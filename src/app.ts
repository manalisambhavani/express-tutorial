import express, { Request, Response } from "express";
import { DataTypes, Sequelize } from "sequelize";
import { signToken, verifyToken } from "./jwt";
import { config } from "dotenv";
config({
    path: ".env"
})


const app = express();
app.use(express.json());

type User = {
    username: string;
    password: string;
    fullname: string;
    age: number;
};

const users: User[] = [];

export const sequelize = new Sequelize(
    process.env.db_name as string,
    process.env.db_username as string,
    process.env.db_password as string,
    {
        host: process.env.db_host as string,
        port: Number(process.env.db_port),
        dialect: process.env.db_dialect as any,
        logging: (process.env.db_logging === "true"),
    }
);
console.log("🚀 ~ process.env.db_logging:", process.env.db_logging, typeof process.env.db_logging)
console.log("🚀 ~ condition:", (process.env.db_logging === "true"))

const User = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log(
            "====> Connection to the database has been established successfully."
        );
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};

connectToDatabase();

// Signup API
app.post("/signup", async (req: Request, res: Response) => {
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
        console.log("🚀 ~ =====newUser:", (newUser as any))
        console.log("🚀 ~ =====newUser:", (newUser as any)._options.isNewRecord)
        console.log("🚀 ~ -------userData:", userData)

        const token = signToken({ userId: userData.id, username: "  aiaaiain" });
        console.log("🚀 ~ token:", token)

        return res.json({ message: "Signed up su:ccessfully :)", token });
    } catch (error) {
        console.error("Error creating user:", error);
    }
});

// Login API
app.post("/login", async (req: Request, res: Response) => {
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
    console.log("🚀 ~ userMatched:", userMatched)

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

app.get("/profile", async (req: Request, res: Response) => {
    const token = req.query.token as string;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
    }

    const userId = (decoded as any).userId;
    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const userData = user.toJSON();

    return res.json({
        username: userData.username,
    });
});

// Start the server
app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});
