import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import jwt, { SignOptions } from "jsonwebtoken";
import type ms from "ms"; // 💡 brings in the StringValue type

const generateToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN as ms.StringValue) || "30d",
  };

  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, options);
};

// ✅ Register Controller
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
    next(err);
  }
};

// ✅ Login Controller
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = (await User.findOne({ email })) as typeof User.prototype & {
      _id: string | { toString(): string };
    };

    if (!user || !(await user.matchPassword(password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
    next(err);
  }
};
