# পর্ব ৪ — Budget, Cost Center ও Subledger (Phase 16–18)

## PHASE 16 — Budget Accounting & Control

### Topics

- Budget
- Allocation
- Revision
- Transfer
- Reservation
- Commitment
- Encumbrance
- Consumption
- Available Budget

Formula:

```text
Available
=
Allocated
- Actual
- Committed
```

Important:

```text
Budget Event != Accounting Event
```

সব budget transaction financial journal তৈরি করবে না।

#### Architecture

```text
Budget
→ Reservation
→ Commitment
→ Actual Accounting Transaction
```

### Project

Design budget-control layer connected to accounting.

---

## PHASE 17 — Cost Center, Department, Branch & Project Accounting

### Goal

Enterprise reporting dimensions design করা।

Journal line dimensions:

```text
account_id
branch_id
department_id
cost_center_id
project_id
fund_id
```

Example:

```text
Salary Expense
Branch: Head Office
Department: IT
Cost Center: Software
Project: HRM
```

Study:

- mandatory dimensions
- optional dimensions
- account-specific dimensions
- validation rules
- reporting by dimension

### Project

Build multidimensional ledger reporting.

---

## PHASE 18 — Subledger Architecture

### Goal

General Ledger এবং detailed operational balances-এর separation বুঝতে হবে।

Common subledgers:

- Customer
- Supplier
- Employee
- Patient
- Student
- Inventory
- Asset

Architecture:

```text
Business Transaction
      ↓
Subledger
      ↓
Accounting Posting
      ↓
General Ledger
```

Critical reconciliation rules:

```text
Customer Subledger = AR GL
Supplier Subledger = AP GL
Inventory Ledger = Inventory GL
Asset Register = Fixed Asset GL
Payroll Payable = Salary Payable GL
```

### Project

Create generic reconciliation service.

---

