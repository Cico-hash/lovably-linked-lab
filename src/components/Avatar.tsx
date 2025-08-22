import React from 'react';
import BoringAvatar from 'boring-avatars';

interface AvatarProps {
  avatarUrl?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  name = 'User',
  size = 40,
  className = '',
}) => {
  // Se non c'è avatar URL, usa le iniziali del nome
  if (!avatarUrl) {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        className={`
          inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium
          ${className}
        `}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    );
  }

  // Se l'avatar URL contiene parametri per boring-avatars, usalo
  if (avatarUrl.includes('-')) {
    const [variant, seed, index] = avatarUrl.split('-');
    const avatarColors = [
      ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'],
      ['#FC8181', '#F6AD55', '#68D391', '#4FD1C7', '#63B3ED'],
      ['#A78BFA', '#F472B6', '#FBBF24', '#34D399', '#60A5FA'],
      ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6'],
    ];
    
    const colors = avatarColors[parseInt(index) % avatarColors.length];
    
    return (
      <div className={`rounded-full overflow-hidden ${className}`}>
        <BoringAvatar
          size={size}
          name={avatarUrl}
          variant={variant as any}
          colors={colors}
        />
      </div>
    );
  }

  // Fallback per URL di immagini normali
  return (
    <img
      src={avatarUrl}
      alt={`Avatar di ${name}`}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        // Se l'immagine non carica, mostra le iniziali
        const target = e.target as HTMLImageElement;
        const parent = target.parentElement;
        if (parent) {
          const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          
          parent.innerHTML = `
            <div class="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium w-full h-full" style="font-size: ${size * 0.4}px">
              ${initials}
            </div>
          `;
        }
      }}
    />
  );
};