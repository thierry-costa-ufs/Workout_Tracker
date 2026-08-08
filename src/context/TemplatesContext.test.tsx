import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { WorkoutTemplate } from '@/types/workout';
import { TemplatesProvider, useTemplates } from '@/context/TemplatesContext';
import { workoutStorage } from '@/core/storage/workoutStorage';

jest.mock('@/core/storage/workoutStorage', () => ({
  workoutStorage: {
    loadTemplates: jest.fn(),
    loadActiveId: jest.fn(),
    saveTemplates: jest.fn(),
    saveActiveId: jest.fn(),
  },
}));

const mocked = {
  loadTemplates: jest.mocked(workoutStorage.loadTemplates),
  loadActiveId: jest.mocked(workoutStorage.loadActiveId),
  saveTemplates: jest.mocked(workoutStorage.saveTemplates),
  saveActiveId: jest.mocked(workoutStorage.saveActiveId),
};

function makeTemplate(overrides: Partial<WorkoutTemplate> = {}): WorkoutTemplate {
  return {
    id: 't1',
    name: 'Plano',
    createdAt: '2025-01-01T00:00:00.000Z',
    data: { dom: [], seg: [], ter: [], qua: [], qui: [], sex: [], sab: [] },
    ...overrides,
  };
}

function renderProvider() {
  let captured: ReturnType<typeof useTemplates> | undefined;
  const Probe = () => {
    captured = useTemplates();
    return null;
  };
  const utils = render(
    <TemplatesProvider>
      <Probe />
    </TemplatesProvider>,
  );
  return { ...utils, getCaptured: () => captured };
}

beforeEach(() => {
  jest.clearAllMocks();
  mocked.loadTemplates.mockResolvedValue([]);
  mocked.loadActiveId.mockResolvedValue(null);
  mocked.saveTemplates.mockResolvedValue(undefined);
  mocked.saveActiveId.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('hydrates templates and activeId after loads resolve', async () => {
  mocked.loadTemplates.mockResolvedValue([makeTemplate()]);
  mocked.loadActiveId.mockResolvedValue('t1');

  const { getCaptured } = renderProvider();

  await waitFor(() => {
    expect(getCaptured()?.templates).toEqual([makeTemplate()]);
    expect(getCaptured()?.activeId).toBe('t1');
    expect(getCaptured()?.isLoading).toBe(false);
  });
});

it('saveTemplate creates template and sets it active', async () => {
  mocked.loadTemplates.mockResolvedValue([makeTemplate()]);

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.templates).toHaveLength(1));

  await getCaptured()!.saveTemplate('Novo', {
    dom: [],
    seg: [],
    ter: [],
    qua: [],
    qui: [],
    sex: [],
    sab: [],
  });

  await waitFor(() => {
    expect(getCaptured()?.templates).toHaveLength(2);
  });
  const created = getCaptured()!.templates.find((t) => t.name === 'Novo');
  expect(created).toBeDefined();
  expect(getCaptured()?.activeId).toBe(created!.id);
  expect(mocked.saveTemplates).toHaveBeenLastCalledWith(getCaptured()!.templates);
  expect(mocked.saveActiveId).toHaveBeenLastCalledWith(created!.id);
});

it('saveTemplate updates existing template in place when id matches', async () => {
  mocked.loadTemplates.mockResolvedValue([makeTemplate()]);

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.templates).toHaveLength(1));

  await getCaptured()!.saveTemplate(
    'Renamed',
    { dom: [], seg: [], ter: [], qua: [], qui: [], sex: [], sab: [] },
    't1',
  );

  await waitFor(() => {
    expect(getCaptured()?.templates).toHaveLength(1);
    expect(getCaptured()?.templates[0]!.name).toBe('Renamed');
  });
});

it('reverts templates and activeId and shows Alert when saveTemplate rejects', async () => {
  mocked.loadTemplates.mockResolvedValue([makeTemplate()]);
  mocked.saveTemplates.mockRejectedValue(new Error('disk full'));
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.templates).toHaveLength(1));

  await getCaptured()!.saveTemplate('Novo', {
    dom: [],
    seg: [],
    ter: [],
    qua: [],
    qui: [],
    sex: [],
    sab: [],
  });

  await waitFor(() => {
    expect(getCaptured()?.templates).toEqual([makeTemplate()]);
    expect(getCaptured()?.activeId).toBeNull();
  });
  expect(alertSpy).toHaveBeenCalledWith('Erro', 'Não foi possível salvar o template.');
});

