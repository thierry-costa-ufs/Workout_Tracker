import { getDisplayValue, epley1RM, parseRecordDate, formatDateShort } from './chartMath';

describe('chartMath', () => {
  it('epley1RM: 100kg x 10 = 133.33', () => {
    expect(epley1RM(100, 10)).toBeCloseTo(133.333, 2);
  });

  it('getDisplayValue: weight mode returns raw, 1rm mode returns epley', () => {
    const r = { date: '01/01/2025', timestamp: '', weight: 100, reps: 10 } as never;
    expect(getDisplayValue(r, 'weight')).toBe(100);
    expect(getDisplayValue(r, '1rm')).toBeCloseTo(133.333, 2);
  });

  it('parseRecordDate: parses pt-BR dd/mm/yyyy', () => {
    const r = { date: '15/02/2025', timestamp: '', weight: 0, reps: 0 } as never;
    const d = parseRecordDate(r);
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(15);
  });

  it('parseRecordDate: prefers timestamp when present', () => {
    const r = {
      date: '15/02/2025',
      timestamp: '2025-03-01T12:00:00Z',
      weight: 0,
      reps: 0,
    } as never;
    expect(parseRecordDate(r).getUTCMonth()).toBe(2);
  });

  it('formatDateShort: dd/mm/yyyy -> dd/mm', () => {
    expect(formatDateShort('15/02/2025')).toBe('15/02');
    expect(formatDateShort('nope')).toBe('nope');
  });
});
