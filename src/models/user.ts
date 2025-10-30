import { DataTypes, ModelAttributeColumnOptions } from "sequelize";

export const UserSchema: { [key: string]: ModelAttributeColumnOptions } = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "****",
    },
    email: {
        type: DataTypes.STRING(255),
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    mobileNo: {
        type: DataTypes.STRING(15),
        unique: true,
        validate: {
            is: /^[0-9+\-() ]{7,15}$/i,
        },
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
}


