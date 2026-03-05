# Enterprise JSON-to-TS Engine (Next.js 15)

## 🏗 核心架构原则：确定性外壳 (Deterministic Shell)
本项目严格遵循 **"Deterministic Shell wrapping a Probabilistic Core"** 的企业级 AI 架构思想：
- **概率内核 (Probabilistic Core)**: LLM 负责 JSON 语义理解与初步类型推导。
- **确定性外壳 (Deterministic Shell)**: 由 `Zod`、`TypeScript Compiler API` 和 `Vercel Best Practices` 组成的硬约束校验层。

## 🛠 开发者协议 (Agent Protocol)
如果你是 AI Agent (Antigravity/Claude Code)，在开工前必须：
1. **身份对齐**: 读取 `GEMINI.md`，确认你作为资深前端架构师的职责。
2. **加载规约**: 扫描并加载 `.agents/skills/` 下的所有 Vercel 专家规则。
3. **执行循环**: 强制执行 `.agents/skills/json-to-ts/skills/auto-loop.md` 协议。

## 📂 项目结构规范
- `share/features/generator`: 核心转换引擎（遵循 DDD 领域驱动设计）。
- `share/lib/schemas`: 所有的 Zod 契约定义（真理来源）。
- `scripts/`: 包含 `schema-check.ts` 等物理校验脚本。

## 🚀 启动任务
请查阅 `PLAN.md` 获取当前的执行进度与阶段目标。