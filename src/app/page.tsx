import { GeneratorForm } from "@/features/generator/components/generator-form";
import { ShieldCheck, Cpu, Code2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#fafafa] dark:bg-zinc-950">
      {/* 装饰性背景 */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] dark:bg-indigo-900/10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200/30 rounded-full blur-[120px] dark:bg-violet-900/10" />
      </div>

      <div className="container mx-auto px-4 py-16 relative">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} />
            Deterministic Shell wrapping a Probabilistic Core
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">JSON-to-TS</span> Engine
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-zinc-500 dark:text-zinc-400">
            基于 Next.js 15 与 Vercel 专家级性能规约构建。通过物理编译器 AST 校验，确保 AI 生成结果 100% 符合企业级工业标准。
          </p>
          
          <div className="flex justify-center gap-8 pt-4">
            <div className="flex flex-col items-center gap-1">
              <div className="p-2 rounded-lg bg-white shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                <Cpu className="text-indigo-600" size={20} />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">AI Inference</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="p-2 rounded-lg bg-white shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                <ShieldCheck className="text-green-600" size={20} />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">AST Sandbox</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="p-2 rounded-lg bg-white shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                <Code2 className="text-violet-600" size={20} />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Type-Safe Output</span>
            </div>
          </div>
        </div>

        {/* Core Generator Component */}
        <GeneratorForm />

        {/* Footer info */}
        <div className="mt-20 text-center">
          <div className="text-zinc-400 text-sm font-medium flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Vercel Engineering Best Practices Applied
          </div>
        </div>
      </div>
    </main>
  );
}
