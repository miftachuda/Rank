import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/common/UI';
import { ArrowLeft, Activity, Target, ShieldCheck, ActivitySquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ApiDetail() {
  const { apiId } = useParams<{ apiId: string }>();
  const navigate = useNavigate();
  const { apis, scores } = useAppStore();

  const api = useMemo(() => apis.find(a => a.id === apiId), [apis, apiId]);
  
  const avgScore = useMemo(() => {
    if (!api || !scores.length) return 0;
    return scores.reduce((acc, curr) => acc + (curr.apiScores[api.id] || 0), 0) / scores.length;
  }, [api, scores]);

  if (!api) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">API Not Found</h2>
        <button onClick={() => navigate('/api-scores')} className="text-primary-600 hover:underline">
          Return to API Scores
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/api-scores')}
          className="p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{api.name} Details</h2>
          <p className="text-muted-foreground">{api.description}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* API Overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>API Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Endpoint</p>
                <p className="font-medium font-mono text-sm mt-1 bg-muted px-2 py-1 rounded inline-block">{api.endpoint}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  <Badge variant={
                    api.status === 'healthy' ? 'success' : 
                    api.status === 'warning' ? 'warning' : 
                    api.status === 'error' ? 'destructive' : 'default'
                  }>
                    {api.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="font-medium mt-1">{api.responseTime || 0} ms</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium mt-1">{formatDistanceToNow(new Date(api.lastUpdated), { addSuffix: true })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Score Info */}
        <Card>
          <CardHeader>
            <CardTitle>Global Metrics</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-[calc(100%-4rem)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-muted-foreground font-medium">Average Score</span>
              <span className="text-3xl font-bold">{Math.round(avgScore)}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-muted-foreground font-medium">Global Weight</span>
              <span className="text-xl font-semibold text-primary-600">{Math.round(api.weight * 100)}%</span>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Contribution</span>
              <span className="text-xl font-bold">{(avgScore * api.weight).toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-semibold mt-8 mb-4">Scoring Parameters</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {api.parameters.map(param => (
          <Card key={param.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{param.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">Weight: {Math.round(param.weight * 100)}% of {api.name} score</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">{param.normalizedScore}</span>
                  <span className="text-sm text-muted-foreground ml-1">/ 100</span>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Score Progress</span>
                  <span className="font-medium">{param.normalizedScore}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${param.normalizedScore >= (param.target || 80) ? 'bg-success' : param.normalizedScore >= 60 ? 'bg-warning' : 'bg-destructive'}`}
                    style={{ width: `${param.normalizedScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>Raw: {param.rawValue}</span>
                  <span>Target: {param.target}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}