import express, { Request, Response } from "express";
import { User } from "../models";
import { signToken } from "../utils/jwt";
import { encrypt } from "../utils/encrypt";
import { compare } from "bcryptjs";
export const authRoute = express.Router();

authRoute.post("/signup", async (req: Request, res: Response) => {
    const inputUsername = req.body.username;
    const inputPassword = req.body.password;

    const existingUser = await User.findOne({
        where: {
            username: inputUsername,
        },
    });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    try {
        const newUser = await User.create({
            username: inputUsername,
            password: await encrypt(inputPassword),
        });
        const userData = newUser.toJSON();

        const token = signToken({ userId: userData.id, username: "  aiaaiain" });

        return res.status(200).json({
            message: "Signed up successfully ",
            data: { token }
        });
    } catch (error) {
        console.error("Error creating user:", error);

        return res.status(500).json({
            message: " Error creating user:" + (error as any).message,
            error
        });

    }
});

// Login API
authRoute.post("/login", async (req: Request, res: Response) => {

    try {

        const { username, password } = req.body;


        const user = await User.findOne({
            where: {
                username: username,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const userData = user.toJSON();
        console.log("🚀 ~ userData:", userData)

        const verified = await compare(password, userData.password)
        console.log("🚀 ~ verified:", verified)

        if (!verified) {
            return res.status(401).json({ message: "Authentication Failed" });
        }

        const token = signToken({ userId: userData.id });

        res.status(200).json({
            message: "Welcome back, " + userData.username,
            data: { token },
        });
    } catch (error) {
        console.error("Error while login:", error);

        return res.status(500).json({
            message: " Error while login:" + (error as any).message,
            error
        });

    }
});