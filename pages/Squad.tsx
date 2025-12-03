
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { PlayerCard } from '../components/PlayerCard';
import { INITIAL_SQUAD_POSITIONS, calculatePlayerValue } from '../services/gameLogic';
import { Player } from '../types';
import { X, DollarSign, Shirt, ArrowRightLeft, Search, Filter, AlertTriangle } from 'lucide-react';

export const Squad: React.FC = () => {
  const { state, setSquadPlayer, removeSquadPlayer, quickSellPlayer } = useGame();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [showSellModal, setShowSellModal] = useState(false);

  const selectedInvPlayer = useMemo(() => 
    state.inventory.find(p => p.id === selectedInventoryId), 
  [state.inventory, selectedInventoryId]);

  const inventoryList = useMemo(() => {
    return state.inventory
      .filter(p => !state.squad.some(squadP => squadP?.id === p.id))
      .filter(p => p.name.toLowerCase().includes(filterQuery.toLowerCase()) || p.position.includes(filterQuery.toUpperCase()))
      .sort((a, b) => b.rating - a.rating);
  }, [state.inventory, state.squad, filterQuery]);

  const handleSlotClick = (index: number) => {
    const playerInSlot = state.squad[index];

    if (selectedSlot === index) {
      setSelectedSlot(null);
      if (playerInSlot && selectedInventoryId === playerInSlot.id) {
        setSelectedInventoryId(null);
      }
    } else {
      setSelectedSlot(index);
      if (selectedInvPlayer && !state.squad.some(p => p?.id === selectedInvPlayer.id)) {
        setSquadPlayer(index, selectedInvPlayer);
        setSelectedInventoryId(null);
        setSelectedSlot(null);
      } else if (playerInSlot) {
        setSelectedInventoryId(playerInSlot.id);
      }
    }
  };

  const handleInventoryClick = (player: Player) => {
    if (selectedSlot !== null) {
      setSquadPlayer(selectedSlot, player);
      setSelectedSlot(null);
    } else {
      setSelectedInventoryId(player.id === selectedInventoryId ? null : player.id);
    }
  };

  const handleSell = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedInvPlayer) return;
    setShowSellModal(true);
  };

  const confirmSell = () => {
    if (selectedInvPlayer) {
        quickSellPlayer(selectedInvPlayer.id);
        setSelectedInventoryId(null);
        setShowSellModal(false);
    }
  };

  const FORMATION_COORDS = [
    { top: '85%', left: '50%' }, // GK
    { top: '70%', left: '15%' }, // LB
    { top: '75%', left: '38%' }, // CB
    { top: '75%', left: '62%' }, // CB
    { top: '70%', left: '85%' }, // RB
    { top: '55%', left: '30%' }, // CM
    { top: '60%', left: '50%' }, // CDM
    { top: '55%', left: '70%' }, // CM
    { top: '25%', left: '15%' }, // LW
    { top: '18%', left: '50%' }, // ST
    { top: '25%', left: '85%' }, // RW
  ];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4 pb-4">
      
      {/* LEFT COLUMN: THE PITCH */}
      <div className="lg:w-2/3 bg-slate-900 relative rounded-xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
        
        {/* Header Overlay */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-4">
          <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <span className="text-slate-300 text-xs uppercase font-bold tracking-wider mr-2">Esquema</span>
            <span className="font-display font-bold text-white text-lg">4-3-3 Ofensivo</span>
          </div>
        </div>

        {/* Realistic Pitch Graphic */}
        <div className="flex-1 relative bg-[#1a7a3e] overflow-hidden select-none">
          {/* Grass Stripes */}
          <div className="absolute inset-0 opacity-20" 
               style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, #000 40px, #000 80px)' }}>
          </div>
          
          {/* Pitch Lines (White) */}
          <div className="absolute inset-4 border-2 border-white/40 rounded-sm pointer-events-none"></div>
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/40 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute top-4 left-1/2 w-64 h-32 border-2 border-t-0 border-white/40 -translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-4 left-1/2 w-64 h-32 border-2 border-b-0 border-white/40 -translate-x-1/2 pointer-events-none"></div>

          {/* Players Layer */}
          <div className="absolute inset-0 z-10">
            {INITIAL_SQUAD_POSITIONS.map((posLabel, index) => {
              const style = FORMATION_COORDS[index];
              const player = state.squad[index];
              const isSelected = selectedSlot === index;

              return (
                <div 
                  key={index}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isSelected ? 'scale-110 z-30' : 'z-10 hover:scale-105'}`}
                  style={{ ...style }}
                  onClick={() => handleSlotClick(index)}
                >
                  <div className={`relative group ${!player ? 'opacity-80' : ''}`}>
                    {player ? (
                      <>
                        <PlayerCard player={player} size="pitch" showStats={false} />
                        {/* Remove Button (Hover) */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeSquadPlayer(index); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-20"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      // Empty Slot Placeholder
                      <div className={`
                        w-24 h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center
                        transition-colors backdrop-blur-sm
                        ${isSelected ? 'bg-green-500/30 border-green-400 animate-pulse' : 'bg-black/20 border-white/20 hover:bg-white/10'}
                      `}>
                        <Shirt size={28} className={isSelected ? 'text-green-300' : 'text-slate-400'} />
                        <span className="text-[10px] font-bold mt-2 text-white">{posLabel}</span>
                      </div>
                    )}
                    
                    {/* Position Label under card */}
                    {player && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 px-2 rounded text-[10px] font-bold text-slate-300 border border-slate-700 shadow-md">
                        {posLabel}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: INVENTORY & MANAGEMENT */}
      <div className="lg:w-1/3 flex flex-col gap-4">
        
        {/* Selected Player Management Panel */}
        <div className={`
          bg-slate-800 rounded-xl border border-slate-700 p-4 transition-all duration-300 shadow-xl
          ${selectedInvPlayer ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none grayscale'}
        `}>
          <div className="flex items-start gap-4">
             {/* Large Preview */}
             <div className="transform origin-top-left">
                <PlayerCard player={selectedInvPlayer || null} size="lg" showStats={true} />
             </div>
             
             {/* Info & Actions */}
             <div className="flex-1 flex flex-col justify-between h-60">
               {selectedInvPlayer ? (
                 <>
                   <div>
                     <h3 className="font-bold text-white text-lg leading-tight mb-1">{selectedInvPlayer.name}</h3>
                     <div className="text-sm text-slate-400 mb-3">{selectedInvPlayer.position} • {selectedInvPlayer.rarity}</div>
                   </div>
                   
                   <div className="flex flex-col gap-2 mt-auto">
                     <button 
                      onClick={() => selectedSlot !== null && setSquadPlayer(selectedSlot, selectedInvPlayer)}
                      disabled={selectedSlot === null}
                      className={`
                        flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-colors
                        ${selectedSlot !== null 
                          ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/50' 
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                      `}
                     >
                       <ArrowRightLeft size={16} />
                       {selectedSlot !== null ? `Trocar Posição` : 'Selecione vaga no campo'}
                     </button>

                     <button 
                      onClick={handleSell}
                      className="flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm bg-red-900/50 text-red-200 border border-red-800 hover:bg-red-800 transition-colors"
                     >
                       <DollarSign size={16} />
                       Vender: {selectedInvPlayer.marketValue || calculatePlayerValue(selectedInvPlayer)}
                     </button>
                   </div>
                 </>
               ) : (
                 <div className="h-full flex items-center text-slate-500 text-sm italic">
                   Selecione um jogador abaixo (ou no campo) para ver opções.
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Inventory List */}
        <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-700 flex items-center gap-2 bg-slate-850">
            <Filter size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar no clube..." 
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm text-white w-full placeholder-slate-500"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {inventoryList.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                Nenhum jogador encontrado no banco.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {inventoryList.map(player => (
                  <div 
                    key={player.id}
                    onClick={() => handleInventoryClick(player)}
                    className={`
                      relative group cursor-pointer transition-all duration-200
                      ${selectedInventoryId === player.id ? 'transform scale-105 z-10 ring-2 ring-green-500 rounded-lg' : 'hover:scale-105'}
                    `}
                  >
                    {/* Clean Full Art Card for Grid */}
                    <div className="aspect-[3/4] bg-transparent">
                      <img 
                        src={player.image} 
                        alt={player.name} 
                        className="w-full h-full object-contain" 
                        loading="lazy" 
                      />
                    </div>

                    {/* Selection Indicator Overlay */}
                    {selectedInventoryId === player.id && (
                      <div className="absolute inset-0 bg-green-500/20 rounded-lg pointer-events-none"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-2 bg-slate-900 border-t border-slate-700 text-center text-xs text-slate-500">
             {inventoryList.length} jogadores no banco
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showSellModal && selectedInvPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl max-w-md w-full shadow-2xl transform scale-100 transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-500/10 rounded-full">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-display font-bold text-white">Confirmar Venda</h3>
                        <p className="text-slate-400 text-sm">Esta ação é irreversível.</p>
                    </div>
                </div>
                
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-6 flex items-center gap-4">
                        <div className="w-16">
                        <PlayerCard player={selectedInvPlayer} size="sm" showStats={false} />
                        </div>
                        <div>
                            <p className="font-bold text-white">{selectedInvPlayer.name}</p>
                            <p className="text-xs text-slate-500 mb-1">{selectedInvPlayer.position} • {selectedInvPlayer.rarity}</p>
                            <div className="flex items-center gap-1 text-green-400 font-mono font-bold">
                            <DollarSign size={14} />
                            <span>{selectedInvPlayer.marketValue || calculatePlayerValue(selectedInvPlayer)}</span>
                            </div>
                        </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowSellModal(false)} 
                        className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={confirmSell} 
                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white shadow-lg shadow-red-900/20 transition-colors flex items-center justify-center gap-2"
                    >
                        <DollarSign size={18} />
                        Vender Jogador
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
