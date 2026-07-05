# QuantEdge Database Architecture V3 (Institutional SaaS Standard)

## 1. Vision & Core Principles
This architecture is designed to support 100k+ users and millions of trades over a 10-year horizon. It prioritizes **Behavioral Intelligence**, **Security**, and **Scalability**.

- **Reasoning vs. Execution**: Decouples "Why" a trade was taken from "How" it was executed.
- **Contextual Awareness**: Captures account and market state snapshots at every critical lifecycle event.
- **Observability**: Comprehensive audit, system event logging, and feature flagging for SaaS operations.
- **AI Memory**: Persistent behavioral learning layer to track trader evolution.

---

## 2. Entity Relationship Groups

### 2.1 Identity & Access (IAM)
- `organizations`: Root tenant.
- `organization_members`: RBAC mapping.
- `api_keys`: Internal/External integration tokens.
- `feature_flags`: Per-organization feature toggles.

### 2.2 Infrastructure Layer
- `broker_connections`: Provider configurations.
- `broker_accounts`: Specific trading accounts.
- `account_snapshots`: Balance, equity, and margin history (Time-series).
- `webhooks`: Inbound broker notifications and outbound alerts (Discord/Slack).

### 2.3 Logic & Research
- `strategies`: Algorithm definitions.
- `strategy_versions`: Immutable rulesets.
- `research_projects`: Iterative exploration containers.
- `pre_trade_checklists`: Required confirmations per strategy version.

### 2.4 Execution & Journey (The Source of Truth)
- `trade_events`: Core execution record.
- `trade_event_history`: The immutable ledger (timeline).
- `trade_decisions`: Setup reasoning, bias, and confidence.
- `market_snapshots`: Spread, ATR, and volatility at entry.
- `trade_sessions`: Aggregated session-level behavioral data (London, NY, etc.).

### 2.5 Intelligence & Discipline
- `discipline_profiles`: The Rulebook.
- `rule_violations`: Permanent evidence of breaches.
- `discipline_scores`: Multi-dimensional temporal scoring.
- `discipline_streaks`: Consistency tracking and gamification.
- `ai_memory`: Recurring strengths/weaknesses and behavioral observations.
- `ai_reviews`: Deep analysis records.

### 2.6 System & Operations
- `system_events`: Job logs, sync status, and API usage.
- `audit_logs`: Enhanced security logs (IP, Device, Location).
- `notifications`: User alert center.
- `attachments`: Polymorphic media storage.
- `tags`: Global tagging system.

---

## 3. Migration Roadmap (Phased Implementation)

| Phase | Migration Group | Tables included |
|-------|-----------------|-----------------|
| 01 | Identity & Core | `organizations`, `members`, `audit_logs`, `tags`, `feature_flags` |
| 02 | Logic Layer | `strategies`, `strategy_versions`, `research_projects`, `checklists` |
| 03 | Infrastructure | `broker_connections`, `broker_accounts`, `account_snapshots`, `api_keys` |
| 04 | Execution Ledger | `trade_events`, `trade_event_history`, `market_snapshots`, `trade_decisions` |
| 05 | Behavioral | `trade_sessions`, `discipline_profiles`, `rule_violations`, `streaks` |
| 06 | Intelligence | `ai_reviews`, `ai_memory`, `discipline_scores` |
| 07 | Comms & Jobs | `notifications`, `webhooks`, `system_events`, `optimization_jobs` |
| 08 | Media & Reporting | `attachments`, `materialized_reporting_views` |

---

## 4. Performance & Scalability Considerations

### 4.1 Indexing Strategy
- **Partitioning**: Potential future partitioning of `trade_event_history` and `account_snapshots` by `created_at` (Time-series).
- **Organization Isolation**: Every index is prefixed or includes `organization_id` to ensure sub-millisecond RLS resolution.
- **Search**: GIN indexes on all `JSONB` fields for complex behavioral filtering.

### 4.2 Storage Estimates
- **Trades**: 1M trades with full history/snapshots ≈ 50GB.
- **Snapshots**: Daily account snapshots ≈ 10GB/year per 10k users.
- **Media**: Screen-captures stored in Object Storage (S3/Supabase Storage), not DB.

### 4.3 Risks
- **Write Amplification**: Trade events trigger multiple snapshot/decision entries. Mitigation: Use background workers for non-critical logging.
- **Snapshot Frequency**: Excessive account snapshots could bloat the DB. Mitigation: Throttled snapshots (e.g., max 1 per hour or on trade event).

---

## 5. Security & RLS
- **Helper Function**: `get_my_organizations(required_role)` will be the gatekeeper for all policies.
- **Write Policy**: `WITH CHECK (auth.uid() = created_by AND organization_id IN (SELECT get_my_organizations('editor')))`.
- **Read Policy**: `USING (organization_id IN (SELECT get_my_organizations('viewer')))`.

---

## 6. Archival Strategy
- **Cold Storage**: Trades older than 3 years move to `trade_archives` (Compressed/Aggregated).
- **Snapshot Aggregation**: Hourly account snapshots aggregated to Daily after 90 days.
