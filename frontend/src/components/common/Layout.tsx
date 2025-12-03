
import { Coins, Gem, LayoutDashboard, Lock, Menu, Repeat, ShoppingBag, Trophy, Users } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useGame } from '../../context/GameContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useGame();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const NavItem = ({ to, icon: Icon, label, isAdmin = false }: { to: string, icon: any, label: string, isAdmin?: boolean }) => (
    <NavLink
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
          ? isAdmin ? 'bg-red-900/50 text-red-200 font-semibold border border-red-800' : 'bg-green-600 text-white font-semibold'
          : isAdmin ? 'text-red-400/50 hover:bg-red-900/20 hover:text-red-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 h-screen sticky top-0 z-50">
        <div className="p-6">
          <h1 className="text-3xl font-display font-bold text-green-500 italic">JOGACRAQUE</h1>
          <p className="text-xs text-slate-500 tracking-wider">MMO MANAGER</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem to="/" icon={LayoutDashboard} label="Início" />
          <NavItem to="/squad" icon={Users} label="Meu Time" />
          <NavItem to="/market" icon={ShoppingBag} label="Mercado & Loja" />
          <NavItem to="/match" icon={Trophy} label="Jogar" />
        </nav>

        <div className="px-4 pb-4">
          <NavItem to="/admin" icon={Lock} label="Admin" isAdmin={true} />
        </div>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">{state.userTeamName}</p>
              <p className="text-xs text-slate-500">Nvl {state.level} • MMR {state.ratingMMR}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-950 sticky top-0 z-50 border-b border-slate-800">
        <span className="font-display font-bold text-xl text-green-500">JOGACRAQUE</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
          <Menu />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950 z-40 flex flex-col p-4 md:hidden">
          <div className="flex justify-end mb-8">
            <button onClick={() => setMobileMenuOpen(false)} className="text-white p-2">Fechar</button>
          </div>
          <nav className="space-y-4">
            <NavItem to="/" icon={LayoutDashboard} label="Início" />
            <NavItem to="/squad" icon={Users} label="Meu Time" />
            <NavItem to="/market" icon={ShoppingBag} label="Mercado & Loja" />
            <NavItem to="/match" icon={Trophy} label="Jogar" />
            <div className="pt-4 border-t border-slate-800">
              <NavItem to="/admin" icon={Lock} label="Admin" isAdmin={true} />
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar Resources */}
        <div className="bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 px-6 py-3 border-b border-slate-800 flex flex-wrap justify-end items-center gap-4">
          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700" title="Moedas (Pacotes)">
            <Coins size={16} className="text-yellow-400" />
            <span className="font-mono font-bold text-sm">{state.coins.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700" title="Fundos de Transferência (Mercado)">
            <Repeat size={16} className="text-green-400" />
            <span className="font-mono font-bold text-sm">{state.transferFunds.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700" title="Gemas">
            <Gem size={16} className="text-purple-400" />
            <span className="font-mono font-bold text-sm">{state.gems.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
