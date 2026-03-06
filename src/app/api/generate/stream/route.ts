import { NextRequest } from 'next/server';
import { executeConversion } from '@/shared/features/generator/orchestrator';
import { OrchestratorEvent } from '@/shared/lib/schemas/orchestrator-event';

/**
 * SSE API Route for streaming orchestrator events
 * 
 * @example
 * POST /api/generate/stream
 * Body: { json: '{"name":"John"}', includeJSDoc: true }
 * 
 * Note: rootName 已移除，AI 将自动根据 JSON 语义推断接口名称
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  // 创建 SSE 流
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // 事件发射器 - 将事件推送到 SSE 流
      const onEvent = (event: OrchestratorEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        // 执行转换，传入事件发射器
        const result = await executeConversion(body, { onEvent });

        // 发送最终结果
        const finalEvent = {
          type: 'result',
          timestamp: Date.now(),
          data: result,
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalEvent)}\n\n`));

        // 关闭流
        controller.close();
      } catch (error) {
        // 发送错误事件
        const errorEvent = {
          type: 'error',
          timestamp: Date.now(),
          message: error instanceof Error ? error.message : 'Unknown error',
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        controller.close();
      }
    },
  });

  // 返回 SSE 响应
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
