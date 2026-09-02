import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../sidebar/Sidebar';
import { Header } from '../header/Header';
import { cn } from '../../utils/cn';
import { useAppStore } from '../../store';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { loadData, theme } = useAppStore();

  useEffect(() => {
    loadData();
    // Initialize theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, [loadData, theme]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      <div 
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
        )}
      >
        <Header toggleSidebar={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};