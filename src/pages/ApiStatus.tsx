import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/common/UI';
import { RefreshCw, Activity, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function ApiStatus() {
  const { apis, loadData } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
      toast.success('API statuses refreshed');
    } catch (e) {
      toast.error('Failed to refresh statuses');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'healthy': return <CheckCircle size={18} className="text-success" />;
      case 'warning': return <AlertTriangle size={18} className="text-warning" />;
      case 'error': return <XCircle size={18} className="text-destructive" />;
      default: return <Activity size={18} className="text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = { healthy: 'success', warning: 'warning', error: 'destructive', offline: 'default' };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Status</h2>
          <p className="text-muted-foreground">Monitor the health and response times of connected APIs.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-card border rounded-md hover:bg-muted font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh All'}
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Endpoint</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Response Time</th>
                <th className="px-6 py-4 font-medium">Last Checked</th>
              </tr>
            </thead>
            <tbody>
              {apis.map((api) => (
                <tr key={api.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(api.status)}
                      <span className="font-medium">{api.name} API</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                    {api.endpoint}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(api.status)}
                  </td>
                  <td className="px-6 py-4">
                    {api.status === 'offline' ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <span className={api.responseTime! > 1000 ? 'text-warning font-medium' : 'text-foreground'}>
                        {api.responseTime} ms
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(api.lastUpdated), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}