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
  Terminal
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

import { LandingView } from "./features/landing/LandingView";

import { MarketThesisWorkspace } from "./features/blueprint/MarketThesisWorkspace";
import { FirewallDashboard } from "./features/firewall/FirewallDashboard";

import { BuilderView } from "./features/strategy/BuilderView";
import { DisciplineView } from "./features/discipline/DisciplineView";

import "./styles.css";

// --- CONSTANTS ---
const appTabs = [
  { id: "dashboard", label: "Mission Control", icon: Gauge },
  { id: "thesis", label: "Market Thesis", icon: Terminal },
  { id: "firewall", label: "Pre-Trade Gateway", icon: ShieldCheck },
  { id: "journal", label: "Trading Journey", icon: BookOpen },
  { id: "projects", label: "Research Library", icon: FolderKanban },
  { id: "backtests", label: "Backtesting Lab", icon: Play },
  { id: "builder", label: "Strategies", icon: Braces },
  { id: "coach", label: "AI Coach", icon: Bot },
  { id: "reports", label: "Command Center", icon: WalletCards },
  { id: "risk", label: "Risk & Settings", icon: ShieldCheck }
] as const;

type AppTab = typeof appTabs[number]["id"];

// --- MAIN APP ---
function App() {
  const [mode, setMode] = useState<"landing" | "app">("app");
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
        const data = await loadDashboardData();
        setDashboard(data);
        if (data.riskProfile) {
          setRiskPlanName(data.riskProfile.name);
          setDailyLossLimit(data.riskProfile.daily_loss_limit * 100);
          setWeeklyLossLimit(data.riskProfile.weekly_loss_limit * 100);
          setMaxDrawdownLimit(data.riskProfile.max_drawdown_limit * 100);
          setRiskPlanRiskPerTrade(data.riskProfile.risk_per_trade * 100);
          setPropFirm(data.riskProfile.prop_firm ?? "");
        }
        const marketOptions = await listImportedMarkets();
        setMarkets(marketOptions);
        setSelectedStrategyId((current) => current || data.latestStrategy?.id || "");
        const firstMarket = marketOptions[0];
        if (firstMarket && !selectedMarketKey) {
          setSelectedMarketKey(`${firstMarket.symbolId}:${firstMarket.timeframe}`);
          setBacktestStartAt(toDateInputValue(firstMarket.firstCandle));
          setBacktestEndAt(toDateInputValue(firstMarket.lastCandle));
        }
        setMode("app");
      } else {
        setDashboard(buildDemoDashboard());
      }
      setStatus(session ? "Terminal Active" : "Guest Node");
    } catch (error) { setStatus("Error loading"); } finally { setIsLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);
  useEffect(() => { setEntryRule(`ema_fast > ema_slow and rsi < ${rsiMax}`); }, [rsiMax, emaFast, emaSlow, rsiPeriod]);

  async function handleEmailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Signing in...");
    try { await signInWithEmail(email, password); await refresh(); setIsAuthModalOpen(false); } catch (error) { setStatus("Sign in failed."); }
  }

  async function handleEmailSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Creating account...");
    try { await signUpWithEmail(email, password); setStatus("Check your email."); } catch (error) { setStatus("Sign up failed."); }
  }

  async function handleSignOut() { await signOut(); setIsSignedIn(false); setMode("landing"); setLastResult(null); setActiveProject(null); await refresh(); }

  async function handleCreateOrg(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!orgName) return;
    try { await createOrganization(orgName); await refresh(); } catch (error) { setStatus("Creation failed."); }
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
      await saveBacktestTradeJournal({ organizationId: dashboard.organization.id, backtestTradeId: (selectedTrade.id ?? selectedTrade.trade_index), emotion: journalEmotion, notes: journalNotes, mistakes: journalMistakes.split(","), executionQuality, confidenceScore });
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

  if (mode === "landing") {
    return <LandingView setMode={setMode} setIsAuthModalOpen={setIsAuthModalOpen} setAuthMode={setAuthMode} />;
  }

  if (isSignedIn && !data.organization) {
    return (
      <main className="min-h-screen bg-[#07090d] text-slate-100 grid place-items-center p-5">
        <section className="w-full max-w-md space-y-6">
          <div className="text-center"><h1 className="text-2xl font-bold">Welcome to QuantEdge</h1><p className="text-slate-400 mt-2">Let's set up your workspace to get started.</p></div>
          <div className="panel p-8"><form onSubmit={handleCreateOrg} className="tool-form"><label><span>Workspace Name</span><input value={orgName} onChange={(event) => setOrgName(event.target.value)} placeholder="e.g. My Trading Desk" required /></label><button className="primary-button full-button" type="submit">Create Workspace</button></form></div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink text-slate-100 flex overflow-hidden">
      <aside className="w-64 border-r border-line bg-[#0b0f16] flex flex-col py-6 shrink-0">
        <div className="px-6 mb-10"><button onClick={() => setMode("landing")} className="flex items-center gap-2 group"><div className="w-8 h-8 bg-mint rounded flex items-center justify-center group-hover:rotate-12 transition"><Terminal size={18} className="text-ink" /></div><span className="text-lg font-bold">QuantEdge</span></button></div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">{appTabs.map((tab) => { const Icon = tab.icon; return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-panel text-white border border-line" : "text-slate-400 hover:bg-panel hover:text-white"}`}><Icon size={18} className={activeTab === tab.id ? "text-mint" : ""} />{tab.label}</button>); })}</nav>
        <div className="px-3 border-t border-line pt-6">{isSignedIn ? (<button onClick={handleSignOut} className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-panel hover:text-white transition-colors"><LogOut size={18} /> Sign Out</button>) : (<button onClick={() => setIsAuthModalOpen(true)} className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-panel hover:text-white transition-colors"><User size={18} /> Sign In</button>)}</div>
      </aside>

      <section className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex min-h-16 items-center justify-between border-b border-line bg-ink/90 px-8 backdrop-blur z-20">
          <div className="flex items-center gap-4"><h2 className="text-lg font-semibold capitalize">{activeTab.replace("-", " ")}</h2>{!isSignedIn && <span className="bg-panel border border-line px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-slate-500 font-bold">Demo Mode</span>}</div>
          <div className="flex items-center gap-2">
            <button className="icon-button" onClick={refresh} disabled={isLoading}><RefreshCw size={18} className={isLoading ? "spin" : ""} /></button>
            {isSignedIn && <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-panel border border-line ml-2"><div className="w-5 h-5 rounded-full bg-mint flex items-center justify-center text-[10px] text-ink font-bold">{userEmail[0]?.toUpperCase()}</div><span className="text-xs font-medium text-slate-300">{userEmail.split('@')[0]}</span></div>}
            <button className="primary-button ml-2" onClick={() => { setActiveTab("backtests"); setLastResult(null); setActiveProject(null); }}><Play size={16} /> New Backtest</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid gap-6 p-8">
            {activeTab === "dashboard" && <DashboardView data={data} onNavigate={setActiveTab} />}
            {activeTab === "thesis" && <MarketThesisWorkspace data={data} refresh={refresh} />}
            {activeTab === "firewall" && <FirewallDashboard data={data} refresh={refresh} />}
            {activeTab === "journal" && <JournalView data={data} selectedTrade={selectedTrade} setSelectedTradeId={setSelectedTradeId} journalEmotion={journalEmotion} setJournalEmotion={setJournalEmotion} journalMistakes={journalMistakes} setJournalMistakes={setJournalMistakes} journalNotes={journalNotes} setJournalNotes={setJournalNotes} onSubmit={handleSaveJournal} activeProject={activeProject} formatMetric={formatMetric} />}
            {activeTab === "builder" && <BuilderView data={data} strategyName={strategyName} setStrategyName={setStrategyName} direction={direction} setDirection={setDirection} sessionFilter={sessionFilter} setSessionFilter={setSessionFilter} emaFast={emaFast} setEmaFast={setEmaFast} emaSlow={emaSlow} setEmaSlow={setEmaSlow} rsiPeriod={rsiPeriod} setRsiPeriod={setRsiPeriod} rsiMax={rsiMax} setRsiMax={setRsiMax} stopLossAtr={stopLossAtr} setStopLossAtr={setStopLossAtr} takeProfitRr={takeProfitRr} setTakeProfitRr={setTakeProfitRr} riskPerTrade={riskPerTrade} setRiskPerTrade={setRiskPerTrade} initialBalance={initialBalance} setInitialBalance={setInitialBalance} entryRule={entryRule} setEntryRule={setEntryRule} exitRule={exitRule} setExitRule={setExitRule} onSubmit={handleCreateStrategy} />}
            {activeTab === "discipline" && <DisciplineView data={data} refresh={refresh} />}
            {activeTab === "projects" && <ResearchLibrary data={data} onSelectProject={(p:any) => { setActiveProject(p); setActiveTab("backtests"); }} />}
            {activeTab === "discipline" && <DisciplineView data={data} refresh={refresh} />}
            {activeTab === "builder" && <BuilderView data={data} strategyName={strategyName} setStrategyName={setStrategyName} direction={direction} setDirection={setDirection} sessionFilter={sessionFilter} setSessionFilter={setSessionFilter} emaFast={emaFast} setEmaFast={setEmaFast} emaSlow={emaSlow} setEmaSlow={setEmaSlow} rsiPeriod={rsiPeriod} setRsiPeriod={setRsiPeriod} rsiMax={rsiMax} setRsiMax={setRsiMax} stopLossAtr={stopLossAtr} setStopLossAtr={setStopLossAtr} takeProfitRr={takeProfitRr} setTakeProfitRr={setTakeProfitRr} riskPerTrade={riskPerTrade} setRiskPerTrade={setRiskPerTrade} initialBalance={initialBalance} setInitialBalance={setInitialBalance} entryRule={entryRule} setEntryRule={setEntryRule} exitRule={exitRule} setExitRule={setExitRule} onSubmit={handleCreateStrategy} />}
            {activeTab === "backtests" && (<BacktestingLab data={data} markets={markets} isRunning={isRunning} onSubmit={handleRunBacktest} selectedStrategyId={selectedStrategyId} setSelectedStrategyId={setSelectedStrategyId} selectedMarketKey={selectedMarketKey} setSelectedMarketKey={setSelectedMarketKey} backtestStartAt={backtestStartAt} setBacktestStartAt={setBacktestStartAt} backtestEndAt={backtestEndAt} setBacktestEndAt={setBacktestEndAt} progress={backtestProgress} statusMessage={backtestStatus} lastResult={lastResult} setLastResult={setLastResult} isSignedIn={isSignedIn} onAuthRequired={() => setIsAuthModalOpen(true)} initialBalance={initialBalance} setInitialBalance={setInitialBalance} riskPerTrade={riskPerTrade} setRiskPerTrade={setRiskPerTrade} commission={commissionPerTrade} setCommission={setCommissionPerTrade} spread={spread} setSpread={setSpread} slippage={slippage} setSlippage={setSlippage} direction={direction} setDirection={setDirection} setActiveTab={setActiveTab} activeProject={activeProject} handleUpdateProjectStatus={handleUpdateProjectStatus} notes={projectNotes} setNotes={setProjectNotes} onSaveNotes={() => { if(activeProject) saveResearchProjectNotes(activeProject.id, projectNotes); }} formatMetric={formatMetric} />)}
            {activeTab === "imports" && <ImportsView csvSymbol={csvSymbol} setCsvSymbol={setCsvSymbol} csvTimeframe={csvTimeframe} setCsvTimeframe={setCsvTimeframe} setCsvFile={setCsvFile} handleCandleImport={handleCandleImport} setTradeCsvFile={setTradeCsvFile} handleTradeImport={handleTradeImport} />}
            {activeTab === "journal" && <JournalView data={data} selectedTrade={selectedTrade} setSelectedTradeId={setSelectedTradeId} journalEmotion={journalEmotion} setJournalEmotion={setJournalEmotion} journalMistakes={journalMistakes} setJournalMistakes={setJournalMistakes} journalNotes={journalNotes} setJournalNotes={setJournalNotes} onSubmit={handleSaveJournal} activeProject={activeProject} formatMetric={formatMetric} />}
            {activeTab === "edge" && <EdgeView data={data} edgeFinder={edgeFinder} formatMetric={formatMetric} />}
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
