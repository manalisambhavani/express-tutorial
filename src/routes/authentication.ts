import express, { Request, Response } from "express";
import { User } from "../models";
import { signToken } from "../utils/jwt";
import { encrypt } from "../utils/encrypt";
import { compare } from "bcryptjs";
import { SignupInputSchema } from "../validations/signup-input.validations";
import { LoginInputSchema } from "../validations/login-input.validation";
export const authRoute = express.Router();

authRoute.post("/signup", async (req: Request, res: Response) => {

    let parsedBody: { username: string; password: string; firstName: string; lastName: string; email: string; mobileNo: string };

    try {
        parsedBody = await SignupInputSchema.validateAsync(req.body);
    } catch (error) {
        console.error("Validation Error:", (error as any).message);
        return res.status(400).json({
            message: "Validation Error:" + (error as any).message,
            error
        });
    }

    const inputUsername = parsedBody.username;
    const inputPassword = parsedBody.password;
    const firstName = parsedBody.firstName;
    const lastName = parsedBody.lastName;
    const email = parsedBody.email;
    const mobileNo = parsedBody.mobileNo;


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
            firstName, lastName, email, mobileNo
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

    let parsedBody: { username: string; password: string; };

    try {
        parsedBody = await LoginInputSchema.validateAsync(req.body);
    } catch (error) {
        console.error("Validation Error:", (error as any).message);
        return res.status(400).json({
            message: "Validation Error:" + (error as any).message,
            error
        });
    }

    try {

        const { username, password } = parsedBody;


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