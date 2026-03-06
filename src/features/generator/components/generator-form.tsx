"use client";

import { useActionState } from "react";
import { convertAction } from "../actions/convert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Zap, Copy } from "lucide-react";

/**
 * Enterprise JSON-to-TS Generator Form
 * 使用 React 19 useActionState 处理表单逻辑
 */
export function GeneratorForm() {
  const [state, formAction, isPending] = useActionState(convertAction, {
    data: undefined,
    error: undefined,
  });

  const handleCopy = () => {
    if (state.data?.typescript) {
      navigator.clipboard.writeText(state.data.typescript);
      toast.success("代码已复制到剪贴板");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 items-start">
      {/* 输入区域 */}
      <form action={formAction} className="w-full">
        <Card className="flex flex-col h-[750px] border-none bg-white/60 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900/60 dark:ring-white/10 overflow-hidden">
          <CardHeader className="flex-none">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              <Zap className="fill-indigo-600 text-indigo-600" />
              JSON 入参
            </CardTitle>
            <CardDescription>
              输入原始 JSON 数据，系统将自动基于 Vercel 专家级规范生成 TypeScript 类型。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto space-y-6 px-6 pb-6 pt-0 premium-scrollbar">
            <div className="space-y-2 flex flex-col h-[500px]">
              <Label htmlFor="json" className="text-sm font-semibold">
                JSON 原文
              </Label>
              <Textarea
                id="json"
                name="json"
                placeholder='{ "id": 1, "name": "Antigravity" }'
                className="flex-grow font-mono bg-zinc-50/50 focus:bg-white transition-all duration-300 dark:bg-zinc-950/50 !field-sizing-content"
                style={{ fieldSizing: "content" } as React.CSSProperties}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4 flex-none pt-2">
              <div className="space-y-2">
                <Label htmlFor="rootName" className="text-sm font-semibold">
                  根接口名称
                </Label>
                <Input
                  id="rootName"
                  name="rootName"
                  placeholder="RootResponse"
                  defaultValue="Root"
                  className="bg-zinc-50/50 focus:bg-white dark:bg-zinc-950/50"
                />
              </div>
              <div className="flex items-end pb-2 gap-2">
                <input
                  type="checkbox"
                  id="includeJSDoc"
                  name="includeJSDoc"
                  defaultChecked
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                />
                <Label htmlFor="includeJSDoc" className="cursor-pointer select-none">
                  包含 JSDoc 注释
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-none p-6 pt-0 border-t border-zinc-100 dark:border-zinc-800/50 mt-auto">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在运行确定性校验...
                </>
              ) : (
                "立即转换 (Enterprise Standard)"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* 输出区域 */}
      <div className="w-full">
        <Card className="flex flex-col h-[750px] border-none bg-zinc-950 text-zinc-50 shadow-2xl overflow-hidden">
          <CardHeader className="flex-none border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  TypeScript 输出
                </CardTitle>
                {state.data?.metadata && (
                  <CardDescription className="text-zinc-500">
                    耗时: {state.data.metadata.duration}ms | 接口数: {state.data.metadata.interfaceCount}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                {state.data?.typescript && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="hover:bg-zinc-800 text-zinc-400 hover:text-zinc-50"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-0 relative group overflow-hidden">
            {state.error && (
              <div className="absolute inset-0 z-10 bg-red-900/20 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                <div className="space-y-2 max-w-md">
                  <div className="text-red-400 font-bold">❌ 校验异常 (Deterministic Shell Error)</div>
                  <div className="text-sm text-red-300 font-mono text-left bg-black/40 p-4 rounded-lg overflow-auto max-h-[300px]">
                    {state.error}
                  </div>
                </div>
              </div>
            )}
            
            <pre className="p-6 font-mono text-sm overflow-auto h-full premium-scrollbar">
              {state.data?.typescript ? (
                <code className="text-indigo-300">{state.data.typescript}</code>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 italic">
                  等待输入 JSON 数据并提交...
                </div>
              )}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
