import { Sequelize } from "sequelize";
import { UserSchema } from "./user";
import { config } from "dotenv";
import { PostSchema } from "./post";
import { CommentSchema } from "./comment";
import { PostReactionSchema } from "./post-reaction";
import { CommentReactionSchema } from "./comment-reaction";
import { FriendRequestSchema } from "./friend-request";
config({
    path: ".env"
})

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

export const User = sequelize.define("user", UserSchema);
export const Post = sequelize.define("post", PostSchema)
export const Comment = sequelize.define("comment", CommentSchema)
export const PostReaction = sequelize.define("post-reaction", PostReactionSchema)
export const CommentReaction = sequelize.define("comment-reaction", CommentReactionSchema)
export const FriendRequest = sequelize.define("friend-request", FriendRequestSchema)

User.hasMany(Post, { foreignKey: 'userId', as: 'Post' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'User' });

Post.hasMany(Comment, { foreignKey: 'postId', as: 'Comment' });
Comment.belongsTo(Post);
Comment.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(Comment);

User.hasMany(PostReaction);
PostReaction.belongsTo(User);
Post.hasMany(PostReaction, { foreignKey: 'postId', as: 'Reactions' }); // 👈 for all reactions
Post.hasOne(PostReaction, { foreignKey: 'postId', as: 'UserReaction' }); // 👈 logged in user's reaction
PostReaction.belongsTo(Post, { foreignKey: 'postId' });

Comment.hasMany(CommentReaction, { foreignKey: 'commentId', as: 'CommentReactions' }); // 👈 for all reactions;
Comment.hasOne(CommentReaction, { foreignKey: 'commentId', as: 'UserReactionOnComment' }); // 👈 logged in user's reaction
CommentReaction.belongsTo(Comment);

User.hasMany(FriendRequest, { foreignKey: 'senderId', as: 'sentRequests' });
User.hasMany(FriendRequest, { foreignKey: 'receiverId', as: 'receivedRequests' });

FriendRequest.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
FriendRequest.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// console.log(Post.associations);


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
