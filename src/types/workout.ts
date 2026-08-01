export type WorkoutDayKey = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';

export type MuscleGroup =
  | 'Peito'
  | 'Costas'
  | 'Ombro'
  | 'Quadríceps'
  | 'Posterior'
  | 'Panturrilha'
  | 'Bíceps'
  | 'Tríceps'
  | 'Antebraço'
  | 'Trapézio'
  | 'Abdômen';

export type MechanicType = 'Composto' | 'Isolado';

export type EquipmentType = 'Barra' | 'Halter' | 'Polia' | 'Máquina' | 'Peso Corporal';

export interface ExerciseData {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  mechanic: MechanicType;
  equipment: EquipmentType;
  defaultSets: number;
}

export interface PlannedExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  mechanic?: MechanicType;
  equipment: EquipmentType;
  sets: number;
  defaultSets?: number;
}

export type WorkoutData = Record<WorkoutDayKey, PlannedExercise[]>;

export interface BlockStructure {
  blocks: { id: string; label: string }[];
  dayIds: Record<WorkoutDayKey, string | null>;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  createdAt: string;
  data: WorkoutData;
  blockStructure?: BlockStructure;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  weight: number;
  reps: number;
  date: string;
  timestamp: string;
}
