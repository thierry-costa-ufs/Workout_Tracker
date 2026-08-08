import { act, create, ReactTestRenderer } from 'react-test-renderer';
import React from 'react';
import { useSessionEngine } from '@/features/workout-session/hooks/useSessionEngine';
import { getToday, workoutStorage } from '@/core/storage/workoutStorage';
import { PlannedExercise } from '@/types/workout';

// ponytail: temp mock — B4 moves this to jest.setup.js (same pattern as workoutStorage.test.ts)
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- canonical RN mock pattern
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@/core/storage/workoutStorage', () => {
  const actual = jest.requireActual('@/core/storage/workoutStorage');
  return {
    ...actual,
    workoutStorage: {
      loadSessionProgress: jest.fn(),
      saveSessionProgress: jest.fn(),
    },
  };
});

const mockedStorage = {
  loadSessionProgress: jest.mocked(workoutStorage.loadSessionProgress),
  saveSessionProgress: jest.mocked(workoutStorage.saveSessionProgress),
};

function makeExercise(overrides: Partial<PlannedExercise> = {}): PlannedExercise {
  return {
    id: 'e1',
    name: 'Supino',
    muscleGroup: 'Peito',
    equipment: 'Barra',
    sets: 3,
    ...overrides,
  };
}

function renderEngine(props: {
  exercises: PlannedExercise[];
  templateId: string | null;
  dayKey: 'seg';
}) {
  let captured: ReturnType<typeof useSessionEngine> | undefined;
  let latest = props;

  const Harness = () => {
    captured = useSessionEngine(latest);
    return null;
  };

  let renderer: ReactTestRenderer;
  act(() => {
    renderer = create(<Harness />);
  });

  return {
    get: () => captured!,
    update: (next: typeof props) => {
      latest = next;
      act(() => {
        renderer.update(<Harness />);
      });
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedStorage.loadSessionProgress.mockResolvedValue(null);
  mockedStorage.saveSessionProgress.mockResolvedValue(undefined);
});

describe('useSessionEngine hydration', () => {
  it('hydrates from storage when dayKey and date match', async () => {
    const today = getToday();
    mockedStorage.loadSessionProgress.mockResolvedValue({
      dayKey: 'seg',
      date: today,
      progress: { e1: [true, false, false] },
    });

    const { get } = renderEngine({
      exercises: [makeExercise({ sets: 3 })],
      templateId: 't1',
      dayKey: 'seg',
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(get().progress).toEqual({ e1: [true, false, false] });
  });

  it('ignores stored progress when dayKey does not match', async () => {
    const today = getToday();
    mockedStorage.loadSessionProgress.mockResolvedValue({
      dayKey: 'ter',
      date: today,
      progress: { e1: [true, true, true] },
    });

    const { get } = renderEngine({
      exercises: [makeExercise({ sets: 3 })],
      templateId: 't1',
      dayKey: 'seg',
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // planSig effect scaffolds empty progress on mount; mismatch means stored ticks are dropped
    expect(get().progress).toEqual({ e1: [false, false, false] });
  });
});

describe('useSessionEngine mergeProgress', () => {
  it('truncates surviving sets when plan reduces sets mid-day', async () => {
    const today = getToday();
    mockedStorage.loadSessionProgress.mockResolvedValue({
      dayKey: 'seg',
      date: today,
      progress: { e1: [true, true, true, true, true] },
    });

    const { get } = renderEngine({
      exercises: [makeExercise({ sets: 2 })],
      templateId: 't1',
      dayKey: 'seg',
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(get().progress).toEqual({ e1: [true, true] });
  });
});

describe('useSessionEngine persistence', () => {
  it('saves on progress change with silent error catch', async () => {
    const { get } = renderEngine({
      exercises: [makeExercise({ sets: 3 })],
      templateId: 't1',
      dayKey: 'seg',
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    mockedStorage.saveSessionProgress.mockClear();

    act(() => {
      get().handleCheckNextSet('e1');
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockedStorage.saveSessionProgress).toHaveBeenCalledTimes(1);
    expect(mockedStorage.saveSessionProgress).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({
        dayKey: 'seg',
        date: getToday(),
        progress: { e1: [true, false, false] },
      }),
    );
  });

  it('does not throw when saveSessionProgress rejects', async () => {
    mockedStorage.saveSessionProgress.mockRejectedValue(new Error('disk full'));

    const { get } = renderEngine({
      exercises: [makeExercise({ sets: 3 })],
      templateId: 't1',
      dayKey: 'seg',
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await expect(
      act(async () => {
        get().handleCheckNextSet('e1');
        await Promise.resolve();
        await Promise.resolve();
      }),
    ).resolves.not.toThrow();
  });
});
