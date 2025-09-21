import express, { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { PostReaction } from '../models';

export const reactionRoute = express.Router();

reactionRoute.post('/reaction/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const postId = req.params.id;
    const { reactionName } = req.body;

    console.log("🚀 ~ userId:", userId)
    console.log("🚀 ~ postId:", postId)
    console.log("🚀 ~ reaction Name:", reactionName)

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
            return res.status(201).json({
                message: 'Reaction Added successfully',
                reaction: newReaction
            });
        }

        //update the existing reaction
        existingReaction.set({ reactionName });
        await existingReaction.save();

        return res.status(200).json({ message: 'Reaction Updated', reaction: existingReaction });
    } catch (error) {
        console.error('Error creating reaction:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
})

reactionRoute.delete('/reaction/:id', authMiddleware, async (req: Request, res: Response) => {
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
        return res.json({ message: 'Reaction removed successfully' });
    } catch (error) {
        console.error('Error removing Reaction:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});