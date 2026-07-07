import React, { FormEvent, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  Gauge,
  FolderKanban,
  Play,
  Braces,
  BookOpen,
  Activity,
  FastForward,
  CandlestickChart,
  Bot,
  WalletCards,
  ShieldCheck,
  LogOut,
  User,
  RefreshCw,
  Terminal,
  ShieldAlert,
  Moon,
  Sun,
  Search,
  Bell,
  Settings,
  ChevronRight,
  LayoutGrid
} from "lucide-react";
import { runSavedStrategyBacktest } from "./lib/backtester";
import { generateCoachReport } from "./lib/coach";
import {
  createOrganization,
  createStrategy,
  getSession,
  loadDashboardData,
  saveBacktestResult,
  saveBacktestTradeJournal,
  saveCoachReport,
  saveRiskProfile,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  createResearchProject,
  updateResearchStatus,
  saveResearchProjectNotes
} from "./lib/dashboard";
import { buildDemoDashboard } from "./lib/demo";
import { computeEdgeFinder } from "./lib/edge-finder";
import { importCandlesFromCsv, listImportedMarkets, loadCandlesForBacktest } from "./lib/market-data";
import { importTradesFromCsv } from "./lib/trade-import";
import {
  formatMetric,
  formatPercentValue,
  toDateInputValue,
  buildEquityFromTrades,
  calculateResearchScore,
  calculateReadinessScore
} from "./lib/utils";
import type {
  DashboardData,
  MarketOption,
  BacktestResult,
  ResearchProject,
  ResearchStatus,
  BacktestTradePayload
} from "./lib/types";
import { ErrorBoundary } from "./ErrorBoundary";

// Features
import { LandingView } from "./features/landing/LandingView";
import { DashboardView } from "./features/dashboard/DashboardView";
import { ResearchLibrary } from "./features/research/ResearchLibrary";
import { BacktestingLab } from "./features/research/BacktestingLab";
import { BuilderView } from "./features/strategy/BuilderView";
import { JournalView } from "./features/journal/JournalView";
import { EdgeView } from "./features/analytics/EdgeView";
import { CoachView } from "./features/analytics/CoachView";
import { ReportsView } from "./features/analytics/ReportsView";
import { RiskView } from "./features/risk/RiskView";
import { ImportsView } from "./features/research/ImportsView";
import { AuthModal } from "./features/auth/AuthModal";
import { DisciplineView } from "./features/discipline/DisciplineView";
import { MarketThesisWorkspace } from "./features/blueprint/MarketThesisWorkspace";
import { FirewallDashboard } from "./features/firewall/FirewallDashboard";
import { LiveTradeCenter } from "./features/live/LiveTradeCenter";
import { OptimizationView } from "./features/research/OptimizationView";

import "./styles.css";

// --- CONSTANTS ---
const navigationGroups = [
  {
    title: "Mission Control",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutGrid, subtitle: "Operational overview" },
      { id: "live", label: "Live Trading", icon: Activity, subtitle: "Monitor & Execute" }
    ]
  },
  {
    title: "Research",
    items: [
      { id: "thesis", label: "Market Analysis", icon: Terminal, subtitle: "Develop & validate ideas" },
      { id: "projects", label: "Research", icon: FolderKanban, subtitle: "Projects & studies" },
      { id: "backtests", label: "Backtesting", icon: Play, subtitle: "Test strategies" },
      { id: "optimization", label: "Strategy Optimizer", icon: FastForward, subtitle: "Improve performance" },
      { id: "imports", label: "Market Data", icon: CandlestickChart, subtitle: "Ingest datasets" }
    ]
  },
  {
    title: "Trading Journey",
    items: [
      { id: "firewall", label: "Trade Checklist", icon: ShieldCheck, subtitle: "Pre-trade validation" },
      { id: "journal", label: "Trading Journal", icon: BookOpen, subtitle: "Track & improve" },
      { id: "builder", label: "Strategy Builder", icon: Braces, subtitle: "Create & manage" }
    ]
  },
  {
    title: "Intelligence",
    items: [
      { id: "edge", label: "Opportunities", icon: Activity, subtitle: "High probability setups" },
      { id: "coach", label: "AI Coach", icon: Bot, subtitle: "Personal trading mentor" },
      { id: "reports", label: "Reports", icon: WalletCards, subtitle: "Performance analytics" }
    ]
  },
  {
    title: "Governance",
    items: [
      { id: "performance", label: "Discipline", icon: ShieldAlert, subtitle: "Behavioral metrics" },
      { id: "risk", label: "Settings", icon: Settings, subtitle: "System configuration" }
    ]
  }
] as const;

