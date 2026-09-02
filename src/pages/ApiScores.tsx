import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from '../components/common/UI';
import { ArrowRight, Clock, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ApiScores() {
  const { apis, scores, isLoading } = useAppStore();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">API Scores Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API Scores Overview</h2>
        <p className="text-muted-foreground">View and manage all scoring APIs and their average contributions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {apis.map((api) => {
          // Calculate average score for this API
          const avgScore = scores.length > 0
            ? scores.reduce((acc, curr) => acc + (curr.apiScores[api.id] || 0), 0) / scores.length
            : 0;
            
          const contribution = (avgScore * api.weight).toFixed(1);

          return (
            <Card key={api.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-3 border-b flex flex-row items-start justify-between bg-muted/40">
                <div>
                  <CardTitle className="text-lg">{api.name}</CardTitle>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock size={12} className="mr-1" />
                    Updated {formatDistanceToNow(new Date(api.lastUpdated), { addSuffix: true })}
                  </div>
                </div>
                <Badge variant={
                  api.status === 'healthy' ? 'success' : 
                  api.status === 'warning' ? 'warning' : 
                  api.status === 'error' ? 'destructive' : 'default'
                }>
                  {api.status === 'healthy' ? <Activity size={12} className="mr-1" /> : null}
                  {api.status.charAt(0).toUpperCase() + api.status.slice(1)}
                </Badge>
              </CardHeader>
              
              <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Average Score</p>
                      <p className="text-3xl font-bold">{Math.round(avgScore)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground font-medium mb-1">Weight</p>
                      <p className="text-xl font-semibold text-primary-600 dark:text-primary-400">
                        {Math.round(api.weight * 100)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Avg. Contribution to Final</span>
                      <span className="font-semibold">{contribution} pts</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/api-scores/${api.id}`)}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-secondary text-secondary-foreground hover:bg-muted border transition-colors font-medium text-sm"
                >
                  View Details
                  <ArrowRight size={16} />
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}