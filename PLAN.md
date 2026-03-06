# JSON-to-TS 转换器：全自动化开发计划 (Real-World Enterprise Arch)

> **Version**: 2.1 | **Last Updated**: 2025-01

## 🎯 最终目标
构建一个具备"自愈能力"的高性能 JSON 转换工具。利用 API Key 驱动真实 LLM，通过"确定性外壳"强制约束输出质量，实现 0 `any` 类型和 100% 通过率。

---

## Phase 1: 环境与基础设施 (Infrastructure) ✅ COMPLETED
> **目标**：建立坚固的"确定性外壳"底座，配置 Next.js 15 + Shadcn。
- [x] **Task 1.1**: 初始化 Next.js 15 骨架 (`ts-node`, `zod`, `ai`, `lucide-react`)。
- [x] **Task 1.2**: 初始化 **Tailwind CSS + shadcn/ui** 环境。
- [x] **Task 1.3**: 部署 `.agents/skills/json-to-ts/scripts/schema-check.ts` 并完成**物理拦截测试**。
- [x] **Task 1.4**: 配置环境变量 `.env.local`，填入 `DASHSCOPE_API_KEY` / `OPENAI_API_KEY`。

## Phase 2: 核心内核与抽象层 (The Real Core) ✅ COMPLETED
> **目标**：实现真实的 AI 调用，利用"自愈循环"生成代码。
- [x] **Task 2.1**: 定义 `src/shared/lib/schemas/conversion.ts` (Zod 契约)。
    * **最新升级 (v2.0)**:
      - JSON 语法预校验 (使用 `z.refine`)
      - PascalCase 命名格式校验
      - 扩展 Metadata: `provider`, `model`, `attempts`, `inputLength`, `outputLength`
      - 标准化响应: `success: boolean` 状态字段
      - 辅助函数: `createSuccessResponse()`, `createErrorResponse()`, `validateJsonString()`
- [x] **Task 2.2**: 建立 **通用 AI Provider** (`src/shared/lib/ai/compatible-provider.ts`)。
    * **函数式设计 (v2.1)**: 移除类抽象，导出纯函数 `generate()` / `generateText()`
    * 使用 Vercel AI SDK `createOpenAI` 工厂，兼容所有 OpenAI 兼容端点
    * **环境变量驱动**: `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`
    * 零配置默认 (OpenAI GPT-4o-mini)，支持 DashScope/Ollama/自定义端点
- [x] **Task 2.3**: 编写 **Server Action** (`src/features/generator/actions/convert.ts`)。
    * React 19 `useActionState` 兼容
    * 前置 JSON 校验快速失败
    * 直接返回标准化 `ConversionResponse`
- [x] **Task 2.4**: **Orchestrator 自愈闭环** (`src/shared/features/generator/orchestrator.ts`)。
    * 最大重试 3 次
    * 错误反馈注入修复提示词
    * 使用 `safeParse` 避免异常抛出

## Phase 3: 响应式 UI 与专家级工程实践 (The Shell) ✅ COMPLETED
> **目标**：基于 Vercel 规则集构建高性能流式 UI。
- [x] **Task 3.1**: 使用 React 19 `useActionState` 构建 `GeneratorForm`。
- [x] **Task 3.2**: 集成 shadcn/ui 组件 (Card, Textarea, Button, Toast)。
- [x] **Task 3.3**: 增强 UI 反馈:
    * 成功/失败状态图标 (CheckCircle2/XCircle)
    * 完整 Metadata 展示 (耗时、接口数、Provider、自愈次数)
    * 高级毛玻璃视觉效果

## Phase 4: 架构规范化与最佳实践 ✅ COMPLETED
> **目标**：统一目录结构和 Prompt 管理。
- [x] **Task 4.1**: 迁移 `share/` → `src/shared/`，规范化项目结构。
- [x] **Task 4.2**: 解耦系统提示词 (`src/shared/lib/prompts/conversion-prompt.ts`)。
    * `buildSystemPrompt()`: 生成通用规则
    * `buildInitialPrompt()`: 初始生成提示
    * `buildRepairPrompt()`: 自愈修复提示
- [x] **Task 4.3**: 清理冗余 Provider 文件 (删除 `openai-provider.ts`)。

## Phase 5: 交付、验证与归档 [IN_PROGRESS]
- [x] **Task 5.1**: 更新 `PLAN.md` 同步架构改进。
- [ ] **Task 5.2**: 编写 `ARCHITECTURE.md` 复盘"自愈机制"。
- [ ] **Task 5.3**: 运行全量 `npm run build` 验证。
- [ ] **Task 5.4**: 执行端到端测试用例。

---

## 📁 最终目录结构

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/ui/                # shadcn/ui 组件
├── features/generator/           # 生成器功能模块
│   ├── actions/convert.ts        # Server Action (调用 executeConversion)
│   └── components/generator-form.tsx
└── shared/                       # 共享模块
    ├── features/generator/
    │   └── orchestrator.ts       # 自愈编排器 (函数式: executeConversion)
    └── lib/
        ├── ai/
        │   ├── types.ts                # AIProvider 类型定义
        │   ├── mock-provider.ts        # Mock 实现
        │   └── compatible-provider.ts  # 通用 AI Provider (函数式)
        ├── prompts/
        │   └── conversion-prompt.ts    # 提示词构建器
        └── schemas/
            └── conversion.ts           # Zod 真理来源
```

## 🔑 环境变量

```env
# 统一 AI 配置 (v2.1 环境变量驱动)
AI_API_KEY=sk-xxx           # 必填: API Key
AI_BASE_URL=                # 可选: 自定义端点 (留空使用 OpenAI 默认)
AI_MODEL=gpt-4o-mini        # 可选: 模型名称

# 示例配置:
# DashScope (Qwen): AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
# Ollama:           AI_BASE_URL=http://localhost:11434/v1
# OpenAI:           无需设置 AI_BASE_URL
```

## 🧪 核心 API

```typescript
// 函数式入口 (推荐)
import { executeConversion } from '@/shared/features/generator/orchestrator';

const result = await executeConversion({
  json: '{"name": "John", "age": 30}',
  includeJSDoc: true,
});
// Note: rootName 已移除，AI 将自动根据 JSON 语义推断接口名称

// AI Provider (底层)
import { generate, generateText } from '@/shared/lib/ai/compatible-provider';

const stream = await generate(prompt, systemPrompt);   // 流式
const text = await generateText(prompt, systemPrompt); // 完整文本
```
