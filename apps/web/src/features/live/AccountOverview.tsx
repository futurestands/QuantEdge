import React from "react";
import { Wallet, TrendingUp, ShieldAlert, BarChart3 } from "lucide-react";

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
    { label: "Balance", value: `$${data.balance.toLocaleString()}`, icon: Wallet, color: "text-slate-400" },
    { label: "Equity", value: `$${data.equity.toLocaleString()}`, icon: TrendingUp, color: "text-mint" },
    { label: "Unrealized P/L", value: `$${data.unrealizedPnl.toLocaleString()}`, icon: BarChart3, color: data.unrealizedPnl >= 0 ? "text-mint" : "text-rose-500" },
    { label: "Margin Level", value: `${((data.equity / data.margin) * 100).toFixed(1)}%`, icon: ShieldAlert, color: "text-amber" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="panel p-4 flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs uppercase tracking-wider font-semibold">{stat.label}</span>
            <stat.icon size={16} />
          </div>
          <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
};
