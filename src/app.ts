import express from "express";
import { authRoute } from "./routes/authentication";
import { profileRoute } from "./routes/profile";
import { postRoute } from "./routes/post";



const app = express();
app.use(express.json());

app.use(authRoute)
app.use(profileRoute)
app.use(postRoute)

// Start the server
app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});
