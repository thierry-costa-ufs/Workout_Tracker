import type { PlannedExercise, WorkoutData, WorkoutDayKey } from "@/types/workout";

export const DAYS_OF_WEEK = [
  { id: "dom" as const, label: "Domingo" },
  { id: "seg" as const, label: "Segunda" },
  { id: "ter" as const, label: "Terça" },
  { id: "qua" as const, label: "Quarta" },
  { id: "qui" as const, label: "Quinta" },
  { id: "sex" as const, label: "Sexta" },
  { id: "sab" as const, label: "Sábado" },
] as const;

export const DAY_LABELS: Record<WorkoutDayKey, string> = {
  dom: "DOMINGO",
  seg: "SEGUNDA-FEIRA",
  ter: "TERÇA-FEIRA",
  qua: "QUARTA-FEIRA",
  qui: "QUINTA-FEIRA",
  sex: "SEXTA-FEIRA",
  sab: "SÁBADO",
};

export const MUSCLE_FILTERS = [
  "Todos",
  "Peito",
  "Costas",
  "Ombro",
  "Quadríceps",
  "Posterior",
  "Bíceps",
  "Tríceps",
  "Panturrilha",
  "Abdômen",
] as const;

export type MuscleFilterType = typeof MUSCLE_FILTERS[number];

export function createEmptyWorkoutData(): WorkoutData {
  return {
    dom: [],
    seg: [],
    ter: [],
    qua: [],
    qui: [],
    sex: [],
    sab: [],
  };
}

export function getWorkoutDayKeyForToday(): WorkoutDayKey {
  const order: WorkoutDayKey[] = [
    "dom",
    "seg",
    "ter",
    "qua",
    "qui",
    "sex",
    "sab",
  ];

  return order[new Date().getDay()];
}
