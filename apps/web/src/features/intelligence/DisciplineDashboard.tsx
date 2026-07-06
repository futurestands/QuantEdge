import React from "react";
import { ShieldAlert, TrendingUp, Target, Brain, Scale } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DisciplineScore } from "../../lib/types";

export const DisciplineDashboard = ({ scores }: { scores: DisciplineScore[] }) => {
  const latest = scores[0];
  const chartData = [...scores].reverse().map(s => ({
    date: new Date(s.created_at).toLocaleDateString(),
    score: s.overall_score
  }));

  if (!latest) return (
    <div className="panel py-20 text-center text-slate-500 border-dashed border-line">
       Establish a trading plan and complete a session to initialize discipline scoring.
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ScoreCard label="Execution" score={latest.execution_score} icon={Target} />
          <ScoreCard label="Risk" score={latest.risk_score} icon={ShieldAlert} />
          <ScoreCard label="Psychology" score={latest.psychology_score} icon={Brain} />
          <ScoreCard label="Planning" score={latest.planning_score} icon={Scale} />
          <article className="panel p-6 bg-mint/5 border-mint/20 text-center">
             <span className="text-[10px] uppercase font-black text-slate-500 block mb-2">Overall Grade</span>
             <div className="text-4xl font-black text-mint">{latest.grade}</div>
          </article>
       </div>

       <article className="panel p-8">
          <div className="panel-heading mb-8"><div><p>Trend</p><h2>Discipline History</h2></div><TrendingUp size={21} /></div>
          <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                   <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                   <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                   <Line type="monotone" dataKey="score" stroke="#35d0a3" strokeWidth={3} dot={{ r: 4, fill: '#35d0a3' }} activeDot={{ r: 6 }} />
                </LineChart>
             </ResponsiveContainer>
          </div>
       </article>
    </div>
  );
};

const ScoreCard = ({ label, score, icon: Icon }: any) => (
  <article className="panel p-6 space-y-3">
     <div className="flex justify-between items-start">
        <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">{label}</span>
        <Icon size={14} className="text-slate-600" />
     </div>
     <div className="text-2xl font-black text-white">{score}%</div>
     <div className="w-full h-1 bg-ink rounded-full overflow-hidden">
        <div className="h-full bg-mint" style={{ width: `${score}%` }} />
     </div>
  </article>
);
