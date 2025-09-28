import express, { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { CommentReaction, PostReaction } from '../models';

export const CommentReactionRoute = express.Router();

CommentReactionRoute.post('/comment-reaction/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const commentId = req.params.id;

    console.log("🚀 ~ userId:", userId)
    console.log("🚀 ~ commentId:", commentId)

    try {
        const existingReaction = await CommentReaction.findOne({
            where: {
                userId,
                commentId
            }
        });

        if (!existingReaction) {
            const newReaction = await CommentReaction.create({
                commentId,
                userId
            })
            return res.status(201).json({
                message: 'Reaction Added successfully',
                data: { newReaction }
            });
        }

    } catch (error) {
        console.error('Error creating reaction:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
})

CommentReactionRoute.delete('/comment-reaction/:id', authMiddleware, async (req: Request, res: Response) => {
    const reactionId = req.params.id;
    console.log("🚀 ~ reactionId:", reactionId)

    try {
        const reaction = await CommentReaction.findOne({
            where: {
                id: reactionId,
                userId: (req as any).user.userId
            }
        });
        if (!reaction) {
            return res.status(404).json({ message: 'Reaction does not exist' });
        }

        await reaction.destroy();

        return res.status(201).json({ message: 'Reaction removed successfully' });

    } catch (error) {
        console.error('Error removing Reaction:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});