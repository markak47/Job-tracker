import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export interface AuthRequest extends Request {
  user?: any;
}
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = await User.findById((decoded as any).id).select("-password");
    next(); // ✅ continue
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

/*
to use this
import { protect } from "../middleware/authMiddleware";

router.get("/dashboard", protect, (req, res) => {
  res.json({ message: `Hello ${req.user.name}` });
});
// This will protect the /dashboard route and ensure only authenticated users can access it. :D
*/
