# JSON-to-TS 转换器：全自动化开发计划 (Real-World Enterprise Arch)

## 🎯 最终目标
构建一个具备“自愈能力”的高性能 JSON 转换工具。利用 API Key 驱动真实 LLM，通过“确定性外壳”强制约束输出质量，实现 0 `any` 类型和 100% 通过率。

---

## Phase 1: 环境与基础设施 (Infrastructure) [IN_PROGRESS]
> **目标**：建立坚固的“确定性外壳”底座，配置 Next.js 15 + Shadcn。
- [ ] **Task 1.1**: 初始化 Next.js 15 骨架 (`ts-node`, `zod`, `ai`, `lucide-react`)。
    * *注意：保留 .agents/ 和配置文件，处理 npm 初始化冲突。*
- [ ] **Task 1.2**: 初始化 **Tailwind CSS + shadcn/ui** 环境 (`npx shadcn@latest init`)。
- [ ] **Task 1.3**: 部署 `.agents/skills/json-to-ts/scripts/schema-check.ts` 并完成**物理拦截测试**（Exit Code 1 验证）。
- [ ] **Task 1.4**: 配置环境变量 `.env.local`，填入 `OPENAI_API_KEY` 或对应 Provider 的 Key。

## Phase 2: 核心内核与抽象层 (The Real Core) [TODO]
> **目标**：实现真实的 AI 调用，利用“自愈循环”生成代码。
- [ ] **Task 2.1**: 定义 `src/shared/schemas/conversion.ts` (真理来源/Zod 契约)。
    * *修正路径：确保位于 src/ 下以便 @/shared 别名访问。*
- [ ] **Task 2.2**: 建立 **Provider 抽象层** (`src/infra/ai/provider.ts`)。
    * *实现：编写 `createAIProvider` 工厂函数，解耦具体模型。*
- [ ] **Task 2.3**: 编写 **Server Action** (`src/modules/generator/actions.ts`)。
    * *逻辑：调用 LLM -> 获取 JSON -> 写入临时文件 -> 运行 Schema Check -> (失败则重试) -> 返回前端。*
- [ ] **Task 2.4**: **自动化闭环实战**：
    * 输入一个极度复杂的嵌套 JSON。
    * 观察终端：Agent 是否在 `schema-check` 报错后，自动调用 LLM 进行自我修正（Self-Correction）。

## Phase 3: 响应式 UI 与 专家级工程实践 (The Shell) [TODO]
> **目标**：基于 Vercel 规则集构建高性能流式 UI。
- [ ] **Task 3.1**: 使用 React 19 `useActionState` 构建 `GeneratorForm`。
- [ ] **Task 3.2**: 集成 shadcn/ui 组件 (Card, Textarea, Button, Toast)。
- [ ] **Task 3.3**: 按照 `rendering-usetransition-loading.md` 实现流式加载态 (Streaming UI)。

## Phase 4: 交付、验证与 归档 [TODO]
- [ ] **Task 4.1**: 运行全量 `npm run build`。
- [ ] **Task 4.2**: 编写 `ARCHITECTURE.md`，复盘“自愈机制”在真实 API 调用下的表现。