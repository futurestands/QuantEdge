import { supabase } from "./supabase";

export class DisciplineGuardian {
  private static instance: DisciplineGuardian;

  private constructor() {}

  static getInstance(): DisciplineGuardian {
    if (!DisciplineGuardian.instance) {
      DisciplineGuardian.instance = new DisciplineGuardian();
    }
    return DisciplineGuardian.instance;
  }

  async auditTrade(tradeId: string): Promise<void> {
    const { data: trade } = await supabase
      .from('trade_events')
      .select('*, strategy_versions(rules)')
      .eq('id', tradeId)
      .single();

    if (!trade) return;

    const violations: any[] = [];

    // Example Audit Logic
    if (!trade.stop_loss) {
      violations.push({
        type: 'MISSING_STOP_LOSS',
        severity: 'CRITICAL',
        description: 'Trade entered without an active stop loss.'
      });
    }

    // Check against Blueprint/Strategy Rules if available
    // (This would be more complex in a real implementation)

    for (const v of violations) {
      await supabase.from('discipline_events').insert({
        organization_id: trade.organization_id,
        broker_account_id: trade.broker_account_id,
        trade_event_id: trade.id,
        violation_type: v.type,
        severity: v.severity,
        description: v.description
      });
    }
  }

  async recordViolation(orgId: string, brokerAccId: string, type: string, severity: string, description: string) {
    await supabase.from('discipline_events').insert({
      organization_id: orgId,
      broker_account_id: brokerAccId,
      violation_type: type,
      severity: severity,
      description: description
    });
  }
}
