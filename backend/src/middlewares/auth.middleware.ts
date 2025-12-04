import type { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt.js';

// Estende o tipo Request do Express para incluir user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                isGuest: boolean;
                isAdmin: boolean;
            };
        }
    }
}

/**
 * Middleware de autenticação
 * Todos os usuários devem estar autenticados (sem modo guest)
 */
export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const payload = verifyToken(token);

        // Verifica se usuário existe
        const user = await authService.getUserById(payload.userId);
        if (!user) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }

        req.user = {
            id: payload.userId,
            isGuest: false,  // Sem modo guest durante desenvolvimento
            isAdmin: user.isAdmin,
        };

        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/**
 * Middleware que exige permissões de admin
 * Durante desenvolvimento, todos os usuários são admin, então este middleware
 * apenas verifica se o usuário está autenticado
 */
export const requireAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    if (!req.user.isAdmin) {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }

    next();
};
