
import React from 'react';
import { useGame } from '../context/GameContext';
import { calculateTeamRating, calculateWinRate } from '../services/gameLogic';
import { Trophy, TrendingUp, Users, Shield, Calendar, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PlayerCard } from '../components/PlayerCard';

export const Dashboard: React.FC = () => {
  const { state } = useGame();
  const teamRating = calculateTeamRating(state.squad);

  // Find Idol (Highest Goals, then Rating)
  const bestPlayer = [...state.inventory].sort((a, b) => {
    const goalsA = a.stats?.goals || 0;
    const goalsB = b.stats?.goals || 0;
    if (goalsA !== goalsB) return goalsB - goalsA;
    return b.rating - a.rating;
  })[0];

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-between hover:bg-slate-750 transition-colors shadow-lg">
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">{label}</p>
        <p className="text-3xl font-display font-bold text-white">{value}</p>
      </div>
      <div className={`p-4 rounded-full ${color} bg-opacity-10 border border-white/5`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      {/* Club Header Identity */}
      <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-900 rounded-full border-4 border-slate-800 shadow-xl flex items-center justify-center">
            <Shield size={40} className="text-white" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-4xl font-display font-bold text-white mb-1">{state.userTeamName}</h2>
            <div className="flex items-center justify-center md:justify-start gap-4 text-slate-400 text-sm font-mono">
              <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">NVL {state.level}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Trophy size={14} className="text-yellow-500" /> {state.ratingMMR} MMR</span>
            </div>
          </div>
          <Link to="/match" className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-green-900/50 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2">
             <Activity size={20} />
             JOGAR AGORA
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Partidas" value={state.matchesPlayed} icon={Calendar} color="bg-blue-500" />
            <StatCard label="Vitórias" value={state.wins} icon={Trophy} color="bg-yellow-500" />
            <StatCard label="Aproveitamento" value={`${calculateWinRate(state.wins, state.matchesPlayed)}%`} icon={TrendingUp} color="bg-green-500" />
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                 Histórico de Partidas
               </h3>
               <div className="flex gap-4 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Vitória</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-500"></div> Empate</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Derrota</span>
               </div>
             </div>
             
             <div className="space-y-3">
               {state.matchHistory.length === 0 ? (
                 <div className="text-center py-10 text-slate-500 italic bg-slate-900/50 rounded-lg">
                   Nenhuma partida registrada ainda.
                 </div>
               ) : (
                 state.matchHistory.slice(0, 5).map((match) => (
                   <div key={match.id} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg border-l-4 border-slate-700 hover:bg-slate-900 transition-colors"
                        style={{ borderLeftColor: match.result === 'V' ? '#22c55e' : match.result === 'D' ? '#ef4444' : '#64748b' }}>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200">{match.opponentName}</span>
                        <span className="text-xs text-slate-500">{new Date(match.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xl font-mono font-bold ${match.result === 'V' ? 'text-green-500' : match.result === 'D' ? 'text-red-500' : 'text-slate-400'}`}>
                           {match.myScore} - {match.oppScore}
                        </span>
                        <span className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${match.result === 'V' ? 'bg-green-500/20 text-green-500' : match.result === 'D' ? 'bg-red-500/20 text-red-500' : 'bg-slate-700 text-slate-400'}`}>
                           {match.result}
                        </span>
                      </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>

        {/* Right Column: Idol & Top Players */}
        <div className="space-y-6">
           {/* Club Idol Card */}
           <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Users size={120} />
              </div>
              <h3 className="text-lg font-bold text-yellow-500 mb-4 flex items-center gap-2 uppercase tracking-wide">
                 <Trophy size={18} /> Ídolo da Torcida
              </h3>
              
              {bestPlayer ? (
                <div className="flex flex-col items-center">
                   <div className="transform hover:scale-105 transition-transform duration-300">
                     <PlayerCard player={bestPlayer} size="md" showStats={false} />
                   </div>
                   <div className="mt-4 text-center w-full">
                      <h4 className="text-xl font-bold text-white">{bestPlayer.name}</h4>
                      <p className="text-sm text-slate-400 mb-4">{bestPlayer.position} • {bestPlayer.rating} OVR</p>
                      
                      <div className="grid grid-cols-2 gap-2 w-full">
                         <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
                            <span className="block text-2xl font-bold text-green-400">{bestPlayer.stats?.goals || 0}</span>
                            <span className="text-[10px] uppercase text-slate-500 font-bold">Gols</span>
                         </div>
                         <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
                            <span className="block text-2xl font-bold text-blue-400">{bestPlayer.stats?.matches || 0}</span>
                            <span className="text-[10px] uppercase text-slate-500 font-bold">Jogos</span>
                         </div>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                   Jogue partidas para definir o ídolo do time.
                </div>
              )}
           </div>

           {/* Squad Strength */}
           <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-slate-400 font-bold text-sm">FORÇA DO ELENCO</span>
                 <span className="text-2xl font-display font-bold text-white">{teamRating}</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-green-600 to-green-400" style={{ width: `${Math.min(100, teamRating)}%` }}></div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
