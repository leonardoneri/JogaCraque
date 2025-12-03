
import React from 'react';
import { Player } from '../../types';

interface PlayerCardProps {
  player: Player | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'pitch' | 'admin';
  onClick?: () => void;
  showStats?: boolean; // Mantido para compatibilidade de props
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, size = 'md', onClick }) => {
  if (!player) {
    return (
      <div 
        onClick={onClick}
        className={`
          relative flex items-center justify-center border-2 border-dashed border-white/20 bg-white/5 rounded-lg
          hover:bg-white/10 cursor-pointer transition-colors
          ${size === 'sm' ? 'w-16 h-24' : size === 'md' ? 'w-24 h-36' : size === 'pitch' ? 'w-24 h-32' : size === 'admin' ? 'w-64 h-96' : 'w-48 h-72'}
        `}
      >
        <span className="text-white/30 font-bold">+</span>
      </div>
    );
  }

  const { name, image } = player;

  const sizeClasses = {
    sm: 'w-16 h-24',
    md: 'w-28 h-40',
    lg: 'w-48 h-64',
    xl: 'w-72 h-[420px]',
    pitch: 'w-24 h-32', // Tamanho específico para o campo
    admin: 'w-64 h-96', // Tamanho grande para o editor admin
  }[size] || 'w-28 h-40';

  return (
    <div 
      onClick={onClick}
      className={`
        relative flex-shrink-0 select-none cursor-pointer transition-transform transform hover:scale-105
        bg-transparent z-10 flex items-center justify-center
        ${sizeClasses}
      `}
    >
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-contain" 
        loading="lazy"
      />
    </div>
  );
};
