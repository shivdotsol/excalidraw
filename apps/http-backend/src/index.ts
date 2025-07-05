import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { JoinRoomSchema, SigninSchema, SignupSchema } from "@repo/common/types";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/db/prisma";
const PORT = 5000;
const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
    const body = req.body;
    const { success, data: parsedData } = SignupSchema.safeParse(body);

    if (!success) {
        res.status(400).json("invalid signup schema");
        return;
    }

    try {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(parsedData.password, salt);
        const user = await prisma.user.create({
            data: {
                email: parsedData.email,
                name: parsedData.name,
                password: hashedPassword,
            },
        });

        if (user.id) {
            const token = jwt.sign({ id: user.id }, JWT_SECRET);
            res.json(token);
        }
    } catch {
        res.status(411).json({ message: "Email already in use." });
    }
});

app.post("/signin", (req, res) => {
    const body = req.body;
    const { success } = SigninSchema.safeParse(body);

    if (!success) {
        res.status(400).json("invalid signin schema");
        return;
    }
    //db logic

    const id = 1;

    const token = jwt.sign({ id }, JWT_SECRET);

    res.json({
        token,
    });
});

app.post("/room", middleware, (req, res) => {
    const body = req.body;
    const { success } = JoinRoomSchema.safeParse(body);

    if (!success) {
        res.status(400).json("invalid join room schema");
        return;
    }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
