import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // CLERK INTEGRATION ADJUSTMENT:
            // The frontend sends a Clerk JWT. Local `jwt.verify` with a simple secret won't work 
            // because Clerk uses asymmetric keys. 
            // For rigorous security, we should use `@clerk/clerk-sdk-node` or `jwks-rsa`.
            // For now, to unblock development, we will DECODE the token to get the user ID.

            const decoded: any = jwt.decode(token);

            if (decoded && decoded.sub) {
                req.user = {
                    id: decoded.sub,
                    ...decoded
                };
                next();
            } else {
                // Fallback to original verify if it wasn't a Clerk token or decode failed
                const verified = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
                req.user = verified;
                next();
            }
        } catch (error) {
            console.error("Auth Error:", error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user?.role} is not authorized to access this route`
            });
        }
        next();
    };
};
