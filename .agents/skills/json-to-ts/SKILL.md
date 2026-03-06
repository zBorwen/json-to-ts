# Skill: JSON-to-TS Master (v2.1)

## Description
专门用于将复杂的 JSON 数据结构转换为符合企业级规范的 TypeScript Interface，并自动运行静态校验。

## Triggers
- 当用户要求"转换 JSON"或"生成类型"时触发。

## Instructions
1. 接收用户的 JSON 输入。
2. 调用 `src/shared/lib/ai/compatible-provider.ts` 中的 `generateText()` 函数进行语义推导。
3. 将产出写入临时文件。
4. **运行脚本**：`npx tsx ./scripts/schema-check.ts <文件路径>`
5. 只有校验成功，才将代码合并进主分支。

## Architecture (v2.1 Functional)
- **Provider**: 使用函数式 `generateText()` API，不再依赖 class 抽象
- **配置**: 所有参数 (`AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`) 均通过环境变量配置
- **Self-Healing**: 校验失败时，自动进入修复循环 (最多 3 次)

## Tools
- `validate`: 运行 `schema-check.ts` 进行 AST 级别的静态校验
- `generateText`: 调用 OpenAI 兼容 API 生成 TypeScript 代码