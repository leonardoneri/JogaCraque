import express from 'express';
import { authService } from '../services/auth.service.js';

const router = express.Router();

/**
 * POST /api/auth/guest
 * Cria um usuário guest temporário
 */
router.post('/guest', async (req, res) => {
    try {
        const result = await authService.createGuestUser();
        res.json(result);
    } catch (error) {
        console.error('Error creating guest user:', error);
        res.status(500).json({ error: 'Failed to create guest user' });
    }
});

/**
 * POST /api/auth/register
 * Registra um novo usuário
 * Body: { email, password, username }
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Validação básica
        if (!email || !password || !username) {
            res.status(400).json({ error: 'Email, password and username are required' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }

        const result = await authService.register(email, password, username);
        res.status(201).json(result);
    } catch (error: any) {
        console.error('Error registering user:', error);

        if (error.message === 'Email already in use' || error.message === 'Username already in use') {
            res.status(409).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: 'Failed to register user' });
    }
});

/**
 * POST /api/auth/login
 * Faz login de um usuário
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validação básica
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const result = await authService.login(email, password);
        res.json(result);
    } catch (error: any) {
        console.error('Error logging in:', error);

        if (error.message === 'Invalid credentials' || error.message === 'Guest users cannot login') {
            res.status(401).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: 'Failed to login' });
    }
});

/**
 * GET /api/auth/me
 * Retorna o usuário autenticado
 * Requer autenticação (middleware aplicado na rota principal)
 */
router.get('/me', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const user = await authService.getUserById(req.user.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

export default router;
