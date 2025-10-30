import Joi from "joi";

export const PostInputSchema = Joi.object({
    title: Joi.string()
        .required()
        .min(5)
        .max(50),

    description: Joi.string()
        .required()
        .min(5)
        .max(300)
})