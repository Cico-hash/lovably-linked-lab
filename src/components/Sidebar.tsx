import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Truck, 
  CheckSquare, 
  Calendar, 
  Mail, 
  StickyNote,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'kanban', name: 'Spedizioni', icon: Truck },
  { id: 'todo', name: 'Task', icon: CheckSquare },
  { id: 'calendar', name: 'Calendario', icon: Calendar },
  { id: 'gmail', name: 'Email', icon: Mail },
  { id: 'notes', name: 'Note', icon: StickyNote },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { signOut } = useAuth();

  return (
    <div className="w-64 h-screen bg-card text-card-foreground border-r border-border flex flex-col shadow-lg">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          RM Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Gestione Logistica</p>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className={`w-full justify-start h-12 transition-all duration-200 ${
                activeView === item.id 
                  ? "bg-primary text-primary-foreground shadow-md glow-shadow" 
                  : "hover:bg-muted/60 hover:shadow-sm"
              }`}
              onClick={() => setActiveView(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.name}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-12 transition-all duration-200"
          onClick={() => signOut()}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Disconnetti
        </Button>
      </div>
    </div>
  );
};