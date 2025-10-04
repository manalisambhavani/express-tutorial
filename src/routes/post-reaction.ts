import express, { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { Post, PostReaction } from '../models';
import { PostReactionInputSchema } from '../validations/post-reaction.validation';

export const postReactionRoute = express.Router();

postReactionRoute.post('/reaction/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const postId = req.params.id;
    console.log("🚀 ~ userId:", userId)
    console.log("🚀 ~ postId:", postId)
    let parsedBody: { reactionName: string; };

    try {
        parsedBody = await PostReactionInputSchema.validateAsync(req.body);
    } catch (error) {
        console.error("Validation Error:", (error as any).message);
        return res.status(400).json({
            message: "Validation Error:" + (error as any).message,
            error
        });
    }

    const { reactionName } = parsedBody;

    try {
        const post = await Post.findOne({
            where: {
                id: postId,
                isActive: true
            }
        });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const existingReaction = await PostReaction.findOne({
            where: {
                userId,
                postId,
                isActive: true
            }
        });
        console.log("🚀 ~ existingReaction:", existingReaction)

        if (!existingReaction) {
            const newReaction = await PostReaction.create({
                reactionName,
                postId,
                userId
            });
            const response = newReaction.toJSON();
            console.log("🚀 ~ newReaction:", newReaction)

            return res.status(201).json({
                message: 'Reaction Added successfully',
            });
        }

        //update the existing reaction
        existingReaction.set({ reactionName });
        await existingReaction.save();

        return res.status(200).json({
            message: 'Reaction Updated',
        });

    } catch (error) {
        console.error('Error creating reaction:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
})

postReactionRoute.delete('/reaction/:id', authMiddleware, async (req: Request, res: Response) => {
    const reactionId = req.params.id;
    console.log("🚀 ~ reactionId:", reactionId)

    try {
        const reaction = await PostReaction.findOne({
            where: {
                id: reactionId,
                userId: (req as any).user.userId,
                isActive: true
            }
        });
        if (!reaction) {
            return res.status(404).json({ message: 'Reaction does not exist' });
        }

        reaction.set({ isActive: false });
        await reaction.save();

        return res.status(200).json({ message: 'Reaction removed successfully' });
    } catch (error) {
        console.error('Error removing Reaction:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});