# পর্ব ২ — Core Transaction Cycles (Phase 6–9)

## PHASE 6 — Accounts Receivable (AR)

### Goal

Customer/student/patient/company dues architecture বুঝতে হবে।

### Topics

- Customer/party
- Invoice
- Receivable
- Collection
- Partial Payment
- Advance
- Credit Note
- Refund
- Outstanding
- Aging

#### Basic Posting

Invoice:

```text
Accounts Receivable Dr
    Revenue Cr
```

Payment:

```text
Cash/Bank Dr
    Accounts Receivable Cr
```

Advance:

```text
Cash/Bank Dr
    Customer Advance Liability Cr
```

#### AR Subledger

Track:

```text
customer_id
invoice_id
debit
credit
outstanding
due_date
```

#### Aging

Buckets:

```text
0–30
31–60
61–90
90+
```

#### Reconciliation

Critical rule:

```text
SUM(Customer Outstanding)
=
Accounts Receivable GL Balance
```

### Project

Build customer invoice + payment + aging + reconciliation.

---

## PHASE 7 — Accounts Payable (AP)

### Goal

Supplier dues এবং payment lifecycle বুঝতে হবে।

### Topics

- Supplier
- Supplier Invoice
- Purchase Bill
- Payable
- Partial Payment
- Supplier Advance
- Purchase Return
- Debit Note
- Aging

Supplier Invoice:

```text
Inventory / Expense Dr
    Accounts Payable Cr
```

Payment:

```text
Accounts Payable Dr
    Bank Cr
```

#### Reconciliation

```text
SUM(Supplier Outstanding)
=
Accounts Payable GL Balance
```

### Project

Supplier bill + payment + payable aging + reconciliation.

---

## PHASE 8 — Cash & Bank Accounting

### Topics

- Cash Account
- Bank Account
- Petty Cash
- Receipt
- Payment
- Contra
- Bank Transfer
- Cheque
- Bank Charge
- Interest
- Reconciliation

#### Bank Transfer

```text
Destination Bank Dr
    Source Bank Cr
```

#### Bank Reconciliation

Compare:

```text
Bank Statement
vs
System Bank Ledger
```

Learn:

- outstanding cheque
- deposit in transit
- bank charge
- interest
- missing transaction
- duplicate transaction

### Project

Build bank reconciliation module.

---

## PHASE 9 — Revenue, Expense, Accrual & Prepaid

### Goal

Cash movement এবং accounting recognition-এর difference বুঝতে হবে।

### Topics

#### Revenue Recognition

Revenue earned but unpaid:

```text
Accounts Receivable Dr
    Revenue Cr
```

Advance received:

```text
Cash Dr
    Unearned Revenue Cr
```

Revenue recognized later:

```text
Unearned Revenue Dr
    Revenue Cr
```

#### Accrued Expense

Expense incurred but unpaid:

```text
Expense Dr
    Accrued Liability Cr
```

#### Prepaid Expense

Advance payment:

```text
Prepaid Expense Dr
    Cash Cr
```

Monthly recognition:

```text
Expense Dr
    Prepaid Expense Cr
```

### Exit Criteria

Cash flow এবং revenue/expense recognition গুলিয়ে ফেলবেন না।

---

