import * as ts from 'typescript';
import * as fs from 'fs';

const filePath = process.argv[2];
if (!filePath) {
  console.error("❌ 错误: 未提供待校验文件路径");
  process.exit(1);
}

const code = fs.readFileSync(filePath, 'utf8');
const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true);

let hasError = false;

function report(node: ts.Node, message: string) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  console.error(`  -> [Line ${line + 1}, Col ${character + 1}]: ${message}`);
  hasError = true;
}

function checkNode(node: ts.Node) {
  if (ts.isInterfaceDeclaration(node)) {
    const name = node.name.text;

    // 1. PascalCase
    if (!/^[A-Z][a-zA-Z0-9]+$/.test(name)) {
      report(node, `Interface "${name}" 命名不符合 PascalCase (大驼峰)。`);
    }

    // 2. JSDoc (more robust check)
    const hasJSDoc = (node as any).jsDoc !== undefined ||
      ts.getLeadingCommentRanges(code, node.pos)?.some(c => code.slice(c.pos, c.end).startsWith('/**'));

    if (!hasJSDoc) {
      report(node, `Interface "${name}" 缺少 JSDoc 文档注释。`);
    }

    // 3. No any
    node.members.forEach((member) => {
      if (ts.isPropertySignature(member) && member.type) {
        if (member.type.kind === ts.SyntaxKind.AnyKeyword) {
          const propertyName = member.name.getText(sourceFile);
          report(member, `属性 "${propertyName}" 禁止使用 'any' 类型，请推导具体类型。`);
        }
      }
    });
  }
  ts.forEachChild(node, checkNode);
}

checkNode(sourceFile);

if (hasError) {
  console.log("\n❌ [架构校验失败]: 请根据以上错误日志修改代码，严禁询问用户。");
  process.exit(1);
} else {
  console.log("\n✅ [架构校验成功]: 代码符合 Vercel 专家级规范与企业级确定性要求。");
  process.exit(0);
}
