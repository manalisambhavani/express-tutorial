import Joi from "joi";

export const UpdateCommentInputSchema = Joi.object({
    message: Joi.string()
        .required()
        .min(5)
        .max(100)
})