import { DataTypes, ModelAttributeColumnOptions } from "sequelize";

export const CommentReactionSchema: { [key: string]: ModelAttributeColumnOptions } = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    commentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'comments',
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
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
}



