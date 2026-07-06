import React, { useState, useEffect } from "react";
import { AccountOverview } from "./AccountOverview";
import { OpenPositionsPanel } from "./OpenPositionsPanel";
import { OrdersPanel } from "./OrdersPanel";
import { ExposurePanel } from "./ExposurePanel";
import { TradingTimeline } from "./TradingTimeline";
import { BrokerConnectionManager } from "../../lib/brokers/manager";
import { RealTimeRiskEngine } from "../../lib/risk-engine";
import { Activity, ShieldCheck, Zap } from "lucide-react";

export const LiveTradeCenter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState({
    balance: 10000,
    equity: 10250,
    margin: 500,
    freeMargin: 9750,
    unrealizedPnl: 250,
    dailyPnl: 150
  });

  const [positions, setPositions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    // Simulation for Sprint 4
    const timer = setTimeout(() => {
      setLoading(false);
      setPositions([
        { id: '1', symbol: 'EURUSD', direction: 'long', lotSize: 0.1, entryPrice: 1.0850, currentPrice: 1.0875, unrealizedPnl: 25.00, openedAt: new Date().toISOString() },
        { id: '2', symbol: 'XAUUSD', direction: 'short', lotSize: 0.05, entryPrice: 2350.00, currentPrice: 2345.50, unrealizedPnl: 225.00, openedAt: new Date().toISOString() }
      ]);
      setTimeline([
        { type: 'FIREWALL_PASSED', occurred_at: new Date(Date.now() - 3600000).toISOString(), payload: { symbol: 'XAUUSD' } },
        { type: 'ORDER_FILLED', occurred_at: new Date(Date.now() - 3500000).toISOString(), payload: { symbol: 'XAUUSD' } },
        { type: 'BLUEPRINT_CREATED', occurred_at: new Date(Date.now() - 5000000).toISOString(), payload: { symbol: 'EURUSD' } }
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Initializing Live Trade Center...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-mint" /> Live Trading
          </h1>
          <p className="text-slate-400 mt-1">Real-time execution and monitoring. <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest ml-2">Broker Engine™</span></p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
            <div className="h-2 w-2 rounded-full bg-mint animate-pulse" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">MT5 Connected</span>
          </div>
          <button className="secondary-button !py-1.5"><ShieldCheck size={14} /> Risk Audit</button>
          <button className="primary-button !py-1.5"><Zap size={14} /> New Order</button>
        </div>
      </header>

      <AccountOverview data={accountData} />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <OpenPositionsPanel positions={positions} />
          <div className="grid md:grid-cols-2 gap-6">
            <OrdersPanel orders={orders} />
            <ExposurePanel exposure={{ 'EURUSD': 10875, 'XAUUSD': 117275 }} />
          </div>
        </div>
        <div className="space-y-6">
          <TradingTimeline events={timeline} />
          <article className="panel bg-mint/5 border-mint/20">
            <div className="panel-heading">
              <div>
                <p className="text-mint/80">Discipline Guardian™</p>
                <h2 className="text-mint">System Status</h2>
              </div>
              <ShieldCheck className="text-mint" size={20} />
            </div>
            <div className="text-sm text-slate-300 space-y-3">
              <p>Execution Firewall is <strong>ACTIVE</strong>.</p>
              <div className="p-3 bg-mint/10 rounded border border-mint/10 text-xs flex justify-between items-center">
                <span>Discipline Score (Today)</span>
                <span className="font-bold text-mint">98/100</span>
              </div>
              <p className="text-[10px] text-slate-400 italic">"You are trading within your plan parameters. No violations detected."</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
