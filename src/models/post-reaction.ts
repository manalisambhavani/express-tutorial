import { DataTypes } from "sequelize";

export const PostReactionSchema = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    reactionName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'posts',
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
}
// const Reaction = sequelize.define('Reaction', {
//     type: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     }
// }, {
//     indexes: [
//         {
//             unique: true,
//             fields: ['UserId', 'PostId']  // Enforces one reaction per user per post
//         }
//     ]
// });
// export default Reaction;


