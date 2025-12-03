
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { PlayerCard } from '../components/PlayerCard';
import { Player, Position, COUNTRIES, CARD_COLLECTIONS } from '../types';
import { Lock, Search, Download, Trash2, Loader2, Image as ImageIcon, Save, User } from 'lucide-react';
import { generatePlayer, calculatePlayerValue } from '../services/gameLogic';

export const Admin: React.FC = () => {
  const { state, updatePlayerImage, updatePlayerStats, importPlayers, clearInventory, deletePlayer } = useGame();
  const [activeTab, setActiveTab] = useState<'edit' | 'import'>('import');
  
  // Editor State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  // Form State
  const [editForm, setEditForm] = useState({
    name: '',
    rating: 0,
    position: Position.ST,
    nationality: '',
    club: '',
    collection: '',
    image: '',
    // Stats
    pace: 0,
    shooting: 0,
    passing: 0,
    dribbling: 0,
    defending: 0,
    physical: 0
  });

  useEffect(() => {
    if (selectedPlayer) {
        setEditForm({
            name: selectedPlayer.name,
            rating: selectedPlayer.rating,
            position: selectedPlayer.position,
            nationality: selectedPlayer.nationality || '',
            club: selectedPlayer.club || '',
            collection: selectedPlayer.collection || 'Base',
            image: selectedPlayer.image || '',
            pace: selectedPlayer.attributes.pace,
            shooting: selectedPlayer.attributes.shooting,
            passing: selectedPlayer.attributes.passing,
            dribbling: selectedPlayer.attributes.dribbling,
            defending: selectedPlayer.attributes.defending,
            physical: selectedPlayer.attributes.physical
        });
    }
  }, [selectedPlayer]);

  // Importer State
  const [season, setSeason] = useState('s4');
  const [startId, setStartId] = useState('00001');
  const [amount, setAmount] = useState(20);
  const [suffix, setSuffix] = useState('-1'); 
  const [scanning, setScanning] = useState(false);
  const [scannedPlayers, setScannedPlayers] = useState<Player[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  const filteredInventory = state.inventory.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isGK = editForm.position === Position.GK;

  const handleSaveEdit = () => {
    if (selectedPlayer) {
        // Recalculate market value based on new rating and other factors
        const dummyPlayer = { ...selectedPlayer, rating: editForm.rating, rarity: selectedPlayer.rarity };
        const newMarketValue = calculatePlayerValue(dummyPlayer);

        updatePlayerImage(selectedPlayer.id, editForm.image);
        updatePlayerStats(selectedPlayer.id, {
            name: editForm.name,
            rating: editForm.rating,
            position: editForm.position,
            nationality: editForm.nationality,
            club: editForm.club,
            collection: editForm.collection,
            attributes: {
                pace: editForm.pace,
                shooting: editForm.shooting,
                passing: editForm.passing,
                dribbling: editForm.dribbling,
                defending: editForm.defending,
                physical: editForm.physical,
                vision: selectedPlayer.attributes.vision, 
                positioning: selectedPlayer.attributes.positioning 
            }
        });
        
        alert("Jogador atualizado com sucesso!");
        
        setSelectedPlayer({
            ...selectedPlayer,
            name: editForm.name,
            rating: editForm.rating,
            position: editForm.position,
            nationality: editForm.nationality,
            club: editForm.club,
            collection: editForm.collection,
            image: editForm.image,
            marketValue: newMarketValue,
            attributes: {
                ...selectedPlayer.attributes,
                pace: editForm.pace,
                shooting: editForm.shooting,
                passing: editForm.passing,
                dribbling: editForm.dribbling,
                defending: editForm.defending,
                physical: editForm.physical
            }
        });
    }
  };

  const handleDeletePlayer = () => {
    if (selectedPlayer && window.confirm(`Tem certeza que deseja excluir ${selectedPlayer.name} permanentemente?`)) {
        deletePlayer(selectedPlayer.id);
        setSelectedPlayer(null);
    }
  };

  const scanImages = async () => {
    setScanning(true);
    setScannedPlayers([]);
    setScanProgress(0);
    
    const results: Player[] = [];
    const startNum = parseInt(startId, 10) || 1;

    for (let i = 0; i < amount; i++) {
        const idNum = startNum + i;
        const paddedId = idNum.toString().padStart(5, '0');
        const imageUrl = `https://images.dreamteam.futbol/cards/${season}-${paddedId}${suffix}.png`;
        
        try {
            const isValid = await checkImageExists(imageUrl);
            if (isValid) {
                const p = generatePlayer();
                const baseId = `${season}-${paddedId}`;
                p.id = `ext-${baseId}${suffix}`; 
                p.baseId = baseId; 
                p.image = imageUrl;
                p.marketValue = calculatePlayerValue(p);
                results.push(p);
            }
        } catch (e) {
            // Ignore
        }
        
        setScanProgress(((i + 1) / amount) * 100);
        await new Promise(r => setTimeout(r, 50));
    }

    setScannedPlayers(results);
    setScanning(false);
  };

  const checkImageExists = async (url: string): Promise<boolean> => {
    try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) return true;
    } catch (e) {
        // Fallback for CORS
    }
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
  };

  const removeScannedPlayer = (id: string) => {
      setScannedPlayers(prev => prev.filter(p => p.id !== id));
  };

  const handleImport = () => {
    if (scannedPlayers.length === 0) return;
    importPlayers(scannedPlayers);
    alert(`${scannedPlayers.length} cartas processadas (novos jogadores ou atualizações)!`);
    setScannedPlayers([]);
  };

  return (
    <div className="max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col gap-6 animate-fade-in-up pb-10">
      
      {/* Header & Tabs */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
           <Lock size={24} className="text-red-500" /> Painel Admin
        </h2>
        
        <div className="flex bg-slate-900 p-1 rounded-lg">
           <button 
            onClick={() => setActiveTab('import')}
            className={`px-6 py-2 rounded-md font-bold transition-colors ${activeTab === 'import' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             Importador Externo
           </button>
           <button 
            onClick={() => setActiveTab('edit')}
            className={`px-6 py-2 rounded-md font-bold transition-colors ${activeTab === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             Editor Manual
           </button>
        </div>
      </div>

      {activeTab === 'import' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Download size={20} className="text-green-500" /> Configuração do Scanner
                    </h3>
                    <p className="text-xs text-slate-400">
                        Busca imagens no padrão: <br/>
                        <code className="bg-slate-900 px-1 py-0.5 rounded text-green-400">images.dreamteam.futbol/cards/[Temporada]-[ID]-[Sufixo].png</code>
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold">Temporada</label>
                            <input 
                                type="text" 
                                value={season} 
                                onChange={(e) => setSeason(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                                placeholder="s4"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold">Sufixo</label>
                            <input 
                                type="text" 
                                value={suffix} 
                                onChange={(e) => setSuffix(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                                placeholder="-1"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold">ID Inicial</label>
                            <input 
                                type="text" 
                                value={startId} 
                                onChange={(e) => setStartId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                                placeholder="00001"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold">Quantidade</label>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(parseInt(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={scanImages}
                        disabled={scanning}
                        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${scanning ? 'bg-slate-700 text-slate-400' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                    >
                        {scanning ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                        {scanning ? 'Escaneando...' : 'Escanear URLs'}
                    </button>
                    
                    {scanning && (
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4">Ações de Banco</h3>
                    <div className="space-y-3">
                        <button 
                            onClick={handleImport}
                            disabled={scannedPlayers.length === 0}
                            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${scannedPlayers.length === 0 ? 'bg-slate-700 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                        >
                            <Download size={20} /> Importar {scannedPlayers.length} Cartas
                        </button>

                        <button 
                            onClick={() => {
                                if(window.confirm("Tem certeza? Isso apagará TODOS os jogadores do seu inventário.")) {
                                    clearInventory();
                                }
                            }}
                            className="w-full py-2 bg-red-900/50 border border-red-800 text-red-300 rounded-lg hover:bg-red-900 flex items-center justify-center gap-2 text-sm"
                        >
                            <Trash2 size={16} /> Limpar Inventário Atual
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col h-[600px]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white">Cartas Encontradas ({scannedPlayers.length})</h3>
                    <span className="text-xs text-slate-400">Clique para remover cartas inválidas</span>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-slate-900/50 rounded-lg p-4 custom-scrollbar border border-slate-700">
                    {scannedPlayers.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600">
                            <ImageIcon size={48} className="mb-4 opacity-50" />
                            <p>Nenhuma carta escaneada.</p>
                            <p className="text-sm">Configure o scanner e clique em iniciar.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {scannedPlayers.map(p => (
                                <div key={p.id} className="relative group transform scale-90 origin-top-left hover:scale-100 transition-transform z-0 hover:z-10">
                                    <PlayerCard player={p} size="md" showStats={false} />
                                    <button 
                                        onClick={() => removeScannedPlayer(p.id)}
                                        className="absolute top-2 right-2 bg-red-600 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        title="Remover"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <p className="text-[10px] text-center text-slate-400 mt-1 truncate">{p.baseId}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="flex flex-col xl:flex-row gap-6 h-[700px]">
            {/* Inventory List */}
            <div className="w-full xl:w-1/3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden h-[300px] xl:h-auto">
                <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar jogador..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-green-500"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {filteredInventory.map(player => (
                        <div 
                        key={player.id}
                        onClick={() => setSelectedPlayer(player)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedPlayer?.id === player.id ? 'bg-green-600/20 border border-green-500/50' : 'hover:bg-slate-700/50 border border-transparent'}`}
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-900">
                                <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-white">{player.name}</p>
                                <p className="text-xs text-slate-400">{player.position} • {player.rating} OVR</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor Form */}
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col h-full overflow-hidden">
                {selectedPlayer ? (
                    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar pr-2 space-y-6">
                        <div className="flex flex-col xl:flex-row gap-8">
                            {/* Card Preview with Zoom */}
                            <div className="flex-shrink-0 flex justify-center xl:block group relative cursor-zoom-in z-10 w-fit mx-auto xl:mx-0">
                                <div className="transition-transform duration-300 group-hover:scale-[1.8] group-hover:z-50 origin-top-left relative shadow-2xl rounded-lg">
                                    <PlayerCard player={selectedPlayer} size="admin" showStats={false} />
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="flex-1 flex flex-col space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nome</label>
                                        <input 
                                            type="text" 
                                            value={editForm.name} 
                                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Overall (OVR)</label>
                                        <input 
                                            type="number" 
                                            value={editForm.rating} 
                                            onChange={(e) => setEditForm({...editForm, rating: parseInt(e.target.value)})}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white font-mono text-center text-lg font-bold focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Posição</label>
                                        <select 
                                            value={editForm.position} 
                                            onChange={(e) => setEditForm({...editForm, position: e.target.value as Position})}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white focus:border-blue-500 focus:outline-none"
                                        >
                                            {Object.values(Position).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nacionalidade</label>
                                        <select 
                                            value={editForm.nationality} 
                                            onChange={(e) => setEditForm({...editForm, nationality: e.target.value})}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="">Selecione...</option>
                                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Time (Club)</label>
                                        <input 
                                            type="text" 
                                            value={editForm.club} 
                                            onChange={(e) => setEditForm({...editForm, club: e.target.value})}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="Ex: Flamengo"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Coleção</label>
                                        <select 
                                            value={editForm.collection} 
                                            onChange={(e) => setEditForm({...editForm, collection: e.target.value})}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white focus:border-blue-500 focus:outline-none"
                                        >
                                            {CARD_COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <User size={16} className="text-green-500" /> Atributos da Carta
                            </h4>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{isGK ? 'ALC' : 'RIT'}</label>
                                    <input 
                                        type="number" 
                                        value={editForm.pace} 
                                        onChange={(e) => setEditForm({...editForm, pace: parseInt(e.target.value)})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white font-mono text-center text-lg focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{isGK ? 'POS' : 'FIN'}</label>
                                    <input 
                                        type="number" 
                                        value={editForm.shooting} 
                                        onChange={(e) => setEditForm({...editForm, shooting: parseInt(e.target.value)})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white font-mono text-center text-lg focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{isGK ? 'REP' : 'PAS'}</label>
                                    <input 
                                        type="number" 
                                        value={editForm.passing} 
                                        onChange={(e) => setEditForm({...editForm, passing: parseInt(e.target.value)})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white font-mono text-center text-lg focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{isGK ? 'COND' : 'DRI'}</label>
                                    <input 
                                        type="number" 
                                        value={editForm.dribbling} 
                                        onChange={(e) => setEditForm({...editForm, dribbling: parseInt(e.target.value)})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white font-mono text-center text-lg focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{isGK ? 'REF' : 'DEF'}</label>
                                    <input 
                                        type="number" 
                                        value={editForm.defending} 
                                        onChange={(e) => setEditForm({...editForm, defending: parseInt(e.target.value)})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white font-mono text-center text-lg focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{isGK ? 'EXP' : 'FIS'}</label>
                                    <input 
                                        type="number" 
                                        value={editForm.physical} 
                                        onChange={(e) => setEditForm({...editForm, physical: parseInt(e.target.value)})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white font-mono text-center text-lg focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">URL da Imagem</label>
                            <input 
                                type="text" 
                                value={editForm.image} 
                                onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button 
                                onClick={handleDeletePlayer}
                                className="w-full py-3 bg-red-900/50 border border-red-800 text-red-300 hover:bg-red-900 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-colors"
                            >
                                <Trash2 size={20} /> Excluir
                            </button>
                            
                            <button 
                                onClick={handleSaveEdit}
                                className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Save size={20} /> Salvar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-slate-500 text-center h-full flex flex-col items-center justify-center">
                        <Search size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Selecione um jogador na lista para editar</p>
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
};
