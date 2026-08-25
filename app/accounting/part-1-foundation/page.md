# পর্ব ১ — Accounting Foundation (Phase 1–5)

## PHASE 1 — Accounting Foundation

### Goal

Accounting-এর language বুঝতে হবে এবং transaction দেখেই affected accounts identify করতে পারতে হবে।

### Topics

#### 1.1 Accounting কী

শিখবেন:

- Accounting
- Bookkeeping
- Financial Accounting
- Management Accounting
- Cost Accounting
- Business Transaction
- Financial Transaction
- Accounting Period
- Fiscal Year

#### 1.2 Accounting Equation

মূল equation:

```text
Assets = Liabilities + Equity
```

Expanded form:

```text
Assets = Liabilities + Capital + Revenue - Expense - Drawings
```

Developer perspective:

প্রতিটি valid accounting transaction-এর পরে accounting equation logically balanced থাকতে হবে।

#### 1.3 Five Main Account Types

শিখবেন:

1. Asset
2. Liability
3. Equity
4. Revenue
5. Expense

প্রতিটি account-এর:

- meaning
- normal balance
- increase/decrease behavior
- financial statement impact

#### 1.4 Debit and Credit

Core rule:

| Account Type | Increase | Decrease | Normal Balance |
|---|---|---|---|
| Asset | Debit | Credit | Debit |
| Expense | Debit | Credit | Debit |
| Liability | Credit | Debit | Credit |
| Equity | Credit | Debit | Credit |
| Revenue | Credit | Debit | Credit |

#### 1.5 Double Entry Accounting

প্রতিটি transaction:

```text
Total Debit = Total Credit
```

শিখবেন:

- Single transaction
- Compound journal
- Multiple debit lines
- Multiple credit lines

### Exercises

কমপক্ষে 50টি transaction manually solve করবেন।

Examples:

- Owner invested cash
- Rent paid
- Laptop purchased
- Customer invoice raised
- Customer payment received
- Supplier bill received
- Supplier paid
- Salary accrued
- Salary paid
- Advance received

### Exit Criteria

আপনি কোনো basic transaction দেখে 30–60 seconds-এর মধ্যে বলতে পারবেন:

- কোন accounts affected
- account type
- increase/decrease
- debit/credit
- basic journal entry

---

## PHASE 2 — Chart of Accounts Architecture

### Goal

Accounting software-এর backbone হিসেবে Chart of Accounts design বুঝতে হবে।

### Topics

#### 2.1 Chart of Accounts

শিখবেন:

- Account Code
- Account Name
- Account Type
- Account Group
- Parent Account
- Child Account
- Control Account
- Posting Account
- Header Account
- System Account

Typical hierarchy:

```text
1000 Assets
  1100 Current Assets
    1110 Cash
    1120 Bank
    1130 Accounts Receivable
    1140 Inventory

2000 Liabilities
  2100 Accounts Payable
  2200 Salary Payable

3000 Equity
4000 Revenue
5000 Expenses
```

#### 2.2 Hierarchical COA Design

Understand:

```text
Account Group
    ↓
Sub Group
    ↓
Control Account
    ↓
Posting Account
```

#### 2.3 Database Design

Suggested fields:

```text
accounts
--------
id
company_id
code
name
parent_id
account_type
normal_balance
level
is_postable
is_control_account
allow_manual_posting
system_account_key
is_active
```

#### 2.4 Account Tree Rules

Study:

- Parent cannot be its own child
- Circular reference prevention
- Posting only into leaf accounts
- Account code uniqueness
- System account protection
- Inactive account behavior

#### 2.5 Account Mapping

Hard-coded account IDs avoid করবেন।

Example configuration:

```text
default_cash_account
default_bank_account
accounts_receivable
accounts_payable
inventory_asset
salary_expense
salary_payable
tax_payable
sales_revenue
```

### Project

Design a multi-company configurable Chart of Accounts module.

