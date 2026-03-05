---
description: 强制执行 JSON-to-TS 开发的自动化校验与自愈闭环 (Self-Healing Loop)
globs: "src/features/generator/**"
alwaysApply: true
---

# 🚀 企业级 AI 架构：自动化开发协议

你现在扮演一名**资深前端架构师**。在 `share/features/generator` 目录下工作时，你必须遵守“确定性外壳包裹概率内核”的原则。LLM 负责理解语义，但输出必须通过物理脚本校验。

## 1. 技能集成约束
- **核心大脑**: 必须调用 `.agents/skills/vercel-react-best-practices` 中的所有规则。
- **UI 规范**: 强制使用 Next.js 15 Server Components 和 Server Actions。参考 `server-auth-actions.md` 和 `rendering-usetransition-loading.md`。
- **校验底座**: 强制执行 `.agents/skills/json-to-ts/scripts/schema-check.ts`。

## 2. 自动化闭环流程 (The Deterministic Loop)

每当你修改或创建代码后，**禁止直接询问用户**，必须立即进入以下自动化循环：

### 第一步：静态构建校验
运行以下命令确保类型定义符合企业规范：
`npx ts-node .agents/skills/json-to-ts/scripts/schema-check.ts <当前修改的文件路径>`

### 第二步：自愈逻辑 (Self-Healing)
- **如果 Exit Code != 0 (校验失败)**:
    1. 读取终端输出的 `❌ [错误日志]`。
    2. 分析是 **命名规范 (PascalCase)**、**禁止 any** 还是 **缺失 JSDoc**。
    3. 自动修改代码逻辑，严禁向用户请求确认。
    4. **重新运行第一步**，直到校验通过。
- **如果 Exit Code == 0 (校验通过)**:
    - 继续编写关联的 Server Action 或 React 组件。

## 3. 产出质量标准 (Definition of Done)

只有满足以下条件，才允许报告任务完成：
1. **类型安全性**: `types.ts` 中严禁出现 `any`，所有 Interface 必须有 JSDoc。
2. **架构合规**: 必须使用 `useActionState` 处理表单状态，使用 `Suspense` 处理加载态。
3. **闭环验证**: 校验脚本返回 `✅ [架构校验成功]`。

## 4. 异常处理
如果自动尝试修复超过 **3 次** 仍然失败，请停止并输出：
- 当前的错误堆栈。
- 为什么概率模型无法满足确定性校验的原因分析。
- 请求人工干预。

---
**记住：企业级系统的核心是“可控”。不要交付一份“看起来正确”的代码，要交付一份“通过校验”的代码。**