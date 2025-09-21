import express, { request, Request, response, Response } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { FriendRequest, User } from '../models';
import { json, Op } from 'sequelize';

export const friendRequestRoute = express.Router();

friendRequestRoute.get('/listusers', authMiddleware, async (req: Request, res: Response) => {
    try {
        const Allusers = await User.findAll();
        // console.log("🚀 ~ Allusers:", Allusers)


        return res.json(Allusers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Internal server error' });
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
        console.log("🚀 ~ UserProfile:", UserProfile)
        if (!UserProfile) {
            return res.status(404).json({ message: 'User not found' });
        }
        const UserProfile1 = UserProfile.toJSON();
        // return res.json(UserProfile);

        return res.json({
            id: UserProfile1.id,
            username: UserProfile1.username
        });

        // const ({ id, username }) = UserProfile;
        // return res.json({ id, username });

    } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
);

friendRequestRoute.post('/send-friend-request/:id', authMiddleware, async (req: Request, res: Response) => {
    const receiverId = Number(req.params.id);
    const senderId = (req as any).user.userId;
    console.log("🚀 ~ receiverId:", receiverId)
    console.log("🚀 ~ senderId:", senderId)
    // console.log(typeof senderId, typeof receiverId);

    try {

        // if ((senderId == (req as any).user.userId && receiverId == Number(req.params.id)) || (senderId == Number(req.params.id) && receiverId == (req as any).user.userId)) {
        //     res.status(400).json({ message: 'Friend request already exist.' });
        // }

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
        console.log("🚀 ~ existingRequest:", existingRequest)

        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already exist.' });
        }

        // If no existing request, proceed to create
        const newRequest = await FriendRequest.create({
            senderId,
            receiverId,
            status: 'pending'
        });

        return res.status(201).json({ message: 'Friend request sent.', request: newRequest });

    } catch (error) {
        console.error('Error sending Request:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

friendRequestRoute.get('/friend-request', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    console.log("🚀 ~ userId:", userId)
    try {
        const receivedRequests = await FriendRequest.findAll({
            where: {
                receiverId: userId,
                status: 'pending'
            }
        });

        res.json(receivedRequests);

    } catch (error) {
        console.error('Failed to Fetch available requests:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Respond on Friend Request
friendRequestRoute.patch('/friend-request/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const requestId = req.params.id;
        const loggedInUserId = (req as any).user.userId;
        const { status } = req.body;
        console.log("🚀 ~ loggedInUserId:", loggedInUserId)
        console.log("🚀 ~ requestId:", requestId)

        // Validate status input
        if (!['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be accepted or declined.' });
        }

        // Find the friend request
        const friendRequest = await FriendRequest.findByPk(requestId);
        // console.log("🚀 ~ friendRequest:", friendRequest)

        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found.' });
        }

        const Response = friendRequest.toJSON();
        console.log("🚀 ~ Response:", Response)

        // Check if the logged-in user is the receiver
        if (Response.receiverId !== loggedInUserId) {
            return res.status(403).json({ message: 'You are not authorized to respond to this request.' });
        }

        // Update the status
        friendRequest.set({ status });
        await friendRequest.save();

        // const Response = friendRequest.toJSON();
        // console.log(typeof Response.receiverId);

        return res.status(200).json({
            message: `Friend request ${status}.`,
            friendRequest
        });

    } catch (error) {
        console.error('Error responding to friend request:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Retrive the Friends
friendRequestRoute.get('/friends', authMiddleware, async (req: Request, res: Response) => {
    const loggedInUserId = (req as any).user.userId;
    console.log("🚀 ~ loggedInUserId:", loggedInUserId)

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
            console.log("🚀 ~ parsedEle:", parsedEle)

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

        // console.log("🚀 ~ friends:", friends)
        return res.status(200).json({
            message: `Friends`,
            friends: friendsRes
        });
    } catch (error) {
        console.error('Failed to Fetch available requests:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});