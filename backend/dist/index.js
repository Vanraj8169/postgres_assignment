var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import { z } from "zod";
import bcrypt from "bcryptjs";
const app = express();
app.use(express.json());
app.use(cors());
const prisma = new PrismaClient();
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signupSchema = z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string().min(8, "Passwords must be atleast 8 characters long"),
    });
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
        res.status(401).json({
            error: result.error.errors,
        });
    }
    try {
        const existingUser = yield prisma.user.findUnique({
            where: {
                username: req.body.username,
            },
        });
        if (existingUser) {
            res.status(409).json({
                error: "User with this email already exists",
            });
        }
        const hashedPassword = yield bcrypt.hash(req.body.password, 10);
        const newUser = yield prisma.user.create({
            data: {
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
            },
        });
        res.status(201).send(newUser);
    }
    catch (error) { }
}));
app.listen(process.env.PORT || 8000, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
