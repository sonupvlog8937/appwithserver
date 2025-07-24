import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Extend Request to include user property
interface AuthenticatedRequest extends Request {
    user?: IUser;
}

const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
            req.user = await User.findById(decoded.id).select('-password'); // Attach user to request
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

export { protect, admin };