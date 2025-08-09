import express, { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { Post, User } from '../models';

export const postRoute = express.Router();

postRoute.post('/post', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { title, description } = req.body;

    try {
        const newPost = await Post.create({
            title,
            description,
            userId
        });

        return res.status(201).json({
            message: 'Post created successfully',
            post: newPost
        });
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

postRoute.get('/post', authMiddleware, async (req: Request, res: Response) => {
    try {
        const posts = await Post.findAll({
            include: [{
                model: User,
                attributes: ['username']
            }],
            order: [['createdAt', 'DESC']] // Order by creation date
        });

        return res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
})

postRoute.put('/post/:id', authMiddleware, async (req: Request, res: Response) => {
    const postId = req.params.id;
    const { title, description } = req.body;

    try {
        const post = await Post.findOne({
            where: {
                id: postId,
                userId: (req as any).user.userId
            }
        });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Update post details
        post.set({ title, description });
        await post.save();

        return res.json({
            message: 'Post updated successfully',
            post
        });
    } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

postRoute.delete('/post/:id', authMiddleware, async (req: Request, res: Response) => {
    const postId = req.params.id;

    try {
        const post = await Post.findOne({
            where: { 
                id: postId,
                userId: (req as any).user.userId
            }
        });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        await post.destroy();
        return res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});