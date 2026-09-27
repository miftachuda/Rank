import React, { useState, useEffect } from 'react';
import { format, subMonths, addMonths } from 'date-fns';
import { Search, ChevronLeft, ChevronRight, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getManpowerList, Manpower } from '../services/attendance';
import { fetchLearningHours, saveLearningHour } from '../services/learning';

interface LearningScore {
  manpower: Manpower;
  recordId?: string;
  hours: number;
  score: number;
}

const LearningHourPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LearningScore[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const manpowerList = await getManpowerList();
      const monthStr = format(currentMonth, 'yyyy-MM');
      const learningData = await fetchLearningHours(monthStr);

      const scoredList: LearningScore[] = manpowerList.map(mp => {
        const actualId = mp.id_finger || (mp as any).finger_id || (mp as any).idfinger || mp.nopek;
        const record = learningData[actualId];
        
        const hours = record ? record.hours : 0;
        // Scoring: 10 hours = 100%. 
        const score = Math.min(hours * 10, 100);

        return { 
          manpower: mp, 
          recordId: record?.id,
          hours, 
          score 
        };
      });

      scoredList.sort((a, b) => b.score - a.score || b.hours - a.hours);
      setData(scoredList);
    } catch (error) {
      console.error(error);
      toast.error('Failed to process Learning Hour data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const startEdit = (item: LearningScore) => {
    setEditingId(item.manpower.id);
    setEditValue(item.hours.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSave = async (item: LearningScore) => {
    const parsedHours = parseFloat(editValue);
    if (isNaN(parsedHours) || parsedHours < 0) {
      toast.error('Please enter a valid number of hours');
      return;
    }

    setIsSaving(true);
    try {
      const actualId = item.manpower.id_finger || (item.manpower as any).finger_id || (item.manpower as any).idfinger || item.manpower.nopek;
      const monthStr = format(currentMonth, 'yyyy-MM');
      
      await saveLearningHour(actualId, monthStr, parsedHours, item.recordId);
      
      toast.success('Learning hours saved successfully');
      setEditingId(null);
      fetchData(); // Refresh data to get new record ID and re-sort
    } catch (error) {
      toast.error('Failed to save learning hours');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredData = data.filter(d => 
    d.manpower.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.manpower.nopek.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.manpower.shift.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Learning Hour Scoring</h1>
          <p className="text-muted-foreground mt-1">Track and manage manpower learning hours manually.</p>
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
              placeholder="Search by name, nopek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <button 
            onClick={fetchData}
            disabled={loading || isSaving}
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Rank</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">NOPEK</th>
                <th className="px-6 py-4 font-medium text-center">Learning Hours</th>
                <th className="px-6 py-4 font-medium text-right">Score</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading manpower data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No data found.
                  </td>
                </tr>
              ) : (
                filteredData.map((d, index) => (
                  <tr 
                    key={d.manpower.id} 
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
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
                    <td className="px-6 py-4 font-medium capitalize text-foreground">{d.manpower.nama}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{d.manpower.nopek}</td>
                    
                    <td className="px-6 py-4 text-center">
                      {editingId === d.manpower.id ? (
                        <div className="flex items-center justify-center">
                          <input 
                            type="number" 
                            min="0"
                            step="0.5"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 px-2 py-1 text-center bg-background border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSave(d);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-foreground">
                          {d.hours} <span className="text-xs text-muted-foreground font-normal">hrs</span>
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className={`text-lg font-bold ${d.score >= 80 ? 'text-success' : d.score >= 50 ? 'text-warning' : 'text-destructive'}`}>
                        {d.score}%
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {editingId === d.manpower.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={cancelEdit}
                            disabled={isSaving}
                            className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors"
                          >
                            <X size={16} />
                          </button>
                          <button 
                            onClick={() => handleSave(d)}
                            disabled={isSaving}
                            className="p-1.5 text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                          >
                            <Save size={16} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => startEdit(d)}
                          className="p-1.5 text-muted-foreground hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors inline-flex"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LearningHourPage;