import React, { useMemo } from 'react';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '../components/common/UI';
import { Users, TrendingUp, TrendingDown, Target, Activity, ShieldCheck } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

export default function Dashboard() {
  const { apis, scores, isLoading } = useAppStore();

  const kpis = useMemo(() => {
    if (!scores.length || !apis.length) return null;
    
    const totalManpower = scores.length;
    const overallAvg = scores.reduce((acc, curr) => acc + curr.overallScore, 0) / totalManpower;
    const highest = Math.max(...scores.map(s => s.overallScore));
    const lowest = Math.min(...scores.map(s => s.overallScore));
    const healthyApis = apis.filter(a => a.status === 'healthy').length;

    return {
      overallAvg: overallAvg.toFixed(1),
      totalManpower,
      highest: highest.toFixed(1),
      lowest: lowest.toFixed(1),
      apiHealth: `${healthyApis}/${apis.length}`
    };
  }, [scores, apis]);

  const categoryScores = useMemo(() => {
    if (!scores.length || !apis.length) return [];
    
    return apis.map(api => {
      const avgScore = scores.reduce((acc, curr) => acc + (curr.apiScores[api.id] || 0), 0) / scores.length;
      return {
        name: api.name,
        score: Math.round(avgScore),
        weight: api.weight * 100,
        fill: '#3b82f6' // Primary color
      };
    }).sort((a, b) => b.score - a.score);
  }, [scores, apis]);

  // Mock trend data
  const trendData = [
    { date: 'Mon', score: 82 },
    { date: 'Tue', score: 84 },
    { date: 'Wed', score: 85 },
    { date: 'Thu', score: 86 },
    { date: 'Fri', score: 87.6 },
  ];

  const pieData = [
    { name: 'Score', value: Number(kpis?.overallAvg || 0), fill: '#3b82f6' },
    { name: 'Remaining', value: 100 - Number(kpis?.overallAvg || 0), fill: '#e2e8f0' }
  ];

  if (isLoading || !kpis) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Executive Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Executive Dashboard</h2>
          <p className="text-muted-foreground">Overview of manpower performance and scoring APIs.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard title="Overall Score" value={kpis.overallAvg} icon={Target} trend="+4.2%" trendUp />
        <KpiCard title="Total Manpower" value={kpis.totalManpower} icon={Users} />
        <KpiCard title="Highest Score" value={kpis.highest} icon={TrendingUp} className="text-success" />
        <KpiCard title="Lowest Score" value={kpis.lowest} icon={TrendingDown} className="text-destructive" />
        <KpiCard title="API Health" value={kpis.apiHealth} icon={Activity} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Overall Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={80}
                  outerRadius={100}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className={index === 1 ? 'dark:fill-slate-800' : ''} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold">{kpis.overallAvg}</span>
              <span className="text-sm text-muted-foreground">Out of 100</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Score by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryScores} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                <XAxis type="number" domain={[0, 100]} className="text-xs text-muted-foreground" />
                <YAxis dataKey="name" type="category" className="text-xs font-medium text-foreground" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  cursor={{fill: 'var(--muted)'}}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {categoryScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Performance Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="date" className="text-xs text-muted-foreground" />
                <YAxis domain={['auto', 100]} className="text-xs text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, trend, trendUp, className }: any) {
  return (
    <Card>
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-md">
            <Icon size={18} className="text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className={`text-3xl font-bold ${className || ''}`}>{value}</h3>
          {trend && (
            <p className="text-xs mt-1 flex items-center">
              <span className={`font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
                {trend}
              </span>
              <span className="text-muted-foreground ml-1">vs previous period</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}