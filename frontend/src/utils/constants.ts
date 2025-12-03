// API URLs
export const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Game Constants
export const INITIAL_COINS = 1000;
export const INITIAL_GEMS = 50;
export const INITIAL_TRANSFER_FUNDS = 5000;

// Match Constants
export const MATCH_DURATION = 90; // minutes
export const EVENTS_PER_MATCH = 20;

// Player Constants
export const MAX_SQUAD_SIZE = 11;
export const MAX_BENCH_SIZE = 7;
export const MAX_INVENTORY_SIZE = 100;

// Market Constants
export const MARKET_LISTING_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms
export const MARKET_FEE_PERCENTAGE = 5;

// XP and Leveling
export const XP_PER_LEVEL = 100;
export const XP_PER_WIN = 50;
export const XP_PER_DRAW = 25;
export const XP_PER_LOSS = 10;

// Rating/MMR
export const INITIAL_MMR = 1000;
export const MMR_CHANGE_WIN = 25;
export const MMR_CHANGE_LOSS = -20;
