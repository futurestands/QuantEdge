import React, { useState } from "react";
import { Play, Square, Coffee, Moon, Sun, Zap } from "lucide-react";
import { startTradeSession, endTradeSession } from "../../lib/dashboard";

export const SessionGuard = ({ activeSession, tradingPlan, organizationId, onUpdate }: any) => {
  const [mood, setMood] = useState("focused");
  const [confidence, setConfidence] = useState(8);

  const handleStart = async () => {
    if (!tradingPlan) return;
    await startTradeSession({
      organization_id: organizationId,
      trading_plan_id: tradingPlan.id,
      mood_before: mood as any,
      confidence_before: confidence,
      is_completed: false
    });
    onUpdate();
  };

  const handleEnd = async () => {
    if (!activeSession) return;
    await endTradeSession(activeSession.id, {
      session_rating: 9
    });
    onUpdate();
  };

  if (!tradingPlan) return <div className="panel p-8 text-center text-muted">Create a Trading Plan to enable Session Guard.</div>;

  return (
    <article className="panel">
      <div className="panel-heading">
        <div><p>Performance Context</p><h2>{activeSession ? "Active Session" : "Start your first trading session."}</h2></div>
        <Zap size={21} className={activeSession ? "text-mint animate-pulse" : "text-muted"} />
      </div>

      {!activeSession ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {['focused', 'calm', 'anxious'].map(m => (
              <button key={m} onClick={() => setMood(m)} className={`p-4 panel text-xs font-bold uppercase transition-all ${mood === m ? 'border-mint bg-mint/5 text-main' : 'text-muted hover:text-main'}`}>{m}</button>
            ))}
          </div>
          <label className="tool-form"><span>Pre-session Confidence (1-10)</span><input type="range" min="1" max="10" value={confidence} onChange={e => setConfidence(Number(e.target.value))} className="w-full h-2 bg-panel rounded-lg appearance-none cursor-pointer accent-mint" /></label>
          <button className="primary-button full-button h-14" onClick={handleStart}><Play size={18} /> Enter Trading Arena</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-mint/5 border border-mint/20 text-center">
            <p className="text-[10px] uppercase font-bold text-mint tracking-widest mb-1">Session Active</p>
            <h3 className="text-2xl font-bold text-main">{new Date(activeSession.started_at).toLocaleTimeString()}</h3>
          </div>
          <button className="secondary-button full-button h-14 border-red-500/30 text-danger hover:bg-danger/10" onClick={handleEnd}><Square size={18} /> End Session</button>
        </div>
      )}
    </article>
  );
};
