"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Dumbbell,
  Instagram,
  Linkedin,
  LogOut,
  Menu,
  SendHorizonal,
  ShieldCheck,
  Sparkles,
  Waves,
  X,
} from "lucide-react";
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DOSAGE_STAGES, MEDICATIONS, MOCK_LOGS, MOCK_MEALS } from "@/lib/constants";
import { ChatMessage, DashboardView, DosageStage, Medication, UserProfile } from "@/lib/types";

type AppScreen = "landing" | "onboarding" | "dashboard";

interface PricingPlan {
  name: string;
  monthly: string;
  weekly: string;
  badge?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

const STARTING_ASSISTANT_MESSAGE =
  "Estou com voce nessa jornada. Posso sugerir refeicoes leves para enjoo, bater sua proteina do dia e manter sua massa magra.";

const stageRatio: Record<DosageStage, number> = {
  Iniciacao: 1.35,
  Titulacao: 1.5,
  Manutencao: 1.65,
};

const stageLabels: Record<DosageStage, string> = {
  Iniciacao: "Adaptacao",
  Titulacao: "Ajuste de dose",
  Manutencao: "Fase estavel",
};

const stageDescriptions: Record<DosageStage, string> = {
  Iniciacao: "Primeiras semanas, foco em tolerancia e rotina.",
  Titulacao: "Momento de ajuste, com sintomas variando mais.",
  Manutencao: "Dose estabilizada, foco em consistencia nutricional.",
};

const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Essencial",
    monthly: "R$ 149/mes",
    weekly: "R$ 37/semana",
    features: [
      "Plano alimentar adaptativo semanal",
      "Meta proteica diaria com alertas",
      "Tracking de sintomas e progresso",
      "Assistente IA com limite alto",
    ],
    cta: "Assinar Essencial",
  },
  {
    name: "Protocolo",
    monthly: "R$ 199/mes",
    weekly: "R$ 49/semana",
    badge: "Mais escolhido",
    features: [
      "Tudo do Essencial",
      "Assistente IA ilimitado",
      "Protocolos por sintoma",
      "Relatorio semanal de adesao e risco",
    ],
    cta: "Comecar no Protocolo",
    highlight: true,
  },
  {
    name: "Premium",
    monthly: "R$ 249/mes",
    weekly: "R$ 62/semana",
    features: [
      "Tudo do Protocolo",
      "Revisao humana assincrona mensal",
      "Prioridade no suporte",
      "Plano de contingencia para semanas criticas",
    ],
    cta: "Assinar Premium",
  },
];

const PRICING_FAQS = [
  {
    question: "Ja gasto muito com caneta. Vale a pena?",
    answer:
      "Sim. A DoseCerta foi desenhada para proteger seu investimento principal com rotina alimentar que melhora adesao e resultado.",
  },
  {
    question: "Nao tenho tempo para cardapio complexo.",
    answer:
      "O plano e pratico: porcoes menores, escolhas objetivas e orientacao rapida para o dia a dia brasileiro.",
  },
  {
    question: "E se eu nao me adaptar?",
    answer:
      "Voce pode testar por 7 dias por R$ 19 e avaliar se a abordagem encaixa na sua rotina antes de manter a assinatura.",
  },
];

