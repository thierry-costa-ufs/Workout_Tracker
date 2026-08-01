import {
  getNextLabel,
  buildBlockStructure,
  reconstructFromBlockStructure,
  reconstructFromWorkoutData,
  findDuplicateBlockSignatures,
} from './blockSerializer';
import { DAYS_OF_WEEK } from '@/core/constants/days';
import type { PlannedExercise, WorkoutData } from '@/types/workout';

function block(id: string, label: string, exercises: PlannedExercise[] = []) {
  return { id, label, exercises };
}

function ex(id: string, sets: number): PlannedExercise {
  return { id, name: id, muscleGroup: 'Peito', equipment: 'Barra', sets };
}

function emptyData(): WorkoutData {
  return Object.fromEntries(
    DAYS_OF_WEEK.map((d) => [d.id, [] as PlannedExercise[]]),
  ) as WorkoutData;
}

describe('blockSerializer', () => {
  it('getNextLabel: skips used letters', () => {
    expect(getNextLabel([])).toBe('A');
    expect(getNextLabel([block('1', 'A'), block('2', 'C')])).toBe('B');
    expect(getNextLabel([block('1', 'a'), block('2', 'b')])).toBe('C');
  });

  it('buildBlockStructure + reconstruct round-trips blocks and daySplit', () => {
    const blocks = [block('1', 'A', [ex('e1', 3)])];
    const daySplit: Record<string, string | null> = {
      ...Object.fromEntries(DAYS_OF_WEEK.map((d) => [d.id, null])),
      seg: '1',
    };
    const structure = buildBlockStructure(blocks, daySplit);

    const data = emptyData();
    data.seg = [ex('e1', 3)];

    const { blocks: rebuilt, daySplit: rebuiltSplit } = reconstructFromBlockStructure(
      structure,
      data,
    );
    expect(rebuilt).toHaveLength(1);
    expect(rebuilt[0].id).toBe('1');
    expect(rebuilt[0].exercises).toEqual([ex('e1', 3)]);
    expect(rebuiltSplit.seg).toBe('1');
    expect(rebuiltSplit.dom).toBeNull();
  });

  it('reconstructFromBlockStructure drops blocks with no assigned day', () => {
    const blocks = [block('1', 'A'), block('2', 'B', [ex('e1', 3)])];
    const daySplit: Record<string, string | null> = {
      ...Object.fromEntries(DAYS_OF_WEEK.map((d) => [d.id, null])),
      seg: '2',
    };
    const structure = buildBlockStructure(blocks, daySplit);
    const data = emptyData();
    data.seg = [ex('e1', 3)];

    const { blocks: rebuilt } = reconstructFromBlockStructure(structure, data);
    expect(rebuilt.map((b) => b.id)).toEqual(['2']);
  });

  it('reconstructFromWorkoutData: identical day workouts share one block', () => {
    const data = emptyData();
    data.seg = [ex('e1', 3)];
    data.ter = [ex('e1', 3)];
    data.qua = [ex('e2', 4)];

    const { blocks, daySplit } = reconstructFromWorkoutData(data);
    expect(blocks).toHaveLength(2);
    expect(daySplit.seg).toBe(daySplit.ter);
    expect(daySplit.seg).not.toBe(daySplit.qua);
  });

  it('findDuplicateBlockSignatures: groups identical exercise lists', () => {
    const blocks = [
      block('1', 'A', [ex('e1', 3)]),
      block('2', 'B', [ex('e1', 3)]),
      block('3', 'C', [ex('e2', 4)]),
      block('4', 'D', []),
    ];
    const dupes = findDuplicateBlockSignatures(blocks);
    expect(dupes).toHaveLength(1);
    expect(dupes[0].map((b) => b.id)).toEqual(['1', '2']);
  });
});
