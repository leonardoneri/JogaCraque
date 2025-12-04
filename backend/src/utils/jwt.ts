import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export interface JWTPayload {
    userId: string;
    isGuest: boolean;
}

/**
 * Gera um token JWT para o usuário
 */
export const generateToken = (userId: string, isGuest: boolean = false): string => {
    const payload: JWTPayload = {
        userId,
        isGuest,
    };

    return jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
};

/**
 * Verifica e decodifica um token JWT
 */
export const verifyToken = (token: string): JWTPayload => {
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Extrai o token do header Authorization
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
};
