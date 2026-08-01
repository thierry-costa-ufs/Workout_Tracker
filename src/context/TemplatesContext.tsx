import { BlockStructure, WorkoutData, WorkoutTemplate } from '@/types/workout';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { workoutStorage } from '@/core/storage/workoutStorage';

interface TemplatesContextType {
  templates: WorkoutTemplate[];
  activeId: string | null;
  isLoading: boolean;
  saveTemplate: (
    name: string,
    data: WorkoutData,
    id?: string,
    blockStructure?: BlockStructure,
  ) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  selectActiveTemplate: (id: string | null) => Promise<void>;
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined);

export function TemplatesProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const templatesRef = useRef<WorkoutTemplate[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [tpls, actId] = await Promise.allSettled([
        workoutStorage.loadTemplates(),
        workoutStorage.loadActiveId(),
      ]);
      const nextTemplates = tpls.status === 'fulfilled' ? tpls.value : [];
      const nextActiveId = actId.status === 'fulfilled' ? actId.value : null;
      templatesRef.current = nextTemplates;
      setTemplates(nextTemplates);
      setActiveId(nextActiveId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveTemplate = useCallback(
    async (name: string, data: WorkoutData, id?: string, blockStructure?: BlockStructure) => {
      let targetId = id;
      const current = templatesRef.current;
      let updatedTemplates: WorkoutTemplate[];

      const exists = current.some((t) => t.id === id);

      if (id && exists) {
        updatedTemplates = current.map((t) =>
          t.id === id
            ? { ...t, name, data, blockStructure: blockStructure ?? t.blockStructure }
            : t,
        );
      } else {
        targetId = Date.now().toString();
        const newTemplate: WorkoutTemplate = {
          id: targetId,
          name,
          data,
          blockStructure,
          createdAt: new Date().toISOString(),
        };
        updatedTemplates = [...current, newTemplate];
      }

      const nextActiveId = exists ? activeId || id || null : targetId || null;

      // ponytail: optimistic ref so a rapid double-save can't clobber; a failed write reverts to the pre-save snapshot
      templatesRef.current = updatedTemplates;
      setTemplates(updatedTemplates);

      try {
        await Promise.all([
          workoutStorage.saveTemplates(updatedTemplates),
          workoutStorage.saveActiveId(nextActiveId),
        ]);
      } catch {
        templatesRef.current = current;
        setTemplates(current);
        Alert.alert('Erro', 'Não foi possível salvar o template.');
      }
    },
    [activeId],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      const current = templatesRef.current;
      const nextTemplates = current.filter((t) => t.id !== id);
      const isActiveDeleted = activeId === id;

      templatesRef.current = nextTemplates;
      setTemplates(nextTemplates);

      try {
        await Promise.all([
          workoutStorage.saveTemplates(nextTemplates),
          isActiveDeleted ? workoutStorage.saveActiveId(null) : Promise.resolve(),
        ]);
        if (isActiveDeleted) setActiveId(null);
      } catch {
        templatesRef.current = current;
        setTemplates(current);
        Alert.alert('Erro', 'Não foi possível excluir o template.');
      }
    },
    [activeId],
  );

  const selectActiveTemplate = useCallback(
    async (id: string | null) => {
      const previous = activeId;
      try {
        if (!id) {
          setActiveId(null);
          await workoutStorage.saveActiveId(null);
        } else {
          setActiveId(id);
          await workoutStorage.saveActiveId(id);
        }
      } catch {
        setActiveId(previous);
        Alert.alert('Erro', 'Não foi possível salvar o template ativo.');
      }
    },
    [activeId],
  );

  const value = useMemo(
    () => ({
      templates,
      activeId,
      isLoading,
      saveTemplate,
      deleteTemplate,
      selectActiveTemplate,
    }),
    [templates, activeId, isLoading, saveTemplate, deleteTemplate, selectActiveTemplate],
  );

  return <TemplatesContext.Provider value={value}>{children}</TemplatesContext.Provider>;
}

export function useTemplates() {
  const ctx = useContext(TemplatesContext);
  if (!ctx) throw new Error('useTemplates must be used within a TemplatesProvider');
  return ctx;
}
