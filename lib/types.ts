export type Medication =
  | "Ozempic"
  | "Mounjaro"
  | "Wegovy"
  | "Saxenda"
  | "Rybelsus"
  | "Outro";

export type DosageStage = "Iniciacao" | "Titulacao" | "Manutencao";

export type MacroTag = "Alta Proteina" | "Baixo IG" | "Leve para Nausea";

export interface Meal {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: MacroTag[];
  protein: number;
  calories: number;
}

export interface DailyLog {
  day: string;
  protein: number;
  weight: number;
  symptomFree: boolean;
}

export interface UserProfile {
  name: string;
  medication: Medication;
  stage: DosageStage;
  proteinTarget: number;
}

export type DashboardView = "weekly" | "progress";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
