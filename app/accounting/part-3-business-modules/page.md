# পর্ব ৩ — Business Module Accounting (Phase 10–15)

## PHASE 10 — Inventory Accounting

### Goal

Stock quantity এবং financial value একসাথে understand করা।

### Topics

- Inventory Asset
- Purchase
- Goods Receipt
- Sales
- Issue
- Return
- Transfer
- Adjustment
- Damage
- Wastage
- COGS

#### Sales Accounting

Revenue posting:

```text
Accounts Receivable Dr
    Sales Revenue Cr
```

Cost posting:

```text
COGS Dr
    Inventory Cr
```

#### Valuation

Learn deeply:

- FIFO
- Weighted Average
- Specific Identification

#### Inventory Ledger

Need:

```text
product_id
warehouse_id
quantity_in
quantity_out
unit_cost
value
balance_qty
balance_value
```

#### Reconciliation

```text
Inventory Ledger Value
=
Inventory Asset GL
```

#### Architecture

```text
Inventory Transaction
        ↓
Stock Ledger
        ↓
Valuation Engine
        ↓
Accounting Event
        ↓
Journal
```

### Project

Build inventory valuation + accounting posting + reconciliation.

---

## PHASE 11 — Purchase Accounting

### Topics

Business lifecycle:

```text
Purchase Request
→ Purchase Order
→ Goods Receipt
→ Supplier Invoice
→ Payment
```

Important question:

কোন stage accounting event?

Usually:

```text
Purchase Request → No Journal
Purchase Order → No Journal
Goods Receipt → Maybe Accounting
Supplier Invoice → Accounting
Payment → Accounting
```

#### GRNI / Clearing

Goods received before invoice:

```text
Inventory Dr
    GRNI Cr
```

Invoice:

```text
GRNI Dr
Input Tax Dr
    Accounts Payable Cr
```

### Project

Design procure-to-pay accounting lifecycle.

---

## PHASE 12 — Payroll Accounting

### Goal

HRM/Payroll data এবং GL integration বুঝতে হবে।

### Topics

- Gross Salary
- Basic
- Allowance
- Deduction
- Tax
- PF
- Loan
- Advance
- Employer Contribution
- Salary Payable

#### Payroll Posting

Example:

```text
Salary Expense Dr
Allowance Expense Dr
Employer Contribution Expense Dr

    Tax Payable Cr
    PF Payable Cr
    Loan Receivable Cr
    Salary Payable Cr
```

Salary Payment:

```text
Salary Payable Dr
    Bank Cr
```

#### Architecture

```text
Attendance
→ Payroll Calculation
→ Payroll Approval
→ PAYROLL_POSTED
→ Accounting Engine
→ Journal
```

#### Important Separation

Payroll calculation এবং accounting posting একই responsibility নয়।

### Project

Build payroll-to-accounting integration.

---

## PHASE 13 — Fixed Asset Accounting

### Topics

- Acquisition
- Capitalization
- Useful Life
- Residual Value
- Depreciation
- Accumulated Depreciation
- Revaluation
- Impairment
- Disposal
- Transfer

Asset Purchase:

```text
Fixed Asset Dr
    Cash/AP Cr
```

Depreciation:

```text
Depreciation Expense Dr
    Accumulated Depreciation Cr
```

#### Methods

- Straight Line
- Declining Balance
- Units of Production

#### Reconciliation

```text
Asset Register
=
Fixed Asset GL
```

#### Architecture

```text
Asset Register
     ↓
Depreciation Engine
     ↓
Accounting Event
     ↓
Journal
```

### Project

Build asset capitalization + depreciation + disposal accounting.

---

## PHASE 14 — Hospital Accounting

### Goal

Complex service-based accounting domain practice।

### Topics

Revenue streams:

- Consultation
- Diagnostic
- Pharmacy
- Bed
- Procedure
- Surgery
- Service Charge

Party/subledgers:

- Patient
- Doctor
- Insurance Company
- Corporate Client

Flow:

```text
Patient Registration
→ Service
→ Bill
→ Advance Adjustment
→ Due
→ Collection
→ Refund
```

#### Example Bill

```text
Patient Receivable Dr

    Consultation Revenue Cr
    Diagnostic Revenue Cr
    Pharmacy Revenue Cr
```

#### Patient Advance

```text
Cash Dr
    Patient Advance Liability Cr
```

#### Doctor Share

Study:

- revenue gross vs net
- payable to doctor
- commission/share liability

### Project

Design patient billing accounting engine.

---

## PHASE 15 — School Accounting

### Topics

- Admission Fee
- Tuition Fee
- Exam Fee
- Transport Fee
- Fine
- Waiver
- Scholarship
- Student Advance
- Student Receivable
- Refund

Fee Billing:

```text
Student Receivable Dr
    Tuition Revenue Cr
```

Collection:

```text
Cash/Bank Dr
    Student Receivable Cr
```

Advance:

```text
Cash Dr
    Student Advance Liability Cr
```

#### Reconciliation

```text
Student Outstanding
=
Student Receivable GL
```

### Project

Build student fee billing + collection + aging.

---