const allAppTabs = navigationGroups.flatMap(g => g.items);
type AppTab = typeof allAppTabs[number]["id"];


import { supabase } from "./lib/supabase";

// --- MAIN APP ---
function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  if (!supabase) {
    return (
      <div className="error-screen">
        <section>
          <p>QuantEdge System Error</p>
          <h1>Configuration Missing</h1>
          <span>Environment variables (VITE_SUPABASE_URL) are not set in Vercel.</span>
          <button type="button" onClick={() => window.location.reload()}>Retry Connection</button>
        </section>
      </div>
    );
  }

  const [mode, setMode] = useState<"landing" | "app">("landing");
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Strategy Builder State
  const [strategyName, setStrategyName] = useState("EMA Pullback");
  const [entryRule, setEntryRule] = useState("ema_fast > ema_slow and rsi < 65");
  const [exitRule, setExitRule] = useState("ema_fast < ema_slow");
  const [emaFast, setEmaFast] = useState(20);
  const [emaSlow, setEmaSlow] = useState(50);
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [rsiMax, setRsiMax] = useState(65);
  const [smaFast, setSmaFast] = useState(20);
  const [smaSlow, setSmaSlow] = useState(50);
  const [macdFast, setMacdFast] = useState(12);
  const [macdSlow, setMacdSlow] = useState(26);
  const [macdSignal, setMacdSignal] = useState(9);
  const [bbPeriod, setBbPeriod] = useState(20);
  const [bbStd, setBbStd] = useState(2);
  const [stopLossAtr, setStopLossAtr] = useState(1.5);
  const [takeProfitRr, setTakeProfitRr] = useState(2);
  const [riskPerTrade, setRiskPerTrade] = useState(1);
  const [initialBalance, setInitialBalance] = useState(10000);
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [sessionFilter, setSessionFilter] = useState<"any" | "london" | "new_york" | "asian" | "overlap">("any");
  const [spread, setSpread] = useState(0.0001);
  const [slippage, setSlippage] = useState(0);
  const [commissionPerTrade, setCommissionPerTrade] = useState(0);

  // Market Data State
  const [csvSymbol, setCsvSymbol] = useState("EURUSD");
  const [csvTimeframe, setCsvTimeframe] = useState("1H");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [tradeCsvFile, setTradeCsvFile] = useState<File | null>(null);
  const [markets, setMarkets] = useState<MarketOption[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState("");
  const [selectedMarketKey, setSelectedMarketKey] = useState("");
  const [backtestStartAt, setBacktestStartAt] = useState("");
  const [backtestEndAt, setBacktestEndAt] = useState("");

  // Journal State
  const [selectedTradeId, setSelectedTradeId] = useState("");
  const [journalEmotion, setJournalEmotion] = useState("Focused");
  const [journalMistakes, setJournalMistakes] = useState("");
  const [journalNotes, setJournalNotes] = useState("");
  const [executionQuality, setExecutionQuality] = useState(8);
  const [confidenceScore, setConfidenceScore] = useState(7);

  // Risk State
  const [riskPlanName, setRiskPlanName] = useState("Default Risk Plan");
  const [dailyLossLimit, setDailyLossLimit] = useState(4);
  const [weeklyLossLimit, setWeeklyLossLimit] = useState(8);
  const [maxDrawdownLimit, setMaxDrawdownLimit] = useState(10);
  const [riskPlanRiskPerTrade, setRiskPlanRiskPerTrade] = useState(1);
  const [propFirm, setPropFirm] = useState("");

  // Status & Auth
  const [status, setStatus] = useState("Connecting...");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [backtestProgress, setBacktestProgress] = useState<number | null>(null);
  const [backtestStatus, setBacktestStatus] = useState("");
  const [lastResult, setLastResult] = useState<BacktestResult | null>(null);
  const [activeProject, setActiveProject] = useState<ResearchProject | null>(null);
  const [projectNotes, setProjectNotes] = useState("");

  async function refresh() {
    setIsLoading(true);
    try {
      const session = await getSession();
      setIsSignedIn(Boolean(session));
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        const dashData = await loadDashboardData();
        setDashboard(dashData);
        if (dashData.riskProfile) {
          setRiskPlanName(dashData.riskProfile.name);
          setDailyLossLimit(dashData.riskProfile.daily_loss_limit * 100);
          setWeeklyLossLimit(dashData.riskProfile.weekly_loss_limit * 100);
          setMaxDrawdownLimit(dashData.riskProfile.max_drawdown_limit * 100);
          setRiskPlanRiskPerTrade(dashData.riskProfile.risk_per_trade * 100);
          setPropFirm(dashData.riskProfile.prop_firm ?? "");
        }
        const marketOptions = await listImportedMarkets();
        setMarkets(marketOptions);
        setSelectedStrategyId((current) => current || dashData.latestStrategy?.id || "");
        const firstMarket = marketOptions[0];
        if (firstMarket && !selectedMarketKey) {
          setSelectedMarketKey(`${firstMarket.symbolId}:${firstMarket.timeframe}`);
          setBacktestStartAt(toDateInputValue(firstMarket.firstCandle));
          setBacktestEndAt(toDateInputValue(firstMarket.lastCandle));
        }

        // Auto-switch to app if they have an org, otherwise stay on landing
        if (dashData.organization) {
          setMode("app");
        } else {
          setMode("landing");
        }
      } else {
        setDashboard(buildDemoDashboard());
        setMode("landing");
      }
      setStatus(session ? "Terminal Active" : "Guest Node");
    } catch (error) {
      setStatus("Error loading");
      setMode("landing");
    } finally { setIsLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);
  useEffect(() => { setEntryRule(`ema_fast > ema_slow and rsi < ${rsiMax}`); }, [rsiMax, emaFast, emaSlow, rsiPeriod]);

  async function handleEmailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Signing in...");
    try {
      await signInWithEmail(email, password);
      await refresh();
      setIsAuthModalOpen(false);
    } catch (error) { setStatus("Sign in failed."); }
  }

  async function handleEmailSignUp(onboardingData: {
    experience: string;
    style: string;
    assets: string[];
  }) {
    setIsSubmitting(true);
    setStatus("Creating account...");
    try {
      const { data, error } = await signUpWithEmail(email, password, onboardingData);
      if (error) throw error;

      if (data.session) {
        await refresh();
        setIsAuthModalOpen(false);
      } else {
        setStatus("Verification email sent. Please check your inbox.");
      }
    } catch (error: any) {
      setStatus(error.message || "Sign up failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() { await signOut(); setIsSignedIn(false); setMode("landing"); setLastResult(null); setActiveProject(null); await refresh(); }

  async function handleCreateOrg(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!orgName) return;
    setIsSubmitting(true);
    setStatus("Creating workspace...");
    try {
      await createOrganization(orgName);
      await refresh();
      setMode("app");
    } catch (error: any) {
      setStatus(error.message || "Creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRunBacktest() {
    if (!isSignedIn) { setIsAuthModalOpen(true); return; }
    const strategy = dashboard?.strategies.find((item) => item.id === selectedStrategyId);
    const market = markets.find((item) => `${item.symbolId}:${item.timeframe}` === selectedMarketKey);
    if (!dashboard?.organization?.id || !strategy || !market || !backtestStartAt || !backtestEndAt) { setStatus("Check settings."); return; }

    setIsRunning(true); setLastResult(null);
    try {
      setBacktestStatus("Initializing Lab..."); setBacktestProgress(10);
      const candles = await loadCandlesForBacktest(market.symbolId, market.timeframe, new Date(backtestStartAt).toISOString(), new Date(backtestEndAt).toISOString());
      setBacktestStatus("Calculating..."); setBacktestProgress(40);
      const result = await runSavedStrategyBacktest(strategy, candles);
      setBacktestProgress(80);
      const backtestId = await saveBacktestResult({ organizationId: dashboard.organization.id, strategy, symbol: market.symbol, timeframe: market.timeframe, startAt: backtestStartAt, endAt: backtestEndAt, candleCount: candles.length }, result);
      const projectId = await createResearchProject({ name: `${strategy.name} Research`, organization_id: dashboard.organization.id, strategy_id: strategy.id, market_symbol: market.symbol, timeframe: market.timeframe, latest_backtest_id: backtestId, research_score: calculateResearchScore(result.metrics), readiness_score: calculateReadinessScore(result.metrics), confidence_level: result.trades.length > 50 ? "high" : "medium" });
      setLastResult({ ...result, equity_curve: buildEquityFromTrades(result.trades) } as any);
      await refresh();
      const updatedData = await loadDashboardData();
      const newProject = updatedData.researchProjects.find(p => p.id === projectId);
      if (newProject) setActiveProject(newProject);
    } catch (error) { setStatus("Simulation failed"); } finally { setIsRunning(false); setBacktestProgress(null); }
  }

  async function handleCreateStrategy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSignedIn) { setIsAuthModalOpen(true); return; }
    if (!dashboard?.organization?.id) return;
    try {
      await createStrategy(dashboard.organization.id, { name: strategyName, entry: entryRule, exit: exitRule, emaFast, emaSlow, rsiPeriod, rsiMax, smaFast, smaSlow, macdFast, macdSlow, macdSignal, bbPeriod, bbStd, stopLossAtr, takeProfitRr, riskPerTrade: riskPerTrade / 100, initialBalance, direction, session: sessionFilter, spread, slippage, commissionPerTrade });
      await refresh(); setActiveTab("dashboard");
    } catch (error) { setStatus("Failed"); }
  }

  async function handleCandleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!csvFile) return;
    try { await importCandlesFromCsv(csvFile, csvSymbol, csvTimeframe); setCsvFile(null); await refresh(); } catch (e) { setStatus("Import failed"); }
  }

  async function handleTradeImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dashboard?.organization?.id || !tradeCsvFile) return;
    try { await importTradesFromCsv(tradeCsvFile, dashboard.organization.id); setTradeCsvFile(null); await refresh(); } catch (e) { setStatus("Import failed"); }
  }

  async function handleSaveJournal() {
    if (!dashboard?.organization?.id || !selectedTrade) return;
    try {
      await saveBacktestTradeJournal({ organizationId: dashboard.organization.id, backtestTradeId: (selectedTrade.id ?? selectedTrade.trade_index).toString(), emotion: journalEmotion, notes: journalNotes, mistakes: journalMistakes.split(","), executionQuality, confidenceScore });
      setJournalNotes(""); await refresh();
    } catch (e) { setStatus("Journal failed"); }
  }

  async function handleSaveRiskProfile() {
    if (!dashboard?.organization?.id) return;
    try {
      await saveRiskProfile({ organizationId: dashboard.organization.id, name: riskPlanName, dailyLossLimit: dailyLossLimit / 100, weeklyLossLimit: weeklyLossLimit / 100, maxDrawdownLimit: maxDrawdownLimit / 100, maxLosingStreak: 6, riskPerTrade: riskPlanRiskPerTrade / 100, propFirm });
      await refresh();
    } catch (e) { setStatus("Risk save failed"); }
  }

  async function handleGenerateCoachReport() {
    if (!dashboard?.organization?.id || !data.latestBacktest) return;
    try {
      const report = generateCoachReport(data.latestBacktest as any, edgeFinder, data.journals);
      await saveCoachReport({ organizationId: dashboard.organization.id, subjectId: data.latestBacktest.id, report });
      await refresh();
    } catch (e) { setStatus("Coach failed"); }
  }

  const handleUpdateProjectStatus = async (projectId: string, nextStatus: ResearchStatus) => {
    try { await updateResearchStatus(projectId, nextStatus); await refresh(); } catch (e) {}
  };

  const data = dashboard ?? buildDemoDashboard();
  const edgeFinder = computeEdgeFinder(data.latestBacktest, data.backtestTrades, data.journals);
  const latestDrawdown = Number(data.latestBacktest?.metrics?.max_drawdown ?? 0) * 100;
  const drawdownStatus = latestDrawdown <= maxDrawdownLimit ? "Compliant" : "Breached";
  const selectedTrade = (lastResult?.trades.find((t:BacktestTradePayload) => (t.id ?? t.trade_index).toString() === selectedTradeId) as any) ?? data.backtestTrades.find((trade) => trade.id === selectedTradeId) ?? data.backtestTrades[0] ?? null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090d] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="text-mint animate-spin" size={40} />
        <div className="text-center">
          <h2 className="text-xl font-bold text-white tracking-tight">QuantEdge</h2>
          <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-widest">Initializing Terminal...</p>
        </div>
      </div>
    );
  }

  if (mode === "landing") {
    return <LandingView
      setMode={setMode}
      setIsAuthModalOpen={setIsAuthModalOpen}
      setAuthMode={setAuthMode}
      isSignedIn={isSignedIn}
    />;
  }

  if (isSignedIn && !data.organization) {
    return (
      <main className="min-h-screen bg-[#07090d] text-slate-100 grid place-items-center p-5">
        <section className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome to QuantEdge</h1>
            <p className="text-slate-400 mt-2">Initialize your institutional workspace.</p>
          </div>
          <div className="panel p-8">
            <form onSubmit={handleCreateOrg} className="tool-form">
              <label>
                <span>Workspace Name</span>
                <input
                  value={orgName}
                  onChange={(event) => setOrgName(event.target.value)}
                  placeholder="e.g. Alpha Trading Desk"
                  required
                  disabled={isSubmitting}
                />
              </label>
              <button
                className="primary-button full-button h-12"
                type="submit"
                disabled={isSubmitting || !orgName}
              >
                {isSubmitting ? <RefreshCw className="spin mr-2" size={16} /> : null}
                {isSubmitting ? "Creating..." : "Create Workspace"}
              </button>
            </form>
            <button
              onClick={() => setMode("landing")}
              className="w-full text-center text-xs text-muted hover:text-main transition mt-6 uppercase tracking-widest font-bold"
            >
              ← Back to Home
            </button>
            {status !== "Terminal Active" && (
              <p className="text-center text-xs text-rose-400 mt-4 font-mono uppercase">{status}</p>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink text-main flex overflow-hidden font-sans">
      {/* Institutional Sidebar */}
      <aside className="w-72 border-r border-line bg-sidebar flex flex-col shrink-0 z-30">
        <div className="p-8 pb-6">
          <button onClick={() => setMode("landing")} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-mint rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-mint/20">
              <Terminal size={22} className="text-ink" strokeWidth={3} />
            </div>
            <div className="text-left">
              <span className="block text-lg font-black tracking-tight text-main">QuantEdge</span>
              <span className="block text-[10px] text-muted font-bold uppercase tracking-widest">Research OS</span>
            </div>
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <h3 className="px-4 text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-3">{group.title}</h3>
              {group.items.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AppTab)}
                    className={`group flex items-center w-full gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-white/5 text-main shadow-sm border border-white/5"
                        : "text-muted hover:text-main hover:bg-white/5"
                    }`}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 transition-colors ${isActive ? "text-mint" : "group-hover:text-main"}`}>
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block leading-none">{tab.label}</span>
                      <span className="block text-[9px] text-muted/60 mt-1 font-medium group-hover:text-muted/80">{tab.subtitle}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-mint" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-6 space-y-3 border-t border-line bg-sidebar/30">
          <button
            onClick={toggleTheme}
            className="flex items-center w-full gap-3 px-4 py-2.5 rounded-xl text-xs font-black text-muted hover:bg-white/5 hover:text-main transition-all uppercase tracking-widest"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>

          {isSignedIn ? (
            <button
              onClick={handleSignOut}
              className="flex items-center w-full gap-3 px-4 py-2.5 rounded-xl text-xs font-black text-rose-400 hover:bg-rose-500/10 transition-all uppercase tracking-widest"
            >
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center w-full gap-3 px-4 py-2.5 rounded-xl text-xs font-black text-mint hover:bg-mint/10 transition-all uppercase tracking-widest"
            >
              <User size={16} /> Sign In
            </button>
          )}
        </div>
      </aside>

      <section className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Global Header */}
        <header className="flex min-h-[80px] items-center justify-between border-b border-line bg-ink/80 px-10 backdrop-blur-xl z-20">
          <div className="flex items-center gap-10 flex-1">
            <div className="relative w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-mint transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search research, strategies, symbols... (Ctrl+K)"
                className="w-full h-11 bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:border-mint/30 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted font-black uppercase tracking-widest">Market Status</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full shadow-glow animate-pulse ${data.activeSession ? 'bg-mint' : 'bg-amber'}`}></div>
                  <span className="text-xs font-bold text-main">{data.activeSession ? 'Live' : 'Standby'}</span>
                </div>
              </div>
              <div className="w-px h-8 bg-line"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted font-black uppercase tracking-widest">Net P/L</span>
                <span className={`text-sm font-black mt-0.5 ${data.metrics[0]?.status === 'positive' ? 'text-mint' : 'text-danger'}`}>
                  {data.metrics[0]?.value || "$0"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <Bell size={18} className="text-muted" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-ink"></span>
              </button>
              <button className="icon-button !rounded-xl" onClick={refresh} disabled={isLoading}>
                <RefreshCw size={18} className={isLoading ? "spin" : "text-muted"} />
              </button>
            </div>

            <div className="w-px h-8 bg-line mr-4"></div>

            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <span className="block text-sm font-black text-main tracking-tight leading-none">
                  {isSignedIn ? userEmail.split('@')[0] : "Guest User"}
                </span>
                <span className="block text-[10px] text-mint font-bold uppercase tracking-widest mt-1">
                  {data.riskProfile?.prop_firm || (isSignedIn ? "Pro Plan" : "Demo Mode")}
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-mint/20 to-indigo/20 border border-white/10 flex items-center justify-center group-hover:border-mint/50 transition-all overflow-hidden shadow-lg shadow-mint/10">
                {isSignedIn ? (
                  <span className="text-lg font-black text-mint">{userEmail[0]?.toUpperCase()}</span>
                ) : (
                  <User size={20} className="text-muted" />
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(0,242,254,0.03),transparent_40%)]">
          <div className="max-w-[1600px] mx-auto p-10">
            {activeTab === "dashboard" && <DashboardView data={data} onNavigate={setActiveTab} />}
            {activeTab === "live" && <LiveTradeCenter />}
            {activeTab === "thesis" && <MarketThesisWorkspace data={data} refresh={refresh} />}
            {activeTab === "firewall" && <FirewallDashboard data={data} refresh={refresh} />}
            {activeTab === "projects" && <ResearchLibrary data={data} onSelectProject={(p:any) => { setActiveProject(p); setActiveTab("backtests"); }} onNavigate={setActiveTab} />}
            {activeTab === "performance" && <DisciplineView data={data} refresh={refresh} />}
            {activeTab === "builder" && <BuilderView data={data} strategyName={strategyName} setStrategyName={setStrategyName} direction={direction} setDirection={setDirection} sessionFilter={sessionFilter} setSessionFilter={setSessionFilter} emaFast={emaFast} setEmaFast={setEmaFast} emaSlow={emaSlow} setEmaSlow={setEmaSlow} rsiPeriod={rsiPeriod} setRsiPeriod={setRsiPeriod} rsiMax={rsiMax} setRsiMax={setRsiMax} stopLossAtr={stopLossAtr} setStopLossAtr={setStopLossAtr} takeProfitRr={takeProfitRr} setTakeProfitRr={setTakeProfitRr} riskPerTrade={riskPerTrade} setRiskPerTrade={setRiskPerTrade} initialBalance={initialBalance} setInitialBalance={setInitialBalance} entryRule={entryRule} setEntryRule={setEntryRule} exitRule={exitRule} setExitRule={setExitRule} onSubmit={handleCreateStrategy} />}
            {activeTab === "backtests" && (<BacktestingLab data={data} markets={markets} isRunning={isRunning} onSubmit={handleRunBacktest} selectedStrategyId={selectedStrategyId} setSelectedStrategyId={setSelectedStrategyId} selectedMarketKey={selectedMarketKey} setSelectedMarketKey={setSelectedMarketKey} backtestStartAt={backtestStartAt} setBacktestStartAt={setBacktestStartAt} backtestEndAt={backtestEndAt} setBacktestEndAt={setBacktestEndAt} progress={backtestProgress} statusMessage={backtestStatus} lastResult={lastResult} setLastResult={setLastResult} isSignedIn={isSignedIn} onAuthRequired={() => setIsAuthModalOpen(true)} initialBalance={initialBalance} setInitialBalance={setInitialBalance} riskPerTrade={riskPerTrade} setRiskPerTrade={setRiskPerTrade} commission={commissionPerTrade} setCommission={setCommissionPerTrade} spread={spread} setSpread={setSpread} slippage={slippage} setSlippage={setSlippage} direction={direction} setDirection={setDirection} setActiveTab={setActiveTab} activeProject={activeProject} handleUpdateProjectStatus={handleUpdateProjectStatus} notes={projectNotes} setNotes={setProjectNotes} onSaveNotes={() => { if(activeProject) saveResearchProjectNotes(activeProject.id, projectNotes); }} formatMetric={formatMetric} />)}
            {activeTab === "imports" && <ImportsView csvSymbol={csvSymbol} setCsvSymbol={setCsvSymbol} csvTimeframe={csvTimeframe} setCsvTimeframe={setCsvTimeframe} setCsvFile={setCsvFile} handleCandleImport={handleCandleImport} setTradeCsvFile={setTradeCsvFile} handleTradeImport={handleTradeImport} />}
            {activeTab === "journal" && <JournalView data={data} selectedTrade={selectedTrade} setSelectedTradeId={setSelectedTradeId} journalEmotion={journalEmotion} setJournalEmotion={setJournalEmotion} journalMistakes={journalMistakes} setJournalMistakes={setJournalMistakes} journalNotes={journalNotes} setJournalNotes={setJournalNotes} onSubmit={handleSaveJournal} activeProject={activeProject} formatMetric={formatMetric} />}
            {activeTab === "edge" && <EdgeView data={data} edgeFinder={edgeFinder} formatMetric={formatMetric} />}
            {activeTab === "optimization" && <OptimizationView data={data} refresh={refresh} />}
            {activeTab === "coach" && <CoachView data={data} handleGenerateCoachReport={handleGenerateCoachReport} />}
            {activeTab === "reports" && <ReportsView data={data} />}
            {activeTab === "risk" && <RiskView data={data} riskPlanName={riskPlanName} setRiskPlanName={setRiskPlanName} dailyLossLimit={dailyLossLimit} setDailyLossLimit={setDailyLossLimit} weeklyLossLimit={weeklyLossLimit} setWeeklyLossLimit={setWeeklyLossLimit} maxDrawdownLimit={maxDrawdownLimit} setMaxDrawdownLimit={setMaxDrawdownLimit} riskPlanRiskPerTrade={riskPlanRiskPerTrade} setRiskPlanRiskPerTrade={setRiskPlanRiskPerTrade} handleSaveRiskProfile={handleSaveRiskProfile} drawdownStatus={drawdownStatus} latestDrawdown={latestDrawdown} />}
          </div>
        </div>
        {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} mode={authMode} onSwitchMode={setAuthMode} onSignIn={handleEmailSignIn} onSignUp={handleEmailSignUp} email={email} setEmail={setEmail} password={password} setPassword={setPassword} />}
      </section>
    </main>
  );
}

// --- RENDER ---
ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary><App /></ErrorBoundary>
);
