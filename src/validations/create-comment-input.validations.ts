import Joi from "joi";

export const CreateCommentInputSchema = Joi.object({
    message: Joi.string()
        .required()
        .min(5)
        .max(100),

    postId: Joi.number()
        .required()
})