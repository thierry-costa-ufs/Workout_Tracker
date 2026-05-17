import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";

export type WorkoutDayKey =
  | "domingo"
  | "segunda-feira"
  | "terça-feira"
  | "quarta-feira"
  | "quinta-feira"
  | "sexta-feira"
  | "sábado";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  weight?: number;
}

export type WorkoutData = {
  [key in WorkoutDayKey]?: Exercise[];
};

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
  duration: number; // Duração estrita em segundos
  icon: IoniconsGlyphName;
}

export interface PlannedExercise {
  name: ReactNode;
  muscleGroup: any;
  equipment: any;
  id: string;
  sets: number;
}
