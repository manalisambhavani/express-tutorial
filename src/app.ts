import express, { Request, Response } from "express";
import { DataTypes, Sequelize } from "sequelize";

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
    "express-tutorial",
    "postgres",
    "postgres",
    {
        host: "localhost",
        port: 5432,
        dialect: "postgres",
        logging: false,
    }
);

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
            password: inputPassword,
        });
        console.log("New user created:", newUser.toJSON());
        return res.json({
            message: "User created successfully",
            user: newUser,
        });
    } catch (error) {
        console.error("Error creating user:", error);
    }
});

// Login API
app.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const userMatched = await User.findOne({
        where: {
            username: username,
            password: password,
        },
    });
    if (!userMatched) {
        return res.status(401).json({ message: "Authentication failed" });
    }

    const userData = userMatched.toJSON();

    res.status(200).json({ message: "Welcome back, " + userData.username });
});

// Start the server
app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});
