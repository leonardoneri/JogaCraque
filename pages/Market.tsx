
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Player, Position, Rarity } from '../types';
import { PlayerCard } from '../components/PlayerCard';
import { Package, Sparkles, Repeat, Search, Filter } from 'lucide-react';

export const Market: React.FC = () => {
  const { state, buyPack, marketListings, buyPlayerFromMarket, refreshMarket } = useGame();
  const [activeTab, setActiveTab] = useState<'packs' | 'transfers'>('packs');
  const [opening, setOpening] = useState(false);
  const [newCards, setNewCards] = useState<Player[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPos, setFilterPos] = useState<string>('');
  const [filterRarity, setFilterRarity] = useState<string>('');

  const PACK_COST = 500;

  const handleBuyPack = () => {
    if (state.coins < PACK_COST) return;
    setOpening(true);
    setNewCards([]);
    setTimeout(() => {
      const cards = buyPack(PACK_COST);
      setNewCards(cards);
    }, 1500);
  };

  const closePack = () => {
    setOpening(false);
    setNewCards([]);
  };

  const filteredListings = marketListings.filter(l => {
    const matchesName = l.player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPos = filterPos ? l.player.position === filterPos : true;
    const matchesRarity = filterRarity ? l.player.rarity === filterRarity : true;
    return matchesName && matchesPos && matchesRarity;
  });

  return (
    <div className="max-w-6xl mx-auto min-h-[600px] flex flex-col">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h2 className="text-4xl font-display font-bold text-white">Mercado</h2>
           <p className="text-slate-400">Adquira novos talentos para o seu time.</p>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg">
           <button 
            onClick={() => setActiveTab('packs')}
            className={`px-6 py-2 rounded-md font-bold transition-colors ${activeTab === 'packs' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             Pacotes
           </button>
           <button 
            onClick={() => setActiveTab('transfers')}
            className={`px-6 py-2 rounded-md font-bold transition-colors ${activeTab === 'transfers' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             Transferências
           </button>
        </div>
      </div>

      {activeTab === 'packs' && (
        !opening ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-fade-in-up">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col items-center text-center hover:border-green-500 transition-all hover:-translate-y-2 group shadow-2xl">
              <div className="w-48 h-64 bg-gradient-to-br from-green-600 to-slate-900 rounded-xl mb-6 shadow-inner flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                <Package size={64} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="text-2xl font-bold font-display">Pacote Ouro</h3>
              <p className="text-sm text-slate-400 mt-2 mb-6 h-10">Contém 5 jogadores com chance de cartas Raras e Lendárias.</p>
              
              <button 
                onClick={handleBuyPack}
                disabled={state.coins < PACK_COST}
                className={`
                  w-full py-3 rounded-lg font-bold flex items-center justify-center space-x-2
                  ${state.coins >= PACK_COST 
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/50' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                `}
              >
                <span>{PACK_COST} Moedas</span>
              </button>
            </div>
             {[1, 2].map((i) => (
                <div key={i} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-800 flex flex-col items-center text-center opacity-70 grayscale">
                  <div className="w-48 h-64 bg-slate-900 rounded-xl mb-6 flex items-center justify-center">
                    <Package size={64} className="text-slate-700" />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-slate-500">Pacote Premium</h3>
                  <p className="text-sm text-slate-500 mt-2 mb-6">Em Breve</p>
                  <button disabled className="w-full py-3 bg-slate-800 rounded-lg text-slate-600 font-bold border border-slate-700">
                    Bloqueado
                  </button>
                </div>
              ))}
          </div>
        ) : (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            {newCards.length === 0 ? (
              <div className="animate-pulse flex flex-col items-center">
                <Package size={120} className="text-green-500 animate-bounce-small" />
                <h2 className="text-3xl font-display font-bold mt-8 text-white tracking-widest">ABRINDO...</h2>
              </div>
            ) : (
              <div className="w-full max-w-6xl animate-fade-in-up">
                <div className="text-center mb-10">
                   <Sparkles className="inline-block text-yellow-400 mb-4 animate-spin-slow" size={40} />
                   <h2 className="text-4xl font-display font-bold text-white">Pacote Aberto!</h2>
                </div>
                <div className="flex flex-wrap justify-center gap-6 mb-12">
                  {newCards.map((player, idx) => (
                    <div key={idx} className="animate-[bounce_0.5s_ease-out]" style={{ animationDelay: `${idx * 100}ms` }}>
                      <PlayerCard player={player} size="lg" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <button 
                    onClick={closePack}
                    className="bg-white text-slate-900 hover:bg-slate-200 font-bold py-3 px-10 rounded-full text-lg shadow-xl"
                  >
                    Enviar para o Clube
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {activeTab === 'transfers' && (
        <div className="animate-fade-in-up w-full">
           {/* Filters */}
           <div className="bg-slate-800 p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4 items-center border border-slate-700">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                 <input 
                  type="text" 
                  placeholder="Buscar jogador..." 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-green-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                 <select 
                   className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none"
                   value={filterPos}
                   onChange={(e) => setFilterPos(e.target.value)}
                 >
                   <option value="">Todas Posições</option>
                   {Object.values(Position).map(p => <option key={p} value={p}>{p}</option>)}
                 </select>

                 <select 
                   className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none"
                   value={filterRarity}
                   onChange={(e) => setFilterRarity(e.target.value)}
                 >
                   <option value="">Todas Raridades</option>
                   {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
                 
                 <button onClick={refreshMarket} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600" title="Atualizar Mercado">
                    <Repeat size={20} />
                 </button>
              </div>
           </div>

           {/* Listings Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredListings.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-500">Nenhum jogador encontrado no mercado.</div>
              )}
              
              {filteredListings.map(listing => (
                 <div key={listing.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-500 transition-all flex flex-col">
                    <div className="p-4 flex justify-center bg-slate-900/50 pt-6">
                       <PlayerCard player={listing.player} size="md" showStats={true} />
                    </div>
                    <div className="p-4 bg-slate-800 flex-1 flex flex-col justify-between">
                       <div>
                         <p className="text-xs text-slate-500 mb-1">Vendedor: {listing.sellerName}</p>
                         <h4 className="font-bold text-lg leading-tight">{listing.player.name}</h4>
                         <p className="text-sm text-slate-400">{listing.player.position} • {listing.player.rating}</p>
                       </div>
                       
                       <button 
                        onClick={() => buyPlayerFromMarket(listing.id)}
                        disabled={state.transferFunds < listing.price}
                        className={`mt-4 w-full py-2 rounded font-bold flex items-center justify-center space-x-1 ${state.transferFunds >= listing.price ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                       >
                         <Repeat size={14} />
                         <span>{listing.price.toLocaleString()}</span>
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};
