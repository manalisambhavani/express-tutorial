import express, { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { Comment, CommentReaction, Post, User } from '../models';

export const commentRoute = express.Router();

commentRoute.post('/comment', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { postId, message } = req.body;

    try {
        const newComment = await Comment.create({
            message,
            postId,
            userId
        });

        return res.status(201).json({
            message: 'Comment Added successfully',
            data: { newComment }
        });
    } catch (error) {
        console.error('Error Adding Comment:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});

commentRoute.get('/comment/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        const comment = await Comment.findAll({
            where: { postId },
            include: [{
                model: User,
                attributes: ['username']
            },
            {
                model: CommentReaction,
                attributes: ['id'],
                where: {
                    userId: (req as any).user.userId
                },
                required: false
            }
            ],
            order: [['createdAt', 'DESC']] // Order by creation date
        });
        return res.status(200).json({
            message: 'Comments fetched successfully',
            data: { comment }
        });

    } catch (error) {
        console.error('Error fetching Comments:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
})

commentRoute.put('/comment/:id', authMiddleware, async (req: Request, res: Response) => {
    const commentId = req.params.id;
    const loggedInUserId = (req as any).user.userId;
    const { message } = req.body;

    try {
        const comment = await Comment.findOne({
            where: {
                id: commentId,
                userId: loggedInUserId // Ensures ownership
            },
            include: [{
                model: User,
                attributes: ['username']
            }]

        });
        if (!comment) {
            return res.status(404).json({
                message: 'Comment not found'
            });
        }

        // Update Comment details
        comment.set({ message });
        await comment.save();

        return res.status(200).json({
            message: 'Comment updated successfully',
            data: { comment }
        });
    } catch (error) {
        console.error('Error updating Comment:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});

commentRoute.delete('/comment/:id', authMiddleware, async (req: Request, res: Response) => {
    const commentId = req.params.id;
    const loggedInUserId = (req as any).user.userId;

    try {
        const comment = await Comment.findOne({
            where: {
                id: commentId,
                userId: loggedInUserId
            }
        });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        await comment.destroy();
        return res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});