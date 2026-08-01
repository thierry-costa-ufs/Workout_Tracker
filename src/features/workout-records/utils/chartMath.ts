import { PersonalRecord } from '@/types/workout';

export type ChartMode = 'weight' | '1rm';

export function epley1RM(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

export function getDisplayValue(record: PersonalRecord, mode: ChartMode): number {
  return mode === '1rm' ? epley1RM(record.weight, record.reps) : record.weight;
}

export function parseRecordDate(record: PersonalRecord): Date {
  if (record.timestamp) return new Date(record.timestamp);
  const parts = record.date.split('/');
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date(record.date);
}

export function formatDateShort(dateStr: string): string {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[0]}/${parts[1]}`;
  }
  return dateStr;
}
