
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, GameState, Position, Rarity, MarketListing, MatchHistoryEntry, PlayerAttributesUpdate } from '../types';
import { generatePlayer, INITIAL_SQUAD_POSITIONS, calculatePlayerValue } from '../services/gameLogic';

interface GameContextType {
  state: GameState;
  marketListings: MarketListing[];
  addCoins: (amount: number) => void;
  buyPack: (cost: number) => Player[];
  setSquadPlayer: (index: number, player: Player) => void;
  removeSquadPlayer: (index: number) => void;
  simulateMatchResult: (myScore: number, oppScore: number, oppName: string, isRanked: boolean, goalScorers: string[]) => void;
  quickSellPlayer: (playerId: string) => void;
  buyPlayerFromMarket: (listingId: string) => void;
  refreshMarket: () => void;
  updatePlayerImage: (playerId: string, imageUrl: string) => void;
  updatePlayerStats: (playerId: string, updates: PlayerAttributesUpdate) => void;
  importPlayers: (players: Player[]) => void;
  clearInventory: () => void;
  deletePlayer: (playerId: string) => void;
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
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('jogacraque_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge parsed state with defaultState to ensure new fields
        return { 
          ...defaultState, 
          ...parsed,
          transferFunds: typeof parsed.transferFunds === 'number' ? parsed.transferFunds : defaultState.transferFunds,
          coins: typeof parsed.coins === 'number' ? parsed.coins : defaultState.coins,
          matchHistory: Array.isArray(parsed.matchHistory) ? parsed.matchHistory : [],
          draws: typeof parsed.draws === 'number' ? parsed.draws : 0,
        };
      } catch (e) {
        console.error("Failed to load save", e);
        return defaultState;
      }
    }
    const starterSquad = INITIAL_SQUAD_POSITIONS.map(pos => generatePlayer(Rarity.COMMON, pos));
    return {
      ...defaultState,
      squad: starterSquad,
      inventory: [...starterSquad]
    };
  });

  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);

  useEffect(() => {
    localStorage.setItem('jogacraque_save', JSON.stringify(state));
  }, [state]);

  // Initial Market Seed
  useEffect(() => {
    refreshMarket();
  }, []);

  const refreshMarket = () => {
    const newListings: MarketListing[] = Array(20).fill(null).map((_, i) => {
      const p = generatePlayer();
      return {
        id: `mkt-${Date.now()}-${i}`,
        player: p,
        price: Math.floor((p.marketValue || 100) * (Math.random() * 0.4 + 0.8)), // Price varies 80%-120% of value
        sellerName: `User${Math.floor(Math.random() * 9999)}`,
        expiresAt: Date.now() + 3600000
      };
    });
    setMarketListings(newListings);
  };

  const addCoins = (amount: number) => {
    setState(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const buyPack = (cost: number): Player[] => {
    if (state.coins < cost) {
      alert("Moedas insuficientes!");
      return [];
    }

    const newPlayers = Array(5).fill(null).map(() => generatePlayer());
    
    setState(prev => ({
      ...prev,
      coins: prev.coins - cost,
      inventory: [...prev.inventory, ...newPlayers]
    }));

    return newPlayers;
  };

  const setSquadPlayer = (index: number, player: Player) => {
    const existingIndex = state.squad.findIndex(p => p?.id === player.id);
    
    setState(prev => {
      const newSquad = [...prev.squad];
      if (existingIndex !== -1) {
        newSquad[existingIndex] = null;
      }
      newSquad[index] = player;
      return { ...prev, squad: newSquad };
    });
  };

  const removeSquadPlayer = (index: number) => {
    setState(prev => {
      const newSquad = [...prev.squad];
      newSquad[index] = null;
      return { ...prev, squad: newSquad };
    });
  };

  const quickSellPlayer = (playerId: string) => {
    const player = state.inventory.find(p => p.id === playerId);
    if (!player) return;

    const squadIndex = state.squad.findIndex(p => p?.id === playerId);
    
    let currentSquad = [...state.squad];
    if (squadIndex !== -1) {
       currentSquad[squadIndex] = null;
    }

    const sellValue = player.marketValue || calculatePlayerValue(player);

    setState(prev => ({
      ...prev,
      squad: currentSquad,
      inventory: prev.inventory.filter(p => p.id !== playerId),
      transferFunds: (prev.transferFunds || 0) + sellValue
    }));
  };

  const buyPlayerFromMarket = (listingId: string) => {
    const listing = marketListings.find(l => l.id === listingId);
    if (!listing) return;

    if (state.transferFunds < listing.price) {
      alert("Fundos de Transferência insuficientes!");
      return;
    }

    setState(prev => ({
      ...prev,
      transferFunds: prev.transferFunds - listing.price,
      inventory: [...prev.inventory, listing.player]
    }));

    setMarketListings(prev => prev.filter(l => l.id !== listingId));
    alert(`Você comprou ${listing.player.name}!`);
  };

  const simulateMatchResult = (myScore: number, oppScore: number, oppName: string, isRanked: boolean, goalScorers: string[]) => {
    const win = myScore > oppScore;
    const draw = myScore === oppScore;
    
    // Create history entry
    const historyEntry: MatchHistoryEntry = {
      id: `match-${Date.now()}`,
      opponentName: oppName,
      myScore,
      oppScore,
      result: win ? 'V' : draw ? 'E' : 'D',
      timestamp: Date.now()
    };

    setState(prev => {
      // Update stats for squad players
      const squadIds = prev.squad.map(p => p?.id).filter(id => id !== undefined) as string[];
      
      const updatedInventory = prev.inventory.map(p => {
        if (!squadIds.includes(p.id)) return p;
        
        // Ensure stats object exists (for legacy players)
        const stats = p.stats || { goals: 0, matches: 0, assists: 0 };
        
        // Count goals for this player
        const goalsScored = goalScorers.filter(id => id === p.id).length;
        
        return {
          ...p,
          stats: {
            ...stats,
            matches: stats.matches + 1,
            goals: stats.goals + goalsScored
          }
        };
      });

      // Update squad references with new stats (since squad references objects in inventory conceptually)
      const updatedSquad = prev.squad.map(p => {
        if (!p) return null;
        const updatedP = updatedInventory.find(invP => invP.id === p.id);
        return updatedP || p;
      });

      return {
        ...prev,
        inventory: updatedInventory,
        squad: updatedSquad,
        matchesPlayed: prev.matchesPlayed + 1,
        wins: win ? prev.wins + 1 : prev.wins,
        draws: draw ? prev.draws + 1 : prev.draws,
        losses: (!win && !draw) ? prev.losses + 1 : prev.losses,
        coins: prev.coins + (win ? 200 : draw ? 100 : 50),
        xp: prev.xp + (win ? 100 : 50),
        ratingMMR: isRanked ? (win ? prev.ratingMMR + 25 : draw ? prev.ratingMMR : Math.max(0, prev.ratingMMR - 20)) : prev.ratingMMR,
        matchHistory: [historyEntry, ...prev.matchHistory].slice(0, 50) // Keep last 50
      };
    });
  };

  const updatePlayerImage = (playerId: string, imageUrl: string) => {
    setState(prev => {
      const updatedInventory = prev.inventory.map(p => p.id === playerId ? { ...p, image: imageUrl } : p);
      const updatedSquad = prev.squad.map(p => p?.id === playerId ? { ...p, image: imageUrl } : p);
      return {
        ...prev,
        inventory: updatedInventory,
        squad: updatedSquad
      };
    });
  };

  const updatePlayerStats = (playerId: string, updates: PlayerAttributesUpdate) => {
    setState(prev => {
        const updater = (p: Player) => {
            if (p.id !== playerId) return p;
            return {
                ...p,
                name: updates.name || p.name,
                rating: updates.rating || p.rating,
                position: updates.position || p.position,
                nationality: updates.nationality || p.nationality,
                club: updates.club || p.club,
                collection: updates.collection || p.collection,
                attributes: updates.attributes ? { ...p.attributes, ...updates.attributes } : p.attributes
            };
        };

        const updatedInventory = prev.inventory.map(updater);
        const updatedSquad = prev.squad.map(p => p ? updater(p) : null);

        return {
            ...prev,
            inventory: updatedInventory,
            squad: updatedSquad
        };
    });
  };

  const deletePlayer = (playerId: string) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.filter(p => p.id !== playerId),
      squad: prev.squad.map(p => p?.id === playerId ? null : p)
    }));
  };

  const importPlayers = (newPlayers: Player[]) => {
    setState(prev => {
        const currentInventory = [...prev.inventory];
        const addedPlayers: Player[] = [];

        newPlayers.forEach(newP => {
            if (!newP.baseId) {
                // If no base ID, just add (legacy behavior)
                addedPlayers.push(newP);
                return;
            }

            const existingIndex = currentInventory.findIndex(p => p.baseId === newP.baseId);
            
            if (existingIndex !== -1) {
                // Player exists! Add this new variation to their list
                const existingP = currentInventory[existingIndex];
                const currentVariations = existingP.variations || (existingP.image ? [existingP.image] : []);
                
                // Add new image if not present
                if (newP.image && !currentVariations.includes(newP.image)) {
                    currentInventory[existingIndex] = {
                        ...existingP,
                        variations: [...currentVariations, newP.image]
                    };
                }
            } else {
                // New Player entirely
                const p = {
                    ...newP,
                    variations: newP.image ? [newP.image] : []
                };
                addedPlayers.push(p);
            }
        });

        return {
            ...prev,
            inventory: [...currentInventory, ...addedPlayers]
        };
    });
  };

  const clearInventory = () => {
    setState(prev => ({
      ...prev,
      inventory: [],
      squad: Array(11).fill(null)
    }));
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
      deletePlayer
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