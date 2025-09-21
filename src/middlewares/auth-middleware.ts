import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    // console.log("🚀 ~ authMiddleware ~ authHeader:", authHeader)

    // Expecting "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided or wrong format' });
    }

    // console.log("authHeader.split(' '):", authHeader.split(' '));
    // console.log("authHeader.split(' ')[0]:", authHeader.split(' ')[0]);
    // console.log("authHeader.split(' ')[1]:", authHeader.split(' ')[1]);

    const token = authHeader.split(' ')[1]; // Extract token after 'Bearer'
    console.log("🚀 ~ token:", token)
    const decoded = verifyToken(token);
    console.log("🚀decoded:", decoded)

    if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach user info to req so routes can use it
    (req as any).user = decoded;
    // console.log("🚀 ~ authMiddleware ~ decoded:", decoded)

    next();
}