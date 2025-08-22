import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MultiStepRegistration } from '../components/MultiStepRegistration';

export const AuthPage: React.FC = () => {
  const [view, setView] = useState<'login' | 'register' | 'multiStep'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn } = useAuth();

  // This component will be conditionally rendered by App.tsx

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'multiStep') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
        <MultiStepRegistration 
          onBack={() => setView('login')}
          onSuccess={() => setView('login')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Logistica
          </h1>
          <p className="text-muted-foreground">
            Accedi al tuo account
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Caricamento...' : 'Accedi'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setView('multiStep');
              setEmail('');
              setPassword('');
            }}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Non hai un account? Registrati qui
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>🚚 Sistema di gestione spedizioni e logistica</p>
        </div>
      </div>
    </div>
  );
};