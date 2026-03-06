# 🔄 JSON-to-TypeScript Engine

> **AI 驱动的智能类型生成器** — 将 JSON 数据自动转换为企业级 TypeScript Interface

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-6.x-000?logo=vercel)](https://sdk.vercel.ai/)

**🌐 在线演示**: [https://json-to-ts-beta.vercel.app](https://json-to-ts-beta.vercel.app)

### 🧠 Architecture Philosophy

本项目是基于对 AI 驱动软件工程的深度思考——即**"确定性外壳包裹概率内核"**（Deterministic Shell wrapping a Probabilistic Core）架构思想的实战演习。

在这个系统中，LLM（概率内核）负责语义理解与复杂逻辑的初步推导，而由 TypeScript AST 校验器、Zod 契约以及严格的工程规约组成的"确定性外壳"，则确保了最终产出的代码具备 100% 的可靠性与一致性。我们不试图消除 AI 的随机性，而是将其约束在工程化的确定性边界之内。

> 💡 灵感来源：[如何把概率性 LLM 放进稳定可控系统](https://mp.weixin.qq.com/s/PLtXLB6bLcXWCPGsTeOjHg)

---

## ✨ 特性亮点

- 🧠 **AI 智能推导** — 基于 LLM 语义理解，而非简单的类型映射
- 🔄 **自愈循环** — 自动检测错误并重试，最多 3 次修复尝试
- 🛡️ **确定性校验** — TypeScript AST 物理检查，确保输出符合企业规范
- 🌐 **Provider 无关** — 一套代码适配 OpenAI、DashScope、Ollama
- ⚡ **流式输出** — 实时展示生成过程，提升用户体验
- 📦 **开箱即用** — 只需配置环境变量即可运行

---

## 🏗️ 核心架构

本项目采用 **"确定性外壳 + 概率内核"** 的混合架构：

```
┌─────────────────────────────────────────────────────┐
│            DETERMINISTIC SHELL (确定性外壳)          │
│  ┌─────────────────────────────────────────────┐    │
│  │  • Zod Schema 输入验证                       │    │
│  │  • TypeScript AST 输出校验                   │    │
│  │  • PascalCase / JSDoc 企业规范               │    │
│  └─────────────────────────────────────────────┘    │
│                         ↓                           │
│  ┌─────────────────────────────────────────────┐    │
│  │        PROBABILISTIC CORE (概率内核)         │    │
│  │  • LLM 语义理解 (Qwen/GPT/Ollama)            │    │
│  │  • 智能类型推导                              │    │
│  │  • 自愈循环 (错误反馈 → 自动修复)             │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 为什么这样设计？

| 传统方案 | 本项目方案 |
|----------|------------|
| 简单类型映射 (`typeof`) | LLM 语义推导 + AST 校验 |
| 无法处理复杂嵌套 | 递归分析 + 智能命名 |
| 输出不可控 | 确定性校验强制约束 |
| 单次生成 | 自愈循环自动修复 |

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-org/json-to-ts.git
cd json-to-ts
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# === AI Provider 配置 (选择以下任一方式) ===

# 方式1: OpenAI
AI_API_KEY=sk-your-openai-key
AI_MODEL=gpt-4o

# 方式2: 阿里云 DashScope (通义千问)
AI_API_KEY=sk-your-dashscope-key
AI_BASE_URL=https://dashscope.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1
AI_MODEL=qwen-plus

# 方式3: 本地 Ollama
AI_API_KEY=ollama
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=llama3
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 开始使用！

---

## 📖 使用方法

### 输入示例

```json
{
  "user": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "roles": ["admin", "editor"]
  }
}
```

### 输出示例

```typescript
/**
 * 用户信息
 */
interface User {
  /** 用户唯一标识 */
  id: number;
  /** 用户名称 */
  name: string;
  /** 电子邮箱 */
  email: string;
  /** 用户角色列表 */
  roles: string[];
}

/**
 * 根数据结构
 */
interface Root {
  /** 用户信息 */
  user: User;
}
```

---

## 🧪 自愈循环机制

```
LLM 生成 → AST 校验 → 通过? → 输出
                ↓ 
              失败
                ↓
        错误注入 Prompt → 重新生成 (最多3次)
```

**校验规则**：
- ❌ 禁止 `any` 类型
- ✅ 强制 PascalCase 命名
- ✅ 必须有 JSDoc 注释

---

## 💭 项目思考方向

### 1. 确定性 + 概率混合架构

**核心理念**: 不要完全依赖 LLM，用确定性代码（AST 校验）作为"物理边界"约束 LLM 输出。

### 2. 自愈循环的价值

| 策略 | 成功率 | 适用场景 |
|------|--------|----------|
| 一次性生成 | ~70% | 简单任务 |
| 自愈循环 | ~95%+ | 企业级应用 |

### 3. Provider 无关性

只需修改环境变量即可切换 OpenAI / DashScope / Ollama，降低供应商锁定风险。

### 4. 未来方向

| 方向 | 描述 |
|------|------|
| **Streaming UI** | 流式显示生成过程 |
| **多模态输入** | 截图 → TypeScript |
| **MCP 集成** | 作为 AI Agent 工具 |
| **SDK 化** | 发布为 npm 包 |

---

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
├── shared/
│   ├── features/generator/ # 生成器核心
│   └── lib/ai/             # AI Provider
.agents/skills/             # Agent 技能定义
```

---

## 🔧 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 15.5 | 全栈框架 |
| React | 19 | UI 库 |
| Vercel AI SDK | 6.x | AI 集成 |
| Zod | 4.x | Schema 验证 |

---

## 📚 相关文档

- [ARCHITECTURE.md](./ARCHITECTURE.md) — 架构设计
- [REVIEW.md](./REVIEW.md) — 项目评估
- [TODO.md](./TODO.md) — 优化建议

---

## 📄 许可证

MIT License © 2024-present

---

<p align="center">
  <strong>用确定性约束概率，让 AI 生成可靠代码</strong>
</p>
