export type TradeDirection = "long" | "short";

export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'expired' | 'rejected';
export type PositionStatus = 'open' | 'closed' | 'liquidated';

export type LiveAccount = {
  id: string;
  broker_account_id: string;
  organization_id: string;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  margin_level: number | null;
  unrealized_pnl: number;
  daily_pnl: number;
  weekly_pnl: number;
  updated_at: string;
};

export type OpenPosition = {
  id: string;
  organization_id: string;
  broker_account_id: string;
  external_id: string;
  symbol: string;
  direction: TradeDirection;
  entry_price: number;
  current_price: number;
  lot_size: number;
  stop_loss: number | null;
  take_profit: number | null;
  unrealized_pnl: number;
  commission: number;
  swap: number;
  opened_at: string;
  updated_at: string;
};

export type Metric = {
  label: string;
  value: string;
  delta: string;
  status: "positive" | "neutral" | "danger";
};

export type Organization = {
  id: string;
  name: string;
};

export type TradeRow = {
  id: string;
  symbol: string;
  side: "long" | "short";
  entry_time: string;
  exit_time: string | null;
  pnl: number | null;
  session: string | null;
  strategy_id: string | null;
  trading_plan_id: string | null;
  trade_session_id: string | null;
  tradingview_url?: string;
  replay_link?: string;
};

export type TradingAccountType = "personal" | "demo" | "funded" | "prop_challenge";
export type MarketSessionType = "london" | "new_york" | "asian" | "overlap" | "all_day";
export type MoodType = "focused" | "calm" | "anxious" | "impatient" | "tired" | "overconfident";

export type TradingPlan = {
  id: string;
  organization_id: string;
  broker_account_id: string | null;
  strategy_version_id: string | null;
  name: string;
  description: string | null;
  account_type: TradingAccountType;
  risk_per_trade_percent: number;
  max_daily_loss_percent: number;
  max_weekly_loss_percent: number;
  max_total_loss_percent: number;
  max_trades_per_day: number;
  max_open_positions: number;
  minimum_risk_reward: number;
  allowed_symbols: string[];
  allowed_sessions: MarketSessionType[];
  news_filter_enabled: boolean;
  weekend_holding_allowed: boolean;
  checklist_required: boolean;
  psychology_notes: string | null;
  is_active: boolean;
  created_at: string;
};

export type TradeSession = {
  id: string;
  organization_id: string;
  trading_plan_id: string;
  broker_account_id: string | null;
  started_at: string;
  ended_at: string | null;
  market_session: MarketSessionType;
  mood_before: MoodType | null;
  confidence_before: number | null;
  sleep_hours: number | null;
  energy_level: number | null;
  stress_level: number | null;
  focus_level: number | null;
  distractions: string | null;
  trading_location: string | null;
  economic_events: string[];
  notes: string | null;
  session_rating: number | null;
  is_completed: boolean;
  created_at: string;
};

export type BacktestRow = {
  id: string;
  strategy_id: string;
  symbol: string;
  timeframe: string;
  metrics: Record<string, number>;
  status: string;
  created_at: string;
};

export type BacktestTradeRow = {
  id: string;
  backtest_id: string;
  trade_index: number;
  payload: {
    entry_time?: string;
    exit_time?: string;
    side?: "long" | "short";
    entry_price?: number;
    exit_price?: number;
    quantity?: number;
    pnl?: number;
    r_multiple?: number;
    reason?: string;
  };
};

export type JournalRow = {
  id: string;
  backtest_trade_id: string | null;
  emotion: string | null;
  notes: string | null;
  mistakes: string[];
  execution_quality: number | null;
  confidence_score: number | null;
  created_at: string;
};

export type RiskProfile = {
  id: string;
  organization_id: string;
  name: string;
  daily_loss_limit: number;
  weekly_loss_limit: number;
  max_drawdown_limit: number;
  max_losing_streak: number;
  risk_per_trade: number;
  prop_firm: string | null;
};

export type OptimizationRun = {
  id: string;
  strategy_id: string;
  objective: string;
  search_space: Record<string, unknown>;
  best_parameters: Record<string, unknown> | null;
  status: string;
  created_at: string;
};

export type StrategyRow = {
  id: string;
  name: string;
  rules: Record<string, unknown>;
  parameters: Record<string, unknown>;
  language: string;
  updated_at: string;
};

export type StrategyDraft = {
  name: string;
  entry: string;
  exit: string;
  emaFast: number;
  emaSlow: number;
  rsiPeriod: number;
  rsiMax: number;
  smaFast: number;
  smaSlow: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  bbPeriod: number;
  bbStd: number;
  stopLossAtr: number;
  takeProfitRr: number;
  riskPerTrade: number;
  initialBalance: number;
  direction: "long" | "short";
  session: "any" | "london" | "new_york" | "asian" | "overlap";
  spread: number;
  slippage: number;
  commissionPerTrade: number;
};

export type AiReport = {
  summary: string;
  findings: unknown[];
  scores: Record<string, unknown>;
  created_at: string;
};

