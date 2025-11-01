import express, { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { Comment, CommentReaction } from '../models';

export const CommentReactionRoute = express.Router();

CommentReactionRoute.post('/comment-reaction/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const commentId = req.params.id;

    try {
        const comment = await Comment.findOne({
            where: {
                id: commentId,
                isActive: true
            }
        });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        const existingReaction = await CommentReaction.findOne({
            where: {
                userId,
                commentId,
                isActive: true
            }
        });

        if (!existingReaction) {
            const newReaction = await CommentReaction.create({
                commentId,
                userId
            })
            return res.status(201).json({
                message: 'Reaction Added successfully',
                data: newReaction
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

// list comment Reactions
CommentReactionRoute.get('/comment-reaction/:id', authMiddleware, async (req: Request, res: Response) => {
    const commentId = req.params.id;

    try {
        const comment = await Comment.findOne({
            where: {
                id: commentId,
                isActive: true
            }
        });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const Reaction = await CommentReaction.findAll({
            where: {
                commentId,
                isActive: true
            }
        });

        if (!Reaction) {
            return res.status(404).json({ message: 'Reaction does not exist' });
        }

        const response = Reaction.map((ele) => {
            const { id, userId, commentId } = ele.toJSON()
            return { id, userId, commentId }
        })

        return res.status(200).json({
            message: 'Reactions fetched successfully',
            data: response
        });

    } catch (error) {
        console.error('Error fetching Reactions:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }

});

CommentReactionRoute.delete('/comment-reaction/:id', authMiddleware, async (req: Request, res: Response) => {
    const reactionId = req.params.id;

    try {
        const reaction = await CommentReaction.findOne({
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

        return res.status(201).json({ message: 'Reaction removed successfully' });

    } catch (error) {
        console.error('Error removing Reaction:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});