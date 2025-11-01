import express, { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { Post, PostReaction, User } from '../models';
import { PostInputSchema } from '../validations/post.validations';
import { literal, Sequelize } from 'sequelize';

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
            data: newPost
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
        const loggedInUserId = (req as any).user.userId
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const totalItems = await Post.count({
            where: { isActive: true }
        });

        const posts = await Post.findAll({
            attributes: [
                'id',
                'title',
                'description',
                [literal(`jsonb_build_object(
                    'id', "User"."id",
                    'username', "User"."username"
                )`), 'user'],
                [literal(`jsonb_build_object(
                    'id', "UserReaction"."id",
                    'reactionName', "UserReaction"."reactionName"
                )`), 'userReaction'],
                [literal(`(
                    SELECT jsonb_agg(jsonb_build_object('reactionName', pr2."reactionName", 'count', pr2."cnt"))
                    FROM (
                        SELECT "reactionName", COUNT(*) AS "cnt"
                        FROM "post-reactions" AS pr
                        WHERE pr."postId" = "post"."id" AND pr."isActive" = true
                        GROUP BY pr."reactionName"
                    ) AS pr2
                )`), 'count'],
            ],
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ["id", "username"]
                },
                {
                    model: PostReaction,
                    as: 'UserReaction',
                    required: false,
                    where: { userId: loggedInUserId, isActive: true },
                }
            ],
            where: {
                isActive: true,
            },
            group: ['post.id', 'User.id', 'UserReaction.id'],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            subQuery: false,
            raw: true
        });

        const totalPages = Math.ceil(totalItems / limit);

        const response = posts.map((ele) => {
            const { id, title, description, user, userReaction, count } = ele as any
            return { id, title, description, user, userReaction, count }
        })

        return res.status(200).json({
            message: 'Posts fetched successfully',
            data: response,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }

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
            data: post
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

postRoute.get('/post/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const loggedInUserId = (req as any).user.userId;
        const postId = req.params.id;

        const post = await Post.findOne({
            attributes: [
                'id',
                'title',
                'description',
                [literal(`jsonb_build_object(
                    'id', "User"."id",
                    'username', "User"."username"
                )`), 'user'],
                [literal(`jsonb_build_object(
                    'id', "UserReaction"."id",
                    'reactionName', "UserReaction"."reactionName"
                )`), 'userReaction'],
                [literal(`(
                    SELECT jsonb_agg(jsonb_build_object('reactionName', pr2."reactionName", 'count', pr2."cnt"))
                    FROM (
                    SELECT "reactionName", COUNT(*) AS "cnt"
                    FROM "post-reactions" AS pr
                    WHERE pr."postId" = "post"."id" AND pr."isActive" = true
                    GROUP BY pr."reactionName"
                    ) AS pr2
                )`), 'count'],
            ],
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'username'],
                },
                {
                    model: PostReaction,
                    as: 'UserReaction',
                    required: false,
                    where: { userId: loggedInUserId, isActive: true },
                },
            ],
            where: { id: postId, isActive: true },
            group: ['post.id', 'User.id', 'UserReaction.id'],
            subQuery: false,
            raw: true,
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const { id, title, description, user, userReaction, count } = post as any;
        return res.status(200).json({
            message: 'Post fetched successfully',
            data: { id, title, description, user, userReaction, count },
        });
    } catch (error) {
        console.error('Error fetching single post:', error);
        return res.status(500).json({
            message: 'Internal server error ' + (error as any).message,
            error,
        });
    }
});
  