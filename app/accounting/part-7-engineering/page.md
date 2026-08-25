# পর্ব ৭ — Reporting, API ও Testing (Phase 32–35)

## PHASE 32 — Financial Report Engine Architecture

### Goal

Reusable reporting engine design করা।

Core reports:

- General Ledger
- Trial Balance
- P&L
- Balance Sheet
- Cash Flow
- Account Statement
- AR Aging
- AP Aging

Architecture:

```text
Journal Lines
      ↓
Query / Aggregation Layer
      ↓
Report Mapping
      ↓
Financial Report
```

Study:

- date filters
- opening/period/closing balance
- comparative reports
- branch filters
- department filters
- project filters
- drill-down
- caching
- snapshots

---

## PHASE 33 — Accounting API Design

Possible APIs:

```text
POST /journal-entries
GET /journal-entries
POST /journal-entries/{id}/post
POST /journal-entries/{id}/reverse

GET /ledger
GET /trial-balance
GET /profit-loss
GET /balance-sheet

GET /receivables
GET /payables
```

Internal service interface:

```text
AccountingService.post(event)
AccountingService.reverse(reference)
AccountingService.validate(event)
```

Study:

- command vs query separation
- validation error structure
- financial idempotency
- source references

---

## PHASE 34 — Accounting Testing Strategy

### Unit Tests

Test:

- debit/credit rules
- posting rule resolution
- account mapping
- rounding

### Integration Tests

Test complete flows:

```text
Invoice
→ Journal
→ Ledger
→ Trial Balance
→ AR
```

### Must-have Assertions

```text
total_debit == total_credit
```

```text
AR Subledger == AR GL
```

```text
Inventory Ledger == Inventory GL
```

Test scenarios:

- duplicate posting
- closed period
- inactive account
- reversal
- partial payment
- advance
- rounding
- concurrency

---

## PHASE 35 — Common Accounting Software Bugs

Learn to identify:

- Debit/Credit reversed
- Duplicate journal
- Unbalanced journal
- Hard-coded accounts
- Wrong posting date
- Wrong fiscal period
- Posted journal edited
- Posted transaction deleted
- AR/AP mismatch
- Inventory/GL mismatch
- Asset/GL mismatch
- Advance treated as revenue
- Expense treated as asset
- Tax duplicated
- Missing reversal
- Backdated posting after close
- Wrong currency conversion
- Wrong rounding

---

