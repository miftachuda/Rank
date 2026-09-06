import PocketBase from 'pocketbase';
import axios from 'axios';
import { format, addDays, startOfMonth, endOfMonth, parseISO, subDays } from 'date-fns';

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'https://data.loc-2.com');

export interface Manpower {
  id: string;
  nama: string;
  shift: string;
  nopek: string;
  id_finger: string;
}

const cycleOffset: Record<string, number> = {
  'C': 1,
  'B': 4,
  'A': 7,
  'D': 10
};

export const getExpectedShift = (date: Date, group: string): 'Pagi' | 'Malam' | 'Sore' | 'Harian' | 'Off' => {
  // Check for Harian group first
  if (group && group.toUpperCase().includes('HARIAN')) {
    const dayOfWeek = date.getDay();
    // Sunday is 0, Saturday is 6
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'Off';
    }
    return 'Harian';
  }

  // Extract just the A, B, C, D part from the string in case it's "Shift A", etc.
  const groupLetterMatch = group?.toUpperCase().match(/[ABCD]/);
  const groupLetter = groupLetterMatch ? groupLetterMatch[0] : '';
  
  const epochDate = new Date(2026, 8, 5); // Sep 5, 2026
  
  const targetMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = targetMidnight.getTime() - epochDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const groupOffset = cycleOffset[groupLetter];
  if (!groupOffset) return 'Off';
  
  let cycleDay = ((groupOffset - 1 + diffDays) % 12 + 12) % 12 + 1;
  
  if (cycleDay >= 1 && cycleDay <= 3) return 'Pagi';
  if (cycleDay >= 5 && cycleDay <= 7) return 'Malam';
  if (cycleDay >= 9 && cycleDay <= 11) return 'Sore';
  return 'Off';
};

