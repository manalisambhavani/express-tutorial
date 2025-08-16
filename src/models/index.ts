import { Sequelize } from "sequelize";
import { UserSchema } from "./users";
import { config } from "dotenv";
import { PostSchema } from "./post";
import { CommentSchema } from "./comment";
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
// console.log("🚀 ~ process.env.db_logging:", process.env.db_logging, typeof process.env.db_logging)
// console.log("🚀 ~ condition:", (process.env.db_logging === "true"))

export const User = sequelize.define("user",UserSchema);
export const Post = sequelize.define("post", PostSchema)
export const Comment = sequelize.define("comment", CommentSchema)

User.hasMany(Post);
Post.belongsTo(User);

Post.hasMany(Comment);
Comment.belongsTo(Post);
Comment.belongsTo(User);
User.hasMany(Comment);

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
