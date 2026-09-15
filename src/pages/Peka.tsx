import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { getManpowerList, Manpower } from '../services/attendance';

interface PekaRecord {
  nopek: string;
  jumlah: number;
}

interface PekaScore {
  manpower: Manpower;
  jumlah: number;
  score: number;
}

const PekaPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PekaScore[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Manpower list
      const manpowerList = await getManpowerList();
      
      // Fetch PEKA data
      let pekaRecords: PekaRecord[] = [];
      try {
        const response = await axios.get('https://peka.loc-2.com/peka2');
        // Handle different possible response structures
        if (Array.isArray(response.data)) {
          pekaRecords = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          pekaRecords = response.data.data;
        } else {
          console.warn("Unexpected PEKA API format", response.data);
        }
      } catch (error: any) {
        console.error("Failed to fetch from PEKA API", error);
        toast.error(`Failed to load live PEKA data: ${error.message}`);
      }

      // Map PEKA API data strictly by identitas
      const pekaMap: Record<string, number> = {};

      pekaRecords.forEach((record: any) => {
        const jumlahNum = Number(record.Jumlah || record.jumlah || record.JUMLAH || 0);
        const identitasRaw = record.Identitas || record.identitas || record.IDENTITAS || '';
        const identitas = String(identitasRaw).trim().toUpperCase();
        
        if (identitas && identitas !== '-') {
          pekaMap[identitas] = (pekaMap[identitas] || 0) + jumlahNum;
        }
      });

      // Combine with Manpower List (gate_id) by nopek
      const scoredList: PekaScore[] = manpowerList.map(mp => {
        const nopekRaw = mp.nopek || (mp as any).NOPEK || '';
        const mpNopek = String(nopekRaw).trim().toUpperCase();
        const jumlah = pekaMap[mpNopek] || 0;
        
        const score = Math.min(jumlah * 10, 100);

        return { manpower: mp, jumlah, score };
      });

      // Sort by score descending, then by jumlah descending
      scoredList.sort((a, b) => b.score - a.score || b.jumlah - a.jumlah);
      setData(scoredList);
    } catch (error) {
      console.error(error);
      toast.error('Failed to process PEKA scores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(d => 
    d.manpower.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.manpower.nopek.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.manpower.shift.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PEKA Scoring</h1>
          <p className="text-muted-foreground mt-1">Track manpower PEKA participation and calculate scores.</p>
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
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">NOPEK</th>
                <th className="px-6 py-4 font-medium">Shift Group</th>
                <th className="px-6 py-4 font-medium text-right">Jumlah PEKA</th>
                <th className="px-6 py-4 font-medium text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <p>Fetching PEKA data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No PEKA data found.
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
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                        Shift {d.manpower.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-foreground">
                        {d.jumlah}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-lg font-bold ${d.score >= 80 ? 'text-success' : d.score >= 50 ? 'text-warning' : 'text-destructive'}`}>
                        {d.score}%
                      </span>
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

export default PekaPage;
