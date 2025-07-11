import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"] || "";

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: string;
        };

        if (decoded) {
            // console.log("from middleware:  " + decoded.id);
            req.userId = decoded.id;
            next();
        }
    } catch {
        // console.log("Invalid jwt token");
        res.status(401).json("Invalid token");
    }
};
