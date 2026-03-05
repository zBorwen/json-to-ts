import { MockAIProvider } from './share/lib/ai/mock-provider';
import { GeneratorOrchestrator } from './share/features/generator/orchestrator';

/**
 * 冒烟测试脚本
 * 验证 Phase 2 的编排逻辑与 Phase 1 的校验脚本是否跑通
 */
async function smokeTest() {
  console.log("🚀 开始闭环演练 (Closed-Loop Exercise)...");

  const provider = new MockAIProvider();
  const orchestrator = new GeneratorOrchestrator(provider);

  try {
    const result = await orchestrator.execute({
      json: '{"id": 1, "test": "val"}',
      rootName: "TestResponse",
      includeJSDoc: true
    });

    console.log("\n✨ 演练成功!");
    console.log("生成代码预览:\n" + result.typescript);
    console.log(`耗时: ${result.metadata?.duration}ms`);
  } catch (error) {
    console.error("\n💥 演练发现异常 (符合预期/不符合预期):");
    console.error(error);
    process.exit(1);
  }
}

smokeTest();
