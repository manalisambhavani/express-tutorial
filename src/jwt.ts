import * as jwt from "jsonwebtoken";
import { config } from "dotenv";
config({
    path: ".env"
})

// Your secret key - *IMPORTANT*: In a production environment, store this securely (e.g., in environment variables).
const secretKey: string = process.env.JWT_SECRET as string; // Using crypto.randomBytes(64).toString('hex') can help generate strong secrets.

export const signToken = (payload: object): string => {
    // console.log("🚀 ~ signToken ~ payload:", payload)
    // console.log("🚀 ~ signToken ~ secretKey:", secretKey)
    const token = jwt.sign(payload, secretKey, {
        expiresIn: "1h", // Token expires in 1 hour.
        algorithm: "HS256", // Signing algorithm (HS256 is commonly used for symmetric keys).
    });
    // console.log("🚀 ~ signToken ~ token:", token)
    return token;
};

export const verifyToken = (token: string): object | null => {
    try {
        const decoded = jwt.verify(token, secretKey);
        // console.log("🚀 ~ verifyToken ~ decoded:", decoded)
        return decoded as object; // Return the decoded payload.
    } catch (error) {
        console.error("JWT verification failed:", error);
        return null; // Return null if verification fails.
    }
};
