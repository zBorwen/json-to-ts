# Skill: JSON-to-TS Master

## Description
专门用于将复杂的 JSON 数据结构转换为符合企业级规范的 TypeScript Interface，并自动运行静态校验。

## Triggers
- 当用户要求“转换 JSON”或“生成类型”时触发。

## Instructions
1. 接收用户的 JSON 输入。
2. 使用 LLM 进行语义推导。
3. 将产出写入临时文件。
4. **运行脚本**：调用 `./scripts/schema-check.ts`。
5. 只有校验成功，才将代码合并进主分支。

## Tools
- `validate`: 运行项目根目录的校验脚本。