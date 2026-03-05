# JSON-to-TS 转换器：全自动化开发计划 (Enterprise Architecture)

## 🎯 最终目标
构建一个具备“自愈能力”的高性能 JSON 转换工具，采用“确定性外壳包裹概率内核”架构，确保在无 API Key 环境下也能完成全链路工程闭环。

---

## Phase 1: 环境与基础设施 (Infrastructure) [IN_PROGRESS]
> **目标**：建立坚固的“确定性外壳”底座，配置样式与脚本规则。
- [ ] **Task 1.1**: 在当前目录下初始化 Next.js 15 骨架及依赖 (`zod`, `ai`, `lucide-react`, `ts-node`)。
- [ ] **Task 1.2**: 初始化 **Tailwind CSS + shadcn/ui** 环境 (运行 `npx shadcn@latest init`)。
- [ ] **Task 1.3**: 部署并测试 `.agents/skills/json-to-ts/scripts/schema-check.ts`。
- [ ] **Check**: 物理拦截测试——手动创建一个非法 `types.ts`，验证脚本返回 Exit Code 1。

## Phase 2: 核心内核与抽象层 (The Decoupled Core) [TODO]
> **目标**：实现 AI 调用层的解耦，确保系统不强依赖外部 API Key。
- [ ] **Task 2.1**: 定义 `share/lib/schemas/conversion.ts` (真理来源/Zod 契约)。
- [ ] **Task 2.2**: 建立 **Provider 抽象层** (`share/lib/ai/provider.ts`)。
- [ ] **Task 2.3**: 实现 `MockAIProvider` (模拟延迟与流式返回)，无需 API Key 即可跑通逻辑。
- [ ] **Task 2.4**: **自动化闭环演练**：由 Antigravity 模拟 LLM 产出，运行 `schema-check.ts` 进行自愈修复。

## Phase 3: 响应式 UI 与 专家级工程实践 (The Shell) [TODO]
> **目标**：基于 Vercel 规则集构建高性能 UI。
- [ ] **Task 3.1**: 使用 React 19 `useActionState` 构建 `GeneratorForm`。
- [ ] **Task 3.2**: 集成 shadcn/ui 组件 (Card, Textarea, Button, Toast)。
- [ ] **Task 3.3**: 按照 `rendering-usetransition-loading.md` 实现流式加载态。

## Phase 4: 交付、验证与 归档 [TODO]
- [ ] **Task 4.1**: 运行全量 `npm run build`。
- [ ] **Task 4.2**: 编写 `ARCHITECTURE.md`，记录“确定性外壳”在无 Key 开发时的 Trade-off 分析。

---
**Agent 指令**：请读取更新后的 `PLAN.md`。立即开始 **Phase 1**。在完成 Task 1.2 的 shadcn 初始化后，请报告进度。