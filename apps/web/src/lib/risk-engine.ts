import { supabase } from "./supabase";

export interface RiskMetrics {
  currentExposure: number;
  portfolioExposurePercent: number;
  openTradeCount: number;
  dailyDrawdownPercent: number;
  marginLevel: number;
  riskPerTrade: Record<string, number>;
}

export class RealTimeRiskEngine {
  private static instance: RealTimeRiskEngine;

  private constructor() {}

  static getInstance(): RealTimeRiskEngine {
    if (!RealTimeRiskEngine.instance) {
      RealTimeRiskEngine.instance = new RealTimeRiskEngine();
    }
    return RealTimeRiskEngine.instance;
  }

  async calculateRisk(brokerAccountId: string): Promise<RiskMetrics> {
    // 1. Get Live Account Info
    const { data: liveAccount } = await supabase
      .from('live_accounts')
      .select('*')
      .eq('broker_account_id', brokerAccountId)
      .single();

    // 2. Get Open Positions
    const { data: positions } = await supabase
      .from('open_positions')
      .select('*')
      .eq('broker_account_id', brokerAccountId);

    if (!liveAccount) throw new Error("Live account data not found");

    const totalExposure = (positions || []).reduce((sum, pos) => sum + (pos.lot_size * pos.current_price), 0);
    const exposurePercent = (totalExposure / liveAccount.equity) * 100;

    const metrics: RiskMetrics = {
      currentExposure: totalExposure,
      portfolioExposurePercent: exposurePercent,
      openTradeCount: (positions || []).length,
      dailyDrawdownPercent: (Math.abs(liveAccount.daily_pnl) / liveAccount.balance) * 100,
      marginLevel: liveAccount.margin_level || 0,
      riskPerTrade: {}
    };

    // Store snapshot
    await supabase.from('risk_snapshots').insert({
      organization_id: liveAccount.organization_id,
      broker_account_id: brokerAccountId,
      current_exposure: totalExposure,
      risk_percent: exposurePercent / 100,
      margin_usage_percent: (liveAccount.margin / liveAccount.equity),
      open_trade_count: metrics.openTradeCount,
      daily_drawdown_percent: metrics.dailyDrawdownPercent / 100
    });

    return metrics;
  }

  async checkViolations(brokerAccountId: string, proposedTrade: any): Promise<string[]> {
    const warnings: string[] = [];
    const metrics = await this.calculateRisk(brokerAccountId);

    // Placeholder logic for risk checks
    if (metrics.dailyDrawdownPercent > 5) {
      warnings.push("Daily drawdown limit exceeded (5%)");
    }

    if (metrics.openTradeCount >= 10) {
      warnings.push("Maximum open positions reached (10)");
    }

    return warnings;
  }
}
