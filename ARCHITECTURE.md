# Enterprise JSON-to-Ts Engine: Architectural Analysis

## 🏗 Core Design: Deterministic Shell vs. Probabilistic Core

This project implements a hybrid AI architecture designed for enterprise-grade safety and reliability.

### 🔍 1. The Probabilistic Core (AI Layer)
- **Role**: LLM (Large Language Model) responsible for semantic understanding.
- **Characteristics**: High creative flexibility, but naturally non-deterministic.
- **Implementation**: Decoupled via the `AIProvider` interface. 
  - **OpenAIProvider**: Uses GPT-4o for SOTA results.
  - **QwenProvider**: Uses Alibaba DashScope (OpenAI Compatible) with `qwen3.5-plus`.
  - **MockAIProvider**: Simulates this core without requiring external API keys.

### 🛡 2. The Deterministic Shell (Validation Layer)
- **Role**: Hard-constraint verification that wraps the probabilistic output.
- **Characteristics**: Binary outcomes (Pass/Fail), 100% predictable, industrial-grade.
- **Implementation**:
  - **Zod Schemas**: Initial IO validation for JSON inputs.
  - **AST Verifier**: [schema-check.ts](file:///d:/workspace/JSON-to-TS/.agents/skills/json-to-ts/scripts/schema-check.ts) uses the TypeScript Compiler API to perform physical static analysis.
  - **Rules Enforced**: No `any` keyword, PascalCase naming, required JSDoc.

## ⚙ Engineering Workflow: The Self-Healing Loop

When a "Probabilistic" output violates a "Deterministic" rule, the system triggers an automated self-healing loop:
1. **Orchestrator** generates code.
2. **Schema-check** fails with specific AST error logs.
3. **Agent (AI)** observes the failure and "re-adjusts" its probability distribution to fix the violation.
4. **Re-verify** until the deterministic shell grants approval (Exit Code 0).

## ⚖ Architecture Trade-off Analysis

### Performance vs. Correctness
- **Trade-off**: Running a full TypeScript AST check for every generation adds latency (approx. 200-500ms).
- **Justification**: In an enterprise context, "Correctness" is superior to "Speed". A generated model that causes a build failure is useless regardless of how fast it was produced.

### Offline Resilience
- **Design Choice**: The `AIProvider` abstraction allows for 0-dependency development. 
- **Benefit**: Engineering teams can build and test the entire UI/Validation pipeline without burning tokens or requiring network connectivity.

## 🚀 Technical Stack Summary
- **Framework**: Next.js 15 (App Router + Server Actions)
- **Runtime**: React 19 (`useActionState` for seamless form handling)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Premium Glassmorphism Aesthetic)
- **Engine**: TypeScript 5.x Compiler API + Zod
