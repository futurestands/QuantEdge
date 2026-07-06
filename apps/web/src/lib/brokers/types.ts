import { TradeDirection } from "../types";

export type BrokerProvider = 'mt5' | 'mt4' | 'ibkr' | 'ctrader' | 'dx_trade' | 'tradelynx' | 'csv' | 'binance';

export interface BrokerAccount {
  id: string;
  accountNumber: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
}

export interface BrokerPosition {
  id: string;
  externalId: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  currentPrice: number;
  lotSize: number;
  stopLoss?: number;
  takeProfit?: number;
  unrealizedPnl: number;
  openedAt: string;
}

export interface BrokerOrder {
  id: string;
  externalId: string;
  symbol: string;
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  direction: TradeDirection;
  limitPrice?: number;
  stopPrice?: number;
  lotSize: number;
  status: 'pending' | 'filled' | 'cancelled' | 'expired' | 'rejected';
  createdAt: string;
}

export interface BrokerTrade {
  id: string;
  externalId: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  pnl: number;
  commission: number;
  swap: number;
  entryTime: string;
  exitTime: string;
}

export interface BrokerAdapter {
  provider: BrokerProvider;
  connect(credentials: any): Promise<boolean>;
  disconnect(): Promise<void>;
  getAccount(): Promise<BrokerAccount>;
  getPositions(): Promise<BrokerPosition[]>;
  getOrders(): Promise<BrokerOrder[]>;
  getHistory(from: Date, to: Date): Promise<BrokerTrade[]>;
  placeOrder(order: Partial<BrokerOrder>): Promise<BrokerOrder>;
  cancelOrder(orderId: string): Promise<void>;
  closePosition(positionId: string): Promise<void>;
}
