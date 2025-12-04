import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { GameState, MarketListing, MatchHistoryEntry, Player, PlayerAttributesUpdate } from '../types';
import { useAuth } from './AuthContext';

interface GameContextType {
    state: GameState;
    marketListings: MarketListing[];
    addCoins: (amount: number) => void;
    buyPack: (cost: number) => Promise<Player[]>;
    setSquadPlayer: (index: number, player: Player) => Promise<void>;
    removeSquadPlayer: (index: number) => Promise<void>;
    simulateMatchResult: (myScore: number, oppScore: number, oppName: string, isRanked: boolean, goalScorers: string[]) => void;
    quickSellPlayer: (playerId: string) => void;
    buyPlayerFromMarket: (listingId: string) => void;
    refreshMarket: () => void;
    updatePlayerImage: (playerId: string, imageUrl: string) => void;
    updatePlayerStats: (playerId: string, updates: PlayerAttributesUpdate) => void;
    importPlayers: (players: Player[]) => void;
    clearInventory: () => void;
    deletePlayer: (playerId: string) => void;
    isLoading: boolean;
}

const defaultState: GameState = {
    userTeamName: 'Meu Time dos Sonhos',
    coins: 5000,
    gems: 10,
    transferFunds: 0,
    inventory: [],
    squad: Array(11).fill(null),
    bench: [],
    level: 1,
    xp: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    ratingMMR: 1000,
    matchHistory: [],
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [state, setState] = useState<GameState>(defaultState);
    const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar dados do jogo ao iniciar ou mudar usuário
    useEffect(() => {
        const loadGameData = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Carregar inventário e squad em paralelo
                const [players, squad] = await Promise.all([
                    api.get<Player[]>('/api/players'),
                    api.get<Player[]>('/api/squad')
                ]);

                // Atualizar estado com dados do backend
                setState(prev => ({
                    ...prev,
                    userTeamName: user.teamName || prev.userTeamName,
                    coins: user.coins || prev.coins,
                    gems: user.gems || prev.gems,
                    transferFunds: user.transferFunds || prev.transferFunds,
                    inventory: players,
                    squad: squad, // O backend já retorna array de 11 posições (com nulls)
                    level: user.level || prev.level,
                    xp: user.xp || prev.xp,
                    ratingMMR: user.ratingMMR || prev.ratingMMR,
                    matchesPlayed: user.matchesPlayed || prev.matchesPlayed,
                    wins: user.wins || prev.wins,
                    draws: user.draws || prev.draws,
                    losses: user.losses || prev.losses,
                }));

            } catch (error) {
                console.error('Error loading game data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadGameData();
    }, [user]);

    // Initial Market Seed (Mockado por enquanto)
    useEffect(() => {
        refreshMarket();
    }, []);

    const refreshMarket = () => {
        // TODO: Migrar para backend
        const newListings: MarketListing[] = [];
        setMarketListings(newListings);
    };

    const addCoins = (amount: number) => {
        setState(prev => ({ ...prev, coins: prev.coins + amount }));
        // TODO: Persistir no backend
    };

    const buyPack = async (cost: number): Promise<Player[]> => {
        if (state.coins < cost) {
            alert("Moedas insuficientes!");
            return [];
        }

        try {
            const response = await api.post<Player[]>('/api/players/pack', { cost });
            const newPlayers = response; // ApiClient já retorna o corpo

            setState(prev => ({
                ...prev,
                coins: prev.coins - cost,
                inventory: [...prev.inventory, ...newPlayers]
            }));

            return newPlayers;
        } catch (error) {
            console.error('Error buying pack:', error);
            alert('Erro ao comprar pacote.');
            return [];
        }
    };

    const setSquadPlayer = async (index: number, player: Player) => {
        try {
            // Atualizar estado otimista
            const newSquad = [...state.squad];
            const existingIndex = state.squad.findIndex(p => p?.id === player.id);

            if (existingIndex !== -1) {
                newSquad[existingIndex] = null;
            }
            newSquad[index] = player;

            setState(prev => ({ ...prev, squad: newSquad }));

            // Persistir no backend
            const positions = newSquad.map(p => p ? p.id : null);
            await api.put('/api/squad', { positions });

        } catch (error) {
            console.error('Error updating squad:', error);
            // Reverter em caso de erro (poderia ser melhor implementado)
        }
    };

    const removeSquadPlayer = async (index: number) => {
        try {
            const newSquad = [...state.squad];
            newSquad[index] = null;

            setState(prev => ({ ...prev, squad: newSquad }));

            const positions = newSquad.map(p => p ? p.id : null);
            await api.put('/api/squad', { positions });
        } catch (error) {
            console.error('Error removing player from squad:', error);
        }
    };

    const quickSellPlayer = (playerId: string) => {
        // TODO: Migrar para backend
        const player = state.inventory.find(p => p.id === playerId);
        if (!player) return;

        const squadIndex = state.squad.findIndex(p => p?.id === playerId);

        let currentSquad = [...state.squad];
        if (squadIndex !== -1) {
            currentSquad[squadIndex] = null;
        }

        // Valor fixo por enquanto, idealmente viria do backend
        const sellValue = 100;

        setState(prev => ({
            ...prev,
            squad: currentSquad,
            inventory: prev.inventory.filter(p => p.id !== playerId),
            transferFunds: (prev.transferFunds || 0) + sellValue
        }));
    };

    const buyPlayerFromMarket = (listingId: string) => {
        // TODO: Migrar para backend
        alert('Mercado em manutenção');
    };

    const simulateMatchResult = (myScore: number, oppScore: number, oppName: string, isRanked: boolean, goalScorers: string[]) => {
        // TODO: Migrar para backend
        const win = myScore > oppScore;
        const draw = myScore === oppScore;

        const historyEntry: MatchHistoryEntry = {
            id: `match-${Date.now()}`,
            opponentName: oppName,
            myScore,
            oppScore,
            result: win ? 'V' : draw ? 'E' : 'D',
            timestamp: Date.now()
        };

        setState(prev => ({
            ...prev,
            matchesPlayed: prev.matchesPlayed + 1,
            wins: win ? prev.wins + 1 : prev.wins,
            draws: draw ? prev.draws + 1 : prev.draws,
            losses: (!win && !draw) ? prev.losses + 1 : prev.losses,
            coins: prev.coins + (win ? 200 : draw ? 100 : 50),
            matchHistory: [historyEntry, ...prev.matchHistory].slice(0, 50)
        }));
    };

    const updatePlayerImage = async (playerId: string, imageUrl: string) => {
        try {
            await api.put(`/api/players/${playerId}`, { image: imageUrl });
            setState(prev => {
                const updatedInventory = prev.inventory.map(p => p.id === playerId ? { ...p, image: imageUrl } : p);
                const updatedSquad = prev.squad.map(p => p?.id === playerId ? { ...p, image: imageUrl } : p);
                return {
                    ...prev,
                    inventory: updatedInventory,
                    squad: updatedSquad
                };
            });
        } catch (error) {
            console.error('Error updating player image:', error);
        }
    };

    const updatePlayerStats = async (playerId: string, updates: PlayerAttributesUpdate) => {
        try {
            await api.put(`/api/players/${playerId}`, updates);
            // Reload inventory to get updated data
            const players = await api.get<Player[]>('/api/players');
            setState(prev => ({
                ...prev,
                inventory: players,
                squad: prev.squad.map(p => {
                    const updated = players.find(pl => pl.id === p?.id);
                    return updated || p;
                })
            }));
        } catch (error) {
            console.error('Error updating player stats:', error);
        }
    };

    const deletePlayer = async (playerId: string) => {
        try {
            await api.delete(`/api/players/${playerId}`);
            setState(prev => ({
                ...prev,
                inventory: prev.inventory.filter(p => p.id !== playerId),
                squad: prev.squad.map(p => p?.id === playerId ? null : p)
            }));
        } catch (error) {
            console.error('Error deleting player:', error);
        }
    };

    const importPlayers = async (newPlayers: Player[]) => {
        try {
            await api.post('/api/players/import', { players: newPlayers });
            // Reload inventory
            const players = await api.get<Player[]>('/api/players');
            setState(prev => ({
                ...prev,
                inventory: players
            }));
        } catch (error) {
            console.error('Error importing players:', error);
            alert('Erro ao importar jogadores.');
        }
    };

    const clearInventory = async () => {
        try {
            await api.delete('/api/players/inventory/clear');
            setState(prev => ({
                ...prev,
                inventory: [],
                squad: Array(11).fill(null)
            }));
        } catch (error) {
            console.error('Error clearing inventory:', error);
        }
    };

    return (
        <GameContext.Provider value={{
            state,
            marketListings,
            addCoins,
            buyPack,
            setSquadPlayer,
            removeSquadPlayer,
            simulateMatchResult,
            quickSellPlayer,
            buyPlayerFromMarket,
            refreshMarket,
            updatePlayerImage,
            updatePlayerStats,
            importPlayers,
            clearInventory,
            deletePlayer,
            isLoading
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame must be used within a GameProvider");
    return context;
};
