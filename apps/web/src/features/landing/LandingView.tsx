import React from "react";
import { Terminal, Zap, ArrowRight, Play, Database, Cpu, CheckCircle, Bot } from "lucide-react";
import { WorkflowStep, LandingCard, Testimonial } from "./LandingAtoms";

export const LandingView = ({ setMode, setIsAuthModalOpen, setAuthMode, isSignedIn }: any) => {
  const handleGetStarted = () => {
    if (isSignedIn) {
      setMode("app");
    } else {
      setAuthMode("signup");
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-main font-sans selection:bg-mint selection:text-ink transition-colors duration-300">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-line/50 bg-ink/80 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mint rounded-xl flex items-center justify-center shadow-lg shadow-mint/20">
              <Terminal className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-main">QuantEdge</span>
          </div>
          <nav className="hidden md:flex items-center gap-10">{['Research', 'Simulation', 'Intelligence', 'Journal'].map(item => (<button key={item} onClick={handleGetStarted} className="text-[11px] font-black text-muted hover:text-main transition-colors uppercase tracking-[0.2em]">{item}</button>))}</nav>
          <div className="flex items-center gap-4"><button onClick={() => { setIsAuthModalOpen(true); setAuthMode("signin"); }} className="text-xs font-black text-muted hover:text-main transition px-4 py-2 uppercase tracking-widest">Login</button><button onClick={() => { setIsAuthModalOpen(true); setAuthMode("signup"); }} className="bg-mint text-white px-6 py-2.5 rounded-full text-xs font-black hover:scale-105 transition-all shadow-xl shadow-mint/20 active:scale-95 uppercase tracking-widest">Create Account</button></div>
        </div>
      </header>

      <main className="pt-40 pb-40 text-center">
          <div className="max-w-7xl mx-auto px-8 space-y-12">
             <div className="inline-flex items-center gap-3 bg-panel border border-line px-5 py-2 rounded-full text-[10px] font-black text-mint uppercase tracking-[0.3em]"><Zap size={14} className="fill-mint" /> Institutional Grade Algorithm Research</div>
             <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-[0.85] text-main">Verify your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint via-muted to-slate-500">Statistical Edge.</span></h1>
             <p className="text-2xl text-muted max-w-3xl mx-auto leading-relaxed font-medium">Stop guessing. QuantEdge is the unified research environment for professional traders to build, test, and approve institutional-grade strategies.</p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
                <button onClick={handleGetStarted} className="group bg-main text-ink h-20 px-12 rounded-full text-xl font-black flex items-center gap-4 hover:bg-mint hover:text-white transition-all shadow-2xl active:scale-95">Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} /></button>
                <button onClick={() => setMode("app")} className="bg-panel/50 backdrop-blur border border-line h-20 px-12 rounded-full text-xl font-black hover:bg-panel transition-all flex items-center gap-4 active:scale-95"><Play size={24} className="text-mint fill-mint/20" /> View Demo</button>
             </div>
          </div>

          <div className="mt-60 max-w-7xl mx-auto px-8 space-y-40">
             <div className="grid md:grid-cols-5 gap-4 items-center max-w-5xl mx-auto"><WorkflowStep icon={Database} label="Ingest" /><div className="hidden md:block h-px bg-gradient-to-r from-transparent via-line to-transparent" /><WorkflowStep icon={Cpu} label="Simulate" active /><div className="hidden md:block h-px bg-gradient-to-r from-transparent via-line to-transparent" /><WorkflowStep icon={CheckCircle} label="Approve" /></div>
             <div className="grid md:grid-cols-3 gap-8"><LandingCard icon={Database} title="Ingest" desc="Import market data with institutional validation." /><LandingCard icon={Cpu} title="Simulate" desc="Launch high-performance backtests in milliseconds." /><LandingCard icon={Bot} title="Analyze" desc="Receive deep AI reviews automatically." /></div>
             <div className="grid md:grid-cols-3 gap-8"><Testimonial quote="Forces professional discipline." author="Alex Riva" role="Macro Trader" /><Testimonial quote="Unified research is a game changer." author="Sarah Chen" role="Researcher" /><Testimonial quote="Readiness score is my new north star." author="Marcus Thorne" role="Scalper" /></div>
          </div>
      </main>
    </div>
  );
};
