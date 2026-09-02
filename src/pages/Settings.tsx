import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/UI';
import { useAppStore } from '../store';
import { Moon, Sun, Database } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your application preferences and system configuration.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme Preference</p>
              <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-muted border font-medium"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="text-primary-600" />
              <div>
                <p className="font-medium">Data Source</p>
                <p className="text-sm text-muted-foreground">Current active API backend</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success">
                {import.meta.env.VITE_USE_MOCK_API === 'true' ? 'MOCK DATA ENABLED' : 'LIVE API ENABLED'}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground p-4">
            <p><strong>App Version:</strong> 1.0.0</p>
            <p><strong>React:</strong> ^18.2.0</p>
            <p><strong>Build Time:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}