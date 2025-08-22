import React, { useState } from 'react';
import Avatar from 'boring-avatars';

interface AvatarSelectorProps {
  selectedAvatar: string | null;
  onSelectAvatar: (avatar: string) => void;
}

const avatarVariants = ['marble', 'beam', 'pixel', 'sunset', 'ring', 'bauhaus'];
const avatarColors = [
  ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'],
  ['#FC8181', '#F6AD55', '#68D391', '#4FD1C7', '#63B3ED'],
  ['#A78BFA', '#F472B6', '#FBBF24', '#34D399', '#60A5FA'],
  ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6'],
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onSelectAvatar,
}) => {
  const [seed, setSeed] = useState(0);

  const generateNewAvatars = () => {
    setSeed(prev => prev + 1);
  };

  const avatarOptions = avatarVariants.map((variant, index) => {
    const name = `${variant}-${seed}-${index}`;
    const colors = avatarColors[index % avatarColors.length];
    return { variant, name, colors };
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Scegli il tuo avatar
        </h3>
        <p className="text-sm text-muted-foreground">
          Seleziona un avatar divertente per il tuo profilo
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {avatarOptions.map(({ variant, name, colors }) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelectAvatar(name)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105
              ${selectedAvatar === name 
                ? 'border-primary bg-primary/10 shadow-lg' 
                : 'border-border bg-card hover:border-primary/50'
              }
            `}
          >
            <div className="flex justify-center mb-2">
              <Avatar
                size={60}
                name={name}
                variant={variant as any}
                colors={colors}
              />
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {variant}
            </p>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={generateNewAvatars}
          className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          🎲 Genera nuovi avatar
        </button>
      </div>
    </div>
  );
};