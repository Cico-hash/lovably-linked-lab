import React, { useState, useCallback } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { useToast } from './hooks/use-toast';
import { useDarkMode } from './hooks/useDarkMode';
import { Toaster } from './components/ui/toaster';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LoadingScreen } from './components/LoadingScreen';
import { KanbanView } from './views/KanbanView';
import { TodoView } from './views/TodoView';
import { CalendarView } from './views/CalendarView';
import { GmailView } from './views/GmailView';
import { NotesView } from './views/NotesView';
import Chat from './components/Chat';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      toast({
        title: "Ricerca",
        description: `Cercando: ${searchQuery}`,
      });
    }
  }, [searchQuery, toast]);

  const getViewTitle = (view: string): string => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      kanban: 'Gestione Spedizioni',
      todo: 'Gestione Task',
      calendar: 'Calendario',
      gmail: 'Gestione Email',
      notes: 'Note'
    };
    return titles[view] || 'Dashboard';
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'kanban':
        return <KanbanView />;
      case 'todo':
        return <TodoView />;
      case 'calendar':
        return <CalendarView />;
      case 'gmail':
        return <GmailView />;
      case 'notes':
        return <NotesView />;
      default:
        return <DashboardView />;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="flex h-screen w-full">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            title={getViewTitle(activeView)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
          
          <main className="flex-1 overflow-y-auto bg-background">
            {renderView()}
          </main>
        </div>
        <Chat isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
};

export default App;
