import { verifyToken } from "../utils/jwt";
import { authMiddleware } from "../middlewares/auth-middleware";
import { User } from "../models";
import express, { Request, Response } from "express";

export const profileRoute = express.Router();

profileRoute.get("/profile",authMiddleware, async (req: Request, res: Response) => {
    
    const userId = (req as any).user.userId;
    // console.log("🚀 ~ userId:", userId)
    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const userData = user.toJSON();

    // console.log("🚀 ~ res.json:", res.json)
    return res.json({
        username: userData.username,
    });
});