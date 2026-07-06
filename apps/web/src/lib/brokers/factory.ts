import { BrokerProvider, BrokerAdapter } from "./types";
import { MT5Adapter } from "./adapters/mt5";

export class BrokerFactory {
  static getAdapter(provider: BrokerProvider): BrokerAdapter {
    switch (provider) {
      case 'mt5':
        return new MT5Adapter();
      case 'ctrader':
        // Placeholder for cTrader
        return new MT5Adapter() as any;
      case 'ibkr':
        // Placeholder for IBKR
        return new MT5Adapter() as any;
      case 'binance':
        // Placeholder for Binance
        return new MT5Adapter() as any;
      case 'csv':
        // Placeholder for CSV
        return new MT5Adapter() as any;
      default:
        throw new Error(`Unsupported broker provider: ${provider}`);
    }
  }
}
