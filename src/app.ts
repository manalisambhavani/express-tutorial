import express from "express";
import { authRoute } from "./routes/authentication";
import { profileRoute } from "./routes/profile";
import { postRoute } from "./routes/post";
import { commentRoute } from "./routes/comment";
import { postReactionRoute } from "./routes/post-reaction";
import { CommentReactionRoute } from "./routes/comment-reaction";
import { friendRequestRoute } from "./routes/friend-request";



const app = express();
app.use(express.json());

app.use(authRoute)
app.use(profileRoute)
app.use(postRoute)
app.use(commentRoute)
app.use(postReactionRoute)
app.use(CommentReactionRoute)
app.use(friendRequestRoute)


// Start the server
app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});
