import React from "react";
import { CheckCircle2 } from "lucide-react";

export const RiskStat = ({ label, value, icon: Icon, color }: any) => (
  <div className="panel p-6 bg-ink border-line/40 flex items-center gap-4 group hover:border-slate-500 transition-all">
     <div className={`w-12 h-12 rounded-xl bg-panel flex items-center justify-center ${color}`}><Icon size={24} /></div>
     <div><span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{label}</span><strong className="text-xl">{value}</strong></div>
  </div>
);

export const CompStat = ({ label, value, primary, danger }: any) => (
  <div className="p-4 panel bg-panel border-line/30">
     <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">{label}</span>
     <strong className={`text-xl ${primary ? "text-mint" : danger ? "text-red-500" : "text-white"}`}>{value}</strong>
  </div>
);

export const MetaRow = ({ label, value }: any) => (
  <div className="flex justify-between text-xs border-b border-line/30 pb-2"><span className="text-slate-500">{label}</span><span className="font-bold text-slate-300">{value}</span></div>
);

export const DataOption = ({ label, sub, icon: Icon, onClick, active, disabled }: any) => (
  <button onClick={onClick} disabled={disabled} className={`p-6 panel text-left transition-all relative overflow-hidden group ${active ? "border-mint bg-mint/5" : "hover:border-slate-500"} ${disabled ? "opacity-40 grayscale" : ""}`}>
     <div className="flex items-start justify-between mb-4">
        <Icon className={active ? "text-mint" : "text-slate-500 group-hover:text-slate-300"} size={22} />
        {active && <CheckCircle2 className="text-mint" size={16} />}
        {disabled && <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Soon</span>}
     </div>
     <strong className="block text-sm mb-1">{label}</strong>
     <p className="text-[10px] text-slate-500">{sub}</p>
  </button>
);

export const LabPreviewItem = ({ label, value, icon: Icon }: any) => (
  <div className="p-4 panel bg-panel border-line/40 flex items-center gap-4">
     <div className="w-10 h-10 rounded-lg bg-ink border border-line flex items-center justify-center text-slate-400"><Icon size={18} /></div>
     <div><span className="text-[10px] uppercase font-bold text-slate-500 block">{label}</span><strong className="text-xs">{value}</strong></div>
  </div>
);
