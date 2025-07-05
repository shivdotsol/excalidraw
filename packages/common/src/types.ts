import { z } from "zod";

export const SignupSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
});

export const SigninSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const JoinRoomSchema = z.object({
    name: z.string().min(3).max(20),
});
