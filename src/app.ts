import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

type User = {
    username: string;
    password: string;
    fullname: string;
    age: number;
};

const users: User[] = [];

// Signup API
app.post("/signup", (req: Request, res: Response) => {
    const { username, password, fullname, age } = req.body;

    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    users.push({ username, password, fullname, age });
    console.log("==>", users);
    res.json({ message: "Signup successful" });
});

// Login API
app.post("/login", (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user = users.find(
        (user) => user.username === username && user.password === password
    );
    console.log("===> 36", user);

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: `Welcome back, ${user.fullname}` });
});

// Start the server
app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});
