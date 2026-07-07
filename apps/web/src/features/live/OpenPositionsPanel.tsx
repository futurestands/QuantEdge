import React from "react";
import { ArrowUpRight, ArrowDownRight, XCircle, MoreVertical, ShieldCheck, Zap } from "lucide-react";
import { BrokerPosition } from "../../lib/brokers/types";

export const OpenPositionsPanel: React.FC<{ positions: BrokerPosition[] }> = ({ positions }) => {
  return (
    <article className="panel p-0 overflow-hidden">
      <div className="px-8 py-6 border-b border-line flex items-center justify-between bg-white/[0.01]">
        <div>
          <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mb-1">Portfolio Exposure</p>
          <h2 className="text-xl font-black tracking-tight">Active Execution Logs</h2>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black text-muted uppercase tracking-widest">
              Count: {positions.length}
           </div>
           <button className="secondary-button !h-8 !px-3 text-[9px] font-black uppercase tracking-widest border-white/10 hover:border-mint-bright/30">
              Close All
           </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02]">
            <tr className="text-[9px] font-black text-muted uppercase tracking-[0.2em] border-b border-line">
              <th className="px-8 py-4">Instrument</th>
              <th className="px-4 py-4">Operational Side</th>
              <th className="px-4 py-4 text-center">Volume (Lots)</th>
              <th className="px-4 py-4">Entry Node</th>
              <th className="px-4 py-4">Current Vector</th>
              <th className="px-4 py-4 text-right">Synthesized P/L</th>
              <th className="px-8 py-4 text-right">Command</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {positions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center text-muted font-medium italic opacity-50">
                   No active institutional positions detected in current session.
                </td>
              </tr>
            ) : (
              positions.map((pos) => {
                const isProfit = pos.unrealizedPnl >= 0;
                return (
                  <tr key={pos.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5 font-black text-main tracking-tight uppercase">{pos.symbol}</td>
                    <td className="px-4 py-5">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border font-black text-[10px] uppercase tracking-widest ${
                        pos.direction === 'long'
                          ? 'bg-mint-bright/10 border-mint-bright/20 text-mint-bright shadow-[0_0_15px_rgba(53,208,163,0.1)]'
                          : 'bg-danger/10 border-danger/20 text-danger shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                      }`}>
                        {pos.direction === 'long' ? <Zap size={10} className="fill-current" /> : <ShieldCheck size={10} />}
                        {pos.direction}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center font-black text-dim tabular-nums">{pos.lotSize.toFixed(2)}</td>
                    <td className="px-4 py-5 font-black text-muted tabular-nums">{pos.entryPrice.toFixed(5)}</td>
                    <td className="px-4 py-5 font-black text-main tabular-nums">{pos.currentPrice.toFixed(5)}</td>
                    <td className={`px-4 py-5 text-right font-black tabular-nums tracking-tight text-lg ${isProfit ? 'text-mint-bright' : 'text-danger'}`}>
                      {isProfit ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-danger/10 hover:text-danger text-muted rounded-xl transition-all group/btn">
                          <XCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button className="p-2 hover:bg-white/5 text-muted rounded-xl transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
};
