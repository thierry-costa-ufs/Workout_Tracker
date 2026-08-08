import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { PersonalRecord } from '@/types/workout';
import { PersonalRecordsProvider, usePersonalRecords } from '@/context/PersonalRecordsContext';
import { workoutStorage } from '@/core/storage/workoutStorage';

jest.mock('@/core/storage/workoutStorage', () => ({
  workoutStorage: {
    loadPersonalRecords: jest.fn(),
    savePersonalRecords: jest.fn(),
  },
}));

const mocked = {
  loadPersonalRecords: jest.mocked(workoutStorage.loadPersonalRecords),
  savePersonalRecords: jest.mocked(workoutStorage.savePersonalRecords),
};

function makeRecord(overrides: Partial<PersonalRecord> = {}): PersonalRecord {
  return {
    id: 'r1',
    exerciseId: 'e1',
    exerciseName: 'Supino',
    muscleGroup: 'Peito',
    weight: 80,
    reps: 8,
    date: '01/01/2025',
    timestamp: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderProvider() {
  let captured: ReturnType<typeof usePersonalRecords> | undefined;
  const Probe = () => {
    captured = usePersonalRecords();
    return null;
  };
  const utils = render(
    <PersonalRecordsProvider>
      <Probe />
    </PersonalRecordsProvider>,
  );
  return { ...utils, getCaptured: () => captured };
}

beforeEach(() => {
  jest.clearAllMocks();
  mocked.loadPersonalRecords.mockResolvedValue([]);
  mocked.savePersonalRecords.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('renders children and hydrates records after load resolves', async () => {
  mocked.loadPersonalRecords.mockResolvedValue([makeRecord()]);

  const { getCaptured } = renderProvider();

  await waitFor(() => {
    expect(getCaptured()?.personalRecords).toEqual([makeRecord()]);
  });
});

it('savePR appends record and persists merged array', async () => {
  mocked.loadPersonalRecords.mockResolvedValue([makeRecord({ id: 'r1' })]);

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.personalRecords).toHaveLength(1));

  await getCaptured()!.savePR('e2', 'Crucifixo', 'Peito', 60, 10);

  await waitFor(() => {
    expect(getCaptured()?.personalRecords).toHaveLength(2);
  });
  expect(mocked.savePersonalRecords).toHaveBeenLastCalledWith(
    expect.arrayContaining([
      expect.objectContaining({ id: 'r1' }),
      expect.objectContaining({ exerciseId: 'e2' }),
    ]),
  );
});

it('reverts to pre-save snapshot and shows Alert when savePR rejects', async () => {
  mocked.loadPersonalRecords.mockResolvedValue([makeRecord({ id: 'r1' })]);
  mocked.savePersonalRecords.mockRejectedValue(new Error('disk full'));
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.personalRecords).toHaveLength(1));

  await getCaptured()!.savePR('e2', 'Crucifixo', 'Peito', 60, 10);

  await waitFor(() => {
    expect(getCaptured()?.personalRecords).toEqual([makeRecord({ id: 'r1' })]);
  });
  expect(alertSpy).toHaveBeenCalledWith('Erro', 'Não foi possível salvar o recorde.');
});

it('passes final merged array, not stale closure, on two rapid saves', async () => {
  mocked.loadPersonalRecords.mockResolvedValue([]);

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.personalRecords).toEqual([]));

  const first = getCaptured()!.savePR('e1', 'Supino', 'Peito', 80, 8);
  const second = getCaptured()!.savePR('e2', 'Crucifixo', 'Peito', 60, 10);
  await Promise.all([first, second]);

  await waitFor(() => {
    expect(getCaptured()?.personalRecords).toHaveLength(2);
  });
  expect(mocked.savePersonalRecords).toHaveBeenLastCalledWith(
    expect.arrayContaining([
      expect.objectContaining({ exerciseId: 'e1' }),
      expect.objectContaining({ exerciseId: 'e2' }),
    ]),
  );
});

it('deletePR removes item and persists filtered array', async () => {
  mocked.loadPersonalRecords.mockResolvedValue([
    makeRecord({ id: 'r1' }),
    makeRecord({ id: 'r2', exerciseId: 'e2' }),
  ]);

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.personalRecords).toHaveLength(2));

  await getCaptured()!.deletePR('r1');

  await waitFor(() => {
    expect(getCaptured()?.personalRecords).toEqual([makeRecord({ id: 'r2', exerciseId: 'e2' })]);
  });
  expect(mocked.savePersonalRecords).toHaveBeenLastCalledWith([
    makeRecord({ id: 'r2', exerciseId: 'e2' }),
  ]);
});

it('deletePR reverts and shows Alert when save rejects', async () => {
  mocked.loadPersonalRecords.mockResolvedValue([
    makeRecord({ id: 'r1' }),
    makeRecord({ id: 'r2', exerciseId: 'e2' }),
  ]);
  mocked.savePersonalRecords.mockRejectedValue(new Error('disk full'));
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.personalRecords).toHaveLength(2));

  await getCaptured()!.deletePR('r1');

  await waitFor(() => {
    expect(getCaptured()?.personalRecords).toHaveLength(2);
  });
  expect(alertSpy).toHaveBeenCalledWith('Erro', 'Não foi possível excluir o recorde.');
});
