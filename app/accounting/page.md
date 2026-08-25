# Accounting for Software Development

> লক্ষ্য: এমনভাবে Accounting শেখা যাতে HRM, Payroll, Inventory, Asset Management, Hospital, School, ERP, Billing, Procurement, Finance বা অন্য যেকোনো business application-এ accounting features confidently design, implement, test এবং review করা যায়।

এটি traditional accountant হওয়ার জন্য নয়। এটি **Software Developer / Software Architect**-এর perspective থেকে তৈরি।

পুরো বিষয়টি একটি বই হিসেবে লেখা হচ্ছে — ৩ Volume, ৬ Part, ৬২ অধ্যায়। শুরু করুন এখান থেকে:

- [**📖 The Book — Print Edition**](/accounting/book) — অধ্যায়ের তালিকা, লেখার অগ্রগতি ও print format
- [**Projects ও Exit Criteria**](/accounting/projects) — পড়ার পাশাপাশি যা বানাবেন, আর নিজেকে যাচাই করার মাপকাঠি
- [৬ মাসের Study Plan ও Routine](/accounting/study-plan) — month-by-month plan, daily/weekly routine, study method

---

## Final Capability: Requirement থেকে Report পর্যন্ত

আপনার final capability হওয়া উচিত — একটি business requirement দেখেই পুরো accounting chain mentally trace করতে পারা:

```text
Business Requirement
        ↓
Business Transaction
        ↓
Accounting Event
        ↓
Debit / Credit Logic
        ↓
Posting Rule
        ↓
Journal Entry
        ↓
Subledger
        ↓
General Ledger
        ↓
Reconciliation
        ↓
Financial Report
```

---

## বইয়ের কাঠামো

| Volume | Part | অধ্যায় | Focus |
| --- | --- | --- | --- |
| **Volume 1**<br/>Fundamentals & Core | Part 1 — Fundamentals | ১–১০ | Debit/Credit, COA, Journal, GL, Trial Balance |
| | Part 2 — Core Business Accounting | ১১–১৯ | Cash, Bank, AR, AP, Revenue, Accrual, Prepaid |
| | Part 3 — Financial Statements | ২০–২৬ | P&L, Balance Sheet, Cash Flow, Adjusting, Closing |
| **Volume 2**<br/>Accounting in Business Applications | Part 4 — Application-specific | ২৭–৩৫ | Inventory, Purchase, Payroll, Asset, Hospital, School, Budget, Cost Center |
| **Volume 3**<br/>Accounting Software Engineering | Part 5 — Architecture | ৩৬–৫৩ | Subledger, Event, Posting Rule Engine, Voucher, Period, Reversal, Reconciliation, Audit, Idempotency, Report, API, Testing, Capstone |
| | Part 6 — Advanced ERP | ৫৪–৬২ | Multi-currency, Tax, Cost Accounting, Manufacturing, Consolidation, Migration |

পূর্ণ অধ্যায়-তালিকা ও অগ্রগতি [বইয়ের পাতায়](/accounting/book)।

---

## Recommended Study Time

| বিষয় | পরিমাণ |
| --- | --- |
| প্রতিদিন | ২ ঘণ্টা |
| মোট সময় | ৫–৭ মাস |
| সপ্তাহে | ৬ দিন study + ১ দিন revision |
| পদ্ধতি | Theory + Exercise + Architecture + Implementation — parallel-ভাবে |

---

## 6-Month High-Level Timeline

```text
Month 1–2   Accounting Foundation + Core Accounting Flows
Month 3     Financial Statements + Inventory + Payroll + Asset Accounting
Month 4     Hospital + School + Budget Accounting
Month 5     Accounting Architecture + Posting Engine + Subledger + Reconciliation
Month 6     Advanced Accounting Architecture + Full Capstone Accounting System
```

| Month | Main Focus | Expected Outcome |
|---|---|---|
| Month 1 | Accounting equation, debit/credit, COA, journal | Basic accounting transaction confidently analyze করা |
| Month 2 | AR, AP, cash/bank, revenue, expense, accrual, prepaid | Common business accounting flows understand করা |
| Month 3 | Financial statements, inventory, payroll, asset | Operational modules-এর accounting impact design করা |
| Month 4 | Hospital, school, budget accounting | Domain-specific accounting flows independently model করা |
| Month 5 | Posting engine, events, subledger, GL, reconciliation | Production accounting architecture understand/design করা |
| Month 6 | Reliability, audit, reversal, idempotency, reporting, capstone | End-to-end generic accounting system architect করা |

---

## কীভাবে পড়বেন

প্রতিটি অধ্যায় একই ১০-section কাঠামোয় লেখা — Learning Objective থেকে Summary Card পর্যন্ত। ক্রমানুসারে পড়ুন; অধ্যায়ের Exercises আর Developer Challenge বাদ দেবেন না।

একটি Part শেষ হলে [Projects ও Exit Criteria](/accounting/projects) পাতায় গিয়ে সেই Part-এর Project ধরুন। Exit Criteria নিজে verify করতে না পারলে পরের Part-এ যাবেন না।

শুরু করার আগে [Study Plan](/accounting/study-plan) একবার পড়ে নিন।

---

## Final Target

একজন developer হিসেবে যেকোনো business software-এ accounting layer **design, implement, verify এবং defend** করতে পারা — যেন accounting আপনার কাছে আলাদা কোনো domain না, বরং system-এর একটি নিয়মিত subsystem।
