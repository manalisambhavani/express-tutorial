import Joi from "joi";

export const SignupInputSchema = Joi.object({
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

    firstName: Joi.string()
        .pattern(/^[a-zA-Z\s'-]+$/) // letters, spaces, apostrophes, hyphens
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.pattern.base": "First name can only contain letters, spaces, apostrophes, or hyphens",
        }),

    lastName: Joi.string()
        .pattern(/^[a-zA-Z\s'-]+$/)
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.pattern.base": "Last name can only contain letters, spaces, apostrophes, or hyphens",
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } }) // disable strict TLD validation (accepts test emails)
        .max(255)
        .lowercase()
        .required(),

    mobileNo: Joi.string()
        .pattern(/^\+[1-9]\d{1,14}$/) // +countrycode + number, max 15 digits
        .required()
        .messages({
            "string.pattern.base": "Mobile number must be in international format (e.g. +14155552671)",
        }),

})