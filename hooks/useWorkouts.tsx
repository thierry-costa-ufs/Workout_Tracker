import { WorkoutData } from "@/constants/exercises";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface WorkoutSession {
  [key: string]: any;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  data: WorkoutData;
}

interface WorkoutContextType {
  workouts: WorkoutSession[];
  templates: WorkoutTemplate[];
  activeId: string | null;
  isLoading: boolean;
  storeData: (value: WorkoutSession[]) => Promise<void>;
  saveTemplate: (name: string, data: WorkoutData, id?: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  selectActiveTemplate: (id: string) => Promise<void>;
  loadData: () => Promise<void>;
}

// Chaves padronizadas do AsyncStorage
const STORAGE_KEY_WORKOUTS = "@gym_app:workouts_key";
const STORAGE_KEY_TEMPLATES = "@gym_app:workout_templates";
const STORAGE_KEY_ACTIVE = "@gym_app:active_template_id";

// 1. Criação do Contexto Global
const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// 2. Implementação do Provider Centralizado
export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para carregar todos os dados do Storage
  const loadData = async () => {
    try {
      const [vWorkouts, vTemplates, vActiveId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_WORKOUTS),
        AsyncStorage.getItem(STORAGE_KEY_TEMPLATES),
        AsyncStorage.getItem(STORAGE_KEY_ACTIVE),
      ]);

      if (vWorkouts) setWorkouts(JSON.parse(vWorkouts));
      if (vTemplates) setTemplates(JSON.parse(vTemplates));
      if (vActiveId) setActiveId(vActiveId);
    } catch (e) {
      console.error("Erro ao carregar dados do AsyncStorage:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega os dados assim que o Provider for montado na raiz do app
  useEffect(() => {
    loadData();
  }, []);

  // Salva sessões de treino concluídas
  const storeData = async (value: WorkoutSession[]) => {
    try {
      setWorkouts(value);
      await AsyncStorage.setItem(STORAGE_KEY_WORKOUTS, JSON.stringify(value));
    } catch (e) {
      console.error("Erro ao salvar sessões:", e);
    }
  };

  // Cria e salva um novo template de planejamento
  const saveTemplate = async (name: string, data: WorkoutData, id?: string) => {
    try {
      let updatedTemplates: WorkoutTemplate[];
      let targetId = id;

      // Se já existe um ID, estamos editando um plano
      const exists = templates.some((t) => t.id === id);

      if (id && exists) {
        updatedTemplates = templates.map((t) =>
          t.id === id ? { ...t, name, data } : t,
        );
      } else {
        // Se não existe ou não foi passado, cria um novo
        targetId = Date.now().toString();
        const newTemplate: WorkoutTemplate = {
          id: targetId,
          name,
          data,
        };
        updatedTemplates = [...templates, newTemplate];
      }

      setTemplates(updatedTemplates);
      if (targetId) setActiveId(targetId);

      await Promise.all([
        AsyncStorage.setItem(
          STORAGE_KEY_TEMPLATES,
          JSON.stringify(updatedTemplates),
        ),
        AsyncStorage.setItem(STORAGE_KEY_ACTIVE, targetId || ""),
      ]);
    } catch (error) {
      console.error("Erro ao salvar/atualizar template:", error);
      throw error;
    }
  };

  // Remove um template existente
  const deleteTemplate = async (id: string) => {
    try {
      const updated = templates.filter((t) => t.id !== id);
      setTemplates(updated);
      await AsyncStorage.setItem(
        STORAGE_KEY_TEMPLATES,
        JSON.stringify(updated),
      );

      // Se o template deletado era o ativo, limpa o estado ativo
      if (activeId === id) {
        setActiveId(null);
        await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE);
      }
    } catch (e) {
      console.error("Erro ao deletar template:", e);
    }
  };

  // Seleciona e ativa um template da lista
  const selectActiveTemplate = async (id: string) => {
    try {
      if (!id) {
        // Se passar vazio, limpa o plano ativo
        setActiveId(null);
        await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE);
      } else {
        setActiveId(id);
        await AsyncStorage.setItem(STORAGE_KEY_ACTIVE, id);
      }
    } catch (e) {
      console.error("Erro ao selecionar template ativo:", e);
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        templates,
        activeId,
        isLoading,
        storeData,
        saveTemplate,
        deleteTemplate,
        selectActiveTemplate,
        loadData,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

// 3. Hook customizado para consumir o contexto nas telas do App
export function useWorkouts() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error(
      "useWorkouts deve ser utilizado dentro de um WorkoutProvider",
    );
  }
  return context;
}
