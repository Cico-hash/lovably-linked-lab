import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar } from './Avatar';
import { Search, Sun, Moon, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  searchQuery, 
  setSearchQuery, 
  onSearch,
  isDarkMode,
  toggleDarkMode 
}) => {
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
    <header className="bg-card text-card-foreground border-b border-border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="pr-10 w-64"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearch}
              className="absolute right-0 top-0 h-full px-3"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <div className="relative" ref={settingsRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            >
              <Settings className="h-4 w-4" />
            </Button>

            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-popover text-popover-foreground rounded-lg shadow-lg z-[9999] border border-border divide-y divide-border">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm border-b border-border text-muted-foreground">
                    {user?.user_metadata?.name || user?.email}
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-2 text-sm h-auto"
                    onClick={() => {
                      toggleDarkMode();
                      setShowSettingsMenu(false);
                    }}
                  >
                    {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    <span>{isDarkMode ? 'Modalità chiara' : 'Modalità scura'}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-2 text-sm text-destructive hover:text-destructive h-auto"
                    onClick={() => {
                      signOut();
                      setShowSettingsMenu(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </Button>
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