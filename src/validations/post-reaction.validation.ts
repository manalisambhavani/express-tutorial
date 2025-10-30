import Joi from "joi";

export const PostReactionInputSchema = Joi.object({
    reactionName: Joi.string()
        .required()
        .valid('like', 'love', 'happy', 'celebrate', 'insightful', 'funny')

})