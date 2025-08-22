import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { useShipments, useProfiles, useTasks, useNotes, useCustomers } from './hooks/useSupabaseData';
import { useToast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';
import { Avatar } from './components/Avatar';
// Define types inline for now
type Priority = 'Alta' | 'Media' | 'Bassa';
type KanbanColumnID = 'Spedizioni Ferme' | 'Spedizioni Future' | 'Ritira il Cliente';

// Utility functions
const getPriorityClass = (priority: string): string => {
  switch (priority) {
    case 'Alta': return 'text-red-500';
    case 'Media': return 'text-yellow-500';
    case 'Bassa': return 'text-green-500';
    default: return 'text-gray-500';
  }
};

const getEventTypeClass = (type: string): string => {
  switch (type) {
    case 'shipment': return 'bg-blue-500';
    case 'task': return 'bg-green-500';
    case 'pickup': return 'bg-orange-500';
    case 'meeting': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

// Icon component
const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => (
  <i className={`fas fa-${name} ${className}`} />
);

// UI components with updated auth integration
const Sidebar: React.FC<{
  activeView: string;
  setActiveView: (view: string) => void;
  isDarkMode: boolean;
}> = ({ activeView, setActiveView, isDarkMode }) => {
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'tachometer-alt' },
    { id: 'kanban', name: 'Spedizioni', icon: 'shipping-fast' },
    { id: 'todo', name: 'Task', icon: 'tasks' },
    { id: 'calendar', name: 'Calendario', icon: 'calendar' },
    { id: 'gmail', name: 'Email', icon: 'envelope' },
    { id: 'notes', name: 'Note', icon: 'sticky-note' },
  ];

  return (
    <div className={`w-64 h-screen ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
      <div className="p-6">
        <h1 className="text-xl font-bold">Dashboard Logistica</h1>
      </div>
      
      <nav className="flex-1 px-4 pb-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full text-left px-4 py-3 mb-2 rounded-lg transition-colors ${
              activeView === item.id
                ? 'bg-blue-500 text-white'
                : `hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-white' : 'text-gray-700'}`
            }`}
          >
            <Icon name={item.icon} className="mr-3" />
            {item.name}
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => signOut()}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
            isDarkMode 
              ? 'text-red-400 hover:bg-gray-700' 
              : 'text-red-600 hover:bg-gray-100'
          }`}
        >
          <Icon name="sign-out-alt" className="mr-3" />
          Disconnetti
        </button>
      </div>
    </div>
  );
};

const Header: React.FC<{
  title: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
}> = ({ title, isDarkMode, toggleDarkMode, searchQuery, setSearchQuery, onSearch }) => {
  const { user, signOut } = useAuth();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border-b border-gray-200 dark:border-gray-700 p-4`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className={`px-4 py-2 pr-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            />
            <button
              onClick={onSearch}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            >
              <Icon name="search" />
            </button>
          </div>
          
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'
            } hover:bg-opacity-80 transition-colors`}
          >
            <Icon name={isDarkMode ? 'sun' : 'moon'} />
          </button>

          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-2 w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Icon name="settings" />
            </button>

            {showSettingsMenu && (
              <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50 ${
                isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <div className="py-1">
                  <div className={`px-4 py-2 text-sm border-b ${
                    isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'
                  }`}>
                    {user?.user_metadata?.name || user?.email}
                  </div>
                  
                  <button
                    onClick={toggleDarkMode}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon name={isDarkMode ? 'sun' : 'moon'} />
                    <span>{isDarkMode ? 'Modalità chiara' : 'Modalità scura'}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      signOut();
                      setShowSettingsMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 text-red-600 ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon name="log-out" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Avatar 
              avatarUrl={user?.user_metadata?.avatar_url} 
              name={user?.user_metadata?.name || user?.email || 'User'} 
              size={32} 
            />
            <span className="text-sm">{user?.user_metadata?.name || user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// View components will be updated to use Supabase data
const DashboardView: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const { shipments, loading: shipmentsLoading } = useShipments();
  const { tasks, loading: tasksLoading } = useTasks();
  
  if (shipmentsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Caricamento dati...</div>
      </div>
    );
  }

  const todayShipments = shipments.filter(s => 
    s.due_date && new Date(s.due_date).toDateString() === new Date().toDateString()
  );
  
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
          <h3 className="text-lg font-semibold mb-2">Spedizioni Totali</h3>
          <p className="text-3xl font-bold text-blue-500">{shipments.length}</p>
        </div>
        
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
          <h3 className="text-lg font-semibold mb-2">Spedizioni Oggi</h3>
          <p className="text-3xl font-bold text-green-500">{todayShipments.length}</p>
        </div>
        
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
          <h3 className="text-lg font-semibold mb-2">Task Attivi</h3>
          <p className="text-3xl font-bold text-orange-500">{pendingTasks.length}</p>
        </div>
        
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
          <h3 className="text-lg font-semibold mb-2">Task Completati</h3>
          <p className="text-3xl font-bold text-purple-500">{completedTasks.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
          <h3 className="text-lg font-semibold mb-4">Spedizioni Recenti</h3>
          <div className="space-y-3">
            {shipments.slice(0, 5).map((shipment) => (
              <div key={shipment.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div>
                  <p className="font-medium">{shipment.order_number}</p>
                  <p className="text-sm text-gray-500">{shipment.customer?.name}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getPriorityClass(shipment.priority)}`}>
                  {shipment.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow`}>
          <h3 className="text-lg font-semibold mb-4">Task Recenti</h3>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                  {task.completed && <Icon name="check-circle" className="text-green-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Caricamento...</p>
    </div>
  </div>
);

// Main App component wrapped with authentication
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

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
        return <DashboardView isDarkMode={isDarkMode} />;
      case 'kanban':
        return <div className="p-6">Kanban View - In sviluppo</div>;
      case 'todo':
        return <div className="p-6">Todo View - In sviluppo</div>;
      case 'calendar':
        return <div className="p-6">Calendar View - In sviluppo</div>;
      case 'gmail':
        return <div className="p-6">Gmail View - In sviluppo</div>;
      case 'notes':
        return <div className="p-6">Notes View - In sviluppo</div>;
      default:
        return <DashboardView isDarkMode={isDarkMode} />;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          isDarkMode={isDarkMode} 
        />
        
        <div className="flex-1">
          <Header
            title={getViewTitle(activeView)}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
          />
          
          <main className={isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}>
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  );
};

// Main App component with providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
};

export default App;
