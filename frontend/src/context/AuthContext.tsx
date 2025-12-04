import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
    id: string;
    username: string;
    email?: string;
    teamName: string;
    coins: number;
    gems: number;
    transferFunds: number;
    level: number;
    xp: number;
    ratingMMR: number;
    isGuest?: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isGuest: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    loginAsGuest: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const authMode = import.meta.env.VITE_AUTH_MODE || 'guest';

    // Salva token no localStorage
    const saveToken = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('auth_token', newToken);
    };

    // Remove token do localStorage
    const clearToken = () => {
        setToken(null);
        localStorage.removeItem('auth_token');
    };

    // Login como guest
    const loginAsGuest = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/auth/guest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to create guest user');
            }

            const data = await response.json();
            setUser(data.user);
            saveToken(data.token);
        } catch (error) {
            console.error('Error creating guest user:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Login com email e senha
    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to login');
            }

            const data = await response.json();
            setUser(data.user);
            saveToken(data.token);
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Registro
    const register = async (email: string, password: string, username: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, username }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to register');
            }

            const data = await response.json();
            setUser(data.user);
            saveToken(data.token);
        } catch (error) {
            console.error('Error registering:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout
    const logout = () => {
        setUser(null);
        clearToken();
    };

    // Valida token ao carregar
    const validateToken = async (storedToken: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Invalid token');
            }

            const data = await response.json();
            setUser(data.user);
            setToken(storedToken);
        } catch (error) {
            console.error('Error validating token:', error);
            clearToken();

            // Se for modo guest, cria novo guest
            if (authMode === 'guest') {
                await loginAsGuest();
            }
        }
    };

    // Inicialização
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('auth_token');

            if (storedToken) {
                // Valida token existente
                await validateToken(storedToken);
            } else if (authMode === 'guest') {
                // Modo guest: cria automaticamente
                await loginAsGuest();
            }

            setIsLoading(false);
        };

        initAuth();
    }, []);

    const value: AuthContextType = {
        user,
        token,
        isGuest: user?.isGuest || false,
        isLoading,
        login,
        register,
        loginAsGuest,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
