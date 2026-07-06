import { supabase } from "./supabase";

export type PositionEventType =
  | 'BLUEPRINT_CREATED'
  | 'FIREWALL_PASSED'
  | 'ORDER_SUBMITTED'
  | 'ORDER_FILLED'
  | 'STOP_UPDATED'
  | 'PARTIAL_CLOSE'
  | 'FINAL_CLOSE'
  | 'AI_REVIEW_GENERATED'
  | 'DISCIPLINE_SCORE_UPDATED';

export class TradeTimelineManager {
  static async recordEvent(tradeId: string, eventType: PositionEventType, payload: any = {}) {
    await supabase.from('trade_event_history').insert({
      trade_event_id: tradeId,
      event_type: eventType,
      payload,
      occurred_at: new Date().toISOString()
    });
  }

  static async getTimeline(tradeId: string) {
    const { data } = await supabase
      .from('trade_event_history')
      .select('*')
      .eq('trade_event_id', tradeId)
      .order('occurred_at', { ascending: true });
    return data || [];
  }
}
