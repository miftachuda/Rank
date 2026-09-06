import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trophy, 
  Users,
  SlidersHorizontal, 
  Settings,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: Users, label: 'Attendance', path: '/attendance' },
  { icon: SlidersHorizontal, label: 'Weight Config', path: '/weights' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out bg-card border-r flex flex-col",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
          isCollapsed && !isOpen ? "md:w-20" : "md:w-64"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className={cn("flex items-center gap-2", isCollapsed && !isOpen && "md:hidden")}>
            <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold">
              MP
            </div>
            <span className="font-semibold text-lg whitespace-nowrap">Manpower Rank</span>
          </div>
          
          {isCollapsed && !isOpen && (
            <div className="hidden md:flex w-full items-center justify-center">
              <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold">
                MP
              </div>
            </div>
          )}

          <button onClick={() => setIsOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                    isActive 
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={isCollapsed && !isOpen ? item.label : undefined}
                >
                  <item.icon size={20} className={cn("shrink-0", isCollapsed && !isOpen && "mx-auto")} />
                  <span className={cn(
                    "whitespace-nowrap transition-opacity", 
                    isCollapsed && !isOpen ? "md:opacity-0 md:hidden" : "opacity-100"
                  )}>
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-full items-center justify-center py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <ChevronLeft size={20} className={cn("transition-transform", isCollapsed && "rotate-180")} />
          </button>
          
          <div className={cn("flex items-center gap-3 mt-4", isCollapsed && !isOpen && "md:justify-center")}>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
               <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className={cn(
              "flex flex-col",
              isCollapsed && !isOpen ? "md:hidden" : "block"
            )}>
              <span className="text-sm font-medium leading-none">Admin User</span>
              <span className="text-xs text-muted-foreground mt-1">admin@company.com</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};