export const getManpowerList = async (): Promise<Manpower[]> => {
  try {
    // Direct fetch to bypass potential PocketBase SDK issues with skipTotal or large perPage
    let allRecords: Manpower[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const url = `${pb.baseUrl}/api/collections/gate_id/records?page=${page}&perPage=500`;
      const response = await axios.get(url);
      
      if (response.data && Array.isArray(response.data.items)) {
        allRecords = [...allRecords, ...response.data.items];
        
        // If we received fewer items than requested, we're at the end
        if (response.data.items.length < 500) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }
    
    return allRecords;
  } catch (error) {
    console.error("Error fetching manpower:", error);
    return [];
  }
};

export interface AttendanceRecord {
  id: string;
  timestamp: string; // Assuming API returns timestamp, maybe need to check the exact field
  // other fields ignored
  datetime?: string;
  date?: string;
  time?: string;
  created?: string;
}

export interface DailyDetail {
  date: Date;
  shift: 'Pagi' | 'Malam' | 'Sore' | 'Harian' | 'Off';
  windowStart: Date | null;
  windowEnd: Date | null;
  actualEntries: Date[];
  scored: boolean;
}

export interface ScoreResult {
  score: number;
  totalWorkingDays: number;
  details: DailyDetail[];
}

export const fetchAllAttendanceRecords = async (ids: string[], monthDate: Date): Promise<Record<string, any[]>> => {
  if (ids.length === 0) return {};

  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  
  // We need to start 1 day earlier and end 1 day later to safely catch all shifts crossing month boundaries
  const fetchStart = format(subDays(start, 1), 'yyyy-MM-dd');
  const fetchEnd = format(addDays(end, 1), 'yyyy-MM-dd');
  
  const idString = ids.join(',');
  const url = `https://gate.loc-2.com/api/records?id=${idString}&source=db&start_date=${fetchStart}&end_date=${fetchEnd}`;
  
  try {
    console.log(`Fetching all attendance data: ${url}`);
    const response = await axios.get(url);
    // Based on the example, response.data is an object keyed by id_finger
    return response.data || {};
  } catch (error) {
    console.error(`Error fetching bulk attendance:`, error);
    return {};
  }
};

export const calculateScoreForManpower = (manpower: Manpower, monthDate: Date, rawRecords: any[] = []): ScoreResult => {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);

  // 1. Filter out records that don't have "IN" in their gate name
  const validRecords = rawRecords.filter(r => r.gate && String(r.gate).toUpperCase().includes('IN'));

  // Normalize record timestamps to Date objects based on "waktu"
  const entryTimes: Date[] = validRecords.map(r => {
    let dateStr = r.waktu || r.timestamp || r.datetime || r.created; 
    if (dateStr) {
      // Safely replace space with 'T' for robust cross-browser parsing of "YYYY-MM-DD HH:MM:SS"
      dateStr = dateStr.replace(' ', 'T');
      return new Date(dateStr);
    }
    if (r.date && r.time) return new Date(`${r.date}T${r.time}`);
    return null;
  }).filter((d): d is Date => d !== null && !isNaN(d.getTime()));

  let score = 0;
  let totalWorkingDays = 0;
  const details: DailyDetail[] = [];
  
  // Iterate through all days of the month
  let currentDay = new Date(start);
  while (currentDay <= end) {
    const shift = getExpectedShift(currentDay, manpower.shift);
    let windowStart: Date | null = null;
    let windowEnd: Date | null = null;
    let entryWindowStart: Date | null = null;
    let entryWindowEnd: Date | null = null;
    let scored = false;
    let actualEntriesForShift: Date[] = [];
    
    if (shift !== 'Off') {
      totalWorkingDays += 1;
      const targetYear = currentDay.getFullYear();
      const targetMonth = currentDay.getMonth();
      const targetDate = currentDay.getDate();
      
      if (shift === 'Pagi') {
        windowStart = new Date(targetYear, targetMonth, targetDate, 8, 0, 0);
        windowEnd = new Date(targetYear, targetMonth, targetDate, 16, 0, 0);
      } else if (shift === 'Sore') {
        windowStart = new Date(targetYear, targetMonth, targetDate, 16, 0, 0);
        windowEnd = new Date(targetYear, targetMonth, targetDate + 1, 0, 0, 0); // 24:00 is next day 00:00
      } else if (shift === 'Malam') { 
        // Malam shift for a given date starts at 00:00 of that date
        // Pre-shift 2-hour window falls on the previous day from 22:00 to 00:00
        windowStart = new Date(targetYear, targetMonth, targetDate, 0, 0, 0);
        windowEnd = new Date(targetYear, targetMonth, targetDate, 8, 0, 0);
      } else if (shift === 'Harian') {
        windowStart = new Date(targetYear, targetMonth, targetDate, 7, 0, 0);
        windowEnd = new Date(targetYear, targetMonth, targetDate, 16, 0, 0);
      }
      
      // New valid clock-in window: exactly 2 hours before the shift start up to the shift start
      entryWindowStart = new Date(windowStart!.getTime() - 2 * 60 * 60 * 1000);
      entryWindowEnd = windowStart;
      
      // Display window: from the start of the valid clock-in window to a few hours after shift ends
      // This ensures we capture clock-outs and late entries without overflowing to the next shift too much
      const displayWindowEnd = new Date(windowEnd!.getTime() + 4 * 60 * 60 * 1000);
      
      // All entries for UI display
      actualEntriesForShift = entryTimes.filter(time => time >= entryWindowStart! && time <= displayWindowEnd);
      
      // Scored is true ONLY if there's an entry within the strict valid clock-in window
      const validEntries = entryTimes.filter(time => time >= entryWindowStart! && time <= entryWindowEnd!);
      if (validEntries.length > 0) {
        scored = true;
        score += 1;
      }
    } else {
      // If it's a day Off, don't show any entries
      actualEntriesForShift = [];
      entryWindowStart = null;
      entryWindowEnd = null;
    }
    
    details.push({
      date: new Date(currentDay),
      shift,
      windowStart, // Use actual shift start
      windowEnd,   // Use actual shift end
      actualEntries: actualEntriesForShift,
      scored
    });
    
    currentDay = addDays(currentDay, 1);
  }
  
  return { score, totalWorkingDays, details };
};