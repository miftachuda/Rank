import PocketBase from 'pocketbase';

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'https://data.loc-2.com');

export interface LearningHourRecord {
  id?: string;
  id_finger: string;
  month: string; // Format: 'YYYY-MM'
  hours: number;
}

export const fetchLearningHours = async (monthStr: string): Promise<Record<string, { id: string, hours: number }>> => {
  try {
    const records = await pb.collection('learning_hours').getFullList({
      filter: `month = "${monthStr}"`,
    });
    
    const result: Record<string, { id: string, hours: number }> = {};
    records.forEach(r => {
      result[r.id_finger] = { id: r.id, hours: r.hours };
    });
    return result;
  } catch (error) {
    console.error("Failed to fetch learning hours:", error);
    return {};
  }
};

export const saveLearningHour = async (id_finger: string, monthStr: string, hours: number, existingId?: string) => {
  try {
    if (existingId) {
      await pb.collection('learning_hours').update(existingId, { hours });
    } else {
      await pb.collection('learning_hours').create({
        id_finger,
        month: monthStr,
        hours
      });
    }
    return true;
  } catch (error) {
    console.error("Failed to save learning hour:", error);
    throw error;
  }
};