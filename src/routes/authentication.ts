import express, { Request, Response } from "express";
import { User } from "../models";
import { signToken } from "../jwt";
export const authRoute = express.Router();


authRoute.post("/signup", async (req: Request, res: Response) => {
    const inputUsername = req.body.username;
    const inputPassword = req.body.password;
    // console.log("🚀 ~ inputUsername:", inputUsername, req.body.username);
    // console.log("🚀 ~ inputPassword:", inputPassword);
    // console.log("🚀 ~ req.body:", req.body);
    // console.log("Full name:", req.body.fullname);
    // console.log("Age:", req.body.age);
    // console.log("email:", req.body.email);

    const existingUser = await User.findOne({
        where: {
            username: inputUsername,
        },
    });
    if (existingUser) {
        // console.log("🚀 ~ existingUser:", existingUser)
        return res.status(400).json({ message: "User already exists" });
    }
    // console.log("line 80========");
    

    try {
        const newUser = await User.create({
            username: inputUsername,
            password: inputPassword,
        });
        const userData = newUser.toJSON();
        // console.log("🚀 ~ =====newUser:", (newUser as any))
        // console.log("🚀 ~ =====newUser:", (newUser as any)._options.isNewRecord)
        // console.log("🚀 ~ -------userData:", userData)

        const token = signToken({ userId: userData.id, username: "  aiaaiain" });
        // console.log("🚀 ~ token:", token)

        return res.json({ message: "Signed up su:ccessfully :)", token });
    } catch (error) {
        console.error("Error creating user:", error);
    }
});

// Login API
authRoute.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    // console.log("🚀 ~ req.body:", req.body)
    // console.log("🚀 ~ password:", password)
    // console.log("🚀 ~ username:", username)

    const userMatched = await User.findOne({
        where: {
            username: username,
            password: password,
        },
    });
    // console.log("🚀 ~ userMatched:", userMatched)

    if (!userMatched) {
        return res.status(401).json({ message: "Authentication failed" });
    }

    const userData = userMatched.toJSON();

    const token = signToken({ userId: userData.id });

    res.status(200).json({
        message: "Welcome back, " + userData.username,
        token,
    });
});