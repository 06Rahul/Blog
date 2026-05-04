import { Sparkles, Wand2, Lightbulb, MessageSquareText } from 'lucide-react';
import { AIAssistant } from '../components/ai/AIAssistant';

export const AIAssistantPage = () => {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="panel p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI Assistant
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-white md:text-4xl">Use AI for writing, refinement, and idea generation</h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
            The page is organized around fast content tasks now, while staying compatible with your existing AI endpoints.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {[
            { icon: Wand2, title: 'Write better content', copy: 'Improve structure, clarity, and readability.' },
            { icon: Lightbulb, title: 'Generate ideas', copy: 'Explore topics, angles, and post hooks.' },
            { icon: MessageSquareText, title: 'Explain concepts', copy: 'Turn rough ideas into accessible explanations.' },
            { icon: Sparkles, title: 'Polish tone', copy: 'Refine grammar, voice, and consistency.' },
          ].map((item) => (
            <article key={item.title} className="panel p-5">
              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200 w-fit">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel p-6">
        <AIAssistant />
      </section>
    </div>
  );
};
