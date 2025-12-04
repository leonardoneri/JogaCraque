const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

/**
 * Obtém o token de autenticação do localStorage
 */
const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private buildURL(endpoint: string, params?: Record<string, string>): string {
        const url = new URL(`${this.baseURL}${endpoint}`);
        if (params) {
            Object.keys(params).forEach(key =>
                url.searchParams.append(key, params[key])
            );
        }
        return url.toString();
    }

    async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        const url = this.buildURL(endpoint, options?.params);
        const token = getAuthToken();

        const response = await fetch(url, {
            ...options,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options?.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
        const url = this.buildURL(endpoint, options?.params);
        const token = getAuthToken();

        const response = await fetch(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options?.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
        const url = this.buildURL(endpoint, options?.params);
        const token = getAuthToken();

        const response = await fetch(url, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options?.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        const url = this.buildURL(endpoint, options?.params);
        const token = getAuthToken();

        const response = await fetch(url, {
            ...options,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options?.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}

// Export singleton instance
export const api = new ApiClient(API_URL);

// Export API endpoints
export const endpoints = {
    // Health
    health: () => api.get('/api/health'),

    // Players (TODO: implementar no backend)
    // getPlayers: () => api.get('/api/players'),
    // getPlayer: (id: string) => api.get(`/api/players/${id}`),

    // Market (TODO: implementar no backend)
    // getMarketListings: () => api.get('/api/market'),
    // buyPlayer: (playerId: string) => api.post('/api/market/buy', { playerId }),

    // Squad (TODO: implementar no backend)
    // getSquad: () => api.get('/api/squad'),
    // updateSquad: (squad: any) => api.put('/api/squad', squad),
};
