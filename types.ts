
export enum Rarity {
  COMMON = 'Comum',
  RARE = 'Raro',
  EPIC = 'Épico',
  LEGENDARY = 'Lendário'
}

export enum Position {
  GK = 'GOL',
  CB = 'ZAG',
  LB = 'LE',
  RB = 'LD',
  CDM = 'VOL',
  CM = 'MC',
  CAM = 'MEI',
  LM = 'ME',
  RM = 'MD',
  LW = 'PE',
  RW = 'PD',
  ST = 'ATA'
}

export const CARD_COLLECTIONS = [
  'Base',
  'Libertadores',
  'Sulamericana',
  'Carta Secreta',
  'Nostalgic',
  'Eternos Heróis',
  'Nova Geração',
  'Halloween',
  'Legado Imortal',
  'Parceria Corinthians',
  'Parceria Bahia',
  'Futebol Arte',
  'Parceria Cruzeiro',
  'Multifuncionais',
  'Copa do Brasil',
  'Craques Europeus Lendas',
  'Parceria SP',
  'Aniversário',
  'Melhores Transferencias',
  'Fim de Uma Era',
  'Carrascos',
  'Escolhas',
  'Craques Europeus',
  'Mundial',
  'Versus'
];

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  vision: number;        // Novo
  positioning: number;   // Novo
}

export interface PlayerAttributesUpdate {
  name?: string;
  rating?: number;
  position?: Position;
  nationality?: string;
  club?: string;
  collection?: string;
  attributes?: PlayerAttributes;
}

export interface PlayerStats {
  matches: number;
  goals: number;
  assists: number;
}

export interface Player {
  id: string;
  baseId?: string; // ID único do jogador (sem variação)
  variation?: string; // O sufixo atual desta instância
  variations?: string[]; // Lista de todas as URLs de imagens disponíveis para este jogador
  name: string;
  position: Position;
  nationality?: string;
  club?: string;
  collection?: string; // Coleção da carta (ex: Libertadores, Halloween)
  rarity: Rarity;
  rating: number;
  attributes: PlayerAttributes;
  image?: string;
  level: number;
  xp: number;
  marketValue?: number;
  stats: PlayerStats;
}

export interface Formation {
  name: string;
  positions: Position[];
}

export type MatchEventType = 
  | 'GOAL' | 'GOAL_HEADER' | 'GOAL_LONG' | 'GOAL_BICYCLE' | 'GOAL_OLYMPIC' | 'GOAL_FK' | 'GOAL_PENALTY'
  | 'MISS' | 'SAVE' | 'BLOCKED_SHOT' | 'FOUL' | 'CARD_YELLOW' | 'CARD_RED' | 'OFFSIDE'
  | 'VAR_CHECK' | 'VAR_CONFIRMED' | 'VAR_ANNULLED'
  | 'HALF_TIME' | 'FULL_TIME' | 'START' | 'SUBSTITUTION' | 'SKILL_MOVE'
  | 'PASS' | 'INTERCEPTION' | 'TACKLE'
  | 'CORNER' | 'FREE_KICK' | 'PENALTY_AWARDED'
  | 'BUILDUP'
  | 'SECOND_HALF_START' | 'FREEKICK_PASS' | 'FREEKICK_CROSS'
  | 'KICKOFF' | 'PASS_ATTACKING' | 'PASS_DEFENSIVE' | 'DRIBBLE_SIMPLE';

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  description: string;
  team: 'home' | 'away' | null;
}

export interface MatchHistoryEntry {
  id: string;
  opponentName: string;
  myScore: number;
  oppScore: number;
  result: 'V' | 'D' | 'E';
  timestamp: number;
}

export interface GameState {
  userTeamName: string;
  coins: number;
  gems: number;
  transferFunds: number;
  inventory: Player[];
  squad: (Player | null)[];
  bench: Player[];
  level: number;
  xp: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  ratingMMR: number;
  matchHistory: MatchHistoryEntry[];
}

export interface MarketListing {
  id: string;
  player: Player;
  price: number;
  sellerName: string;
  expiresAt: number;
}

export type MatchZone = 'DEFENSE' | 'MIDFIELD' | 'ATTACK' | 'BOX';
export type SetPieceType = 'NONE' | 'CORNER' | 'FREEKICK' | 'PENALTY' | 'KICKOFF';

export interface BallState {
  zone: MatchZone;
  possessionTeam: 'home' | 'away';
  isSetPiece: SetPieceType;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isSystem?: boolean;
  timestamp: number;
}

export const COUNTRIES = [
  'Brazil', 'Argentina', 'France', 'Germany', 'Spain', 'England', 'Italy', 'Portugal', 'Netherlands', 'Uruguay'
];
