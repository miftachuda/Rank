import { ScoreApi, Manpower, ManpowerScore } from '../../types';
import { mockApis, mockManpower, mockManpowerScores } from '../../data/mock';
import { getManpowerList, fetchAllAttendanceRecords, calculateScoreForManpower, fetchJustifications } from '../attendance';
import { fetchLearningHours } from '../learning';
import axios from 'axios';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const IS_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

// Delay helper to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchApis = async (): Promise<ScoreApi[]> => {
  return mockApis; // ALWAYS return our updated mockApis (which includes boc)
};

export const fetchManpower = async (): Promise<Manpower[]> => {
  try {
    const list = await getManpowerList();
    if (list && list.length > 0) {
      return list.map((mp: any) => ({
        id: mp.id,
        name: mp.nama || mp.name || 'Unknown',
        employeeId: mp.nopek || mp.employeeId || 'N/A',
        department: mp.shift ? `Shift ${mp.shift}` : 'Unknown',
        position: 'Operator',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(mp.nama || 'User')}&background=random`,
        // keep original data attached if needed
        _raw: mp
      }));
    }
  } catch (error) {
    console.error("Error fetching live manpower, falling back to mock", error);
  }
  return mockManpower;
};

export const fetchManpowerScores = async (): Promise<ManpowerScore[]> => {
  try {
    const list = await getManpowerList();
    if (list && list.length > 0) {
      const currentMonth = new Date();
      
      // 1. Fetch attendance and justifications and learning hours
      const ids = list.map((mp: any) => mp.id_finger || mp.finger_id || mp.idfinger || mp.nopek).filter(Boolean) as string[];
      const monthStr = format(currentMonth, 'yyyy-MM');
      const [attendanceRecords, allJustifications, learningData] = await Promise.all([
        fetchAllAttendanceRecords(ids, currentMonth),
        fetchJustifications(currentMonth),
        fetchLearningHours(monthStr)
      ]);
      
      // 2. Fetch BOC data
      let bocData: Record<string, number> = {};
      try {
        const dateFrom = format(startOfMonth(currentMonth), 'd MMMM yyyy');
        const dateTo = format(endOfMonth(currentMonth), 'd MMMM yyyy');
        const response = await axios.get('https://incidental.loc-2.com/api/scrape', {
          params: { dateFrom, dateTo }
        });
        const records = response.data?.data || [];
        records.forEach((r: any) => {
          const op = (r.oprator || '').trim().toLowerCase();
          if (op) {
            bocData[op] = (bocData[op] || 0) + 1;
          }
        });
      } catch (e) {
        console.error("Failed to fetch BOC for scores", e);
      }

      // 3. Fetch PEKA data
      const pekaMap: Record<string, number> = {};
      try {
        const pekaResponse = await axios.get('https://peka.loc-2.com/peka2');
        let pekaRecords: any[] = [];
        if (Array.isArray(pekaResponse.data)) {
          pekaRecords = pekaResponse.data;
        } else if (pekaResponse.data && Array.isArray(pekaResponse.data.data)) {
          pekaRecords = pekaResponse.data.data;
        }
        pekaRecords.forEach(r => {
          const jumlahNum = Number(r.Jumlah || r.jumlah || r.JUMLAH || 0);
          const identitasRaw = r.Identitas || r.identitas || r.IDENTITAS || '';
          const identitas = String(identitasRaw).trim().toUpperCase();
          if (identitas && identitas !== '-') {
            pekaMap[identitas] = (pekaMap[identitas] || 0) + jumlahNum;
          }
        });
      } catch (e) {
        console.error("Failed to fetch PEKA for scores", e);
      }

      const scores: ManpowerScore[] = list.map((mp: any) => {
        const actualId = mp.id_finger || mp.finger_id || mp.idfinger || mp.nopek;
        const records = actualId ? (attendanceRecords[actualId] || []) : [];
        const justifications = actualId ? (allJustifications[actualId] || {}) : {};
        const attResult = calculateScoreForManpower(mp, currentMonth, records, justifications);
        
        const attendanceScorePercentage = attResult.totalWorkingDays > 0 
          ? Math.round((attResult.score / attResult.totalWorkingDays) * 100) 
          : 0;

        // Match BOC (BOC operator names often match the nama but can be slightly different)
        const mpNameLower = (mp.nama || '').trim().toLowerCase();
        let bocScoreCount = 0;
        // Simple fuzzy match or exact match
        Object.keys(bocData).forEach(op => {
          if (mpNameLower.includes(op) || op.includes(mpNameLower)) {
            bocScoreCount += bocData[op];
          }
        });
        // Normalize BOC score (e.g. 5 reports = 100%, 0 = 0%)
        const bocScorePercentage = Math.min(100, Math.round((bocScoreCount / 5) * 100));

        // PEKA calculation
        const nopekRaw = mp.nopek || mp.NOPEK || '';
        const mpNopek = String(nopekRaw).trim().toUpperCase();
        const jumlahPeka = pekaMap[mpNopek] || 0;
        const pekaScorePercentage = Math.min(jumlahPeka * 10, 100);

        // Learning Hours calculation
        const learningRecord = learningData[actualId];
        const learningHours = learningRecord ? learningRecord.hours : 0;
        const learningScorePercentage = Math.min(learningHours * 10, 100);

        const apiScores: Record<string, number> = {
          attendance: attendanceScorePercentage,
          boc: bocScorePercentage,
          peka: pekaScorePercentage,
          learning: learningScorePercentage,
          // Generate random scores for the rest to keep UI populated
          productivity: Math.floor(Math.random() * 40) + 60,
          safety: Math.floor(Math.random() * 40) + 60,
          quality: Math.floor(Math.random() * 40) + 60,
          training: Math.floor(Math.random() * 40) + 60,
          discipline: Math.floor(Math.random() * 40) + 60,
        };

        // We don't need to calculate overall score here, store.recalculateScores will do it
        return {
          manpowerId: mp.id,
          apiScores,
          overallScore: 0 // Will be recalculated by store
        };
      });

      return scores;
    }
  } catch (error) {
    console.error("Error fetching live scores, falling back to mock", error);
  }
  
  return mockManpowerScores;
};

export const saveApiWeights = async (weights: Record<string, number>): Promise<boolean> => {
  await delay(800);
  return true;
};
