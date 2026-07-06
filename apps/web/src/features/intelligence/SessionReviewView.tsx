import React from "react";
import { BookOpen, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";
import type { SessionReview } from "../../lib/types";

export const SessionReviewView = ({ reviews }: { reviews: SessionReview[] }) => {
  if (!reviews.length) return <div className="panel p-20 text-center text-slate-500">No session reviews recorded.</div>;

  return (
    <div className="grid gap-6">
      {reviews.map(review => (
        <article key={review.id} className="panel p-8 space-y-8">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400"><BookOpen size={20} /></div>
                 <h3 className="text-xl font-bold">Session Review • {new Date(review.created_at).toLocaleDateString()}</h3>
              </div>
              <div className="text-right">
                 <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Confidence</span>
                 <div className="text-lg font-black text-white">{review.confidence}/10</div>
              </div>
           </div>

           <p className="text-lg text-slate-300 leading-relaxed italic">"{review.summary}"</p>

           <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <h4 className="flex items-center gap-2 text-xs font-black uppercase text-mint tracking-widest"><CheckCircle size={14}/> Good Decisions</h4>
                 <div className="flex flex-wrap gap-2">
                    {review.good_decisions.map((d, i) => <span key={i} className="px-3 py-1 bg-mint/5 border border-mint/20 text-mint text-[10px] font-bold rounded-lg">{d}</span>)}
                 </div>
              </div>
              <div className="space-y-4">
                 <h4 className="flex items-center gap-2 text-xs font-black uppercase text-red-400 tracking-widest"><AlertTriangle size={14}/> Mistakes</h4>
                 <div className="flex flex-wrap gap-2">
                    {review.mistakes.map((m, i) => <span key={i} className="px-3 py-1 bg-red-500/5 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg">{m}</span>)}
                 </div>
              </div>
           </div>

           <div className="p-6 bg-ink rounded-2xl border border-line flex items-start gap-4">
              <Lightbulb size={24} className="text-yellow-500 shrink-0" />
              <div>
                 <h4 className="text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Key Lesson</h4>
                 <p className="text-sm text-slate-300">{review.lesson}</p>
              </div>
           </div>
        </article>
      ))}
    </div>
  );
};
