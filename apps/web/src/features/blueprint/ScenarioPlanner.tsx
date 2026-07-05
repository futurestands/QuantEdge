import React, { useState } from "react";
import { Plus, Target, ShieldAlert, Zap } from "lucide-react";
import { createScenario } from "../../lib/dashboard";

export const ScenarioPlanner = ({ thesisId, scenarios, onUpdate }: any) => {
  const [label, setLabel] = useState("Scenario A");
  const [direction, setDirection] = useState("long");
  const [entry, setEntry] = useState(0);
  const [target, setTarget] = useState(0);
  const [invalidation, setInvalidation] = useState(0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await createScenario({
      blueprint_id: thesisId,
      label,
      direction: direction as any,
      entry_zone_price: entry,
      target_price: target,
      invalidation_price: invalidation,
      expected_rr: Math.abs(target - entry) / Math.max(Math.abs(entry - invalidation), 0.0001)
    });
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {scenarios?.map((s: any) => (
          <article key={s.id} className="panel p-6 border-line hover:border-mint transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase font-bold text-slate-500">{s.label}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${s.direction === 'long' ? 'bg-mint/10 text-mint' : 'bg-red-500/10 text-red-500'}`}>{s.direction}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Entry</span><strong>{s.entry_zone_price}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Target</span><strong className="text-mint">{s.target_price}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Invalidation</span><strong className="text-red-500">{s.invalidation_price}</strong></div>
            </div>
          </article>
        ))}
        <button className="panel p-6 border-dashed border-line flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-mint hover:border-mint transition-all">
          <Plus size={24} />
          <span className="text-xs font-bold uppercase">Add Scenario</span>
        </button>
      </div>

      <form className="tool-form panel p-8 bg-ink/50" onSubmit={handleAdd}>
        <div className="grid md:grid-cols-2 gap-6">
          <label><span>Title</span><input value={label} onChange={e => setLabel(e.target.value)} /></label>
          <label><span>Direction</span><select value={direction} onChange={e => setDirection(e.target.value)}><option value="long">Long</option><option value="short">Short</option></select></label>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <label><span>Entry Zone</span><input type="number" step="0.0001" value={entry} onChange={e => setEntry(Number(e.target.value))} /></label>
          <label><span>Target</span><input type="number" step="0.0001" value={target} onChange={e => setTarget(Number(e.target.value))} /></label>
          <label><span>Invalidation</span><input type="number" step="0.0001" value={invalidation} onChange={e => setInvalidation(Number(e.target.value))} /></label>
        </div>
        <button className="primary-button mt-4" type="submit"><Plus size={16} /> Save Scenario</button>
      </form>
    </div>
  );
};
