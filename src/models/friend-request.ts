import { DataTypes } from "sequelize";

export const FriendRequestSchema = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined'),
        allowNull: false,
        defaultValue: 'pending'
    },
}


