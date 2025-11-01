import express, { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { FriendRequest, User } from '../models';
import { Op } from 'sequelize';

export const friendRequestRoute = express.Router();

friendRequestRoute.get('/list-users', authMiddleware, async (req: Request, res: Response) => {
    try {
        const currentUserId = (req as any).user.userId;

        // find all users the current user already sent friend requests to
        const sentRequests = await FriendRequest.findAll({
            where: {
                [Op.or]: [
                    { senderId: currentUserId },
                    { receiverId: currentUserId },
                ]
            },
            attributes: ['receiverId', 'senderId'],
        });

        const excludedIds = []
        sentRequests.forEach((r) => { 
            excludedIds.push(r.toJSON().receiverId);
            excludedIds.push(r.toJSON().senderId);
        });
        excludedIds.push(currentUserId); // also exclude self

        const users = await User.findAll({
            where: {
                id: {
                    [Op.notIn]: excludedIds,
                },
            },
            attributes: ['id', 'username', 'email'], // limit columns if needed
        });

        res.json({ data: users });

    } catch (error) {
        console.error('Error fetching users:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
})

friendRequestRoute.get('/user/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
        const UserProfile = await User.findOne({
            where: {
                id: userId,
            }
        });
        if (!UserProfile) {
            return res.status(404).json({ message: 'User not found' });
        }
        const UserProfile1 = UserProfile.toJSON();
        // return res.json(UserProfile);

        return res.status(200).json({
            message: 'User fetched successfully',
            data: {
                id: UserProfile1.id,
                username: UserProfile1.username
            }
        });


    } catch (error) {
        console.error('Error updating post:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
}
);

friendRequestRoute.post('/send-friend-request/:id', authMiddleware, async (req: Request, res: Response) => {
    const receiverId = Number(req.params.id);
    const senderId = (req as any).user.userId;

    try {

        // Check if a request already exists in either direction
        const existingRequest = await FriendRequest.findOne({
            where: {
                [Op.or]: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ],
                status: 'pending'
            }
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already exist.' });
        }

        // If no existing request, proceed to create
        const newRequest = await FriendRequest.create({
            senderId,
            receiverId,
            status: 'pending'
        });

        return res.status(201).json({
            message: 'Friend request sent.'
        });

    } catch (error) {
        console.error('Error sending Request:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});

friendRequestRoute.get('/friend-request', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    try {
        const receivedRequests = await FriendRequest.findAll({
            where: {
                receiverId: userId,
                status: 'pending'
            },
            include: [
                {
                    model: User,
                    as: 'sender'
                }
            ]
        });

        res.status(200).json({
            message: 'Pending friend request fetched successfully',
            data: receivedRequests
        });

    } catch (error) {
        console.error('Failed to Fetch available requests:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});

// Respond on Friend Request
friendRequestRoute.patch('/friend-request/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const requestId = req.params.id;
        const loggedInUserId = (req as any).user.userId;
        const { status } = req.body;

        // Validate status input
        if (!['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be accepted or declined.' });
        }

        // Find the friend request
        const friendRequest = await FriendRequest.findByPk(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found.' });
        }

        const Response = friendRequest.toJSON();

        // Check if the logged-in user is the receiver
        if (Response.receiverId !== loggedInUserId) {
            return res.status(403).json({ message: 'You are not authorized to respond to this request.' });
        }

        //delete record from friend-request table who's friendship request is deleted
        if (status == 'declined') {
            await friendRequest.destroy();
            return res.status(200).json({ message: 'friend request is deleted successfully' });
        }


        // Update the status
        friendRequest.set({ status });
        await friendRequest.save();

        return res.status(200).json({
            message: `Friend request ${status}.`,
            data: friendRequest
        });


    } catch (error) {
        console.error('Error responding to friend request:', error);

        return res.status(500).json({
            message: 'Internal server error.' + (error as any).message,
            error
        });
    }
});

// Retrieve the Friends
friendRequestRoute.get('/friends', authMiddleware, async (req: Request, res: Response) => {
    const loggedInUserId = (req as any).user.userId;

    try {
        const friends = await FriendRequest.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [
                    { senderId: loggedInUserId },
                    { receiverId: loggedInUserId }
                ]
            },
            include: [{
                model: User,
                as: "sender",
            },
            {
                model: User,
                as: "receiver",
            }]
        });

        const friendsRes = friends.map((ele) => {
            const parsedEle = ele.toJSON()

            if (parsedEle.senderId !== loggedInUserId) {
                return {
                    id: parsedEle.senderId,
                    username: parsedEle.sender.username
                }
            }

            if (parsedEle.receiverId !== loggedInUserId) {
                return {
                    id: parsedEle.receiverId,
                    username: parsedEle.receiver.username
                }
            }

        })

        return res.status(200).json({
            message: `Friends`,
            data: friendsRes
        });
    } catch (error) {
        console.error('Failed to Fetch available requests:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});

// Unfriend the Friend
friendRequestRoute.put('/unfriend/:id', authMiddleware, async (req: Request, res: Response) => {
    const loggedInUserId = (req as any).user.userId;
    const requestId = req.params.id;


    try {

        const friendRequest = await FriendRequest.findOne({
            where: {
                status: "accepted",
                [Op.or]: [
                    {
                        senderId: loggedInUserId,
                        receiverId: requestId
                    },
                    {
                        senderId: requestId,
                        receiverId: loggedInUserId
                    }
                ]
            }
        });

    } catch (error) {
        console.error('Failed to Fetch available requests:', error);

        return res.status(500).json({
            message: 'Internal server error' + (error as any).message,
            error
        });
    }
});