function calculateProteinTarget(stage: DosageStage) {
  return Math.round(92 * stageRatio[stage]);
}

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedStage, setSelectedStage] = useState<DosageStage | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dashboardView, setDashboardView] = useState<DashboardView>("weekly");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: STARTING_ASSISTANT_MESSAGE },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (screen !== "onboarding" || onboardingStep !== 3 || !selectedStage || analysisReady) {
      return;
    }

    setAnalysisLoading(true);

    const timer = window.setTimeout(() => {
      const target = calculateProteinTarget(selectedStage);

      setProfile((prev) => ({
        name: prev?.name ?? "Paciente DoseCerta",
        medication: selectedMedication ?? "Ozempic",
        stage: selectedStage,
        proteinTarget: target,
      }));
      setAnalysisLoading(false);
      setAnalysisReady(true);
    }, 1900);

    return () => window.clearTimeout(timer);
  }, [analysisReady, onboardingStep, screen, selectedMedication, selectedStage]);

  const averageProtein = useMemo(() => {
    const total = MOCK_LOGS.reduce((sum, log) => sum + log.protein, 0);
    return Math.round(total / MOCK_LOGS.length);
  }, []);

  const symptomFreeDays = useMemo(
    () => MOCK_LOGS.filter((log) => log.symptomFree).length,
    [],
  );

  const currentWeight = useMemo(() => MOCK_LOGS[MOCK_LOGS.length - 1].weight, []);

  const openOnboarding = () => {
    setScreen("onboarding");
    setMobileMenuOpen(false);
  };

  const logout = () => {
    setScreen("landing");
    setOnboardingStep(1);
    setSelectedMedication(null);
    setSelectedStage(null);
    setAnalysisReady(false);
    setAnalysisLoading(false);
    setProfile(null);
    setDashboardView("weekly");
    setChatMessages([{ role: "assistant", content: STARTING_ASSISTANT_MESSAGE }]);
    setChatInput("");
  };

  const handleChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!chatInput.trim() || chatLoading) {
      return;
    }

    const userMessage = chatInput.trim();
    const nextMessages = [...chatMessages, { role: "user" as const, content: userMessage }];

    setChatMessages(nextMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/nutrition-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: nextMessages.slice(-6),
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao consultar assistente");
      }

      const data = (await response.json()) as { reply?: string };

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ??
            "Agora estou sem conexao com a IA. Tente novamente em instantes.",
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "No momento estou em modo offline. Foque em pequenas porcoes com proteina magra e hidratacao em goles.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (screen === "landing") {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
        <div className="pointer-events-none absolute -top-24 left-[-8rem] h-80 w-80 rounded-full bg-teal-200/60 blur-3xl" />
        <div className="pointer-events-none absolute right-[-8rem] top-32 h-80 w-80 rounded-full bg-emerald-200/60 blur-3xl" />

        <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-slate-50/75 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-200 to-teal-700" />
              <p className="text-base font-semibold">DoseCerta Nutri</p>
            </div>

            <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
              <button className="transition hover:text-slate-900">Como funciona</button>
              <button className="transition hover:text-slate-900">Historias reais</button>
              <button className="transition hover:text-slate-900">Suporte clinico</button>
            </nav>

            <button
              onClick={openOnboarding}
              className="hidden rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 md:inline-flex"
            >
              Montar meu plano
            </button>

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {mobileMenuOpen ? (
            <div className="border-t border-slate-200 bg-white/90 px-4 py-4 md:hidden">
              <div className="space-y-3 text-sm text-slate-700">
                <button className="block">Como funciona</button>
                <button className="block">Historias reais</button>
                <button className="block">Suporte clinico</button>
                <button
                  onClick={openOnboarding}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white"
                >
                  Comecar agora
                </button>
              </div>
            </div>
          ) : null}
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pt-16">
          <section className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div className="space-y-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-teal-800">
                <ShieldCheck size={14} /> Mais de 2.800 brasileiros acompanhados
              </span>

              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
                  Seu tratamento mudou a fome. Seu plano alimentar tambem precisa mudar.
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  A DoseCerta cria uma rotina simples para quem usa canetas para emagrecimento e
                  diabetes: mais proteina, menos enjoo e refeicoes que cabem na vida real.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={openOnboarding}
                  className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Montar meu plano
                </button>
                <button className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100">
                  Ver pratos exemplo
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-2 -z-10 rounded-[2rem] bg-gradient-to-br from-teal-100 to-emerald-200 blur-xl" />
              <div className="grid gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-2xl shadow-slate-400/20 backdrop-blur sm:grid-cols-2">
                <div className="relative h-52 overflow-hidden rounded-2xl sm:h-60">
                  <Image
                    src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1000&q=80"
                    alt="Refeicao com proteina e vegetais"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="space-y-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 p-5">
                  <p className="text-sm font-semibold text-teal-900">Plano pensado para o Brasil real</p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Em cada etapa do tratamento, voce recebe orientacao pratica para comer com mais
                    conforto, sem abrir mao de proteina de qualidade.
                  </p>
                  <p className="text-2xl font-bold text-teal-800">140g</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Meta diaria de proteina</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16 grid gap-5 md:grid-cols-3">
            <FeatureCard
              icon={<Dumbbell size={18} />}
              title="Nao perder musculo no processo"
              description="Distribuimos proteina ao longo do dia para proteger massa magra mesmo com pouca fome."
            />
            <FeatureCard
              icon={<Waves size={18} />}
              title="Comer bem mesmo com enjoo"
              description="Pratos leves, porcoes menores e ajustes por fase para reduzir desconforto gastrico."
            />
            <FeatureCard
              icon={<Sparkles size={18} />}
              title="Qualidade nutricional sem complicacao"
              description="Refeicoes praticas que entregam proteina, fibras e micronutrientes em pouco volume."
            />
          </section>

          <section className="mt-18 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-xl shadow-slate-300/30 sm:p-8">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                Cuidado nutricional acolhedor para cada etapa do seu tratamento.
              </h2>
              <p className="text-base leading-relaxed text-slate-600">
                Escolha o plano que melhor combina com sua rotina e receba orientacao pratica para
                comer melhor, reduzir enjoo e preservar massa magra com constancia.
              </p>
            </div>

            <div className="mt-7 grid gap-4 lg:grid-cols-3">
              {PRICING_PLANS.map((plan) => (
                <article
                  key={plan.name}
                  className={`rounded-2xl border p-5 shadow-sm ${
                    plan.highlight
                      ? "border-teal-500 bg-gradient-to-b from-teal-50 to-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{plan.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{plan.weekly}</p>
                    </div>
                    {plan.badge ? (
                      <span className="rounded-full bg-teal-700 px-2.5 py-1 text-xs font-semibold text-white">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-4 text-3xl font-bold text-slate-900">{plan.monthly}</p>

                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {plan.features.map((feature) => (
                      <li key={`${plan.name}-${feature}`} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={openOnboarding}
                    className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      plan.highlight
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                Teste de 7 dias por R$ 19
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                A partir de R$ 37 por semana
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                Nao substitui acompanhamento medico
              </span>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {PRICING_FAQS.map((item) => (
                <article
                  key={item.question}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <h3 className="text-sm font-semibold text-slate-900">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-base font-semibold text-slate-900">DoseCerta Nutri</p>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
                Cuidado nutricional acolhedor para quem usa canetas, com orientacoes praticas para
                seguir com seguranca e constancia no dia a dia.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                O assistente nao substitui acompanhamento medico e nutricional individualizado.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <Instagram size={16} /> Instagram
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <Linkedin size={16} /> LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (screen === "onboarding") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
        <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-300/30 sm:p-8">
          <p className="text-sm font-medium text-slate-500">Etapa {onboardingStep} de 3</p>
          <div className="mt-3 h-2 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-300 to-teal-700 transition-all"
              style={{ width: `${(onboardingStep / 3) * 100}%` }}
            />
          </div>

          {onboardingStep === 1 ? (
            <div className="mt-7 space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Qual caneta voce esta usando?</h2>
                <p className="mt-2 text-slate-600">
                  Isso ajuda a personalizar o plano para sua rotina, sua fome e seus sintomas.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {MEDICATIONS.map((medication) => (
                  <button
                    key={medication}
                    onClick={() => setSelectedMedication(medication)}
                    className={`rounded-2xl border px-4 py-3 text-left font-medium transition ${
                      selectedMedication === medication
                        ? "border-teal-600 bg-teal-50 text-teal-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {medication}
                  </button>
                ))}
              </div>

              <button
                onClick={() => selectedMedication && setOnboardingStep(2)}
                disabled={!selectedMedication}
                className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continuar
              </button>
            </div>
          ) : null}

          {onboardingStep === 2 ? (
            <div className="mt-7 space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Em que etapa do tratamento voce esta?</h2>
                <p className="mt-2 text-slate-600">
                  Cada etapa muda a tolerancia gastrica e a estrategia ideal de proteina.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {DOSAGE_STAGES.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setSelectedStage(stage)}
                    className={`rounded-2xl border px-4 py-3 text-left font-medium transition ${
                      selectedStage === stage
                        ? "border-teal-600 bg-teal-50 text-teal-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{stageLabels[stage]}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {stageDescriptions[stage]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setOnboardingStep(1)}
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700"
                >
                  Voltar
                </button>
                <button
                  onClick={() => selectedStage && setOnboardingStep(3)}
                  disabled={!selectedStage}
                  className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Analisar perfil
                </button>
              </div>
            </div>
          ) : null}

          {onboardingStep === 3 ? (
            <div className="mt-7">
              {analysisLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-lg font-semibold">Montando seu plano personalizado...</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Ajustando proteina, volume e distribuicao para a sua etapa atual.
                  </p>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-teal-300 to-teal-700" />
                  </div>
                </div>
              ) : null}

              {!analysisLoading && analysisReady && profile ? (
                <div className="space-y-5 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-6">
                  <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
                    Analise concluida
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Meta diaria de proteina: {profile.proteinTarget}g
                  </h3>
                  <p className="text-slate-600">
                    Seu plano prioriza refeicoes pequenas e frequentes com foco em proteina para
                    preservar massa magra e aliviar desconfortos comuns da caneta.
                  </p>
                  <button
                    onClick={() => setScreen("dashboard")}
                    className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white"
                  >
                    Revelar meu plano
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-7xl gap-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-300/30 sm:p-4 lg:gap-5">
        <aside className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:w-72 lg:shrink-0">
          <div className="rounded-2xl bg-gradient-to-br from-teal-100 to-teal-700 p-5 text-white">
            <p className="text-xs uppercase tracking-wide text-white/90">Perfil ativo</p>
            <p className="mt-1 text-xl font-bold">{profile?.name ?? "Paciente"}</p>
            <p className="mt-3 text-sm text-white/90">{profile?.medication ?? "Ozempic"}</p>
            <p className="text-sm text-white/90">
              Fase: {stageLabels[profile?.stage ?? "Iniciacao"]}
            </p>
            <p className="mt-4 text-sm font-semibold">Meta: {profile?.proteinTarget ?? 140}g/dia</p>
          </div>

          <nav className="mt-5 space-y-2">
            <button
              onClick={() => setDashboardView("weekly")}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                dashboardView === "weekly"
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              <CalendarDays size={16} /> Plano semanal
            </button>
            <button
              onClick={() => setDashboardView("progress")}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                dashboardView === "progress"
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              <Activity size={16} /> Progresso e sinais
            </button>
          </nav>

          <button
            onClick={logout}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut size={16} /> Sair
          </button>
        </aside>

        <main className="flex min-h-[80vh] flex-1 flex-col rounded-3xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          {dashboardView === "weekly" ? (
            <div className="grid h-full gap-4 xl:grid-cols-[1.35fr_1fr]">
              <section>
                <h2 className="text-2xl font-bold">Plano semanal de refeicoes</h2>
                <p className="mt-2 text-slate-600">
                  Cardapio pratico com alto teor proteico, pouco volume e melhor tolerancia digestiva.
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {MOCK_MEALS.map((meal) => (
                    <article
                      key={meal.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="relative h-32">
                        <Image src={meal.imageUrl} alt={meal.title} fill className="object-cover" />
                      </div>
                      <div className="space-y-3 p-4">
                        <h3 className="font-semibold text-slate-900">{meal.title}</h3>
                        <p className="text-sm text-slate-600">{meal.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {meal.tags.map((tag) => (
                            <span
                              key={`${meal.id}-${tag}`}
                              className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-slate-700">
                          <span>Proteina: {meal.protein}g</span>
                          <span>{meal.calories} kcal</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Assistente nutricional</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Pergunte sobre enjoo, fome baixa, distribuicao de proteina e trocas de refeicao.
                </p>

                <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-3">
                  {chatMessages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "ml-auto bg-slate-900 text-white"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                  {chatLoading ? (
                    <div className="inline-flex rounded-2xl bg-white px-3 py-2 text-sm text-slate-500">
                      Processando resposta...
                    </div>
                  ) : null}
                </div>

                <form onSubmit={handleChatSubmit} className="mt-4 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Ex: Hoje acordei com enjoo. O que consigo comer sem piorar?"
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500"
                  />
                  <button
                    disabled={chatLoading}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <SendHorizonal size={15} /> Enviar
                  </button>
                </form>
              </section>
            </div>
          ) : null}

          {dashboardView === "progress" ? (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold">Progresso e sinais</h2>
              <p className="text-slate-600">
                Acompanhe semana a semana sua proteina, peso e dias com melhor bem-estar.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Peso atual" value={`${currentWeight.toFixed(1)} kg`} />
                <StatCard label="Media proteina/dia" value={`${averageProtein} g`} />
                <StatCard label="Dias sem sintomas" value={`${symptomFreeDays}/7`} />
              </div>

              <div className="h-[360px] rounded-2xl border border-slate-200 bg-white p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={MOCK_LOGS} margin={{ top: 20, right: 24, bottom: 10, left: 4 }}>
                    <XAxis dataKey="day" stroke="#475569" />
                    <YAxis yAxisId="left" stroke="#0f766e" />
                    <YAxis yAxisId="right" orientation="right" stroke="#0f172a" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                      }}
                    />
                    <Area
                      yAxisId="left"
                      dataKey="protein"
                      type="monotone"
                      stroke="#0f766e"
                      fill="#99f6e4"
                      fillOpacity={0.75}
                    />
                    <Line
                      yAxisId="right"
                      dataKey="weight"
                      type="monotone"
                      stroke="#0f172a"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-lg shadow-slate-300/30 backdrop-blur">
      <span className="inline-flex rounded-xl bg-teal-50 p-2 text-teal-700">{icon}</span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </article>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
