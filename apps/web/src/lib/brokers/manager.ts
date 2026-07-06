import { supabase } from "../supabase";
import { BrokerProvider, BrokerAdapter } from "./types";
import { BrokerFactory } from "./factory";

export class BrokerConnectionManager {
  private static instance: BrokerConnectionManager;
  private activeAdapters: Map<string, BrokerAdapter> = new Map();

  private constructor() {}

  static getInstance(): BrokerConnectionManager {
    if (!BrokerConnectionManager.instance) {
      BrokerConnectionManager.instance = new BrokerConnectionManager();
    }
    return BrokerConnectionManager.instance;
  }

  async connectBroker(organizationId: string, provider: BrokerProvider, credentials: any): Promise<string> {
    // 1. Create adapter
    const adapter = BrokerFactory.getAdapter(provider);

    // 2. Connect
    const success = await adapter.connect(credentials);
    if (!success) throw new Error("Failed to connect to broker");

    // 3. Store in DB (encrypted metadata should be handled by backend/Supabase vault if available,
    // here we just store the connection record)
    const { data, error } = await supabase
      .from('broker_connections')
      .insert({
        organization_id: organizationId,
        provider,
        status: 'connected',
        encrypted_credentials: { msg: "Credentials stored securely" } // Placeholder
      })
      .select()
      .single();

    if (error) throw error;

    this.activeAdapters.set(data.id, adapter);
    return data.id;
  }

  async disconnectBroker(connectionId: string): Promise<void> {
    const adapter = this.activeAdapters.get(connectionId);
    if (adapter) {
      await adapter.disconnect();
      this.activeAdapters.delete(connectionId);
    }

    await supabase
      .from('broker_connections')
      .update({ status: 'disconnected' })
      .eq('id', connectionId);
  }

  async refreshAccount(connectionId: string): Promise<void> {
    const adapter = this.activeAdapters.get(connectionId);
    if (!adapter) throw new Error("Broker not connected");

    const account = await adapter.getAccount();

    // Update live_accounts and broker_accounts
    const { data: brokerAccount } = await supabase
      .from('broker_accounts')
      .select('id')
      .eq('connection_id', connectionId)
      .eq('account_number', account.accountNumber)
      .single();

    if (brokerAccount) {
      await supabase
        .from('live_accounts')
        .upsert({
          broker_account_id: brokerAccount.id,
          organization_id: (await supabase.from('broker_connections').select('organization_id').eq('id', connectionId).single()).data?.organization_id,
          balance: account.balance,
          equity: account.equity,
          margin: account.margin,
          free_margin: account.freeMargin,
          updated_at: new Date().toISOString()
        });
    }
  }

  getAdapter(connectionId: string): BrokerAdapter | undefined {
    return this.activeAdapters.get(connectionId);
  }
}
