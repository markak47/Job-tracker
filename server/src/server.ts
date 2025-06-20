import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes"; // adjust if in another file

dotenv.config(); // Assuming .env is inside /server

const app = express();
const PORT = 5050;

// Middleware
app.use(cors());
app.use(express.json());
// ✅ Correct: mounts the router, not the function
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

console.log("🔧 Starting server...");
console.log("MONGO_URI:", process.env.MONGO_URI);
// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("✅ MongoDB connected");

    // 🔥 This is the line that caused the error — but now it's typed correctly
    app.get("/", (_req: Request, res: Response) => {
      console.log("🔥 Root route hit");
      res.send("Backend is up 🛠");
    });

    app.get("/favicon.ico", (_req: Request, res: Response) => {
      res.status(204).end();
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
