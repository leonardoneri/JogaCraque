import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    PORT: number;
    NODE_ENV: string;
    FRONTEND_URL: string;
    GEMINI_API_KEY?: string;
}

const getEnvConfig = (): EnvConfig => {
    return {
        PORT: parseInt(process.env.PORT || '3001', 10),
        NODE_ENV: process.env.NODE_ENV || 'development',
        FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    };
};

export const config = getEnvConfig();
