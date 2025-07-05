import { WebSocketServer } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket, request) => {
    const url = request.url;
    if (!url) {
        return;
    }
    const params = new URLSearchParams(url?.split("?")[1]);
    const token = params.get("token") ?? "";

    try {
        jwt.verify(token, JWT_SECRET);
        socket.send("connected");
    } catch {
        console.log("Invalid token");
        socket.close(4001, "Invalid token");
        return;
    }

    socket.on("message", (data) => console.log("received: " + data.toString()));
});
