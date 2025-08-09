import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    // Expecting "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided or wrong format' });
    }

    const token = authHeader.split(' ')[1]; // Extract token after 'Bearer'
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach user info to req so routes can use it
    (req as any).user = decoded;

    next();
}