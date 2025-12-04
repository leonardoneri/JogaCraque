import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    PORT: number;
    NODE_ENV: string;
    FRONTEND_URL: string;
    GEMINI_API_KEY?: string;
    AUTH_MODE: 'guest' | 'full';
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
}

const getEnvConfig = (): EnvConfig => {
    return {
        PORT: parseInt(process.env.PORT || '3001', 10),
        NODE_ENV: process.env.NODE_ENV || 'development',
        FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        AUTH_MODE: (process.env.AUTH_MODE as 'guest' | 'full') || 'guest',
        JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    };
};

export const config = getEnvConfig();
