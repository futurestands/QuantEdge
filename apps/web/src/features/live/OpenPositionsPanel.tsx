import React from "react";
import { ArrowUpRight, ArrowDownRight, XCircle } from "lucide-react";
import { BrokerPosition } from "../../lib/brokers/types";

export const OpenPositionsPanel: React.FC<{ positions: BrokerPosition[] }> = ({ positions }) => {
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p>Live Monitoring</p>
          <h2>Open Positions</h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-800">
            <tr>
              <th className="pb-3 font-semibold">Symbol</th>
              <th className="pb-3 font-semibold">Side</th>
              <th className="pb-3 font-semibold">Size</th>
              <th className="pb-3 font-semibold">Entry</th>
              <th className="pb-3 font-semibold">Price</th>
              <th className="pb-3 font-semibold text-right">P/L</th>
              <th className="pb-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {positions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">No active positions.</td>
              </tr>
            ) : (
              positions.map((pos) => (
                <tr key={pos.id} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-medium text-slate-200">{pos.symbol}</td>
                  <td className="py-3">
                    <span className={`flex items-center gap-1 ${pos.direction === 'long' ? 'text-mint' : 'text-rose-400'}`}>
                      {pos.direction === 'long' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {pos.direction.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">{pos.lotSize}</td>
                  <td className="py-3 text-slate-400">{pos.entryPrice.toFixed(5)}</td>
                  <td className="py-3 text-slate-200">{pos.currentPrice.toFixed(5)}</td>
                  <td className={`py-3 text-right font-bold ${pos.unrealizedPnl >= 0 ? 'text-mint' : 'text-rose-500'}`}>
                    ${pos.unrealizedPnl.toFixed(2)}
                  </td>
                  <td className="py-3 text-right">
                    <button className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 rounded transition-all">
                      <XCircle size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
};
