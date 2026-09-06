import React, { useState, useEffect } from 'react';
import { format, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Search, X, CheckCircle2, XCircle } from 'lucide-react';
import { getManpowerList, fetchAllAttendanceRecords, calculateScoreForManpower, Manpower, DailyDetail } from '../services/attendance';
import toast from 'react-hot-toast';

interface ManpowerScore extends Manpower {
  score: number;
  totalWorkingDays: number;
  details: DailyDetail[];
}

const AttendanceScore: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [manpowerData, setManpowerData] = useState<ManpowerScore[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManpower, setSelectedManpower] = useState<ManpowerScore | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const list = await getManpowerList();
      
      if (list.length === 0) {
        toast.error('No manpower data found in PocketBase or fetch failed. Check console.');
        setManpowerData([]);
        setLoading(false);
        return;
      }

      // Collect all IDs for bulk fetch
      const ids = list
        .map(mp => mp.id_finger || (mp as any).finger_id || (mp as any).idfinger)
        .filter(Boolean) as string[];

      // Fetch all attendance records at once
      const allRecords = await fetchAllAttendanceRecords(ids, currentMonth);

      const scoredList = list.map((mp) => {
        const actualId = mp.id_finger || (mp as any).finger_id || (mp as any).idfinger;
        const records = actualId ? (allRecords[actualId] || []) : [];
        const result = calculateScoreForManpower(mp, currentMonth, records);
        return { ...mp, score: result.score, totalWorkingDays: result.totalWorkingDays, details: result.details };
      });
      
      scoredList.sort((a, b) => b.score - a.score);
      setManpowerData(scoredList);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load attendance scores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const filteredData = manpowerData.filter(mp => 
    mp.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    mp.nopek.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mp.shift.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance Scoring</h1>
          <p className="text-muted-foreground mt-1">Track manpower attendance based on shift schedules.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-lg border shadow-sm">
          <button onClick={prevMonth} className="p-1 hover:bg-muted rounded-md transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-muted rounded-md transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name, nopek, or shift..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <button 
            onClick={fetchData}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Calculating...' : 'Refresh Data'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Rank</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">NOPEK</th>
                <th className="px-6 py-4 font-medium">Shift Group</th>
                <th className="px-6 py-4 font-medium">ID Finger</th>
                <th className="px-6 py-4 font-medium text-right">Score</th>
                <th className="px-6 py-4 font-medium text-right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <p>Calculating scores and fetching data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No manpower data found for this period.
                  </td>
                </tr>
              ) : (
                filteredData.map((mp, index) => (
                  <tr 
                    key={mp.id} 
                    onClick={() => setSelectedManpower(mp)}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        index === 1 ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                        index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{mp.nama}</td>
                    <td className="px-6 py-4">{mp.nopek}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                        Shift {mp.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{mp.id_finger}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {mp.score}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">/ {mp.totalWorkingDays}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {mp.totalWorkingDays > 0 ? Math.round((mp.score / mp.totalWorkingDays) * 100) : 0}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedManpower && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-card text-card-foreground w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] border border-border">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-xl font-bold">{selectedManpower.nama}</h3>
                <p className="text-sm text-muted-foreground">
                  NOPEK: {selectedManpower.nopek} | Shift Group: {selectedManpower.shift} | Score: <span className="font-bold text-primary-600 dark:text-primary-400">{selectedManpower.score} / {selectedManpower.totalWorkingDays}</span> ({selectedManpower.totalWorkingDays > 0 ? Math.round((selectedManpower.score / selectedManpower.totalWorkingDays) * 100) : 0}%)
                </p>
              </div>
              <button 
                onClick={() => setSelectedManpower(null)}
                className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10 shadow-sm border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-tl-md">Date</th>
                    <th className="px-4 py-3 font-medium">Expected Shift</th>
                    <th className="px-4 py-3 font-medium">Shift Window</th>
                    <th className="px-4 py-3 font-medium">Actual Entries</th>
                    <th className="px-4 py-3 font-medium text-center rounded-tr-md">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedManpower.details.map((detail, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {format(detail.date, 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          detail.shift === 'Off' 
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        }`}>
                          {detail.shift}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {detail.shift !== 'Off' && detail.windowStart && detail.windowEnd ? (
                          <span>
                            {format(detail.windowStart, 'dd/MM HH:mm')} - {format(detail.windowEnd, 'dd/MM HH:mm')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {detail.actualEntries.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {detail.actualEntries.map((entry, eIdx) => (
                              <span key={eIdx} className="text-foreground font-medium">
                                {format(entry, 'dd/MM HH:mm:ss')}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {detail.shift === 'Off' ? (
                          <span className="text-muted-foreground">-</span>
                        ) : detail.scored ? (
                          <CheckCircle2 size={20} className="text-success mx-auto" />
                        ) : (
                          <XCircle size={20} className="text-destructive mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceScore;