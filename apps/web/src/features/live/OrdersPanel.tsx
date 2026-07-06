import React from "react";
import { Clock, Trash2 } from "lucide-react";
import { BrokerOrder } from "../../lib/brokers/types";

export const OrdersPanel: React.FC<{ orders: BrokerOrder[] }> = ({ orders }) => {
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p>Execution</p>
          <h2>Pending Orders</h2>
        </div>
        <Clock size={18} className="text-slate-500" />
      </div>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="py-4 text-center text-slate-500 text-sm">No pending orders.</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 rounded bg-slate-800/20 border border-slate-800/50">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">{order.symbol} • {order.type.toUpperCase()}</span>
                <span className={`text-[10px] font-semibold ${order.direction === 'long' ? 'text-mint' : 'text-rose-400'}`}>
                  {order.direction.toUpperCase()} {order.lotSize} Lots
                </span>
              </div>
              <div className="text-right flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">@ {order.limitPrice || order.stopPrice}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{order.status}</span>
                </div>
                <button className="text-slate-500 hover:text-rose-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
};
