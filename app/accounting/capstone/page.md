# Capstone — Generic Accounting Engine (Phase 36)

## PHASE 36 — Final Capstone: Generic Accounting Engine

### Goal

একটি reusable accounting core design/build করা যা multiple business modules support করতে পারে।

### Modules

```text
HRM / Payroll
Inventory
Purchase
Sales
Asset
Hospital
School
Billing
```

### Architecture

```text
Business Modules
      │
      ▼
Domain Events
      │
      ▼
Accounting Events
      │
      ▼
Posting Rule Engine
      │
      ├── Account Mapping
      ├── Dimension Resolution
      ├── Period Validation
      └── Balance Validation
      │
      ▼
Journal Entries
      │
      ▼
Journal Lines
      │
 ┌────┴────────┐
 ▼             ▼
Subledgers     General Ledger
 │             │
 └──────┬──────┘
        ▼
Reconciliation
        │
        ▼
Financial Reports
```

### Capstone Features

Must include:

- Multi-company
- Multi-branch
- Hierarchical COA
- Financial years
- Accounting periods
- Account mappings
- Posting rules
- Accounting events
- Journal posting
- Journal reversal
- Dimensions
- Customer subledger
- Supplier subledger
- Inventory integration
- Asset integration
- Payroll integration
- Period lock
- Audit trail
- Idempotency
- Trial Balance
- General Ledger
- P&L
- Balance Sheet
- Reconciliation

---

