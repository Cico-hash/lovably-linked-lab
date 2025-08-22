import React, { useState } from 'react';
import { AvatarSelector } from './AvatarSelector';
import { useAuth } from '../contexts/AuthContext';

interface MultiStepRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const MultiStepRegistration: React.FC<MultiStepRegistrationProps> = ({
  onBack,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1 data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Step 2 data
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  
  const { signUp } = useAuth();

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && name) {
      setStep(2);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAvatar) return;

    setLoading(true);
    try {
      const { error } = await signUp(email, password, name, selectedAvatar);
      if (!error) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Dashboard Logistica
        </h1>
        <p className="text-muted-foreground">
          {step === 1 ? 'Crea il tuo account' : 'Personalizza il tuo profilo'}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            1
          </div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            2
          </div>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Nome Completo
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Il tuo nome completo"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="la-tua-email@esempio.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="La tua password"
              required
              minLength={6}
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-4 py-2 border border-input rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              Indietro
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Continua
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-6">
          <AvatarSelector
            selectedAvatar={selectedAvatar}
            onSelectAvatar={setSelectedAvatar}
          />

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-2 border border-input rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              Indietro
            </button>
            <button
              type="submit"
              disabled={!selectedAvatar || loading}
              className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creazione...' : 'Completa Registrazione'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>🚚 Sistema di gestione spedizioni e logistica</p>
      </div>
    </div>
  );
};