import React from "react";
import { History, CheckCircle2, AlertCircle, Info } from "lucide-react";

export const TradingTimeline: React.FC<{ events: any[] }> = ({ events }) => {
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p>Audit History</p>
          <h2>Event Timeline</h2>
        </div>
        <History size={18} className="text-slate-500" />
      </div>
      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-800 before:via-slate-800 before:to-transparent">
        {events.length === 0 ? (
          <div className="py-4 text-center text-slate-500 text-sm">Waiting for events...</div>
        ) : (
          events.map((event, idx) => (
            <div key={idx} className="relative flex items-center gap-4">
              <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#0f172a] border-2 ${
                event.type === 'FIREWALL_PASSED' ? 'border-mint' :
                event.type.includes('VIOLATION') ? 'border-rose-500' : 'border-slate-700'
              }`}>
                {event.type === 'FIREWALL_PASSED' ? <CheckCircle2 size={14} className="text-mint" /> :
                 event.type.includes('VIOLATION') ? <AlertCircle size={14} className="text-rose-500" /> :
                 <Info size={14} className="text-slate-400" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">{event.type.replace(/_/g, ' ')}</span>
                <span className="text-[10px] text-slate-500">{new Date(event.occurred_at).toLocaleTimeString()} • {event.payload?.symbol || 'System'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
};
