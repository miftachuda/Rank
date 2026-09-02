import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/common/UI';
import { ArrowLeft, Trophy, MapPin, Briefcase, User } from 'lucide-react';
import { ResponsiveContainer, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart } from 'recharts';

export default function ManpowerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { manpower, scores, apis, isLoading } = useAppStore();

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;

  const mp = manpower.find(m => m.id === id);
  const scoreData = scores.find(s => s.manpowerId === id);
  const rank = scores.findIndex(s => s.manpowerId === id) + 1;

  if (!mp || !scoreData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Manpower Not Found</h2>
        <button onClick={() => navigate('/leaderboard')} className="text-primary-600 hover:underline">
          Return to Leaderboard
        </button>
      </div>
    );
  }

  const radarData = apis.map(api => ({
    subject: api.name,
    A: scoreData.apiScores[api.id] || 0,
    fullMark: 100,
  }));

  const strengths = [...radarData].sort((a, b) => b.A - a.A).slice(0, 2);
  const weaknesses = [...radarData].sort((a, b) => a.A - b.A).slice(0, 2);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <button 
        onClick={() => navigate('/leaderboard')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Leaderboard
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-primary-600 to-primary-400"></div>
          <CardContent className="pt-16 pb-8 px-6 flex flex-col items-center text-center relative z-10">
            <div className="w-32 h-32 rounded-full border-4 border-card overflow-hidden bg-card mb-4 shadow-md">
              <img src={mp.avatar} alt={mp.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold">{mp.name}</h2>
            <p className="text-muted-foreground mb-4">{mp.employeeId}</p>
            
            <div className="flex items-center justify-center gap-2 mb-6 w-full">
              <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
                <Briefcase size={14} /> {mp.department}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
                <User size={14} /> {mp.position}
              </Badge>
            </div>

            <div className="w-full bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 flex flex-col items-center">
              <span className="text-sm font-semibold text-primary-600/80 dark:text-primary-400/80 uppercase tracking-wider mb-1">Overall Rank</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-primary-600 dark:text-primary-400">#{rank}</span>
                <span className="text-muted-foreground text-sm font-medium">/ {scores.length}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-800 w-full flex justify-between items-center">
                <span className="text-sm font-medium">Final Score</span>
                <span className="text-xl font-bold">{scoreData.overallScore}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Area */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                    <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="bg-success/5 border-success/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-success text-sm uppercase tracking-wider">Key Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {strengths.map(s => (
                    <li key={s.subject} className="flex justify-between items-center">
                      <span className="font-medium">{s.subject}</span>
                      <span className="font-bold text-success">{s.A}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-warning/5 border-warning/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-warning-foreground text-sm uppercase tracking-wider">Needs Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {weaknesses.map(s => (
                    <li key={s.subject} className="flex justify-between items-center">
                      <span className="font-medium">{s.subject}</span>
                      <span className="font-bold text-warning-foreground">{s.A}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Category Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apis.map(api => {
                  const score = scoreData.apiScores[api.id] || 0;
                  return (
                    <div key={api.id} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium">{api.name}</div>
                      <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${score >= 90 ? 'bg-success' : score >= 70 ? 'bg-primary-500' : 'bg-warning'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <div className="w-8 text-right font-bold">{score}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}