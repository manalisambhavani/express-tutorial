import express, { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { Post, PostReaction, User } from '../models';
import { PostInputSchema } from '../validations/post.validations';
import { Sequelize } from 'sequelize';

export const postRoute = express.Router();

postRoute.post('/post', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    let parsedBody: { title: string; description: string; };

    try {
        parsedBody = await PostInputSchema.validateAsync(req.body);
    } catch (error) {
        console.error("Validation Error:", (error as any).message);
        return res.status(400).json({
            message: "Validation Error:" + (error as any).message,
            error
        });
    }

    const { title, description } = parsedBody;

    try {
        const newPost = await Post.create({
            title,
            description,
            userId
        });

        return res.status(201).json({
            message: 'Post created successfully',
            data: { post: newPost }
        });
    } catch (error) {
        console.error('Error creating post:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});

postRoute.get('/post', authMiddleware, async (req: Request, res: Response) => {
    try {
        const posts = await Post.findAll({
            where: {
                isActive: true
            },
            attributes: {
                include: [
                    // Add total reaction count
                    [Sequelize.fn('COUNT', Sequelize.col('Reactions.id')), 'reactionCount']
                ]
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['username'],
            },
            {
                // logged in user's reaction
                model: PostReaction,
                as: "UserReaction",
                attributes: ['id', 'reactionName'],
                where: {
                    userId: (req as any).user.userId
                },
                required: false
            },
            {
                // all reactions (only used for count)
                model: PostReaction,
                as: "Reactions", // 👈 alias is important
                attributes: [],
                required: false
            }],
            group: ['Post.id', 'User.id', 'UserReaction.id'],
            order: [['createdAt', 'DESC']] // Order by creation date
        });
        console.log("🚀 ~ posts:", posts)

        return res.status(200).json({
            message: 'Posts fetched successfully',
            data: { posts }
        });

    } catch (error) {
        console.error('Error fetching posts:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
})

postRoute.put('/post/:id', authMiddleware, async (req: Request, res: Response) => {
    const postId = req.params.id;
    let parsedBody: { title: string; description: string; };

    try {
        parsedBody = await PostInputSchema.validateAsync(req.body);
    } catch (error) {
        console.error("Validation Error:", (error as any).message);
        return res.status(400).json({
            message: "Validation Error:" + (error as any).message,
            error
        });
    }

    const { title, description } = parsedBody;

    try {
        const post = await Post.findOne({
            where: {
                id: postId,
                userId: (req as any).user.userId,
                isActive: true
            }
        });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Update post details
        post.set({ title, description });
        await post.save();

        return res.status(200).json({
            message: 'Post updated successfully',
            data: { post }
        });
    } catch (error) {
        console.error('Error updating post:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});

postRoute.delete('/post/:id', authMiddleware, async (req: Request, res: Response) => {
    const postId = req.params.id;

    try {
        const post = await Post.findOne({
            where: {
                id: postId,
                userId: (req as any).user.userId,
                isActive: true
            }
        });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.set({ isActive: false });
        await post.save();
        return res.status(200).json({ message: 'Post deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting post:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});