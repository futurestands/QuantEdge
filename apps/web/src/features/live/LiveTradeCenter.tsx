import React, { useState, useEffect } from "react";
import { AccountOverview } from "./AccountOverview";
import { OpenPositionsPanel } from "./OpenPositionsPanel";
import { OrdersPanel } from "./OrdersPanel";
import { ExposurePanel } from "./ExposurePanel";
import { TradingTimeline } from "./TradingTimeline";
import { Activity, ShieldCheck, Zap, RefreshCw, ChevronRight, AlertCircle, Lock } from "lucide-react";

export const LiveTradeCenter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState({
    balance: 0,
    equity: 0,
    margin: 0,
    freeMargin: 0,
    unrealizedPnl: 0,
    dailyPnl: 0
  });

  const [positions, setPositions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    // Initializing state - awaiting real broker connection in future sprint
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
       <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center">
          <RefreshCw size={24} className="text-mint animate-spin" />
       </div>
       <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Initializing Live Environment...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in text-main max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber/10 border border-amber/20 rounded text-[9px] font-black text-amber uppercase tracking-widest">
               Standby
            </div>
            <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Institutional Terminal</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Live Operations</h1>
          <p className="text-muted text-sm font-medium mt-1">Real-time execution center. Connect a broker node to begin.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-muted uppercase tracking-widest leading-none">Broker Status</span>
                <span className="text-xs font-black text-muted mt-1 flex items-center gap-2 uppercase">
                   Disconnected <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                </span>
             </div>
             <div className="w-px h-6 bg-line"></div>
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-muted uppercase tracking-widest leading-none">Latency</span>
                <span className="text-xs font-black text-muted mt-1">---</span>
             </div>
          </div>
          <button className="primary-button !h-12 px-8 rounded-2xl bg-indigo shadow-[0_0_20px_rgba(99,102,241,0.2)]">
             <Zap size={16} className="mr-2 fill-current" /> Connect Broker
          </button>
        </div>
      </header>

      <div className="animate-in delay-100">
        <AccountOverview data={accountData} />
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-10 animate-in delay-200">
          <OpenPositionsPanel positions={positions} />

          <div className="grid md:grid-cols-2 gap-10">
            <OrdersPanel orders={orders} />
            <ExposurePanel exposure={{}} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8 animate-in delay-300">
          <TradingTimeline events={timeline} />

          <article className="panel border-white/5 relative overflow-hidden group">
            <div className="panel-heading mb-8">
              <div>
                <p className="text-muted font-black uppercase">Safety Protocol</p>
                <h2 className="text-2xl font-black tracking-tight">Execution Firewall</h2>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted">
                 <Lock size={20} strokeWidth={2.5} />
              </div>
            </div>

            <div className="space-y-8 relative">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex justify-between items-end mb-4">
                   <div>
                      <span className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1">Daily Discipline</span>
                      <span className="text-3xl font-black text-muted tabular-nums">---</span>
                   </div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-white/10" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex gap-4">
                 <AlertCircle className="text-muted shrink-0 mt-0.5" size={18} />
                 <p className="text-xs text-muted leading-relaxed font-medium italic">
                    "Connect an institutional broker node to activate real-time behavioral monitoring and capital protection protocols."
                 </p>
              </div>

              <button className="secondary-button w-full justify-between h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50" disabled>
                 Awaiting Live Link <ChevronRight size={14} className="text-muted" />
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