export type ResearchStatus = "draft" | "running" | "completed" | "reviewed" | "optimized" | "approved" | "live_ready";

export type ResearchProject = {
  id: string;
  name: string;
  organization_id: string;
  strategy_id: string;
  market_symbol: string;
  timeframe: string;
  dataset_id?: string;
  version: string;
  status: ResearchStatus;
  notes: string;
  tags: string[];
  created_at: string;
  created_by: string;
  research_score: number;
  readiness_score: number;
  confidence_level: "low" | "medium" | "high";
  latest_backtest_id?: string;
};

export type ResearchVersion = {
  id: string;
  project_id: string;
  backtest_id: string;
  version_label: string;
  changes: string;
  metrics: Record<string, number>;
  created_at: string;
};

export type MarketScenarioStatus = 'waiting' | 'triggered' | 'executed' | 'invalidated' | 'missed';

export type MarketScenario = {
  id: string;
  blueprint_id: string;
  label: string;
  direction: "long" | "short";
  entry_zone_price: number;
  invalidation_price: number;
  target_price: number;
  expected_rr: number | null;
  confidence_level: number | null;
  probability_percent: number | null;
  status: MarketScenarioStatus;
  actual_accuracy_percent?: number;
  created_at: string;
};

export type MarketThesis = {
  id: string;
  organization_id: string;
  trading_plan_id: string;
  symbol: string;
  bias: "bullish" | "bearish" | "neutral" | null;
  market_regime: string | null;
  market_structure: Record<string, unknown>;
  liquidity_map: Record<string, unknown>;
  volume_profile: Record<string, unknown>;
  daily_goal: string | null;
  risk_budget_percent: number | null;
  preparation_score: number;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  scenarios?: MarketScenario[];
};

export type FirewallCheckStatus = 'PASS' | 'WARNING' | 'FAIL';

export type FirewallCheck = {
  id: string;
  label: string;
  status: FirewallCheckStatus;
  reason?: string;
  category: 'logic' | 'risk' | 'external';
};

export type AttemptedExecution = {
  id: string;
  organization_id: string;
  trading_plan_id: string;
  blueprint_id?: string;
  blueprint_scenario_id?: string;
  symbol: string;
  direction: "long" | "short";
  proposed_entry_price: number;
  proposed_lot_size: number;
  is_authorized: boolean;
  readiness_score: number;
  capital_protection_score: number;
  validation_results: FirewallCheck[];
  created_at: string;
};

export type DashboardData = {
  organization: Organization | null;
  latestStrategy: StrategyRow | null;
  latestBacktest: BacktestRow | null;
  metrics: Metric[];
  equity: Array<{ day: string; value: number }>;
  heatmap: string[][];
  aiSummary: string;
  scores: Array<[string, number]>;
  strategies: StrategyRow[];
  backtestTrades: BacktestTradeRow[];
  journals: JournalRow[];
  riskProfile: RiskProfile | null;
  optimizationRuns: OptimizationRun[];
  researchProjects: ResearchProject[];
  tradingPlans: TradingPlan[];
  activeSession: TradeSession | null;
  activeThesis: MarketThesis | null;
};

export type BacktestResult = {
  metrics: {
    net_profit: number;
    win_rate: number;
    profit_factor: number;
    expectancy: number;
    average_rr: number;
    max_drawdown: number;
    sharpe_ratio: number;
    sortino_ratio: number;
    calmar_ratio: number;
    recovery_factor: number;
    trade_count: number;
    average_trade: number;
    largest_winner: number;
    largest_loser: number;
    exposure: number;
    commission_paid: number;
    consecutive_wins: number;
    consecutive_losses: number;
    long_count: number;
    short_count: number;
    long_win_rate: number;
    short_win_rate: number;
  } & Record<string, number>;
  trades: Array<BacktestTradePayload>;
  ai_context: Record<string, unknown>;
  equity_curve: Array<{ index: number; value: number; drawdown: number }>;
};

export type BacktestTradePayload = {
  id?: string;
  trade_index: number;
  entry_time: string;
  exit_time: string;
  side: "long" | "short";
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl: number;
  r_multiple: number;
  reason: string;
  duration_minutes: number;
  max_favorable_excursion: number;
  max_adverse_excursion: number;
};

export type MarketDataset = {
  id: string;
  name: string;
  market: string;
  symbol: string;
  timeframe: string;
  start_at: string;
  end_at: string;
  candle_count: number;
  quality_score: number;
  has_spread: boolean;
  has_volume: boolean;
  missing_candles: number;
  created_at: string;
  owner: string;
};

export type BacktestCandle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type MarketOption = {
  symbolId: string;
  symbol: string;
  assetClass: string;
  venue: string | null;
  timeframe: string;
  candleCount: number;
  firstCandle: string;
  lastCandle: string;
};

export type BacktestRunConfig = {
  organizationId: string;
  strategy: StrategyRow;
  symbol: string;
  timeframe: string;
  startAt: string;
  endAt: string;
  candleCount: number;
};
