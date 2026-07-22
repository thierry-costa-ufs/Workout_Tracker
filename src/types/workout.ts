import { Ionicons } from "@expo/vector-icons";

export type WorkoutDayKey =
  | "dom"
  | "seg"
  | "ter"
  | "qua"
  | "qui"
  | "sex"
  | "sab";

export interface PlannedExercise {
  id: string;
  name: string;
  muscleGroup: string;
  mechanic?: string;
  equipment: string;
  sets: number;
  defaultSets?: number;
}

export type WorkoutData = Record<WorkoutDayKey, PlannedExercise[]>;

export interface WorkoutTemplate {
  id: string;
  name: string;
  createdAt: string;
  data: WorkoutData;
}

export interface WorkoutSession {
  id: string;
  date: string;
  templateId?: string;
  data: WorkoutData;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  date: string;
}

export interface ExerciseProgress {
  [exerciseId: string]: boolean[];
}

export interface SessionStats {
  totalSets: number;
  completedSets: number;
  percentage: number;
}

export type IoniconsGlyphName = keyof typeof Ionicons.glyphMap;

export interface TimerPreset {
  id: string;
  label: string;
  duration: number;
  icon: IoniconsGlyphName;
}
