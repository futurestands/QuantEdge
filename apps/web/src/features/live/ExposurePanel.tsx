import React from "react";
import { PieChart } from "lucide-react";

export const ExposurePanel: React.FC<{ exposure: Record<string, number> }> = ({ exposure }) => {
  const total = Object.values(exposure).reduce((a, b) => a + b, 0);

  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p>Risk Management</p>
          <h2>Exposure Distribution</h2>
        </div>
        <PieChart size={18} className="text-slate-500" />
      </div>
      <div className="space-y-4">
        {Object.entries(exposure).map(([symbol, value]) => {
          const percentage = total > 0 ? (value / total) * 100 : 0;
          return (
            <div key={symbol} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{symbol}</span>
                <span className="text-slate-200 font-medium">${value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-mint transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        {Object.keys(exposure).length === 0 && (
          <div className="py-4 text-center text-slate-500 text-sm">No exposure.</div>
        )}
      </div>
    </article>
  );
};
