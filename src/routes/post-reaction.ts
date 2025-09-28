import express, { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { PostReaction } from '../models';

export const postReactionRoute = express.Router();

postReactionRoute.post('/reaction/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const postId = req.params.id;
    const { reactionName } = req.body;

    try {
        const existingReaction = await PostReaction.findOne({
            where: {
                userId,
                postId
            }
        });

        if (!existingReaction) {
            const newReaction = await PostReaction.create({
                reactionName,
                postId,
                userId
            });
            const response = newReaction.toJSON();

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
                userId: (req as any).user.userId
            }
        });
        if (!reaction) {
            return res.status(404).json({ message: 'Reaction does not exist' });
        }

        await reaction.destroy();
        return res.status(200).json({ message: 'Reaction removed successfully' });
    } catch (error) {
        console.error('Error removing Reaction:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});