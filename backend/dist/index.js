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
import jwt from "jsonwebtoken";
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
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT Secret is not defined");
        }
        const token = jwt.sign({ userId: newUser === null || newUser === void 0 ? void 0 : newUser.id }, secret, {
            expiresIn: "15d",
        });
        res.status(201).send({ token });
    }
    catch (error) { }
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loginSchema = z.object({
        username: z.string(),
        password: z.string(),
    });
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(401).json({
            error: result.error.errors,
        });
    }
    try {
        const user = yield prisma.user.findUnique({
            where: { username: req.body.username },
        });
        if (!user || !(yield bcrypt.compare(req.body.password, user.password))) {
            return res.status(401).json({
                error: "Invalid Credentials",
            });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT Secret is not defined");
        }
        const token = jwt.sign({ userId: user === null || user === void 0 ? void 0 : user.id }, secret, { expiresIn: "15d" });
        return res.status(200).json({
            message: "Login Successfull",
            token,
        });
    }
    catch (error) {
        return res.status(404).json({
            error: error,
        });
    }
}));
// authenticate
const authenticate = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Access denied. No Token Provided",
        });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT Secret is not defined");
    }
    jwt.verify(token, secret, (err, user) => {
        if (err)
            return res.sendStatus(403);
        req.user = user;
        next();
    });
};
// Add Todo
app.post("/add", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const todoSchema = z.object({
        title: z.string(),
        description: z.string(),
        completed: z.boolean().optional(),
    });
    const result = todoSchema.safeParse(req.body);
    if (!result) {
        return res.status(400).json({
            error: "Missing some details",
        });
    }
    const newTodo = yield prisma.todos.create({
        data: {
            title: req.body.title,
            description: req.body.description,
            userId: req.user.id,
        },
    });
    return res.status(201).json(newTodo);
}));
// Get all todos
app.get("/todo", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = yield prisma.todos.findMany({
            where: {
                id: req.user.id,
            },
        });
        return res.status(200).send(todos);
    }
    catch (error) {
        return res.status(400).json({
            error: "Unauthorized",
        });
    }
}));
// Delete todo
app.delete("/delete/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const todo = yield prisma.todos.delete({
            where: {
                id: parseInt(id),
            },
        });
        return res.status(200).json({
            message: "Deleted Successfully",
            todo,
        });
    }
    catch (error) {
        return res.status(400).send({
            error: "Unauthorized",
        });
    }
}));
app.listen(process.env.PORT || 8000, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
