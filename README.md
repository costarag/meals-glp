# Pleno
> Nutrition companion for GLP-1 patients

[![Live](https://img.shields.io/badge/Live-meals--glp.vercel.app-black?style=flat-square)](https://meals-glp.vercel.app/) ![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js) ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

![Pleno screenshot](https://api.microlink.io/?url=https%3A%2F%2Fmeals-glp.vercel.app%2F&screenshot=true&meta=false&embed=screenshot.url)

**→ Live at [meals-glp.vercel.app](https://meals-glp.vercel.app/)**

---

## The Problem

Patients on GLP-1 medications (Ozempic, Mounjaro, Wegovy) invest ~R$1,700/month in their treatment but face nausea, drastically reduced appetite, and real risk of muscle loss — with nutrition guidance limited to monthly appointments. They make daily food decisions without support, undermining their results.

## The Solution

Pleno is a companion app that protects your investment in the medication. It delivers phase-aware meal plans (initiation → titration → maintenance) focused on protein preservation, plus an AI nutrition assistant for daily decisions. The core insight: GLP-1 nutrition isn't about eating less — it's about eating the *right things* to protect muscle and sustain the drug's effect.

## Key Features

- **Phase-aware meal plans** adapted to your GLP-1 stage (high-protein, low-GI, easy on nausea)
- **Protein targeting** calculated from your current weight and goals
- **AI nutrition chat** for real-time daily guidance
- **Progress tracking** with weight × protein intake charts over time
- **3-step onboarding** — medication, dose phase, protein goal

## Business Model

Recurring subscription anchored on ROI: for patients spending R$1,700/month on GLP-1, protecting that investment with R$149–249/month in nutrition support is a straightforward value equation.

| Plan | Price | Includes |
|------|-------|----------|
| Trial | R$19 / 7 days | Full access |
| Essencial | R$149 / month | Meal plan + AI chat |
| Premium | R$249 / month | Meal plan + AI chat + advanced progress analytics |

Expansion path: B2B2C partnerships with clinics and endocrinologists → acquisition by health operator, telemedicine platform, or pharma group.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| AI | OpenAI `gpt-4.1-mini` |
| Language | TypeScript |
| Runtime | Bun |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Icons | Lucide React |
| Hosting | Vercel |

## Running Locally

```bash
bun install
cp .env.example .env.local  # add your OPENAI_API_KEY
bun dev
```

Open `http://localhost:3000`.

---

*Bootstrapped with AI coding assistants in hours, not weeks.*
