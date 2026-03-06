import * as ts from 'typescript';
import * as fs from 'fs';

const filePath = process.argv[2];
if (!filePath) {
  console.error("❌ [Error]: No file path provided.");
  process.exit(1);
}

const code = fs.readFileSync(filePath, 'utf8');
const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true);

let errorCount = 0;

function report(node: ts.Node, message: string) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  console.error(`  -> [Line ${line + 1}, Col ${character + 1}]: ${message}`);
  errorCount++;
}

/**
 * 递归检查类型节点中是否包含 any
 */
function hasAnyType(typeNode: ts.TypeNode): boolean {
  if (typeNode.kind === ts.SyntaxKind.AnyKeyword) return true;

  // 检查数组: any[]
  if (ts.isArrayTypeNode(typeNode)) {
    return hasAnyType(typeNode.elementType);
  }

  // 检查联合类型: string | any
  if (ts.isUnionTypeNode(typeNode) || ts.isIntersectionTypeNode(typeNode)) {
    return typeNode.types.some(hasAnyType);
  }

  // 检查泛型: Array<any>, Record<string, any>
  if (ts.isTypeReferenceNode(typeNode) && typeNode.typeArguments) {
    return typeNode.typeArguments.some(hasAnyType);
  }

  return false;
}

/**
 * 检查是否有 JSDoc
 */
function hasJSDoc(node: ts.Node): boolean {
  // 检查 AST 挂载的 jsDoc (TS 编译器有时不挂载)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsDoc = (node as any).jsDoc;
  if (jsDoc && jsDoc.length > 0) return true;

  // 物理检查源码中的注释
  const ranges = ts.getLeadingCommentRanges(code, node.pos);
  if (!ranges) return false;
  return ranges.some(r => code.slice(r.pos, r.end).startsWith('/**'));
}

function checkNode(node: ts.Node) {
  // =================================================================
  // 规则 1: Interface & Type Alias 必须 PascalCase 且必须 Export
  // =================================================================
  if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
    const name = node.name.text;

    // 1.1 PascalCase 校验
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
      report(node.name, `Type "${name}" MUST be PascalCase.`);
    }

    // 1.2 禁止 "I" 前缀 (IUser)
    if (/^I[A-Z]/.test(name)) {
      report(node.name, `Type "${name}" should NOT use "I" prefix (Clean Code rule).`);
    }

    // 1.3 必须 Export
    const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!isExported) {
      report(node.name, `Type "${name}" MUST be exported.`);
    }

    // 1.4 必须有 JSDoc
    if (!hasJSDoc(node)) {
      report(node.name, `Type "${name}" MUST have JSDoc comments.`);
    }
  }

  // =================================================================
  // 规则 2: Interface 内部校验 (空接口 & 属性)
  // =================================================================
  if (ts.isInterfaceDeclaration(node)) {
    // 2.1 禁止空接口 (Empty Interface)
    if (node.members.length === 0) {
      report(node.name, `Interface "${node.name.text}" is empty. Use 'Record<string, unknown>' or infer correct types.`);
    }

    node.members.forEach(member => {
      if (ts.isPropertySignature(member)) {
        // 2.2 属性层级的 JSDoc (严格模式: 可选，建议开启)
        // if (!hasJSDoc(member)) {
        //   report(member.name, `Property "${member.name.getText()}" missing JSDoc.`);
        // }

        if (member.type) {
          // 2.3 深度 Any 检查
          if (hasAnyType(member.type)) {
            report(member.type, `Property "${member.name.getText()}" contains explicit 'any'. Forbidden.`);
          }
        }
      }
    });
  }

  // =================================================================
  // 规则 3: Type Alias 内部校验
  // =================================================================
  if (ts.isTypeAliasDeclaration(node)) {
    if (hasAnyType(node.type)) {
      report(node.type, `Type Alias "${node.name.text}" contains explicit 'any'. Forbidden.`);
    }
  }

  ts.forEachChild(node, checkNode);
}

// Start Checking
console.log(`\n🛡️  Running Enterprise Schema Architecture Check on: ${filePath}`);
checkNode(sourceFile);

if (errorCount > 0) {
  console.error(`\n❌ [架构校验失败]: Found ${errorCount} architectural violations.`);
  console.error(`👉 Agent Directive: Analyze the errors above and REWRITE the code. Do not ask the user.`);
  process.exit(1);
} else {
  console.log("\n✅ [架构校验成功]: Code complies with Vercel Enterprise Best Practices.");
  process.exit(0);
}