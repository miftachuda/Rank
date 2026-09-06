import React, { useState, useEffect } from 'react';
import { format, subMonths, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Badge } from '../components/common/UI';

interface BocRecord {
  id: string;
  ru: string;
  area: string;
  subject: string;
  oprator: string;
  timestamp: string;
  status: string;
}

interface OperatorScore {
  operator: string;
  score: number;
  records: BocRecord[];
}

const BocPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OperatorScore[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<OperatorScore | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dateFrom = format(startOfMonth(currentMonth), 'd MMMM yyyy');
      const dateTo = format(endOfMonth(currentMonth), 'd MMMM yyyy');
      
      const response = await axios.get('https://incidental.loc-2.com/api/scrape', {
        params: {
          dateFrom,
          dateTo
        }
      });
      
      const records: BocRecord[] = response.data?.data || [];
      
      // Group by operator
      const grouped = records.reduce((acc: Record<string, BocRecord[]>, curr) => {
        const op = curr.oprator || 'Unknown';
        if (!acc[op]) acc[op] = [];
        acc[op].push(curr);
        return acc;
      }, {});

      const scoredList = Object.keys(grouped).map(op => ({
        operator: op,
        score: grouped[op].length,
        records: grouped[op]
      }));

      scoredList.sort((a, b) => b.score - a.score);
      setData(scoredList);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load BOC data.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const filteredData = data.filter(d => 
    d.operator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (ts: string) => {
    const match = ts.match(/\d+/);
    if (match) {
      return format(new Date(parseInt(match[0])), 'dd MMM yyyy HH:mm:ss');
    }
    return ts;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = { 
      'Closed': 'success', 
      'Open': 'warning', 
      'NFUY': 'destructive' 
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">BOC Scoring</h1>
          <p className="text-muted-foreground mt-1">Track manpower BOC performance and reports.</p>
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
              placeholder="Search operator..."
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
            {loading ? 'Fetching...' : 'Refresh Data'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Rank</th>
                <th className="px-6 py-4 font-medium">Operator</th>
                <th className="px-6 py-4 font-medium">Items Reported</th>
                <th className="px-6 py-4 font-medium text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <p>Fetching BOC data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No BOC data found for this period.
                  </td>
                </tr>
              ) : (
                filteredData.map((d, index) => (
                  <tr 
                    key={d.operator} 
                    onClick={() => setSelectedOperator(d)}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
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
                    <td className="px-6 py-4 font-medium capitalize">{d.operator.replace('.', ' ')}</td>
                    <td className="px-6 py-4 text-muted-foreground">{d.records.length} items</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {d.score}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-card text-card-foreground w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] border border-border">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-xl font-bold capitalize">{selectedOperator.operator.replace('.', ' ')}</h3>
                <p className="text-sm text-muted-foreground">
                  Total Items Reported: <span className="font-bold text-primary-600 dark:text-primary-400">{selectedOperator.score}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedOperator(null)}
                className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10 shadow-sm border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-tl-md">Time</th>
                    <th className="px-4 py-3 font-medium">Area / RU</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium text-center rounded-tr-md">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOperator.records.map((record) => (
                    <tr key={record.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        {formatTimestamp(record.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-medium text-foreground">{record.area}</span>
                        <br />
                        <span className="text-muted-foreground">{record.ru}</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">
                        {record.subject}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(record.status)}
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

export default BocPage;
