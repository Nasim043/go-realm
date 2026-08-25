# পর্ব ৫ — Accounting Engine Architecture (Phase 19–24)

## PHASE 19 — Accounting Event Architecture

### Goal

Business modules-কে accounting engine থেকে decouple করা।

Examples:

```text
PATIENT_BILL_FINALIZED
STUDENT_FEE_BILLED
PAYROLL_POSTED
ASSET_CAPITALIZED
SUPPLIER_INVOICE_POSTED
CUSTOMER_PAYMENT_RECEIVED
INVENTORY_ISSUED
```

Architecture:

```text
Business Module
      ↓
Domain Event
      ↓
Accounting Event
      ↓
Posting Engine
```

Event fields:

```text
event_type
source_type
source_id
company_id
event_date
amounts
dimensions
metadata
```

### Project

Design an AccountingEvent DTO/schema.

---

## PHASE 20 — Posting Rule Engine

### Goal

Debit/Credit logic hard-code না করে configurable করা।

Bad:

```text
if payroll:
    debit account 501
    credit account 201
```

Better:

```text
Event: PAYROLL_POSTED

Rules:
Salary Expense → Debit
Tax Payable → Credit
PF Payable → Credit
Salary Payable → Credit
```

Account resolution:

```text
Posting Rule
→ Account Mapping
→ Organization Configuration
→ Actual Account
```

Topics:

- Rule priority
- Conditional posting
- Dynamic amount calculation
- Multiple lines
- Tax lines
- Dimension resolution
- Missing mapping error

### Project

Build configurable posting-rule engine.

---

## PHASE 21 — Voucher Architecture

### Topics

Common voucher types:

- Journal Voucher
- Receipt Voucher
- Payment Voucher
- Contra Voucher
- Sales Voucher
- Purchase Voucher

Understand:

```text
Voucher UI
    ↓
Journal Entry
```

Voucher is often a business-facing abstraction, while journal is accounting source-of-truth.

---

## PHASE 22 — Accounting Period & Closing Architecture

### Topics

- Financial Year
- Accounting Period
- Open Period
- Closed Period
- Lock Date
- Reopen
- Adjustment Period
- Year-end Closing

Validation flow:

```text
Posting Date
    ↓
Resolve Period
    ↓
Check Open/Closed
    ↓
Allow / Reject
```

#### Closing

Understand:

- Revenue/expense closing
- retained earnings
- opening balances
- carry forward

### Project

Build period locking and closing workflow.

---

## PHASE 23 — Reversal & Correction Architecture

### Goal

Posted financial history preserve করা।

Wrong:

```text
DELETE posted journal
```

Correct:

```text
Original Journal
→ Reversal Journal
→ Correct Journal
```

Store:

```text
reversal_of_id
reversed_by
reversed_at
reversal_reason
```

Study:

- full reversal
- partial reversal
- next-period reversal
- auto-reversing accrual

### Project

Implement journal reversal service.

---

## PHASE 24 — Reconciliation Architecture

### Topics

Reconcile:

```text
Bank Statement ↔ Bank GL

Customer Subledger ↔ AR GL

Supplier Subledger ↔ AP GL

Inventory Ledger ↔ Inventory GL

Asset Register ↔ Fixed Asset GL

Payroll Records ↔ Salary Payable GL
```

Need reports:

- expected balance
- GL balance
- difference
- drill-down
- unresolved exceptions

### Project

Create reconciliation dashboard/service.

---

