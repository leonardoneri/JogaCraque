import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

interface AuthGuardProps {
    children: ReactNode;
}

/**
 * AuthGuard - Protege rotas que requerem autenticação
 * 
 * - Modo guest: Permite acesso automático (auto-login já feito no AuthContext)
 * - Modo full: Redireciona para login se não autenticado
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { user, isLoading } = useAuth();
    const authMode = import.meta.env.VITE_AUTH_MODE || 'guest';

    // Mostra loading enquanto valida autenticação
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
                    <p className="text-white text-lg">Carregando...</p>
                </div>
            </div>
        );
    }

    // Modo guest ou usuário autenticado: permite acesso
    if (authMode === 'guest' || user) {
        return <>{children}</>;
    }

    // Modo full sem autenticação: mostra mensagem
    // (Em produção, redirecionaria para /login)
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Autenticação Necessária</h2>
                <p className="text-gray-300 mb-6">
                    Você precisa fazer login para acessar o jogo.
                </p>
                <button
                    onClick={() => window.location.href = '/#/login'}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                    Ir para Login
                </button>
            </div>
        </div>
    );
};
