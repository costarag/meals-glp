"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Dumbbell,
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

const STARTING_ASSISTANT_MESSAGE =
  "Sou seu assistente nutricional. Posso ajudar com enjoo, distribuicao de proteina e ideias de refeicoes em porcoes pequenas.";

const stageRatio: Record<DosageStage, number> = {
  Iniciacao: 1.35,
  Titulacao: 1.5,
  Manutencao: 1.65,
};

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
        name: prev?.name ?? "Paciente Mealcycle",
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
              <p className="text-base font-semibold">Mealcycle.co</p>
            </div>

            <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
              <button className="transition hover:text-slate-900">Como funciona</button>
              <button className="transition hover:text-slate-900">Resultados</button>
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
                <button className="block">Resultados</button>
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
                <ShieldCheck size={14} /> Mais de 2.800 pacientes acompanhados
              </span>

              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
                  Nutricao desenhada para o seu novo metabolismo.
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Mealcycle ajuda voce a preservar massa magra, reduzir enjoo e manter ingestao
                  proteica com refeicoes inteligentes para quem usa Ozempic, Mounjaro e Wegovy.
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
                  Ver cardapios
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
                  <p className="text-sm font-semibold text-teal-900">Plano biologicamente inteligente</p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    A cada fase da dose, ajustamos volume, textura e densidade proteica para voce
                    comer melhor mesmo com baixa fome.
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
              title="Preservar massa magra"
              description="Com distribuicao proteica por refeicao e cardapios de alta qualidade biologica."
            />
            <FeatureCard
              icon={<Waves size={18} />}
              title="Controlar enjoo"
              description="Comida de facil digestao, porcoes pequenas e estrategias para fases de maior sensibilidade."
            />
            <FeatureCard
              icon={<Sparkles size={18} />}
              title="Alta densidade nutricional"
              description="Cada refeicao prioriza proteina, fibras e micronutrientes mesmo com baixa ingestao total."
            />
          </section>
        </main>
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
                  Esse dado ajuda a calibrar o plano de refeicoes para sua resposta de apetite.
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
                <h2 className="text-2xl font-bold">Em qual fase de dose voce esta?</h2>
                <p className="mt-2 text-slate-600">
                  Cada fase altera tolerancia gastrica e necessidade de estrategia proteica.
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
                    {stage}
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
                  <p className="text-lg font-semibold">Analisando seu perfil metabolico...</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Ajustando proteina, volume e distribuicao para sua fase atual.
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
                    Seu plano prioriza refeicoes pequenas e frequentes com alta densidade proteica
                    para manter massa magra e reduzir desconforto gastrointestinal.
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
            <p className="text-sm text-white/90">Fase: {profile?.stage ?? "Iniciacao"}</p>
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
                  Refeicoes com alto valor proteico, baixo volume e melhor tolerancia digestiva.
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
                  Tire duvidas sobre enjoo, proteina diaria e ajustes de porcao.
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
                    placeholder="Ex: Estou com enjoo. O que comer hoje?"
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
                Evolucao semanal entre consumo proteico, peso e controle de sintomas.
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
