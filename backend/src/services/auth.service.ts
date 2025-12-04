import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { generateToken } from '../utils/jwt.js';

export interface AuthResponse {
    user: Omit<User, 'password'>;
    token: string;
}

export class AuthService {
    /**
     * Cria um usuário guest temporário (para desenvolvimento)
     */
    async createGuestUser(): Promise<AuthResponse> {
        const guestToken = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const username = `Guest_${Date.now()}`;

        const user = await userRepository.create({
            username,
            teamName: 'Meu Time dos Sonhos',
            isGuest: true,
            guestToken,
            coins: 5000,
            gems: 10,
            transferFunds: 0,
        });

        const token = generateToken(user.id, true);

        // Remove password do retorno
        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
        };
    }

    /**
     * Registra um novo usuário
     */
    async register(email: string, password: string, username: string): Promise<AuthResponse> {
        // Verifica se email já existe
        const existingEmail = await userRepository.findByEmail(email);
        if (existingEmail) {
            throw new Error('Email already in use');
        }

        // Verifica se username já existe
        const existingUsername = await userRepository.findByUsername(username);
        if (existingUsername) {
            throw new Error('Username already in use');
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cria usuário (admin por padrão durante desenvolvimento)
        const user = await userRepository.create({
            email,
            username,
            password: hashedPassword,
            teamName: `Time de ${username}`,
            isGuest: false,
            isAdmin: true,  // Todos os usuários são admin durante desenvolvimento
            coins: 5000,
            gems: 10,
            transferFunds: 0,
        });

        const token = generateToken(user.id, false);

        // Remove password do retorno
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
        };
    }

    /**
     * Faz login de um usuário
     */
    async login(email: string, password: string): Promise<AuthResponse> {
        // Busca usuário por email
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verifica se não é guest
        if (user.isGuest) {
            throw new Error('Guest users cannot login');
        }

        // Verifica senha
        if (!user.password) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const token = generateToken(user.id, false);

        // Remove password do retorno
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
        };
    }

    /**
     * Busca usuário por ID (usado pelo middleware)
     */
    async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
        const user = await userRepository.findById(userId);
        if (!user) return null;

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export const authService = new AuthService();
