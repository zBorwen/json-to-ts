# Enterprise JSON-to-TS Engine: Architecture Document

> **Version**: 2.1 | **Last Updated**: 2025-01

## 🏗 Core Design: Deterministic Shell + Probabilistic Core

This project implements a **hybrid AI architecture** designed for enterprise-grade safety and reliability.

### Architecture v2.1: Functional Design

Key changes in v2.1:
- **Class-less Provider**: Replaced `OpenAICompatibleProvider` class with pure functions
- **Environment-Driven Config**: All LLM settings via `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`
- **Functional Orchestration**: `executeConversion()` as the primary entry point

```
┌─────────────────────────────────────────────────────────────────┐
│                    DETERMINISTIC SHELL                          │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────────────┐   │
│  │  Zod Schema   │  │  schema-check  │  │  PascalCase/JSDoc │   │
│  │  Validation   │  │  (AST Verify)  │  │  Name Rules       │   │
│  └───────┬───────┘  └───────┬────────┘  └─────────┬─────────┘   │
│          │                  │                      │            │
│          └──────────────────┼──────────────────────┘            │
│                             │                                   │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                   PROBABILISTIC CORE                     │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │      Compatible Provider (Functional, Unified)     │  │   │
│  │  │                                                    │  │   │
│  │  │   generate(prompt, systemPrompt, config?)          │  │   │
│  │  │   generateText(prompt, systemPrompt, config?)      │  │   │
│  │  │                                                    │  │   │
│  │  │  ┌─────────┐  ┌──────────┐  ┌─────────────────────┐│  │   │
│  │  │  │DashScope│  │  OpenAI  │  │  Ollama / Custom    ││  │   │
│  │  │  │ (Qwen)  │  │ (GPT-4o) │  │  (Self-hosted LLM)  ││  │   │
│  │  │  └─────────┘  └──────────┘  └─────────────────────┘│  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
json-to-ts/
├── .agents/                          # AI Agent Skills
│   └── skills/json-to-ts/scripts/
│       └── schema-check.ts           # AST Verifier (Deterministic)
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/ui/                # shadcn/ui Components
│   ├── features/generator/           # Feature Module
│   │   ├── actions/
│   │   │   └── convert.ts            # Server Action (calls executeConversion)
│   │   └── components/
│   │       └── generator-form.tsx    # React 19 Form
│   └── shared/                       # Shared Module
│       ├── features/generator/
│       │   └── orchestrator.ts       # Self-Healing Orchestrator (Functional)
│       └── lib/
│           ├── ai/
│           │   ├── types.ts               # Type Definitions
│           │   ├── mock-provider.ts       # Mock Implementation
│           │   └── compatible-provider.ts # Unified Provider (Functional)
│           ├── prompts/
│           │   └── conversion-prompt.ts   # Prompt Builder
│           └── schemas/
│               └── conversion.ts          # Zod Truth Source
├── .env.example                      # Environment Variables Template
├── PLAN.md                           # Development Roadmap
└── ARCHITECTURE.md                   # This Document
```

---

## 🔄 Self-Healing Loop Architecture

### Execution Flow

```
User Input (JSON)
      │
      ▼
┌─────────────────┐
│ JSON Validation │ ◄─── Zod Pre-validation (Fast Fail)
│  (conversion.ts)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Orchestrator   │ ◄─── Entry Point
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         │
┌───────┐     │
│  AI   │     │ (Max 3 Attempts)
│ Core  │     │
└───┬───┘     │
    │         │
    ▼         │
┌───────────┐ │
│ TypeScript│ │
│  Output   │ │
└─────┬─────┘ │
      │       │
      ▼       │
┌───────────┐ │
│schema-    │ │
│check.ts   │─┤
│(AST Test) │ │
└─────┬─────┘ │
      │       │
   Pass?      │
   ┌─┴─┐      │
   │   │      │
  Yes  No─────┘
   │   (Inject Error → Repair Prompt)
   ▼
┌───────────┐
│  Success  │
│ Response  │
└───────────┘
```

### Component Responsibilities

| Component | Layer | Responsibility |
|-----------|-------|----------------|
| `conversion.ts` | Deterministic | Zod schema validation, JSON syntax check |
| `orchestrator.ts` | Hybrid | `executeConversion()` - AI generation + validation loop |
| `compatible-provider.ts` | Probabilistic | `generate()` / `generateText()` - Unified LLM interface |
| `conversion-prompt.ts` | Probabilistic | System prompt builder |
| `schema-check.ts` | Deterministic | TypeScript AST verification |

---

## 🧩 Key Modules

### 1. Conversion Schema (`src/shared/lib/schemas/conversion.ts`)

**The Single Source of Truth** for request/response contracts.

- JSON syntax pre-validation using `z.refine`
- PascalCase format validation for root names
- Extended metadata: `provider`, `model`, `attempts`, `inputLength`, `outputLength`
- Success flag: `success: boolean` for explicit status

### 2. Compatible Provider (`src/shared/lib/ai/compatible-provider.ts`)

**Functional AI interface** (v2.1) - no classes, pure functions:

```typescript
// Exported functions
export async function generate(prompt, systemPrompt?, config?): AsyncIterable<string>
export async function generateText(prompt, systemPrompt?, config?): Promise<string>

// Configuration priority:
// 1. Function parameter (config)
// 2. Environment variables (AI_API_KEY, AI_BASE_URL, AI_MODEL)
// 3. Defaults (OpenAI GPT-4o-mini)
```

**Supported backends via environment**:
- **OpenAI**: `AI_API_KEY=sk-xxx` (no AI_BASE_URL needed)
- **DashScope**: `AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`
- **Ollama**: `AI_BASE_URL=http://localhost:11434/v1`
- **Any OpenAI-compatible**: Custom `AI_BASE_URL`

### 3. Prompt Builder (`src/shared/lib/prompts/conversion-prompt.ts`)

**Decoupled prompt management**:
- `buildSystemPrompt()`: Universal generation rules
- `buildInitialPrompt()`: First attempt prompt
- `buildRepairPrompt()`: Self-healing repair prompt

---

## ⚖ Architecture Trade-offs

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| AST Latency | ~200-500ms | Enterprise correctness > Speed |
| Self-Heal Retries | Max 3 | Balance cost/quality |
| Provider Abstraction | Unified interface | One codebase, multiple backends |

---

## 🚀 Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Runtime | React 19 (`useActionState`) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Validation | Zod + TypeScript Compiler API |
| AI SDK | Vercel AI SDK |
| LLM Backends | DashScope, OpenAI, Mock |

---

## 🔑 Environment Variables

```env
# Required
AI_API_KEY=sk-xxx                    # Your API Key (OpenAI, DashScope, etc.)

# Optional
AI_BASE_URL=                          # Custom endpoint (leave empty for OpenAI default)
AI_MODEL=gpt-4o-mini                  # Model name (default: gpt-4o-mini)

# Example configurations:
# ─────────────────────────────────────────────────────────────────────
# OpenAI GPT-4o:
#   AI_API_KEY=sk-xxx
#   AI_MODEL=gpt-4o
#
# Alibaba DashScope (Qwen):
#   AI_API_KEY=sk-xxx
#   AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
#   AI_MODEL=qwen-plus
#
# Local Ollama:
#   AI_API_KEY=ollama
#   AI_BASE_URL=http://localhost:11434/v1
#   AI_MODEL=llama3.2
```

**Configuration Priority**:
1. Function parameter (`config` object)
2. Environment variables (`AI_*`)
3. Built-in defaults (OpenAI GPT-4o-mini)

**Note**: API key is required. Without it, the system will throw an error.
