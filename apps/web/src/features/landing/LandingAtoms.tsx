import React from "react";
import { Quote } from "lucide-react";

export const WorkflowStep = ({ icon: Icon, label, active }: any) => (
  <div className="flex flex-col items-center gap-6 group">
     <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center border-2 transition-all duration-700 ${active ? "bg-mint border-mint shadow-[0_20px_50px_rgba(53,208,163,0.3)] scale-110" : "bg-panel border-line group-hover:border-mint/50"}`}>
        <Icon size={40} className={active ? "text-ink" : "text-slate-500 group-hover:text-mint transition-colors"} />
     </div>
     <span className={`text-xs font-black uppercase tracking-[0.3em] ${active ? "text-mint" : "text-slate-500"}`}>{label}</span>
  </div>
);

export const PlatformStat = ({ label, value }: any) => (
  <div className="space-y-1">
     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{label}</span>
     <strong className="text-2xl font-black text-white">{value}</strong>
  </div>
);

export const Testimonial = ({ quote, author, role }: any) => (
  <div className="p-12 panel bg-panel/30 border-line/40 space-y-8 relative group hover:border-mint transition-all duration-700">
     <Quote size={40} className="text-mint opacity-20 absolute top-8 left-8 group-hover:opacity-40 transition-opacity" />
     <p className="text-lg font-medium text-slate-300 leading-relaxed italic relative z-10 text-left">"{quote}"</p>
     <div className="flex items-center gap-4 relative z-10 pt-4 text-left">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint to-slate-600" />
        <div><p className="font-black text-white">{author}</p><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{role}</p></div>
     </div>
  </div>
);

export const LandingCard = ({ icon: Icon, title, desc }: any) => (
  <div className="panel p-12 space-y-8 hover:border-mint transition-all duration-700 group bg-[#0b0f16]/40 backdrop-blur-xl relative overflow-hidden">
     <div className="absolute top-0 right-0 w-40 h-40 bg-mint/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-mint/10 transition-all duration-700" />
     <div className="w-16 h-16 bg-mint/5 border border-mint/20 rounded-3xl flex items-center justify-center text-mint group-hover:scale-110 group-hover:rotate-12 transition-all shadow-lg relative z-10">
        <Icon size={32} />
     </div>
     <div className="space-y-4 relative z-10 text-left">
        <h3 className="text-3xl font-black tracking-tighter">{title}</h3>
        <p className="text-slate-400 leading-relaxed font-medium">{desc}</p>
     </div>
  </div>
);

export const WhyRow = ({ icon: Icon, title, desc }: any) => (
  <div className="flex gap-8 group text-left">
     <div className="w-16 h-16 shrink-0 rounded-2xl bg-mint/10 flex items-center justify-center text-mint border border-mint/20 group-hover:scale-110 transition-all shadow-xl shadow-mint/5"><Icon size={28} /></div>
     <div className="space-y-2">
        <h4 className="text-2xl font-black text-white tracking-tighter">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
     </div>
  </div>
);
