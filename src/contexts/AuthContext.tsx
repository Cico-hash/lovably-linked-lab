import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string, avatarUrl?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Accesso effettuato",
            description: "Benvenuto nella dashboard logistica!",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Disconnesso",
            description: "Sei stato disconnesso con successo.",
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, name?: string, avatarUrl?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { 
          name: name || email,
          avatar_url: avatarUrl
        }
      }
    });

    // Se la registrazione è riuscita e l'utente è confermato immediatamente, aggiorna il profilo
    if (!error && data.user && !data.user.email_confirmed_at) {
      // L'utente deve confermare l'email
    } else if (!error && data.user && data.user.email_confirmed_at) {
      // L'utente è già confermato, aggiorna il profilo direttamente
      await supabase
        .from('profiles')
        .update({ 
          name: name || email,
          avatar_url: avatarUrl 
        })
        .eq('id', data.user.id);
    }

    if (error) {
      let message = "Errore durante la registrazione";
      if (error.message.includes("already registered")) {
        message = "Email già registrata. Prova ad accedere invece.";
      } else if (error.message.includes("Password")) {
        message = "La password deve essere di almeno 6 caratteri";
      }
      
      toast({
        title: "Errore Registrazione",
        description: message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Registrazione Completata",
        description: "Controlla la tua email per confermare l'account",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let message = "Credenziali non valide";
      if (error.message.includes("Email not confirmed")) {
        message = "Email non confermata. Controlla la tua posta elettronica.";
      } else if (error.message.includes("Invalid login credentials")) {
        message = "Email o password non corretti";
      }
      
      toast({
        title: "Errore Accesso",
        description: message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};