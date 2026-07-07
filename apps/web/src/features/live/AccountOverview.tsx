import React from "react";
import { Wallet, TrendingUp, ShieldAlert, BarChart3, Activity, Target } from "lucide-react";

interface AccountOverviewProps {
  data: {
    balance: number;
    equity: number;
    margin: number;
    freeMargin: number;
    unrealizedPnl: number;
    dailyPnl: number;
  };
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({ data }) => {
  const stats = [
    { label: "Account Balance", value: `$${data.balance.toLocaleString()}`, icon: Wallet, color: "text-main", trend: 'up' },
    { label: "Current Equity", value: `$${data.equity.toLocaleString()}`, icon: TrendingUp, color: "text-mint-bright", trend: 'up' },
    { label: "Floating P/L", value: `$${data.unrealizedPnl.toLocaleString()}`, icon: Activity, color: data.unrealizedPnl >= 0 ? "text-mint-bright" : "text-danger", trend: data.unrealizedPnl >= 0 ? 'up' : 'down' },
    { label: "Operational Margin", value: `${((data.equity / data.margin) * 100).toFixed(0)}%`, icon: ShieldAlert, color: "text-amber", trend: 'up' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <article key={stat.label} className="panel p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] -rotate-12 translate-x-8 -translate-y-8 rounded-3xl group-hover:bg-white/[0.04] transition-all"></div>

          <div className="flex justify-between items-start mb-6 relative">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted group-hover:text-main transition-colors">
               <stat.icon size={18} />
            </div>
            <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
              stat.trend === 'up' ? 'border-mint-bright/20 text-mint-bright bg-mint-bright/5' : 'border-danger/20 text-danger bg-danger/5'
            }`}>
               Real-time
            </div>
          </div>

          <div className="relative">
            <span className="block text-[10px] font-black text-muted uppercase tracking-[0.15em] mb-1">{stat.label}</span>
            <div className={`text-2xl font-black tabular-nums tracking-tighter ${stat.color}`}>
               {stat.value}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
