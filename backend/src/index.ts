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

app.post("/signup", async (req, res) => {
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
    const existingUser = await prisma.user.findUnique({
      where: {
        username: req.body.username,
      },
    });
    if (existingUser) {
      res.status(409).json({
        error: "User with this email already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await prisma.user.create({
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
    const token = jwt.sign({ userId: newUser?.id }, secret, {
      expiresIn: "15d",
    });
    res.status(201).send({ token });
  } catch (error) {}
});

app.post("/login", async (req: any, res: any) => {
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
    const user = await prisma.user.findUnique({
      where: { username: req.body.username },
    });

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({
        error: "Invalid Credentials",
      });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT Secret is not defined");
    }
    const token = jwt.sign({ userId: user?.id }, secret, { expiresIn: "15d" });

    return res.status(200).json({
      message: "Login Successfull",
      token,
    });
  } catch (error) {
    return res.status(404).json({
      error: error,
    });
  }
});

// authenticate
const authenticate = (req: any, res: any, next: any) => {
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
  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
// Add Todo
app.post("/add", authenticate, async (req: any, res: any) => {
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
  const newTodo = await prisma.todos.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      userId: req.user.id,
    },
  });
  return res.status(201).json(newTodo);
});

// Get all todos
app.get("/todo", authenticate, async (req: any, res: any) => {
  try {
    const todos = await prisma.todos.findMany({
      where: {
        id: req.user.id,
      },
    });
    return res.status(200).send(todos);
  } catch (error) {
    return res.status(400).json({
      error: "Unauthorized",
    });
  }
});

// Delete todo
app.delete("/delete/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const todo = await prisma.todos.delete({
      where: {
        id: parseInt(id),
      },
    });
    return res.status(200).json({
      message: "Deleted Successfully",
      todo,
    });
  } catch (error) {
    return res.status(400).send({
      error: "Unauthorized",
    });
  }
});
app.listen(process.env.PORT || 8000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
