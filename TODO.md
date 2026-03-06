# 📋 JSON-to-TS 项目优化建议清单

> **生成时间**: 2026-03-06  
> **来源**: 项目专业评估报告 (REVIEW.md)

---

## 🔴 高优先级 (短期: 1-2 周)

### 1. 添加端到端测试
- [ ] 配置 Playwright 或 Vitest 测试框架
- [ ] 编写核心转换流程的 E2E 测试用例
- [ ] 覆盖自愈循环的边界场景
- [ ] 添加 CI/CD 自动化测试流程

**文件影响**: 
- 新建 `tests/e2e/` 目录
- 新建 `playwright.config.ts` 或 `vitest.config.ts`

---

### 2. ~~实现 Streaming UI~~ ✅ 已完成
- [x] ~~使用 Vercel AI SDK 的 `streamText` API~~ → 使用 SSE 事件流实现（更适合自愈循环场景）
- [x] 前端实现流式显示生成过程
- [x] 添加生成进度指示器
- [x] 优化用户等待体验

**实现方案**:
- 新建 `src/app/api/generate/stream/route.ts` - SSE 流式 API 端点
- 新建 `src/features/generator/components/status-panel.tsx` - 实时状态面板
- 新建 `src/shared/lib/schemas/orchestrator-event.ts` - 事件类型定义
- 修改 `src/shared/features/generator/orchestrator.ts` - 添加 `onEvent` 回调
- 修改 `src/features/generator/components/generator-form.tsx` - 三栏布局集成

**技术说明**: 选择 SSE 而非 `streamText` 是因为自愈循环需要传递结构化元数据（attempt, violations, duration），而非仅仅是文本流

---

## 🟡 中优先级 (中期: 1-3 月)

### 3. 添加生成历史功能
- [ ] 设计历史记录数据结构
- [ ] 实现 localStorage 存储 (MVP)
- [ ] 可选: 集成数据库持久化 (SQLite/Prisma)
- [ ] 添加历史记录列表 UI
- [ ] 实现历史记录的导出/导入

**文件影响**:
- 新建 `src/shared/features/history/` 目录
- 修改主页面布局

---

### 4. 多模态输入支持
- [ ] 集成 Vision API (GPT-4V / Qwen-VL)
- [ ] 支持截图 → TypeScript 类型推导
- [ ] 支持表格图片 → Interface 转换
- [ ] 添加图片上传组件

**文件影响**:
- 修改 `src/shared/lib/ai/compatible-provider.ts`
- 新建 `src/shared/features/vision/` 目录

---

### 5. Schema 智能推导
- [ ] 支持多个 JSON 样例输入
- [ ] 自动推导 Union 类型
- [ ] 识别可选字段 (Optional)
- [ ] 智能合并相似结构

**文件影响**:
- 修改 `src/shared/features/generator/prompt-builder.ts`
- 修改 `conversion.ts`

---

### 6. CI/CD 集成
- [ ] 发布为 GitHub Action
- [ ] 支持在 PR 中自动生成类型
- [ ] 添加类型变更的 diff 展示
- [ ] 配置版本自动发布

**文件影响**:
- 新建 `.github/actions/json-to-ts/`
- 新建 `action.yml`

---

## 🟢 低优先级 (长期: 6-12 月)

### 7. SDK 化
- [ ] 提取核心引擎为独立 npm 包
- [ ] 设计通用 API 接口
- [ ] 编写完整 API 文档
- [ ] 发布到 npm registry

**新建仓库**: `@your-org/ai-type-generator`

---

### 8. MCP 协议支持
- [ ] 研究 Model Context Protocol 规范
- [ ] 实现 MCP 工具接口
- [ ] 支持作为 Claude/Cursor MCP 工具使用
- [ ] 编写 MCP 配置文档

**文件影响**:
- 新建 `mcp/` 目录
- 新建 `mcp-server.ts`

---

### 9. Agent Skill 市场
- [ ] 设计 Skill 打包标准
- [ ] 构建 Skill 发现机制
- [ ] 实现 Skill 版本管理
- [ ] 创建 Skill 文档生成器

**文件影响**:
- 扩展 `.agents/skills/` 结构
- 新建 Skill 注册中心

---

### 10. 可观测性增强
- [ ] 集成 OpenTelemetry
- [ ] 添加 LLM 调用追踪
- [ ] 实现 Token 使用统计
- [ ] 添加性能监控面板

**文件影响**:
- 新建 `src/shared/lib/telemetry/`
- 修改 Provider 层添加埋点

---

## 🔧 技术债务

### 代码质量
- [ ] 提升测试覆盖率至 80%+
- [ ] 添加更多 JSDoc 注释
- [ ] 配置 ESLint 严格模式
- [ ] 添加 Prettier 格式化

### 文档完善
- [ ] 添加 API 文档 (TypeDoc)
- [ ] 补充贡献指南 (CONTRIBUTING.md)
- [ ] 添加更多使用示例
- [ ] 录制演示视频

---

## � 优先级矩阵

```
影响力 ↑
    │
高  │  [E2E测试]   [Streaming]   [SDK化]
    │
中  │  [历史记录]  [多模态]      [MCP协议]
    │
低  │  [CI/CD]     [Skill市场]   [可观测性]
    │
    └─────────────────────────────────────→ 实现难度
        低           中            高
```

---

## ✅ 已完成项

- [x] v2.1 函数式架构迁移
- [x] 环境变量配置统一
- [x] Provider 无关性实现
- [x] Agent Skills 文档同步
- [x] 代码清理 (无效变量/引用)
- [x] 目录结构规范化 (`src/shared/`)
- [x] **Streaming UI 实时状态展示** - SSE 事件流 + 三栏布局 + 自愈循环可视化 (2026-03-06)

---

*最后更新: 2026-03-06 15:50 CST*
