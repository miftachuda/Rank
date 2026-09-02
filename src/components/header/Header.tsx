import React from 'react';
import { Menu, Moon, Sun, Bell } from 'lucide-react';
import { useAppStore } from '../../store';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useAppStore();

  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground md:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-semibold text-lg hidden sm:block">Performance Dashboard</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border-2 border-card"></span>
        </button>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};