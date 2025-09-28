import { verifyToken } from "../utils/jwt";
import { authMiddleware } from "../middlewares/auth-middleware";
import { User } from "../models";
import express, { Request, Response } from "express";

export const profileRoute = express.Router();

profileRoute.get("/profile", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userData = user.toJSON();

        return res.status(200).json({
            message: 'Profile fetched successfully',
            data: { username: userData.username }
        });

    } catch (error) {
        console.error('Error fetching Profile:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});