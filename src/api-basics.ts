import express, { Request, Response } from "express";

const app = express();

// Step 1: Enable JSON parsing
app.use(express.json()); // 👈 allows us to read JSON in req.body

// app.post("test", (req: Request, res: Response) => {
//     console.log("Request body:", req.body); // logs what the client sends
//     res.send("Check your terminal for req.body!"); // sends plain text response
// });

// app.get("/search", (req: Request, res: Response) => {
//     console.log("Query params:", req.query);
//     res.json({ receivedQuery: req.query });
// });

// app.get("/user/id", (req: Request, res: Response) => {
//     console.log("User ID:", req.params.id);
//     res.json({ userId: req.params.id });
// });

const users = [
    { id: 1, name: "Alice", age: 25 },
    { id: 2, name: "Bob", age: 30 },
];

app.get("/users", (req: Request, res: Response) => {
    res.json(users);
});

app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});
