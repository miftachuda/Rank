import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/UI';
import { Trophy, ArrowUp, ArrowDown, Minus, Search, Filter } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Leaderboard() {
  const { scores, manpower, isLoading } = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  if (isLoading || scores.length === 0) {
    return <div className="p-6 text-center">Loading leaderboard...</div>;
  }

  // Combine scores with manpower data
  const rankedData = scores.map((s, idx) => {
    const mp = manpower.find(m => m.id === s.manpowerId);
    return { ...s, mp, rank: idx + 1 };
  }).filter(item => 
    item.mp?.name.toLowerCase().includes(search.toLowerCase()) || 
    item.mp?.department.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = rankedData.slice(0, 3);
  const others = rankedData.slice(3);

  // Reorder top 3 for podium display (2, 1, 3)
  const podiumOrder = [
    top3.find(r => r.rank === 2),
    top3.find(r => r.rank === 1),
    top3.find(r => r.rank === 3),
  ].filter(Boolean);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      <div className="text-center space-y-2 mt-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full mb-2">
          <Trophy size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Manpower Leaderboard</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Top performers based on combined metrics and weighted scoring.</p>
      </div>

      {/* Podium */}
      <div className="flex justify-center items-end gap-2 md:gap-6 h-64 mt-12 mb-8">
        {podiumOrder.map((item, idx) => {
          if (!item || !item.mp) return null;
          const isFirst = item.rank === 1;
          const height = isFirst ? 'h-48' : item.rank === 2 ? 'h-40' : 'h-32';
          const badgeColor = isFirst ? 'bg-yellow-400 text-yellow-950' : item.rank === 2 ? 'bg-slate-300 text-slate-800' : 'bg-amber-600 text-amber-50';

          return (
            <div 
              key={item.manpowerId} 
              className="flex flex-col items-center w-24 md:w-32 cursor-pointer group"
              onClick={() => navigate(`/manpower/${item.manpowerId}`)}
            >
              <div className="relative mb-4 z-10 transition-transform group-hover:-translate-y-2">
                <img 
                  src={item.mp.avatar} 
                  alt={item.mp.name} 
                  className={cn(
                    "rounded-full object-cover border-4",
                    isFirst ? "w-24 h-24 border-yellow-400" : "w-20 h-20 border-border"
                  )}
                />
                <div className={cn("absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center font-bold text-sm rounded-full shadow-lg border-2 border-white", badgeColor)}>
                  {item.rank}
                </div>
              </div>
              
              <div className={cn(
                "w-full rounded-t-lg bg-gradient-to-t flex flex-col items-center pt-6 px-2 text-center",
                height,
                isFirst ? "from-primary-600/20 to-primary-100 dark:to-primary-900/50" : "from-muted to-muted/50"
              )}>
                <p className="font-bold text-sm md:text-base truncate w-full">{item.mp.name}</p>
                <p className="font-black text-xl md:text-2xl mt-1 text-primary-600 dark:text-primary-400">{item.overallScore}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <Card className="max-w-4xl mx-auto border-0 shadow-lg bg-card">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 justify-between md:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search manpower..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted text-sm font-medium">
            <Filter size={16} />
            Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/30 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold w-16 text-center">Rank</th>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Department</th>
                <th className="px-6 py-4 font-semibold text-right">Score</th>
                <th className="px-6 py-4 font-semibold w-24 text-center">Trend</th>
              </tr>
            </thead>
            <tbody>
              {others.map((item) => {
                if (!item.mp) return null;
                // Mock trend
                const trendNum = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
                
                return (
                  <tr 
                    key={item.manpowerId} 
                    onClick={() => navigate(`/manpower/${item.manpowerId}`)}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-center font-medium text-muted-foreground">
                      {item.rank}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.mp.avatar} alt={item.mp.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-semibold">{item.mp.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{item.mp.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                        {item.mp.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-lg">
                      {item.overallScore}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        {trendNum > 0 ? (
                          <div className="flex items-center text-success text-xs font-medium"><ArrowUp size={14} className="mr-1"/>{trendNum}</div>
                        ) : trendNum < 0 ? (
                          <div className="flex items-center text-destructive text-xs font-medium"><ArrowDown size={14} className="mr-1"/>{Math.abs(trendNum)}</div>
                        ) : (
                          <div className="flex items-center text-muted-foreground text-xs"><Minus size={14} /></div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {others.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No matching manpower found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}