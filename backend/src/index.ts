import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import { z } from "zod";
import bcrypt from "bcryptjs";

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
    res.status(201).send(newUser);
  } catch (error) {}
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