### Exit Criteria

আপনি independently COA schema, hierarchy rules এবং system-account mapping design করতে পারবেন।

---

## PHASE 3 — Journal Entry & Posting Engine

### Goal

Accounting engine-এর heart বুঝতে হবে।

### Topics

#### 3.1 Journal Entry

Journal Header:

```text
journal_entries
---------------
id
company_id
voucher_no
posting_date
document_date
reference
description
source_type
source_id
status
```

Journal Lines:

```text
journal_lines
-------------
id
journal_entry_id
account_id
debit
credit
description
```

#### 3.2 Journal Status

Recommended lifecycle:

```text
Draft
→ Submitted
→ Approved
→ Posted
→ Reversed
```

Important:

```text
Approved != Posted
```

#### 3.3 Posting Validation

Before posting:

- Journal has minimum 2 lines
- Debit > 0 or Credit > 0
- Same line should not have both debit and credit
- Total debit = total credit
- Period open
- Accounts active
- Posting allowed
- Source not already posted

#### 3.4 Atomic Posting

Conceptual flow:

```text
BEGIN

Validate source
Resolve accounting period
Resolve posting rules
Resolve accounts
Generate journal
Validate balance
Save journal
Save lines
Mark source as posted

COMMIT
```

On failure:

```text
ROLLBACK
```

#### 3.5 Posted Journal Immutability

Posted journal ideally:

- edit করা যাবে না
- delete করা যাবে না
- correction হবে reversal দিয়ে

### Project

Build a generic journal posting service.

Example interface:

```text
AccountingService.post(event)
```

### Exit Criteria

আপনি robust, transactional, validated journal posting flow design করতে পারবেন।

---

## PHASE 4 — General Ledger & Trial Balance

### Goal

Journal থেকে accounting reports derive করা শিখবেন।

### Topics

#### 4.1 General Ledger

Understand:

```text
Journal = transaction-wise
Ledger = account-wise
```

Ledger report:

```text
Date
Reference
Description
Debit
Credit
Running Balance
```

#### 4.2 Opening Balance

Need to handle:

- opening debit
- opening credit
- brought forward
- carried forward

#### 4.3 Running Balance

Normal balance অনুযায়ী balance logic বুঝবেন।

#### 4.4 Trial Balance

Fields:

```text
Account
Opening Debit
Opening Credit
Period Debit
Period Credit
Closing Debit
Closing Credit
```

Rule:

```text
Total Debit = Total Credit
```

#### 4.5 Ledger Storage vs Derived View

Study tradeoffs:

- compute from journal lines
- materialized ledger
- balance snapshots
- daily/monthly summaries

### Project

Create:

- General Ledger
- Account Statement
- Trial Balance

### Exit Criteria

Journal lines থেকে ledger ও trial balance correctly generate করতে পারবেন।

---

## PHASE 5 — Financial Statements

### Goal

Accounting transactions কীভাবে financial reports-এ impact করে তা বুঝতে হবে।

### Topics

#### 5.1 Income Statement

```text
Revenue
- Expenses
= Net Profit / Loss
```

#### 5.2 Balance Sheet

```text
Assets
=
Liabilities
+
Equity
```

#### 5.3 Cash Flow Statement

Sections:

- Operating Activities
- Investing Activities
- Financing Activities

#### 5.4 Statement of Changes in Equity

Study:

- opening equity
- profit/loss
- owner investment
- drawings/dividend
- closing equity

#### 5.5 Report Mapping

COA থেকে financial report structure mapping:

```text
Account
→ Account Group
→ Report Section
→ Financial Statement
```

### Developer Focus

Reports business transaction tables থেকে directly generate না করে accounting layer থেকে derive করার design বুঝুন।

### Exit Criteria

একটি journal entry P&L, Balance Sheet বা Cash Flow-এ কোথায় impact করবে তা explain করতে পারবেন।

---