it('passes final merged array on two rapid saves', async () => {
  mocked.loadTemplates.mockResolvedValue([makeTemplate()]);

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.templates).toHaveLength(1));

  const empty = { dom: [], seg: [], ter: [], qua: [], qui: [], sex: [], sab: [] };
  const first = getCaptured()!.saveTemplate('A', empty);
  const second = getCaptured()!.saveTemplate('B', empty);
  await Promise.all([first, second]);

  await waitFor(() => {
    expect(getCaptured()?.templates).toHaveLength(3);
  });
  expect(mocked.saveTemplates).toHaveBeenLastCalledWith(getCaptured()!.templates);
});

it('deleteTemplate removes item and clears activeId when deleted was active', async () => {
  mocked.loadTemplates.mockResolvedValue([makeTemplate(), makeTemplate({ id: 't2' })]);
  mocked.loadActiveId.mockResolvedValue('t1');

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.templates).toHaveLength(2));

  await getCaptured()!.deleteTemplate('t1');

  await waitFor(() => {
    expect(getCaptured()?.templates).toEqual([makeTemplate({ id: 't2' })]);
    expect(getCaptured()?.activeId).toBeNull();
  });
  expect(mocked.saveTemplates).toHaveBeenLastCalledWith([makeTemplate({ id: 't2' })]);
  expect(mocked.saveActiveId).toHaveBeenLastCalledWith(null);
});

it('deleteTemplate keeps activeId when deleting non-active', async () => {
  mocked.loadTemplates.mockResolvedValue([makeTemplate(), makeTemplate({ id: 't2' })]);
  mocked.loadActiveId.mockResolvedValue('t2');

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.templates).toHaveLength(2));

  await getCaptured()!.deleteTemplate('t1');

  await waitFor(() => {
    expect(getCaptured()?.templates).toEqual([makeTemplate({ id: 't2' })]);
    expect(getCaptured()?.activeId).toBe('t2');
  });
  expect(mocked.saveActiveId).not.toHaveBeenCalled();
});

it('deleteTemplate reverts and shows Alert on failure', async () => {
  mocked.loadTemplates.mockResolvedValue([makeTemplate(), makeTemplate({ id: 't2' })]);
  mocked.loadActiveId.mockResolvedValue('t1');
  mocked.saveTemplates.mockRejectedValue(new Error('disk full'));
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.templates).toHaveLength(2));

  await getCaptured()!.deleteTemplate('t1');

  await waitFor(() => {
    expect(getCaptured()?.templates).toHaveLength(2);
    expect(getCaptured()?.activeId).toBe('t1');
  });
  expect(alertSpy).toHaveBeenCalledWith('Erro', 'Não foi possível excluir o template.');
});

it('selectActiveTemplate(null) clears activeId and persists', async () => {
  mocked.loadActiveId.mockResolvedValue('t1');

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.activeId).toBe('t1'));

  await getCaptured()!.selectActiveTemplate(null);

  await waitFor(() => {
    expect(getCaptured()?.activeId).toBeNull();
  });
  expect(mocked.saveActiveId).toHaveBeenLastCalledWith(null);
});

it('selectActiveTemplate(id) sets and persists', async () => {
  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.isLoading).toBe(false));

  await getCaptured()!.selectActiveTemplate('t2');

  await waitFor(() => {
    expect(getCaptured()?.activeId).toBe('t2');
  });
  expect(mocked.saveActiveId).toHaveBeenLastCalledWith('t2');
});

it('selectActiveTemplate reverts and shows Alert when save fails', async () => {
  mocked.loadActiveId.mockResolvedValue('t1');
  mocked.saveActiveId.mockRejectedValue(new Error('disk full'));
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  const { getCaptured } = renderProvider();
  await waitFor(() => expect(getCaptured()?.activeId).toBe('t1'));

  await getCaptured()!.selectActiveTemplate('t2');

  await waitFor(() => {
    expect(getCaptured()?.activeId).toBe('t1');
  });
  expect(alertSpy).toHaveBeenCalledWith('Erro', 'Não foi possível salvar o template ativo.');
});
