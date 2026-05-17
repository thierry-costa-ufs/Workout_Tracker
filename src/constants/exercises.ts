export type MuscleGroup =
  | "Peito"
  | "Costas"
  | "Ombro"
  | "Quadríceps"
  | "Posterior"
  | "Panturrilha"
  | "Bíceps"
  | "Tríceps"
  | "Antebraço"
  | "Trapézio"
  | "Abdômen";

export interface ExerciseData {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  mechanic: "Composto" | "Isolado";
  equipment: "Barra" | "Halter" | "Polia" | "Máquina" | "Peso Corporal";
  defaultSets: number;
  defaultReps: string;
}

export const EXERCISES_LIST: ExerciseData[] = [
  {
    id: "p1",
    name: "Supino Reto",
    muscleGroup: "Peito",
    mechanic: "Composto",
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: "8-10",
  },
  {
    id: "p2",
    name: "Supino Inclinado",
    muscleGroup: "Peito",
    mechanic: "Composto",
    equipment: "Halter",
    defaultSets: 4,
    defaultReps: "8-12",
  },
  {
    id: "p3",
    name: "Crossover Polia Alta",
    muscleGroup: "Peito",
    mechanic: "Isolado",
    equipment: "Polia",
    defaultSets: 3,
    defaultReps: "12",
  },
  {
    id: "p4",
    name: "Peck Deck (Voador)",
    muscleGroup: "Peito",
    mechanic: "Isolado",
    equipment: "Máquina",
    defaultSets: 3,
    defaultReps: "10-12",
  },
  // --- COSTAS ---
  {
    id: "c1",
    name: "Puxada Aberta na Polia",
    muscleGroup: "Costas",
    mechanic: "Composto",
    equipment: "Polia",
    defaultSets: 4,
    defaultReps: "10",
  },
  {
    id: "c2",
    name: "Remada Baixa",
    muscleGroup: "Costas",
    mechanic: "Composto",
    equipment: "Polia",
    defaultSets: 4,
    defaultReps: "8-12",
  },
  {
    id: "c3",
    name: "Remada Curvada",
    muscleGroup: "Costas",
    mechanic: "Composto",
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: "8-10",
  },
  {
    id: "c4",
    name: "Pulldown",
    muscleGroup: "Costas",
    mechanic: "Isolado",
    equipment: "Polia",
    defaultSets: 3,
    defaultReps: "12",
  },
  // --- OMBROS ---
  {
    id: "o1",
    name: "Desenvolvimento",
    muscleGroup: "Ombro",
    mechanic: "Composto",
    equipment: "Halter",
    defaultSets: 4,
    defaultReps: "8-10",
  },
  {
    id: "o2",
    name: "Elevação Lateral",
    muscleGroup: "Ombro",
    mechanic: "Isolado",
    equipment: "Halter",
    defaultSets: 4,
    defaultReps: "12-15",
  },
  {
    id: "o3",
    name: "Crucifixo Invertido",
    muscleGroup: "Ombro",
    mechanic: "Isolado",
    equipment: "Halter",
    defaultSets: 3,
    defaultReps: "12",
  },
  // --- BRAÇOS (BÍCEPS/TRÍCEPS) ---
  {
    id: "b1",
    name: "Rosca Direta",
    muscleGroup: "Bíceps",
    mechanic: "Isolado",
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: "10",
  },
  {
    id: "b2",
    name: "Rosca Alternada Inclinada",
    muscleGroup: "Bíceps",
    mechanic: "Isolado",
    equipment: "Halter",
    defaultSets: 3,
    defaultReps: "10-12",
  },
  {
    id: "t1",
    name: "Tríceps Corda",
    muscleGroup: "Tríceps",
    mechanic: "Isolado",
    equipment: "Polia",
    defaultSets: 4,
    defaultReps: "12",
  },
  {
    id: "t2",
    name: "Tríceps Testa",
    muscleGroup: "Tríceps",
    mechanic: "Isolado",
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: "10",
  },
  // --- PERNAS (QUADRÍCEPS/POSTERIOR) ---
  {
    id: "q1",
    name: "Agachamento Livre",
    muscleGroup: "Quadríceps",
    mechanic: "Composto",
    equipment: "Barra",
    defaultSets: 4,
    defaultReps: "6-8",
  },
  {
    id: "q2",
    name: "Leg Press 45°",
    muscleGroup: "Quadríceps",
    mechanic: "Composto",
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: "10-12",
  },
  {
    id: "q3",
    name: "Cadeira Extensora",
    muscleGroup: "Quadríceps",
    mechanic: "Isolado",
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: "12-15",
  },
  {
    id: "po1",
    name: "Cadeira Flexora",
    muscleGroup: "Posterior",
    mechanic: "Isolado",
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: "10-12",
  },
  {
    id: "po2",
    name: "Stiff",
    muscleGroup: "Posterior",
    mechanic: "Composto",
    equipment: "Barra",
    defaultSets: 3,
    defaultReps: "8-10",
  },
  // --- PANTURRILHA & ABDÔMEN ---
  {
    id: "pa1",
    name: "Gêmeos em Pé",
    muscleGroup: "Panturrilha",
    mechanic: "Isolado",
    equipment: "Máquina",
    defaultSets: 4,
    defaultReps: "15",
  },
  {
    id: "a1",
    name: "Abdominal Supra",
    muscleGroup: "Abdômen",
    mechanic: "Isolado",
    equipment: "Peso Corporal",
    defaultSets: 3,
    defaultReps: "Falha",
  },
];
