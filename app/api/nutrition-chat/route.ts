import OpenAI from "openai";
import { NextResponse } from "next/server";

const FALLBACK_MESSAGE =
  "No momento estou em modo offline. Priorize pequenas porcoes ricas em proteina (iogurte grego, ovo, frango desfiado), hidratacao em goles e evite alimentos muito gordurosos quando houver enjoo.";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!body?.message?.trim()) {
      return NextResponse.json(
        { error: "Pergunta invalida." },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ reply: FALLBACK_MESSAGE, fallback: true });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const history = (body.history ?? []).slice(-6);
    const conversation = history
      .map((item) => `${item.role === "user" ? "Paciente" : "Assistente"}: ${item.content}`)
      .join("\n");

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions:
        "Voce e um nutricionista brasileiro especialista em pacientes em uso de canetas como Ozempic, Mounjaro e Wegovy. Responda em PT-BR, com acolhimento clinico e praticidade. Mantenha respostas com no maximo 100 palavras, foque em proteina, hidratacao, manejo de nausea e preservacao de massa magra. Nao substitui consulta medica.",
      input: [
        {
          role: "user",
          content: conversation
            ? `${conversation}\nPaciente: ${body.message}`
            : `Paciente: ${body.message}`,
        },
      ],
      max_output_tokens: 220,
      temperature: 0.6,
    });

    const reply = response.output_text?.trim() || FALLBACK_MESSAGE;

    return NextResponse.json({ reply, fallback: false });
  } catch {
    return NextResponse.json({ reply: FALLBACK_MESSAGE, fallback: true });
  }
}
