# Mealcycle.co

Aplicacao single-page em PT-BR para suporte nutricional de pacientes em uso de canetas como Ozempic, Mounjaro e Wegovy.

Projeto focado em UX premium, com fluxo completo de onboarding + dashboard e assistente nutricional com OpenAI.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Lucide React
- Recharts
- OpenAI SDK (`openai`)

## O que voce encontra no app

- Landing page com proposta clinica clara e CTA para iniciar plano
- Onboarding em 3 etapas (medicacao, fase da dose, analise de proteina)
- Dashboard com:
  - Plano semanal de refeicoes com macros e tags
  - Progresso semanal em grafico (`ComposedChart`)
  - Chat nutricional com fallback quando nao houver chave de API

## Build log rapido (Coding Assistants)

Este projeto foi bootstrapado rapidamente com apoio de assistentes de codigo.

- Ferramenta: `OpenCode`
- Modelo: `GPT-5.3` (`openai/gpt-5.3-codex`)
- Papel dos assistentes: acelerar scaffold, arquitetura de componentes, integracao de API e refinamento de UI/UX

Objetivo: demonstrar velocidade de prototipacao com qualidade de produto e boas praticas de engenharia.

## Executar localmente

1. Instale dependencias:

```bash
npm install
```

2. Crie `.env.local` com sua chave da OpenAI:

```bash
OPENAI_API_KEY=sua_chave_aqui
```

3. Rode o projeto:

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Scripts

- `npm run dev` inicia ambiente local
- `npm run lint` roda ESLint
- `npm run build` gera build de producao

## Deploy na Vercel

- Suba o projeto para GitHub
- Importe na Vercel
- Configure `OPENAI_API_KEY` em Project Settings > Environment Variables
- Deploy

## Publicacao no GitHub

Como este repositorio e publico:

- nao commitar `.env.local`
- nao expor chaves em client-side
- manter segredos apenas nas variaveis da Vercel/GitHub

## Observacao clinica

O assistente de IA apoia decisao nutricional do dia a dia, mas nao substitui acompanhamento medico e nutricional individualizado.
