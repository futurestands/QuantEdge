import React from "react";
import { Activity, ShieldCheck, Zap, Brain } from "lucide-react";
import type { TradeReview } from "../../lib/types";

export const TradeReviewView = ({ reviews }: { reviews: TradeReview[] }) => {
  if (!reviews.length) return <div className="panel p-20 text-center text-slate-500">No behavioral trade reviews recorded.</div>;

  return (
    <div className="grid gap-4">
      {reviews.map(review => (
        <article key={review.id} className="panel p-6 flex items-center justify-between border-line hover:border-mint transition-all">
           <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-panel rounded-xl flex items-center justify-center text-slate-400"><Activity size={24} /></div>
              <div className="space-y-1">
                 <h3 className="font-bold flex items-center gap-2">
                    Behavioral Review
                    <span className="text-[10px] px-2 py-0.5 bg-ink border border-line rounded uppercase text-slate-500">{review.emotion}</span>
                 </h3>
                 <p className="text-xs text-slate-500 line-clamp-1 italic">"{review.review}"</p>
              </div>
           </div>

           <div className="flex items-center gap-8">
              <ReviewStat label="Execution" value={review.execution_quality} />
              <ReviewStat label="Risk" value={review.risk_quality} />
              <ReviewStat label="Discipline" value={review.discipline_quality} />
              <div className="pl-6 border-l border-line">
                 <span className="text-[9px] uppercase font-bold text-slate-500 block">Mistake</span>
                 <span className="text-xs font-bold text-red-400 capitalize">{review.mistake_category || 'None'}</span>
              </div>
           </div>
        </article>
      ))}
    </div>
  );
};

const ReviewStat = ({ label, value }: any) => (
  <div className="text-center">
     <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">{label}</span>
     <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
           <div key={i} className={`w-1.5 h-3 rounded-full ${i < value ? 'bg-mint' : 'bg-ink border border-line'}`} />
        ))}
     </div>
  </div>
);
