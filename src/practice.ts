import express, { Request, Response } from "express";

const app = express();

// Step 1: Enable JSON parsing
app.use(express.json()); // 👈 allows us to read JSON in req.body

app.post("/test", (req: Request, res: Response) => {
    console.log("Request body:", req.body);

    // Try sending back some custom data
    res.json({
        message: "Thanks! Your data is logged.",
        yourInput: req.body,
    });
});

app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});
