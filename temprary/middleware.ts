import express, { NextFunction, Request, Response } from "express";

const app = express();

const middleware = (req: Request, res: Response, next: NextFunction) => {
    console.log("MIDDLEWARE DOING TOKEN VERIFICATION")
    next()
}

const auth = (req: Request, res: Response, next: NextFunction) => {
    console.log("This is authentication")
    next()
}

app.get(
    "/post", auth,
    middleware,
    (req: Request, res: Response) => {
        res.json({ message: "This is Post API :)" });
    }
);

app.get(
    "/comment", auth,
    middleware,
    (req: Request, res: Response) => {
        res.json({ message: "This is Comment API" });
    }
);

app.get(
    "/move", auth,
    middleware,
    (req: Request, res: Response) => {
        res.json({ message: "Move API" });
    }
);

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});