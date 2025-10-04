import Joi from "joi";

export const LoginInputSchema = Joi.object({
    username: Joi.string()
        .required()
        .min(8)
        .max(14)
        .pattern(/^[a-z_]+$/),

    password: Joi.string()
        .required()
        .min(8)
        .max(18)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$"))
        .messages({
            "string.pattern.base":
                "Password must contain at least one uppercase, one lowercase, one number, and one special character.",
        }),
})