import React from "react";
import { ShieldAlert, TrendingUp, Target, Brain, Scale, History, ChevronRight, Activity, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DisciplineScore } from "../../lib/types";

export const DisciplineDashboard = ({ scores }: { scores: DisciplineScore[] }) => {
  const latest = scores[0];
  const chartData = [...scores].reverse().map(s => ({
    date: new Date(s.created_at).toLocaleDateString(),
    score: s.overall_score
  }));

  if (!latest) return (
    <div className="panel py-32 text-center text-muted border-dashed border-white/5 bg-[radial-gradient(circle_at_center,rgba(53,208,163,0.02),transparent_70%)] rounded-[32px]">
       <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-muted">
          <Activity size={28} strokeWidth={1.5} />
       </div>
       <p className="max-w-xs mx-auto font-medium leading-relaxed">
          Establish a trading plan and complete a session to initialize discipline scoring.
       </p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <ScoreCard label="Execution Node" score={latest.execution_score} icon={Target} />
          <ScoreCard label="Risk Protocol" score={latest.risk_score} icon={ShieldAlert} />
          <ScoreCard label="Psych Stability" score={latest.psychology_score} icon={Brain} />
          <ScoreCard label="Tactical Planning" score={latest.planning_score} icon={Scale} />
          <article className="panel p-8 bg-mint/5 border-mint/20 text-center flex flex-col justify-center items-center group overflow-hidden relative">
             <div className="absolute top-0 right-0 w-24 h-24 bg-mint/5 -rotate-12 translate-x-8 -translate-y-8 rounded-3xl group-hover:bg-mint/10 transition-all"></div>
             <span className="text-[10px] uppercase font-black text-mint-bright tracking-[0.2em] block mb-3 relative">Institutional Grade</span>
             <div className="text-6xl font-black text-mint-bright tracking-tighter relative">{latest.grade}</div>
             <div className="mt-4 px-3 py-1 bg-mint-bright/10 rounded-lg text-[9px] font-black text-mint-bright uppercase tracking-widest relative">
                Top 2% Performance
             </div>
          </article>
       </div>

       <div className="grid gap-8 lg:grid-cols-12">
          <article className="lg:col-span-8 panel p-10 group">
             <div className="panel-heading mb-10">
                <div>
                   <p>Historical Vector</p>
                   <h2>Behavioral Discipline Path</h2>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted group-hover:text-mint transition-colors">
                   <History size={20} />
                </div>
             </div>
             <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} fontWeight={800} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="var(--text-muted)" fontSize={10} fontWeight={800} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                           background: "rgba(13, 17, 23, 0.95)",
                           border: "1px solid rgba(255, 255, 255, 0.1)",
                           borderRadius: 12,
                           backdropFilter: "blur(10px)"
                        }}
                        itemStyle={{ color: "var(--mint-bright)", fontWeight: 800, fontSize: 12 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--mint-bright)"
                        strokeWidth={4}
                        dot={{ r: 6, fill: '#05070a', stroke: '#35d0a3', strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: '#35d0a3', shadow: '0 0 15px rgba(53,208,163,0.5)' }}
                        animationDuration={1500}
                      />
                   </LineChart>
                </ResponsiveContainer>
             </div>
          </article>

          <div className="lg:col-span-4 space-y-8">
             <article className="panel p-8 bg-gradient-to-br from-indigo/[0.03] to-transparent border-indigo/10">
                <div className="panel-heading mb-8">
                   <div>
                      <p>AI Audit</p>
                      <h2>Cognitive Feedback</h2>
                   </div>
                   <Brain className="text-indigo" size={24} />
                </div>
                <div className="space-y-6">
                   <div className="p-5 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo opacity-40"></div>
                      <p className="text-xs text-dim leading-relaxed font-medium italic italic">
                         "Execution precision is increasing across the iteration chain. Maintain risk protocol adherence to ensure capital longevity."
                      </p>
                   </div>
                   <button className="secondary-button w-full justify-between h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo/50 transition-all">
                      Full Behavioral Ledger <ChevronRight size={14} className="text-muted" />
                   </button>
                </div>
             </article>

             <div className="p-8 rounded-3xl bg-mint/5 border border-mint/10 flex items-center gap-6 group hover:border-mint/30 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-mint/10 flex items-center justify-center text-mint shadow-inner border border-mint/10 group-hover:scale-110 transition-transform">
                   <Zap size={28} className="fill-current" />
                </div>
                <div>
                   <h4 className="font-black text-mint-bright uppercase tracking-widest text-[10px] mb-1">Operational Ready</h4>
                   <p className="text-[11px] text-dim font-medium">Your discipline vector is 14% above institutional median.</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const ScoreCard = ({ label, score, icon: Icon }: any) => (
  <article className="panel p-8 space-y-6 hover:translate-y-[-4px] transition-all group">
     <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted group-hover:text-main transition-colors">
           <Icon size={18} />
        </div>
        <div className="text-3xl font-black text-main tabular-nums leading-none tracking-tight">{score}%</div>
     </div>
     <div className="space-y-3">
        <span className="text-[9px] uppercase font-black text-muted tracking-widest block">{label}</span>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
           <div className="h-full bg-gradient-to-r from-mint/40 to-mint shadow-[0_0_10px_rgba(53,208,163,0.3)]" style={{ width: `${score}%` }} />
        </div>
     </div>
  </article>
);
