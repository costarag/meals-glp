import { DailyLog, DosageStage, Meal, Medication } from "@/lib/types";

export const MEDICATIONS: Medication[] = [
  "Ozempic",
  "Mounjaro",
  "Wegovy",
  "Saxenda",
  "Rybelsus",
  "Outro",
];

export const DOSAGE_STAGES: DosageStage[] = [
  "Iniciacao",
  "Titulacao",
  "Manutencao",
];

export const MOCK_MEALS: Meal[] = [
  {
    id: "meal-1",
    title: "Bowl de frango com quinoa",
    description: "Prato leve, de facil digestao e com proteina alta em porcao enxuta.",
    imageUrl:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80",
    tags: ["Alta Proteina", "Baixo IG"],
    protein: 42,
    calories: 510,
  },
  {
    id: "meal-2",
    title: "Salmão assado com pure de couve-flor",
    description: "Combina proteina de alta qualidade e textura confortavel para dias sensiveis.",
    imageUrl:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=80",
    tags: ["Alta Proteina", "Leve para Nausea"],
    protein: 39,
    calories: 480,
  },
  {
    id: "meal-3",
    title: "Omelete proteico com cottage",
    description: "Opcao rapida para bater proteina quando a fome esta curta.",
    imageUrl:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=80",
    tags: ["Alta Proteina", "Leve para Nausea"],
    protein: 34,
    calories: 360,
  },
  {
    id: "meal-4",
    title: "Iogurte grego, granola e frutas",
    description: "Lanche pratico para janela curta de fome com boa densidade nutricional.",
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=80",
    tags: ["Baixo IG", "Leve para Nausea"],
    protein: 28,
    calories: 320,
  },
  {
    id: "meal-5",
    title: "Carne magra desfiada com abobora",
    description: "Conforto alimentar com proteina robusta e energia de digestao gradual.",
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80",
    tags: ["Alta Proteina", "Baixo IG"],
    protein: 44,
    calories: 540,
  },
  {
    id: "meal-6",
    title: "Tofu grelhado com arroz integral",
    description: "Alternativa vegetal para variar aminoacidos sem abrir mao da meta proteica.",
    imageUrl:
      "https://images.unsplash.com/photo-1604908176997-4312c36b3f44?auto=format&fit=crop&w=1000&q=80",
    tags: ["Alta Proteina", "Baixo IG"],
    protein: 31,
    calories: 430,
  },
];

export const MOCK_LOGS: DailyLog[] = [
  { day: "Seg", protein: 122, weight: 94.8, symptomFree: true },
  { day: "Ter", protein: 137, weight: 94.6, symptomFree: true },
  { day: "Qua", protein: 129, weight: 94.4, symptomFree: false },
  { day: "Qui", protein: 141, weight: 94.1, symptomFree: true },
  { day: "Sex", protein: 134, weight: 93.9, symptomFree: true },
  { day: "Sab", protein: 146, weight: 93.8, symptomFree: true },
  { day: "Dom", protein: 138, weight: 93.6, symptomFree: true },
];
