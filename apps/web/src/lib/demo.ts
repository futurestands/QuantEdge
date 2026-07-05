import type { DashboardData, StrategyRow, BacktestRow, BacktestTradeRow, JournalRow, OptimizationRun, RiskProfile } from "./types";

export function buildDemoDashboard(): DashboardData {
  const demoOrg = { id: "demo-org", name: "Demo Workspace" };

  const demoStrategies: StrategyRow[] = [
    {
      id: "demo-strat-1",
      name: "EMA Pullback Trend",
      language: "visual",
      rules: {
        entry: "ema_20 > ema_50 and close crosses above ema_20",
        exit: "close crosses below ema_20",
        stop_loss_atr: 1.5,
        take_profit_rr: 2.5
      },
      parameters: { risk_per_trade: 0.01, initial_balance: 10000 },
      updated_at: new Date().toISOString()
    }
  ];

  const demoBacktests: BacktestRow[] = [
    {
      id: "demo-bt-1",
      strategy_id: "demo-strat-1",
      symbol: "EURUSD",
      timeframe: "1H",
      metrics: {
        net_profit: 2450,
        win_rate: 0.62,
        profit_factor: 1.85,
        max_drawdown: 0.042,
        expectancy: 122.5
      },
      status: "succeeded",
      created_at: new Date().toISOString()
    }
  ];

  const demoTrades: BacktestTradeRow[] = Array.from({ length: 40 }).map((_, i) => {
    const isWin = Math.random() > 0.4;
    const hourOffset = (i * 7) % 24; // Varying hours for session distribution
    return {
      id: `demo-trade-${i}`,
      backtest_id: "demo-bt-1",
      trade_index: i + 1,
      payload: {
        side: i % 3 === 0 ? "short" : "long",
        entry_time: new Date(Date.now() - (40 - i) * 3600000 * 4 + hourOffset * 3600000).toISOString(),
        exit_time: new Date(Date.now() - (40 - i) * 3600000 * 4 + (hourOffset + 1) * 3600000).toISOString(),
        pnl: isWin ? 150 + Math.random() * 300 : -100 - Math.random() * 50,
        r_multiple: isWin ? 1.5 + Math.random() * 2 : -1,
        reason: isWin ? "Take Profit" : "Stop Loss"
      }
    };
  });

  const demoJournals: JournalRow[] = [
    {
      id: "demo-j-1",
      backtest_trade_id: demoTrades[0].id,
      emotion: "Focused",
      notes: "Perfect entry on the pullback. Trend was strong.",
      mistakes: [],
      execution_quality: 9,
      confidence_score: 8,
      created_at: new Date().toISOString()
    }
  ];

  const demoRisk: RiskProfile = {
    id: "demo-risk",
    organization_id: "demo-org",
    name: "Conservative Demo",
    daily_loss_limit: 0.02,
    weekly_loss_limit: 0.05,
    max_drawdown_limit: 0.1,
    max_losing_streak: 5,
    risk_per_trade: 0.01,
    prop_firm: "FTMO Demo"
  };

  const demoProjects: ResearchProject[] = [
    {
      id: "demo-p-1",
      name: "EMA Pullback Research",
      organization_id: "demo-org",
      strategy_id: "demo-strat-1",
      market_symbol: "EURUSD",
      timeframe: "1H",
      version: "1.0",
      status: "completed",
      notes: "Baseline simulation successful.",
      tags: ["#Trend", "#EMA"],
      created_at: new Date().toISOString(),
      created_by: "demo-user",
      research_score: 72,
      readiness_score: 68,
      confidence_level: "medium",
      latest_backtest_id: "demo-bt-1"
    }
  ];

  return {
    organization: demoOrg,
    latestStrategy: demoStrategies[0],
    latestBacktest: demoBacktests[0],
    metrics: [
      { label: "Net Profit", value: "$2,450", delta: "+12.4%", status: "positive" },
      { label: "Win Rate", value: "62%", delta: "+2.1%", status: "positive" },
      { label: "Profit Factor", value: "1.85", delta: "+0.12", status: "positive" },
      { label: "Max Drawdown", value: "4.2%", delta: "-0.5%", status: "positive" }
    ],
    equity: Array.from({ length: 7 }).map((_, i) => ({
      day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      value: 10000 + i * 400 + Math.random() * 200
    })),
    heatmap: [
      ["London", "1.2R", "65%", "$1,200"],
      ["New York", "0.8R", "58%", "$850"],
      ["Asian", "0.2R", "45%", "$400"],
      ["Overlap", "1.5R", "70%", "$1,150"]
    ],
    aiSummary: "Your strategy shows a strong statistical edge during the London/NY overlap. Risk management is consistent, but consider tightening stops during low-volatility Asian sessions.",
    scores: [
      ["Discipline", 92],
      ["Execution", 88],
      ["Robustness", 75]
    ],
    strategies: demoStrategies,
    backtestTrades: demoTrades,
    journals: demoJournals,
    riskProfile: demoRisk,
    optimizationRuns: [],
    researchProjects: demoProjects
  };
}
