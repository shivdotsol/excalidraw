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

app.post("/signin", async (req, res) => {
    const body = req.body;
    const { success, data: parsedData } = SigninSchema.safeParse(body);

    if (!success) {
        res.status(400).json("invalid signin schema");
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: parsedData.email,
            },
        });

        if (!user) {
            res.status(404).json({
                message: "User not found.",
            });
            return;
        }

        const passwordValid = bcrypt.compareSync(
            parsedData.password,
            user.password
        );
        if (passwordValid) {
            const token = jwt.sign({ id: user.id }, JWT_SECRET);

            res.json({
                token,
            });
        } else {
            res.status(401).json({
                message: "Invalid credentials",
            });
        }
    } catch {
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
});

app.post("/room", middleware, async (req, res) => {
    const body = req.body;
    const { success, data: parsedData } = JoinRoomSchema.safeParse(body);

    if (!success) {
        res.status(400).json("invalid join room schema");
        return;
    }

    try {
        const room = await prisma.room.create({
            data: {
                slug: parsedData.name,
                adminId: req.userId!!,
            },
        });

        if (room.id) {
            res.json({
                roomId: room.id,
            });
        }
    } catch {
        res.status(400).json({
            message: "Room with that name already exists",
        });
    }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
