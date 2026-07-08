import React from "react";
import { Terminal, Zap, ArrowRight, Play, Database, Cpu, CheckCircle, Bot, ShieldCheck, BarChart3, Globe, Lock } from "lucide-react";
import { LandingCard } from "./LandingAtoms";

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
    <div className="min-h-screen bg-ink text-main font-sans selection:bg-mint selection:text-ink transition-colors duration-300 overflow-x-hidden">
      {/* Institutional Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-line/50 bg-ink/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-mint rounded-lg flex items-center justify-center shadow-lg shadow-mint/20">
              <Terminal className="text-ink" size={18} strokeWidth={3} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">QuantEdge</span>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            {['Architecture', 'Research', 'Simulation', 'Pricing'].map(item => (
              <button key={item} onClick={handleGetStarted} className="text-[10px] font-black text-muted hover:text-mint transition-colors uppercase tracking-[0.2em]">
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { setIsAuthModalOpen(true); setAuthMode("signin"); }}
              className="text-[10px] font-black text-muted hover:text-main transition px-4 uppercase tracking-widest"
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="bg-white text-ink px-5 py-2 rounded-lg text-[10px] font-black hover:bg-mint transition-all uppercase tracking-widest"
            >
              Start Research
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Compact Hero Section */}
        <section className="pt-48 pb-32 relative border-b border-line/30 bg-[radial-gradient(circle_at_center,rgba(53,208,163,0.03),transparent_70%)]">
          <div className="max-w-[1400px] mx-auto px-10 grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[9px] font-black text-mint uppercase tracking-[0.25em]">
                <Globe size={12} className="animate-pulse" /> Global Alpha Infrastructure
              </div>

              <div className="space-y-4">
                <h1 className="text-6xl font-black tracking-tighter leading-[0.9] uppercase italic">
                  Professional Trading <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint to-indigo-400">Research OS</span>
                </h1>
                <p className="text-lg text-muted max-w-xl leading-relaxed font-medium">
                  Eliminate intuition. Build, backtest, and validate institutional-grade strategies within a unified quantitative ecosystem designed for discipline.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={handleGetStarted}
                  className="bg-mint text-ink h-14 px-8 rounded-xl text-xs font-black flex items-center gap-3 hover:bg-mint-bright transition-all shadow-xl shadow-mint/20 active:scale-95 uppercase tracking-widest"
                >
                  Initialize Lab <ArrowRight size={16} strokeWidth={3} />
                </button>
                <button
                  onClick={() => setMode("app")}
                  className="bg-white/5 border border-white/10 h-14 px-8 rounded-xl text-xs font-black hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95 uppercase tracking-widest"
                >
                  <Play size={16} className="text-mint fill-current" /> Watch Simulation
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-10 border-t border-line/30">
                {[
                  { label: "Architecture", val: "Multitenant" },
                  { label: "Engine", val: "Low Latency" },
                  { label: "Security", val: "Bank-Level" }
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-sm font-black text-main uppercase">{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group lg:block hidden">
              <div className="absolute -inset-4 bg-gradient-to-tr from-mint/20 to-indigo-500/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="panel p-2 bg-ink/80 border-line/50 rounded-[32px] shadow-2xl relative">
                <div className="bg-panel rounded-[24px] overflow-hidden border border-line aspect-[4/3] flex flex-col">
                  <div className="h-10 border-b border-line bg-white/5 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-mint/20 border border-mint/50"></div>
                    </div>
                    <div className="mx-auto bg-white/5 px-4 py-1 rounded-md text-[8px] font-black text-muted uppercase tracking-widest">
                      quantedge-terminal // active_session
                    </div>
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-center items-center gap-6 opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700">
                    <div className="w-20 h-20 bg-mint/10 border border-mint/20 rounded-2xl flex items-center justify-center text-mint">
                      <Cpu size={40} />
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-xs font-black uppercase tracking-widest text-mint">Backtesting Engine v4.2</div>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-widest">Ready for deployment</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid - Information Dense */}
        <section className="py-32 bg-sidebar/30">
          <div className="max-w-[1400px] mx-auto px-10">
            <div className="mb-20 space-y-4">
              <h2 className="text-3xl font-black tracking-tight uppercase italic">Core Research Protocols</h2>
              <p className="text-muted text-sm font-medium max-w-xl leading-relaxed">
                A modular suite of tools designed to transform discretionary ideas into deterministic statistical edges.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <LandingCard
                icon={Database}
                title="Data Ingestion"
                desc="Import multi-asset datasets with automatic timeframe detection and validation logic."
              />
              <LandingCard
                icon={Cpu}
                title="Simulation Lab"
                desc="Stress-test strategy versions across thousands of candles with millisecond precision."
              />
              <LandingCard
                icon={Bot}
                title="Neural Review"
                desc="Automated AI audits of your execution ledger to identify cognitive bias and slippage."
              />
              <LandingCard
                icon={ShieldCheck}
                title="Guardian Node"
                desc="Pre-trade firewall validation ensures every execution remains compliant with your risk plan."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section - Institutional Focus */}
        <section className="py-32 border-t border-line/30">
          <div className="max-w-[1400px] mx-auto px-10">
             <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-6">
                   <h2 className="text-4xl font-black tracking-tighter uppercase italic">Institutional <br />Access</h2>
                   <p className="text-muted text-sm font-medium leading-relaxed">
                      Scale your research from individual studies to professional desk operations. All plans include workspace isolation and multi-tenant security.
                   </p>
                   <div className="flex items-center gap-2 text-[10px] font-black text-mint uppercase tracking-widest pt-4">
                      <Lock size={14} /> SOC2 Compliant Storage Active
                   </div>
                </div>

                <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                   <div className="panel p-10 bg-white/[0.01] border-line/50 space-y-8 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-muted uppercase tracking-widest">Researcher</span>
                        <div className="text-5xl font-black text-main">$0<span className="text-lg text-muted font-bold tracking-tight">/mo</span></div>
                        <p className="text-xs text-muted font-medium pt-4">Perfect for individual alpha discovery.</p>
                      </div>
                      <ul className="space-y-3 pt-6 border-t border-line/30">
                        {['1 Active Workspace', 'Unlimited Backtests', 'Standard AI Reviews', 'Community Datasets'].map(f => (
                          <li key={f} className="text-[10px] font-bold text-dim flex items-center gap-3">
                            <div className="w-1 h-1 rounded-full bg-mint"></div> {f}
                          </li>
                        ))}
                      </ul>
                      <button onClick={handleGetStarted} className="secondary-button !h-12 w-full rounded-xl text-[10px] font-black uppercase tracking-widest">Initialize Node</button>
                   </div>

                   <div className="panel p-10 bg-mint/5 border-mint/30 space-y-8 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-mint text-ink px-4 py-1 text-[8px] font-black uppercase tracking-widest -rotate-45 translate-x-8 translate-y-2">Recommended</div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-mint uppercase tracking-widest">Prop Lab</span>
                        <div className="text-5xl font-black text-main">$49<span className="text-lg text-muted font-bold tracking-tight">/mo</span></div>
                        <p className="text-xs text-muted font-medium pt-4">For professional traders seeking funding.</p>
                      </div>
                      <ul className="space-y-3 pt-6 border-t border-mint/20">
                        {['Unlimited Workspaces', 'Priority AI Coaching', 'Advanced Edge Finder', 'Custom API Exports'].map(f => (
                          <li key={f} className="text-[10px] font-bold text-main flex items-center gap-3">
                            <div className="w-1 h-1 rounded-full bg-mint"></div> {f}
                          </li>
                        ))}
                      </ul>
                      <button onClick={handleGetStarted} className="primary-button !h-12 w-full rounded-xl bg-mint text-ink text-[10px] font-black uppercase tracking-widest shadow-lg shadow-mint/20">Upgrade Operations</button>
                   </div>
                </div>
             </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-line/30 bg-sidebar/20">
        <div className="max-w-[1400px] mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
              <Terminal className="text-muted" size={14} />
            </div>
            <span className="text-xs font-black tracking-tighter uppercase text-muted">QuantEdge v1.0</span>
          </div>
          <div className="flex gap-10">
            {['Status', 'Documentation', 'API', 'Legal'].map(l => (
              <button key={l} className="text-[9px] font-black text-muted hover:text-main transition-colors uppercase tracking-widest">{l}</button>
            ))}
          </div>
          <p className="text-[9px] font-bold text-muted/50 uppercase tracking-widest">© 2024 QuantEdge Laboratory</p>
        </div>
      </footer>
    </div>
  );
};
