
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { calculateTeamRating, generatePlayer, INITIAL_SQUAD_POSITIONS, getCommentary } from '../services/gameLogic';
import { MatchEvent, Player, MatchZone, BallState, SetPieceType, MatchEventType, Position, ChatMessage } from '../types';
import { Users, Swords, Globe, ArrowLeft, Share2, Shield, Activity, AlertCircle, Flag, Trophy, XCircle, Hand, AlertTriangle, Play, FastForward, CheckCircle, XOctagon, MessageCircle, Send, X, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { socketService } from '../services/socket';

const MATCH_DURATION_MS = 120000; // 2 minutes
const GAME_TICKS = 90;

type MatchMode = 'MENU' | 'CAMPAIGN' | 'RANKED' | 'FRIENDLY_LOBBY' | 'PLAYING';

interface TeamStats {
  possession: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  corners: number;
  shots: number;
}

interface DramaticEvent {
  type: 'GOAL' | 'SAVE' | 'MISS' | 'RED_CARD';
  title: string;
  subtitle: string;
  teamColor: string; // 'green' | 'red' | 'blue'
}

export const Match: React.FC = () => {
  const { state, simulateMatchResult } = useGame();
  
  const [mode, setMode] = useState<MatchMode>('MENU');
  const [matchType, setMatchType] = useState<'ranked' | 'friendly' | 'campaign'>('campaign');
  const [matchFinished, setMatchFinished] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [opponent, setOpponent] = useState<Player[]>([]);
  const [oppName, setOppName] = useState('Adversário');
  
  // Stats State
  const [matchStats, setMatchStats] = useState<{ home: TeamStats, away: TeamStats }>({
    home: { possession: 0, fouls: 0, yellowCards: 0, redCards: 0, corners: 0, shots: 0 },
    away: { possession: 0, fouls: 0, yellowCards: 0, redCards: 0, corners: 0, shots: 0 }
  });

  // Player Card Tracking (ID -> 'YELLOW' | 'RED')
  const [playerCards, setPlayerCards] = useState<Record<string, 'YELLOW' | 'RED'>>({});
  
  // Simulation State
  const [ball, setBall] = useState<BallState>({ zone: 'MIDFIELD', possessionTeam: 'home', isSetPiece: 'NONE' });
  const [pendingVar, setPendingVar] = useState<{ active: boolean, goalTeam: 'home' | 'away' | null, lastGoalMinute: number, lastGoalPlayer: string | null }>({ active: false, goalTeam: null, lastGoalMinute: 0, lastGoalPlayer: null });
  const [isPaused, setIsPaused] = useState(false);
  
  // Visual Overlay State
  const [dramaticEvent, setDramaticEvent] = useState<DramaticEvent | null>(null);

  // Lobby & Socket States
  const [inviteCode, setInviteCode] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [findingMatch, setFindingMatch] = useState(false);
  
  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);

  const goalScorers = useRef<string[]>([]);
  const possessionRef = useRef<{ home: number, away: number }>({ home: 0, away: 0 });
  const waitTicks = useRef<number>(0);
  const halftimeProcessed = useRef(false);
  
  // Ref changed to target the container, not the end element
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll container to bottom without moving the whole page
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTop = feedContainerRef.current.scrollHeight;
    }
  }, [events]);

  useEffect(() => {
    // Scroll chat container to bottom directly using scrollTop to avoid page jump
    if (chatContainerRef.current && chatOpen) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    if (chatOpen) {
        setUnreadMessages(0);
    }
  }, [chatMessages, chatOpen]);

  // SOCKET LISTENERS
  useEffect(() => {
    socketService.connect();

    socketService.on('match_found', (data: any) => {
        setFindingMatch(false);
        setOppName(data.opponentName);
        setOpponent(data.opponentSquad);
        setMode('PLAYING');
        startMatchLogic();
        setChatMessages([{
            id: 'sys-start',
            sender: 'Sistema',
            text: 'Conectado ao chat da partida.',
            isSystem: true,
            timestamp: Date.now()
        }]);
        setChatOpen(true); // Open chat automatically on start
    });

    socketService.on('chat_message', (msg: ChatMessage) => {
        setChatMessages(prev => [...prev, msg]);
        if (!chatOpen) {
            setUnreadMessages(prev => prev + 1);
        }
    });

    return () => {
        socketService.disconnect();
    };
  }, [chatOpen]);

  const userTeamRating = calculateTeamRating(state.squad);
  const oppTeamRating = calculateTeamRating(opponent);

  const prepareMatch = (type: 'ranked' | 'friendly' | 'campaign') => {
    if (state.squad.some(p => p === null)) {
      alert("Você precisa de um time completo de 11 jogadores para jogar!");
      return;
    }
    setMatchType(type);
    goalScorers.current = [];
    possessionRef.current = { home: 0, away: 0 };
    waitTicks.current = 0;
    halftimeProcessed.current = false;

    if (type === 'ranked') {
      setFindingMatch(true);
      socketService.emit('join_ranked_queue', { mmr: state.ratingMMR });
    } else if (type === 'campaign') {
      const oppSquad = INITIAL_SQUAD_POSITIONS.map(pos => generatePlayer(undefined, pos)); 
      setOpponent(oppSquad);
      setOppName('CPU Club');
      setMode('PLAYING');
      startMatchLogic();
    } else {
      setMode('FRIENDLY_LOBBY');
      setLobbyCode(Math.random().toString(36).substring(7).toUpperCase());
    }
  };

  const cancelSearch = () => {
      setFindingMatch(false);
      socketService.emit('cancel_search', {});
  };

  const joinFriendly = () => {
     if (!inviteCode) return;
     // Simulating socket join for friendly
     const oppSquad = INITIAL_SQUAD_POSITIONS.map(pos => generatePlayer(undefined, pos));
     setOpponent(oppSquad);
     setOppName('Amigo Convidado');
     setMode('PLAYING');
     startMatchLogic();
  };

  const handleSendMessage = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!chatInput.trim()) return;

      const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: state.userTeamName,
          text: chatInput,
          timestamp: Date.now()
      };

      // Optimistic update
      setChatMessages(prev => [...prev, newMsg]);
      socketService.emit('send_chat_message', { text: chatInput });
      setChatInput('');
  };

  const startMatchLogic = () => {
    setMatchFinished(false);
    setScore({ home: 0, away: 0 });
    setEvents([]);
    setCurrentMinute(0);
    setBall({ zone: 'MIDFIELD', possessionTeam: 'home', isSetPiece: 'KICKOFF' });
    setPendingVar({ active: false, goalTeam: null, lastGoalMinute: 0, lastGoalPlayer: null });
    setIsPaused(false);
    setDramaticEvent(null);
    setPlayerCards({});
    setMatchStats({
        home: { possession: 0, fouls: 0, yellowCards: 0, redCards: 0, corners: 0, shots: 0 },
        away: { possession: 0, fouls: 0, yellowCards: 0, redCards: 0, corners: 0, shots: 0 }
    });
    setChatMessages([]);
    
    // Initial Commentary
    const text = getCommentary('START', { teamName: state.userTeamName, opposingTeam: oppName });
    setEvents([{ minute: 0, type: 'START', description: text, team: null }]);
  };

  useEffect(() => {
    if (mode !== 'PLAYING' || matchFinished || isPaused) return;

    const intervalTime = MATCH_DURATION_MS / GAME_TICKS;
    const timer = setInterval(() => {
      // Logic Pause (Cooldown for set pieces)
      if (waitTicks.current > 0) {
         waitTicks.current--;
         // Clear dramatic event if wait is mostly over
         if (waitTicks.current === 1 && dramaticEvent) {
             setDramaticEvent(null);
         }
         return;
      }

      setCurrentMinute(prev => {
        if (prev >= 45 && !halftimeProcessed.current) {
            halftimeProcessed.current = true;
            handleHalfTime(prev);
            return prev;
        }

        if (prev >= 90) {
          clearInterval(timer);
          finishMatch();
          return 90;
        }
        const tick = prev + 1;
        processMatchTick(tick);
        return tick;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [mode, matchFinished, ball, pendingVar, isPaused, dramaticEvent]);

  const handleHalfTime = (minute: number) => {
    setIsPaused(true);
    addCommentaryEvent(minute, 'HALF_TIME', { scoreHome: score.home, scoreAway: score.away });
    
    // 5 seconds pause then restart
    setTimeout(() => {
       addCommentaryEvent(45, 'SECOND_HALF_START', { teamName: state.userTeamName });
       setIsPaused(false);
       // Ensure kickoff happens
       setBall({ zone: 'MIDFIELD', possessionTeam: 'home', isSetPiece: 'KICKOFF' });
    }, 5000);
  };

  const triggerDramaticEvent = (type: 'GOAL' | 'SAVE' | 'MISS' | 'RED_CARD', title: string, subtitle: string, teamColor: string) => {
      setDramaticEvent({ type, title, subtitle, teamColor });
      // The event will be cleared by the waitTicks logic or a timeout fallback
      setTimeout(() => setDramaticEvent(null), 4000);
  };

  // Helper to get a defender from the opposing team based on zone
  const getZoneDefender = (zone: MatchZone, defendingSquad: (Player | null)[]): Player => {
     const validPlayers = defendingSquad.filter(p => p !== null) as Player[];
     if (validPlayers.length === 0) return generatePlayer(); // Fallback

     let targetPositions: Position[] = [];

     // If ball is in Attack (Opponent Defense)
     if (zone === 'ATTACK' || zone === 'BOX') {
        targetPositions = [Position.CB, Position.LB, Position.RB, Position.GK];
     } else if (zone === 'MIDFIELD') {
        targetPositions = [Position.CDM, Position.CM, Position.CAM, Position.LM, Position.RM];
     } else {
        // Ball in Defense (Opponent Attackers pressing)
        targetPositions = [Position.ST, Position.LW, Position.RW, Position.CAM];
     }

     const candidates = validPlayers.filter(p => targetPositions.includes(p.position));
     // Return a candidate or random player if none found in position
     return candidates.length > 0 
        ? candidates[Math.floor(Math.random() * candidates.length)] 
        : validPlayers[Math.floor(Math.random() * validPlayers.length)];
  };

  // --------------------------------------------------------------------------------
  // ROBUST MATCH ENGINE
  // --------------------------------------------------------------------------------
  const processMatchTick = (minute: number) => {
    // Update Possession silently
    possessionRef.current[ball.possessionTeam]++;

    // 1. Handle VAR Interruption
    if (pendingVar.active) {
       // Wait 1-2 ticks before resolving
       if (Math.random() < 0.5) {
          resolveVar(minute);
       }
       return; 
    }

    const isHome = ball.possessionTeam === 'home';
    const attackingTeamName = isHome ? state.userTeamName : oppName;
    const defendingTeamName = isHome ? oppName : state.userTeamName;
    const attackingSquad = isHome ? state.squad : opponent;
    const defendingSquad = isHome ? opponent : state.squad;

    // --- EVENT GENERATION LOGIC ---
    
    // Select active player based on zone
    let activePlayer: Player | null = null;
    const possiblePlayers = attackingSquad.filter(p => p !== null);
    
    if (possiblePlayers.length > 0) {
       const zonePlayers = possiblePlayers.filter(p => {
          if (ball.zone === 'DEFENSE') return [Position.GK, Position.CB, Position.LB, Position.RB].includes(p!.position);
          if (ball.zone === 'MIDFIELD') return [Position.CDM, Position.CM, Position.CAM, Position.LM, Position.RM].includes(p!.position);
          return [Position.ST, Position.LW, Position.RW, Position.CAM].includes(p!.position);
       });
       activePlayer = zonePlayers.length > 0 
          ? zonePlayers[Math.floor(Math.random() * zonePlayers.length)]! 
          : possiblePlayers[Math.floor(Math.random() * possiblePlayers.length)]!;
    }

    const playerName = activePlayer ? activePlayer.name : 'Jogador';

    // A. SET PIECE LOGIC
    if (ball.isSetPiece !== 'NONE') {
       handleSetPiece(minute, playerName, attackingTeamName, defendingTeamName, isHome, defendingSquad);
       return;
    }

    // B. DECISION MAKING (Pass vs Dribble vs Shoot)
    // Probabilities based on zone
    let action: 'PASS' | 'DRIBBLE' | 'SHOOT' = 'PASS';
    const r = Math.random();

    if (ball.zone === 'DEFENSE') {
       action = r < 0.9 ? 'PASS' : 'DRIBBLE'; // Safe play
    } else if (ball.zone === 'MIDFIELD') {
       action = r < 0.8 ? 'PASS' : 'DRIBBLE'; // Build up
    } else if (ball.zone === 'ATTACK') {
       // In Attack zone, priority is getting to BOX via Pass or Dribble
       action = r < 0.6 ? 'PASS' : (r < 0.95 ? 'DRIBBLE' : 'SHOOT'); 
    } else if (ball.zone === 'BOX') {
       // In Box, high priority to Shoot
       action = r < 0.8 ? 'SHOOT' : 'DRIBBLE'; 
    }

    // Get a specific defender to contest the action
    const defender = getZoneDefender(ball.zone, defendingSquad);

    // C. EXECUTE ACTION
    if (action === 'PASS') {
        const passStat = activePlayer?.attributes.passing || 50;
        const interceptStat = (defender.attributes.defending + defender.attributes.vision) / 2;
        
        // DUEL: Attacker Passing vs Defender Intercepting
        // Base ease + Ratio of stats
        // Passing is generally easier than intercepting, so base chance is higher
        const duelRatio = passStat / (passStat + interceptStat);
        const successChance = 0.4 + duelRatio; // e.g., 0.4 + 0.5 = 90% chance if equal

        if (Math.random() < successChance) {
            // Successful Pass -> Move forward (sometimes stay in zone to build possession)
            const advance = Math.random() < 0.6; // 60% chance to move zone forward
            if (advance) {
                if (ball.zone === 'DEFENSE') setBall(prev => ({ ...prev, zone: 'MIDFIELD' }));
                else if (ball.zone === 'MIDFIELD') setBall(prev => ({ ...prev, zone: 'ATTACK' }));
                else if (ball.zone === 'ATTACK') setBall(prev => ({ ...prev, zone: 'BOX' }));
                
                // Narrative Control for Passes
                if (ball.zone === 'ATTACK') { // Into the box next
                    // Decisive Pass (Assist) logic
                    if (Math.random() < 0.5) {
                        addCommentaryEvent(minute, 'PASS_ATTACKING', { playerName, teamName: attackingTeamName });
                    }
                } else if (Math.random() < 0.15) { // 15% chance to narrate defensive/midfield pass
                    const eventType = ball.zone === 'DEFENSE' ? 'PASS_DEFENSIVE' : 'PASS_ATTACKING';
                    // Override for midfield generic pass
                    if (ball.zone === 'MIDFIELD') {
                        addCommentaryEvent(minute, 'DRIBBLE_SIMPLE', { playerName }); // Reusing simple progression message for variety
                    } else {
                        addCommentaryEvent(minute, 'PASS_DEFENSIVE', { playerName, teamName: attackingTeamName });
                    }
                } else if (Math.random() < 0.05) { // 5% chance to narrate buildup
                    addCommentaryEvent(minute, 'BUILDUP', { teamName: attackingTeamName });
                }
            } else {
                // Keep possession, sideways pass.
                if (Math.random() < 0.05) { 
                    addCommentaryEvent(minute, 'BUILDUP', { teamName: attackingTeamName });
                }
            }
        } else {
            // Interception
            if (Math.random() < 0.3) { // Only narrate some interceptions
                 addCommentaryEvent(minute, 'INTERCEPTION', { teamName: defendingTeamName });
            }
            setBall(prev => ({
                zone: prev.zone === 'BOX' ? 'DEFENSE' : prev.zone === 'ATTACK' ? 'MIDFIELD' : 'MIDFIELD',
                possessionTeam: isHome ? 'away' : 'home',
                isSetPiece: 'NONE'
            }));
        }

    } else if (action === 'DRIBBLE') {
        const dribbleStat = activePlayer?.attributes.dribbling || 50;
        const tackleStat = (defender.attributes.defending + defender.attributes.physical) / 2;
        
        // DUEL: Attacker Dribble vs Defender Tackle
        const duelRatio = dribbleStat / (dribbleStat + tackleStat);
        const successChance = 0.2 + duelRatio; // Dribbling is harder, base 0.2 + 0.5 = 70% if equal

        if (Math.random() < successChance) {
            // Success Dribble
            if (ball.zone === 'ATTACK' || ball.zone === 'BOX') {
                addCommentaryEvent(minute, 'SKILL_MOVE', { playerName });
            } else if (Math.random() < 0.2) {
                addCommentaryEvent(minute, 'DRIBBLE_SIMPLE', { playerName });
            }

            // Chance to advance zone
            if (Math.random() < 0.5) {
                 if (ball.zone === 'DEFENSE') setBall(prev => ({ ...prev, zone: 'MIDFIELD' }));
                 else if (ball.zone === 'MIDFIELD') setBall(prev => ({ ...prev, zone: 'ATTACK' }));
                 else if (ball.zone === 'ATTACK') setBall(prev => ({ ...prev, zone: 'BOX' }));
            }
        } else {
            // Tackle / Foul
            // Determine if it was a clean tackle or foul based on defender's defending stat
            // Higher defending = less fouls
            const foulChance = Math.max(0.05, 0.4 - (defender.attributes.defending / 200));

            if (Math.random() < foulChance) {
                // Foul
                addCommentaryEvent(minute, 'FOUL', { teamName: defendingTeamName });
                waitTicks.current = 3; // Pause 3 ticks for Foul

                // Card calculation
                if (Math.random() < 0.3) {
                   setTimeout(() => {
                        addCommentaryEvent(minute, 'CARD_RED', { teamName: defendingTeamName, playerName: defender.name });
                        triggerDramaticEvent('RED_CARD', 'EXPULSÃO!', `Falta violenta de ${defender.name}!`, 'red');
                        setPlayerCards(prev => ({ ...prev, [defender.id]: 'RED' }));
                        waitTicks.current = 4; // Extra pause for Card
                   }, 500);
                } else if (Math.random() < 0.6) {
                    setTimeout(() => {
                        addCommentaryEvent(minute, 'CARD_YELLOW', { teamName: defendingTeamName, playerName: defender.name });
                        setPlayerCards(prev => ({ ...prev, [defender.id]: 'YELLOW' }));
                        waitTicks.current = 3; 
                   }, 500);
                }
                
                // Ensure possession changes to the team that suffered the foul
                setBall(prev => ({ 
                   ...prev, 
                   isSetPiece: 'FREEKICK',
                   possessionTeam: isHome ? 'home' : 'away' // Keep possession
                }));
            } else {
                // Clean Tackle
                if (Math.random() < 0.4) {
                    addCommentaryEvent(minute, 'TACKLE', { teamName: defendingTeamName });
                }
                setBall(prev => ({
                    zone: prev.zone,
                    possessionTeam: isHome ? 'away' : 'home',
                    isSetPiece: 'NONE'
                }));
            }
        }

    } else if (action === 'SHOOT') {
        const type = ball.zone === 'ATTACK' ? 'GOAL_LONG' : 'GOAL';
        attemptGoal(minute, activePlayer, isHome, type, defendingSquad);
    }
  };

  const handleSetPiece = (minute: number, playerName: string, attackingTeam: string, defendingTeam: string, isHome: boolean, defendingSquad: (Player | null)[]) => {
     if (ball.isSetPiece === 'KICKOFF') {
        addCommentaryEvent(minute, 'KICKOFF', { teamName: attackingTeam });
        setBall(prev => ({ ...prev, zone: 'MIDFIELD', isSetPiece: 'NONE' }));
        return;
     }

     if (ball.isSetPiece === 'CORNER') {
        waitTicks.current = 2; // Setup time
        if (Math.random() < 0.01) { // 1% Olympic Goal
            attemptGoal(minute, null, isHome, 'GOAL_OLYMPIC', defendingSquad);
        } else if (Math.random() < 0.2) { // Header Goal
            attemptGoal(minute, null, isHome, 'GOAL_HEADER', defendingSquad);
        } else {
            // Cleared
            setBall(prev => ({ ...prev, zone: 'MIDFIELD', possessionTeam: isHome ? 'away' : 'home', isSetPiece: 'NONE' }));
        }
     } else if (ball.isSetPiece === 'FREEKICK') {
        waitTicks.current = 2; // Setup time
        if (ball.zone === 'ATTACK' || ball.zone === 'BOX') {
           if (Math.random() < 0.08) { // 8% Direct FK Goal
              attemptGoal(minute, null, isHome, 'GOAL_FK', defendingSquad);
           } else {
              if (Math.random() < 0.5) {
                 addCommentaryEvent(minute, 'FREEKICK_CROSS', { playerName }); 
                 // Small chance of header goal next tick
                 setBall(prev => ({ ...prev, isSetPiece: 'CORNER', zone: 'BOX' })); // Treat as Corner logic for header
              } else {
                 addCommentaryEvent(minute, 'FREEKICK_PASS', { playerName });
                 setBall(prev => ({ ...prev, isSetPiece: 'NONE' }));
              }
           }
        } else {
           addCommentaryEvent(minute, 'FREEKICK_PASS', { playerName });
           setBall(prev => ({ ...prev, isSetPiece: 'NONE' }));
        }
     } else if (ball.isSetPiece === 'PENALTY') {
        attemptGoal(minute, null, isHome, 'GOAL_PENALTY', defendingSquad);
     }
  };

  const attemptGoal = (minute: number, player: Player | null, isHome: boolean, type: MatchEventType, defendingSquad: (Player | null)[]) => {
     // Get Opponent GK
     const gk = defendingSquad.find(p => p?.position === Position.GK) || generatePlayer(); // Fallback GK if none

     const shootingStat = player?.attributes.shooting || 60;
     const gkReflex = gk.attributes.defending || 60;

     // DUEL: Shooter vs GK
     const duelRatio = shootingStat / (shootingStat + gkReflex);
     
     let goalChance = duelRatio; // Base chance derived from duel

     // Context Modifiers
     if (type === 'GOAL_LONG') goalChance *= 0.3; // Much harder
     if (type === 'GOAL_HEADER') goalChance *= 0.7; // Harder than shot
     if (type === 'GOAL_PENALTY') goalChance = 0.8; // High chance regardless
     if (type === 'GOAL_FK') goalChance *= 0.4;
     if (type === 'GOAL_OLYMPIC') goalChance = 0.05;

     // 1. Check if ON TARGET
     // On target is slightly easier than scoring
     const onTargetChance = Math.min(0.9, goalChance * 2); 

     if (Math.random() < onTargetChance) {
        // IT IS ON TARGET
        // Update Shot Stats
        setMatchStats(prev => ({
            ...prev,
            [isHome ? 'home' : 'away']: { ...prev[isHome ? 'home' : 'away'], shots: prev[isHome ? 'home' : 'away'].shots + 1 }
        }));

        // Now check if Goal or Save based on the real goal chance vs target chance ratio
        if (Math.random() < (goalChance / onTargetChance)) {
            // GOAL SCENARIO
            // 1. CONFIRM GOAL PROVISIONALLY
            confirmGoal(minute, isHome, type, player);
            waitTicks.current = 5; // Long Celebration time (approx 6-7s)

            // 2. TRIGGER VAR CHECK (After the goal is recorded)
             if (type !== 'GOAL_PENALTY' && Math.random() < 0.2) {
                // Wait 1 tick then start VAR
                setTimeout(() => {
                   triggerVar(minute, isHome, player?.name || 'Jogador', player?.id || null);
                }, 100); 
             }
        } else {
            // SAVE!
            addCommentaryEvent(minute, 'SAVE', { playerName: player?.name });
            triggerDramaticEvent('SAVE', 'DEFESAÇA!', `O goleiro de ${isHome ? oppName : state.userTeamName} salvou!`, 'blue');
            setBall(prev => ({ ...prev, isSetPiece: 'CORNER' }));
        }
     } else {
        // OFF TARGET or BLOCKED
        if (Math.random() < 0.3) {
            addCommentaryEvent(minute, 'BLOCKED_SHOT', { playerName: player?.name });
            setBall(prev => ({ ...prev, isSetPiece: 'CORNER' }));
        } else {
            addCommentaryEvent(minute, 'MISS', { playerName: player?.name });
            triggerDramaticEvent('MISS', 'PRA FORA!', `Chance perdida por ${player?.name || 'atacante'}`, 'red');
            // Goal Kick
            setBall(prev => ({ zone: 'DEFENSE', possessionTeam: isHome ? 'away' : 'home', isSetPiece: 'NONE' }));
        }
        // Count shot anyway
        setMatchStats(prev => ({
            ...prev,
            [isHome ? 'home' : 'away']: { ...prev[isHome ? 'home' : 'away'], shots: prev[isHome ? 'home' : 'away'].shots + 1 }
        }));
     }
  };

  const triggerVar = (minute: number, isHome: boolean, playerName: string, playerId: string | null) => {
     addCommentaryEvent(minute, 'VAR_CHECK', {});
     setPendingVar({ 
        active: true, 
        goalTeam: isHome ? 'home' : 'away',
        lastGoalMinute: minute,
        lastGoalPlayer: playerId
     });
     waitTicks.current = 0; // Reset wait to allow VAR loop processing
  };

  const resolveVar = (minute: number) => {
     const confirmed = Math.random() > 0.3; // 70% confirm
     if (confirmed) {
        addCommentaryEvent(minute, 'VAR_CONFIRMED', {});
        // Goal stays valid, reset ball kickoff
        setBall({ zone: 'MIDFIELD', possessionTeam: pendingVar.goalTeam === 'home' ? 'away' : 'home', isSetPiece: 'KICKOFF' });
        waitTicks.current = 4; // Pause after confirmation
     } else {
        addCommentaryEvent(minute, 'VAR_ANNULLED', {});
        // REVERSE THE GOAL
        setScore(prev => pendingVar.goalTeam === 'home' ? { ...prev, home: prev.home - 1 } : { ...prev, away: prev.away - 1 });
        // Remove from scorer list if needed
        if (pendingVar.lastGoalPlayer && pendingVar.goalTeam === 'home') {
           const idx = goalScorers.current.lastIndexOf(pendingVar.lastGoalPlayer);
           if (idx > -1) goalScorers.current.splice(idx, 1);
        }

        const isHome = pendingVar.goalTeam === 'home';
        setBall({ zone: 'DEFENSE', possessionTeam: isHome ? 'away' : 'home', isSetPiece: 'FREEKICK' }); // Indirect FK for offside
        waitTicks.current = 4; // Pause after annulment
     }
     setPendingVar({ active: false, goalTeam: null, lastGoalMinute: 0, lastGoalPlayer: null });
  };

  const confirmGoal = (minute: number, isHome: boolean, type: MatchEventType, player: Player | null) => {
     setScore(prev => isHome ? { ...prev, home: prev.home + 1 } : { ...prev, away: prev.away + 1 });
     addCommentaryEvent(minute, type, { 
        playerName: player?.name, 
        teamName: isHome ? state.userTeamName : oppName 
     });
     
     triggerDramaticEvent('GOAL', 'GOOOOL!', `${player?.name || 'Jogador'} (${isHome ? state.userTeamName : oppName})`, 'green');

     if (isHome && player) {
        goalScorers.current.push(player.id);
     }
     // Setup Kickoff for opponent
     setBall({ zone: 'MIDFIELD', possessionTeam: isHome ? 'away' : 'home', isSetPiece: 'KICKOFF' });
  };

  const addCommentaryEvent = (minute: number, type: MatchEventType, context: any) => {
     // SYNC STATS UPDATE WITH COMMENTARY
     setMatchStats(prev => ({
         home: { ...prev.home, possession: possessionRef.current.home },
         away: { ...prev.away, possession: possessionRef.current.away }
     }));

     const text = getCommentary(type, context);
     
     let team: 'home' | 'away' | null = null;
     if (context.teamName) {
         team = context.teamName === state.userTeamName ? 'home' : context.teamName === oppName ? 'away' : null;
     } else if (context.playerName) {
         const inHome = state.squad.some(p => p?.name === context.playerName);
         team = inHome ? 'home' : 'away';
     }

     if (team) {
         setMatchStats(prev => {
             const newStats = { ...prev };
             if (type === 'FOUL') newStats[team!].fouls++;
             if (type === 'CARD_YELLOW') newStats[team!].yellowCards++;
             if (type === 'CARD_RED') newStats[team!].redCards++;
             if (type === 'CORNER') newStats[team!].corners++;
             return newStats;
         });
     }

     setEvents(prev => [...prev, { minute, type, description: text, team }]);
  };

  const finishMatch = () => {
    setMatchFinished(true);
    addCommentaryEvent(90, 'FULL_TIME', { scoreHome: score.home, scoreAway: score.away });
    simulateMatchResult(score.home, score.away, oppName, matchType === 'ranked', goalScorers.current);
  };

  const returnToMenu = () => {
    setMode('MENU');
    setMatchFinished(false);
    setChatMessages([]);
    if (matchType === 'ranked') {
        socketService.disconnect(); // Cleanup
    }
  };

  const getPositionColor = (pos: string) => {
     if (pos === 'GOL') return 'bg-yellow-600 text-yellow-100 border-yellow-500';
     if (['ZAG', 'LE', 'LD', 'CB', 'LB', 'RB'].includes(pos)) return 'bg-blue-600 text-blue-100 border-blue-500';
     if (['VOL', 'MC', 'MEI', 'ME', 'MD', 'CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos)) return 'bg-green-600 text-green-100 border-green-500';
     return 'bg-red-600 text-red-100 border-red-500';
  };

  const totalTicks = matchStats.home.possession + matchStats.away.possession;
  const homePossessionPct = totalTicks === 0 ? 50 : Math.round((matchStats.home.possession / totalTicks) * 100);
  const awayPossessionPct = 100 - homePossessionPct;

  // Helper to get Event Icon and Label
  const getEventBadge = (type: MatchEventType) => {
    if (type.includes('GOAL')) return { label: 'GOL', color: 'bg-yellow-500 text-black', icon: Trophy };
    if (type.includes('CARD')) return { label: 'CARTÃO', color: 'bg-red-500 text-white', icon: AlertCircle };
    if (type.includes('CORNER')) return { label: 'ESCANTEIO', color: 'bg-blue-500 text-white', icon: Flag };
    if (type.includes('VAR')) return { label: 'VAR', color: 'bg-purple-500 text-white', icon: AlertTriangle };
    if (type === 'PASS_ATTACKING') return { label: 'CRIAÇÃO', color: 'bg-blue-400 text-white', icon: FastForward };
    if (type === 'SKILL_MOVE') return { label: 'DRIBLE', color: 'bg-purple-400 text-white', icon: Play };
    if (type === 'INTERCEPTION' || type === 'TACKLE' || type === 'SAVE') return { label: 'DEFESA', color: 'bg-slate-500 text-white', icon: Shield };
    if (type === 'PASS_DEFENSIVE' || type === 'BUILDUP') return { label: 'ORGANIZAÇÃO', color: 'bg-slate-600 text-slate-200', icon: Activity };
    if (type === 'MISS' || type === 'BLOCKED_SHOT') return { label: 'PERIGO', color: 'bg-orange-500 text-white', icon: XOctagon };
    return null;
  };

  if (mode === 'MENU') {
    return (
      <div className="max-w-4xl mx-auto py-10 animate-fade-in-up">
        <h2 className="text-4xl font-display font-bold text-center mb-10 text-white">Escolha o Modo de Jogo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => prepareMatch('campaign')}
            className="group bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-green-500 hover:bg-slate-750 transition-all flex flex-col items-center text-center shadow-lg hover:shadow-green-900/20 hover:-translate-y-1"
          >
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ring-1 ring-green-500/30">
              <Globe size={40} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Campanha</h3>
            <p className="text-slate-400 text-sm">Jogue contra a IA para ganhar recompensas e XP.</p>
          </button>

          <button 
            onClick={() => prepareMatch('ranked')}
            className="group bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-purple-500 hover:bg-slate-750 transition-all flex flex-col items-center text-center relative overflow-hidden shadow-lg hover:shadow-purple-900/20 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md">MMR: {state.ratingMMR}</div>
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ring-1 ring-purple-500/30">
              <Swords size={40} className="text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Ranked PvP</h3>
            <p className="text-slate-400 text-sm">Encontre adversários do seu nível. Suba no ranking!</p>
          </button>

          <button 
            onClick={() => prepareMatch('friendly')}
            className="group bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500 hover:bg-slate-750 transition-all flex flex-col items-center text-center shadow-lg hover:shadow-blue-900/20 hover:-translate-y-1"
          >
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ring-1 ring-blue-500/30">
              <Users size={40} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Amistoso</h3>
            <p className="text-slate-400 text-sm">Crie ou entre em uma sala para jogar contra um amigo.</p>
          </button>
        </div>
      </div>
    );
  }

  if (findingMatch) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-6">
        <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-purple-500/20"></div>
            <div className="absolute inset-0 flex items-center justify-center font-bold font-mono text-purple-400 animate-pulse">
                Ranked
            </div>
        </div>
        <h2 className="text-3xl font-display font-bold animate-pulse text-white">Buscando Oponente...</h2>
        <div className="bg-slate-800 px-6 py-3 rounded-xl border border-slate-700 flex flex-col items-center gap-2">
           <p className="text-slate-400 text-sm uppercase font-bold tracking-widest">Seu MMR</p>
           <p className="text-2xl font-display font-bold text-white">{state.ratingMMR}</p>
        </div>
        <button 
            onClick={cancelSearch}
            className="mt-4 px-6 py-2 bg-red-900/50 text-red-300 border border-red-800 rounded-lg hover:bg-red-900 transition-colors font-bold"
        >
            Cancelar Busca
        </button>
      </div>
    );
  }

  if (mode === 'FRIENDLY_LOBBY') {
     return (
       <div className="max-w-md mx-auto py-10 text-center animate-fade-in-up">
         <button onClick={returnToMenu} className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={20} className="mr-2"/> Voltar
         </button>
         <h2 className="text-3xl font-display font-bold mb-6 text-white">Lobby Amistoso</h2>
         
         <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8 shadow-lg">
           <p className="text-sm text-slate-400 mb-2 uppercase font-bold tracking-wider">Seu código de convite</p>
           <div className="text-4xl font-mono font-bold text-green-400 tracking-widest bg-slate-900 py-4 rounded-lg select-all mb-4 border border-slate-700 border-dashed">
             {lobbyCode}
           </div>
           <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
             <Share2 size={12} /> Compartilhe este código com seu amigo.
           </p>
         </div>

         <div className="flex items-center justify-center w-full mb-8">
            <div className="h-px bg-slate-700 flex-1"></div>
            <span className="px-4 text-slate-500 text-sm font-bold">OU</span>
            <div className="h-px bg-slate-700 flex-1"></div>
         </div>

         <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <p className="text-sm text-slate-400 mb-4 uppercase font-bold tracking-wider">Entrar na sala</p>
            <input 
              type="text" 
              placeholder="CÓDIGO" 
              className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 text-center font-mono text-xl uppercase mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all placeholder-slate-600"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            />
            <button 
              onClick={joinFriendly}
              className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold text-white shadow-lg shadow-blue-900/50 transition-all hover:scale-[1.02]"
            >
              Conectar e Jogar
            </button>
         </div>
       </div>
     );
  }

  // PLAYING RENDER
  return (
    <div className="max-w-7xl mx-auto flex flex-col h-auto pb-10 relative">
      
      {/* VISUAL OVERLAY FOR DRAMATIC EVENTS */}
      {dramaticEvent && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none pb-48">
           <div className={`
             relative bg-slate-900/90 backdrop-blur-md border-4 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-[0_0_100px_rgba(0,0,0,0.8)]
             animate-in zoom-in-50 duration-300 transform scale-110
             ${dramaticEvent.teamColor === 'green' ? 'border-green-500 shadow-green-500/20' : dramaticEvent.teamColor === 'red' ? 'border-red-500 shadow-red-500/20' : 'border-blue-500 shadow-blue-500/20'}
           `}>
              <div className="mb-4 animate-bounce">
                {dramaticEvent.type === 'GOAL' && <Trophy size={80} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />}
                {dramaticEvent.type === 'SAVE' && <Shield size={80} className="text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />}
                {dramaticEvent.type === 'MISS' && <XCircle size={80} className="text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]" />}
                {dramaticEvent.type === 'RED_CARD' && <div className="w-16 h-24 bg-red-600 rounded border-2 border-white shadow-lg transform rotate-12"></div>}
              </div>
              
              <h1 className={`text-6xl font-display font-black italic uppercase drop-shadow-xl tracking-tighter mb-2 ${
                  dramaticEvent.teamColor === 'green' ? 'text-green-500' : dramaticEvent.teamColor === 'red' ? 'text-red-500' : 'text-blue-500'
              }`}>
                  {dramaticEvent.title}
              </h1>
              <p className="text-2xl text-white font-bold">{dramaticEvent.subtitle}</p>
           </div>
        </div>
      )}

      {/* Broadcast Scoreboard Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 p-4 shadow-xl flex justify-between items-center z-20 relative rounded-t-xl">
        {/* Home Team */}
        <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center font-bold text-white shadow-lg border-2 border-slate-700 text-lg md:text-xl">
                {state.userTeamName.substring(0,2).toUpperCase()}
            </div>
            <div className="hidden md:block">
                <h3 className="font-display font-bold text-white text-lg md:text-xl leading-tight tracking-tight uppercase">{state.userTeamName}</h3>
                <div className="flex items-center gap-2">
                   <span className="text-xs text-white bg-slate-800 px-1.5 rounded font-bold">H</span>
                   <div className="flex gap-0.5">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                   </div>
                </div>
            </div>
        </div>

        {/* Score Center */}
        <div className="flex flex-col items-center mx-2 md:mx-6 transform scale-90 md:scale-100">
             <div className="bg-slate-950 px-6 py-2 rounded-lg border border-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] flex items-center gap-4 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50"></div>
                 <span className="text-3xl md:text-4xl font-mono font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{score.home}</span>
                 <span className="text-slate-600 font-bold text-xl">-</span>
                 <span className="text-3xl md:text-4xl font-mono font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{score.away}</span>
             </div>
             <div className="mt-1.5 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${matchFinished ? 'bg-red-500' : pendingVar.active ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
                <div className="bg-slate-800/80 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest text-slate-300 uppercase border border-slate-700/50">
                    {matchFinished ? 'FIM DE JOGO' : pendingVar.active ? 'REVISÃO VAR' : `${currentMinute}' TEMPO REGULAR`}
                </div>
             </div>
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-4 flex-1 justify-end text-right">
            <div className="hidden md:block">
                <h3 className="font-display font-bold text-white text-lg md:text-xl leading-tight tracking-tight uppercase">{oppName}</h3>
                <div className="flex items-center justify-end gap-2">
                   <div className="flex gap-0.5">
                      <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   </div>
                   <span className="text-xs text-white bg-slate-800 px-1.5 rounded font-bold">A</span>
                </div>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center font-bold text-white shadow-lg border-2 border-slate-700 text-lg md:text-xl">
                 {oppName.substring(0,2).toUpperCase()}
            </div>
        </div>
      </div>

      {/* MATCH CENTER DASHBOARD */}
      <div className="flex-1 bg-slate-900 flex flex-col lg:flex-row relative min-h-[500px]">
        
        {/* LEFT: Stats Panel */}
        <div className="lg:w-1/2 p-6 border-r border-slate-800 bg-slate-900/90">
           <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
               <Activity size={16} /> Estatísticas da Partida
           </h3>
           
           {/* Possession Bar */}
           <div className="mb-8">
              <div className="flex justify-between text-white font-bold mb-2">
                 <span>{homePossessionPct}%</span>
                 <span className="text-xs text-slate-500 uppercase">Posse de Bola</span>
                 <span>{awayPossessionPct}%</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex">
                 <div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${homePossessionPct}%` }}></div>
                 <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${awayPossessionPct}%` }}></div>
              </div>
           </div>

           {/* Stats Grid */}
           <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                 <span className="font-mono text-xl font-bold text-white w-10 text-center">{score.home}</span>
                 <span className="text-slate-500 text-xs uppercase font-bold">Gols</span>
                 <span className="font-mono text-xl font-bold text-white w-10 text-center">{score.away}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                 <span className="font-mono text-xl font-bold text-white w-10 text-center">{matchStats.home.shots}</span>
                 <span className="text-slate-500 text-xs uppercase font-bold">Finalizações</span>
                 <span className="font-mono text-xl font-bold text-white w-10 text-center">{matchStats.away.shots}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                 <span className="font-mono text-xl font-bold text-white w-10 text-center">{matchStats.home.corners}</span>
                 <span className="text-slate-500 text-xs uppercase font-bold">Escanteios</span>
                 <span className="font-mono text-xl font-bold text-white w-10 text-center">{matchStats.away.corners}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                 <span className="font-mono text-xl font-bold text-white w-10 text-center">{matchStats.home.fouls}</span>
                 <span className="text-slate-500 text-xs uppercase font-bold">Faltas</span>
                 <span className="font-mono text-xl font-bold text-white w-10 text-center">{matchStats.away.fouls}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-800 text-yellow-500">
                 <div className="flex items-center gap-2 w-10 justify-center">
                    <span className="font-mono text-xl font-bold">{matchStats.home.yellowCards}</span>
                    <div className="w-3 h-4 bg-yellow-500 rounded-sm"></div>
                 </div>
                 <span className="text-slate-500 text-xs uppercase font-bold">Amarelos</span>
                 <div className="flex items-center gap-2 w-10 justify-center">
                    <div className="w-3 h-4 bg-yellow-500 rounded-sm"></div>
                    <span className="font-mono text-xl font-bold">{matchStats.away.yellowCards}</span>
                 </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-800 text-red-500">
                 <div className="flex items-center gap-2 w-10 justify-center">
                    <span className="font-mono text-xl font-bold">{matchStats.home.redCards}</span>
                    <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
                 </div>
                 <span className="text-slate-500 text-xs uppercase font-bold">Vermelhos</span>
                 <div className="flex items-center gap-2 w-10 justify-center">
                    <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
                    <span className="font-mono text-xl font-bold">{matchStats.away.redCards}</span>
                 </div>
              </div>
           </div>

           {matchFinished && (
             <div className="mt-8">
                 <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center">
                    <h2 className="text-2xl font-display font-bold text-white mb-2">FIM DE JOGO</h2>
                    <p className={`text-lg font-bold uppercase mb-4 ${score.home > score.away ? 'text-green-500' : score.home === score.away ? 'text-slate-400' : 'text-red-500'}`}>
                        {score.home > score.away ? 'Vitória!' : score.home === score.away ? 'Empate' : 'Derrota'}
                    </p>
                    <button onClick={returnToMenu} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-green-900/50">
                        Voltar ao Menu
                    </button>
                 </div>
             </div>
           )}
        </div>

        {/* RIGHT: Enhanced Commentary Feed */}
        <div ref={feedContainerRef} className="lg:w-1/2 bg-slate-950 flex flex-col h-[500px] z-20 border-l border-slate-800 overflow-y-auto relative custom-scrollbar">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2 sticky top-0 backdrop-blur z-30 justify-between">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="font-bold text-slate-300 text-xs uppercase tracking-widest">Narração Ao Vivo</span>
            </div>
          </div>
          
          <div className="p-6 space-y-4 font-mono text-sm bg-slate-950/50 min-h-0">
            {events.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-600 italic">
                    <p>Aguardando início da partida...</p>
                </div>
            )}
            
            {events.map((evt, i) => {
              const badge = getEventBadge(evt.type);
              return (
              <div 
                key={i} 
                className={`
                    p-4 rounded-xl border-l-4 shadow-lg relative overflow-hidden transition-all duration-500 animate-in slide-in-from-right-4 fade-in
                    ${evt.team === 'home' ? 'border-green-500 bg-gradient-to-r from-green-900/10 to-transparent' : 
                      evt.team === 'away' ? 'border-red-500 bg-gradient-to-r from-red-900/10 to-transparent' : 
                      'border-slate-500 bg-slate-800/30'}
                `}
              >
                <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-400 text-sm bg-slate-900/50 px-2 py-0.5 rounded">{evt.minute}'</span>
                    <div className="flex gap-2">
                        {badge && (
                            <span className={`text-[10px] font-bold ${badge.color} px-2 py-0.5 rounded uppercase flex items-center gap-1`}>
                                <badge.icon size={10} /> {badge.label}
                            </span>
                        )}
                    </div>
                </div>
                <p className={`leading-relaxed text-base ${evt.type.includes('GOAL') ? 'text-white font-bold' : 'text-slate-300'}`}>
                    {evt.description}
                </p>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LINEUPS DISPLAY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-4">
         {/* Home Lineup */}
         <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
             <div className="bg-gradient-to-r from-green-900 to-slate-900 px-4 py-3 border-b border-green-800/30 flex justify-between items-center">
                 <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                    <Shield size={16} className="text-green-500" />
                    {state.userTeamName}
                 </h3>
                 <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-slate-300">OVR {userTeamRating}</span>
             </div>
             <div className="p-2 space-y-1">
                 {state.squad.map((player, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0">
                        {player ? (
                            <>
                                <span className={`w-8 text-center text-[10px] font-bold px-1 py-0.5 rounded border ${getPositionColor(player.position)}`}>
                                    {player.position}
                                </span>
                                <span className="flex-1 text-sm font-medium text-slate-200 truncate">{player.name}</span>
                                {playerCards[player.id] === 'YELLOW' && <div className="w-3 h-4 bg-yellow-500 rounded-sm shadow-sm" title="Cartão Amarelo"></div>}
                                {playerCards[player.id] === 'RED' && <div className="w-3 h-4 bg-red-600 rounded-sm shadow-sm" title="Cartão Vermelho"></div>}
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    player.rating >= 90 ? 'bg-yellow-500/20 text-yellow-400' :
                                    player.rating >= 80 ? 'bg-purple-500/20 text-purple-400' :
                                    player.rating >= 70 ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-slate-700 text-slate-400'
                                }`}>{player.rating}</span>
                            </>
                        ) : (
                            <span className="text-slate-600 text-xs italic pl-2">Vazio</span>
                        )}
                    </div>
                 ))}
             </div>
         </div>

         {/* Away Lineup */}
         <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
             <div className="bg-gradient-to-r from-red-900 to-slate-900 px-4 py-3 border-b border-red-800/30 flex justify-between items-center">
                 <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                    <Shield size={16} className="text-red-500" />
                    {oppName}
                 </h3>
                 <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-slate-300">OVR {oppTeamRating}</span>
             </div>
             <div className="p-2 space-y-1">
                 {opponent.map((player, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0">
                        {player ? (
                            <>
                                <span className={`w-8 text-center text-[10px] font-bold px-1 py-0.5 rounded border ${getPositionColor(player.position)}`}>
                                    {player.position}
                                </span>
                                <span className="flex-1 text-sm font-medium text-slate-200 truncate">{player.name}</span>
                                {playerCards[player.id] === 'YELLOW' && <div className="w-3 h-4 bg-yellow-500 rounded-sm shadow-sm" title="Cartão Amarelo"></div>}
                                {playerCards[player.id] === 'RED' && <div className="w-3 h-4 bg-red-600 rounded-sm shadow-sm" title="Cartão Vermelho"></div>}
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    player.rating >= 90 ? 'bg-yellow-500/20 text-yellow-400' :
                                    player.rating >= 80 ? 'bg-purple-500/20 text-purple-400' :
                                    player.rating >= 70 ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-slate-700 text-slate-400'
                                }`}>{player.rating}</span>
                            </>
                        ) : (
                            <span className="text-slate-600 text-xs italic pl-2">Vazio</span>
                        )}
                    </div>
                 ))}
             </div>
         </div>
      </div>

      {/* FLOATING CHAT WIDGET */}
      <div className={`fixed bottom-0 right-4 z-50 flex flex-col items-end transition-all duration-300 ${chatOpen ? 'w-80' : 'w-60'}`}>
          <div 
            onClick={() => setChatOpen(!chatOpen)}
            className="bg-blue-600 text-white px-4 py-3 rounded-t-xl cursor-pointer flex items-center justify-between shadow-2xl hover:bg-blue-500 transition-colors w-full border border-blue-500 border-b-0"
          >
            <div className="flex items-center gap-2">
               <MessageCircle size={20} />
               <span className="font-bold text-sm">Chat da Partida</span>
               {unreadMessages > 0 && !chatOpen && (
                   <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                       {unreadMessages}
                   </span>
               )}
            </div>
            {chatOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </div>

          {chatOpen && (
            <div className="bg-slate-900 border border-slate-700 w-full h-80 flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
               <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-slate-900">
                  {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs italic">
                          <MessageCircle size={32} className="mb-2 opacity-20" />
                          <p>Nenhuma mensagem.</p>
                      </div>
                  ) : (
                      chatMessages.map(msg => (
                          <div key={msg.id} className={`flex flex-col ${msg.sender === state.userTeamName ? 'items-end' : 'items-start'}`}>
                              {!msg.isSystem && <span className="text-[10px] text-slate-500 mb-1 px-1">{msg.sender}</span>}
                              <div className={`
                                  px-3 py-2 rounded-lg text-sm max-w-[85%] break-words shadow-sm
                                  ${msg.isSystem ? 'bg-slate-800 text-yellow-500 border border-yellow-500/20 w-full text-center text-xs py-1' : 
                                    msg.sender === state.userTeamName ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}
                              `}>
                                  {msg.text}
                              </div>
                          </div>
                      ))
                  )}
               </div>
               
               <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 bg-slate-800 flex gap-2">
                  <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Digite..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button type="submit" className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors" disabled={!chatInput.trim()}>
                      <Send size={18} />
                  </button>
               </form>
            </div>
          )}
      </div>
    </div>
  );
};
