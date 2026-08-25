# পর্ব ৬ — Reliability, Control ও Compliance (Phase 25–31)

## PHASE 25 — Accounting Audit Trail

### Goal

Every financial change traceable হতে হবে।

Track:

- created_by
- approved_by
- posted_by
- reversed_by
- timestamps
- source module
- source id
- reason
- before/after where relevant

Principle:

```text
Posted Financial Record = Immutable History
```

Study:

- append-only logs
- audit tables
- event logs
- database audit strategies

---

## PHASE 26 — Idempotency & Duplicate Posting Prevention

### Goal

এক business event যেন একাধিক journal তৈরি না করে।

Recommended uniqueness:

```text
company_id
source_type
source_id
event_type
```

or:

```text
idempotency_key
```

Example:

```text
Payment webhook received twice
→ only one journal
```

Study:

- API retry
- message retry
- webhook retry
- concurrent posting

### Project

Implement idempotent accounting posting.

---

## PHASE 27 — Database Transaction & Concurrency

### Topics

Use database transaction for financial posting.

```text
BEGIN

lock source
validate
create journal
create lines
update source
create audit record

COMMIT
```

Concurrency problems:

- double click
- two approvers
- duplicate webhook
- worker retry
- two background jobs

Study:

- row locks
- optimistic locking
- unique constraints
- transaction isolation

---

## PHASE 28 — Accounting Security & Permissions

### Important Permissions

```text
account.view
account.manage

journal.create
journal.approve
journal.post
journal.reverse

period.close
period.reopen

opening_balance.manage

financial_report.view
```

High-risk operations:

- posting
- reversal
- period reopening
- opening balance
- COA modification

Study:

- maker-checker
- segregation of duties
- approval matrix
- branch/company data access

---

## PHASE 29 — Tax Accounting Concepts for Developers

Country-specific implementation আলাদা হতে পারে, কিন্তু architecture বুঝুন।

Topics:

- VAT
- Input Tax
- Output Tax
- Withholding Tax
- Tax Payable
- Tax Receivable

Transaction structure:

```text
net_amount
tax_amount
gross_amount
```

Study:

- inclusive tax
- exclusive tax
- tax codes
- tax rates
- withholding
- rounding

---

## PHASE 30 — Multi-Currency Accounting

### Topics

- Base Currency
- Transaction Currency
- Exchange Rate
- Foreign Currency Balance
- Realized Gain/Loss
- Unrealized Gain/Loss

Journal line fields:

```text
currency_id
foreign_amount
exchange_rate
base_amount
```

Architecture:

```text
Transaction Amount
→ FX Conversion
→ Base Amount
→ Journal
```

---

## PHASE 31 — Opening Balance & Migration

### Topics

Migration of:

- Cash
- Bank
- AR
- AP
- Inventory
- Assets
- Accumulated Depreciation
- Loans
- Equity

Critical:

Opening journal must balance.

Need detail preservation:

```text
AR opening total
must match
individual customer outstanding total
```

Same for suppliers, inventory and assets.

### Project

Create opening-balance import and validation workflow.

---

