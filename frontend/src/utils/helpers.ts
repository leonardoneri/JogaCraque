
// Format number with thousands separator
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('pt-BR').format(num);
};

// Format currency
export const formatCurrency = (amount: number): string => {
    return `$${formatNumber(amount)}`;
};

// Calculate win rate percentage
export const calculateWinRate = (wins: number, matches: number): number => {
    if (matches === 0) return 0;
    return Math.round((wins / matches) * 100);
};

// Get player overall rating color based on rating
export const getRatingColor = (rating: number): string => {
    if (rating >= 90) return 'text-yellow-400';
    if (rating >= 85) return 'text-green-400';
    if (rating >= 80) return 'text-blue-400';
    if (rating >= 75) return 'text-purple-400';
    return 'text-gray-400';
};

// Get rarity color
export const getRarityColor = (rarity: string): string => {
    switch (rarity.toLowerCase()) {
        case 'lendário':
            return 'text-yellow-500';
        case 'épico':
            return 'text-purple-500';
        case 'raro':
            return 'text-blue-500';
        default:
            return 'text-gray-400';
    }
};

// Format date
export const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

// Format time
export const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Format match result
export const formatMatchResult = (result: 'V' | 'D' | 'E'): string => {
    switch (result) {
        case 'V':
            return 'Vitória';
        case 'D':
            return 'Derrota';
        case 'E':
            return 'Empate';
        default:
            return '-';
    }
};

// Get result color
export const getResultColor = (result: 'V' | 'D' | 'E'): string => {
    switch (result) {
        case 'V':
            return 'text-green-500';
        case 'D':
            return 'text-red-500';
        case 'E':
            return 'text-yellow-500';
        default:
            return 'text-gray-400';
    }
};
