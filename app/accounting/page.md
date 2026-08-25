# Accounting for Software Development — Complete Learning Roadmap

> লক্ষ্য: এমনভাবে Accounting শেখা যাতে HRM, Payroll, Inventory, Asset Management, Hospital, School, ERP, Billing, Procurement, Finance বা অন্য যেকোনো business application-এ accounting features confidently design, implement, test এবং review করা যায়।

এই roadmap-টি traditional accountant হওয়ার জন্য নয়। এটি **Software Developer / Software Architect**-এর perspective থেকে তৈরি।

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

## Recommended Study Time

| বিষয় | পরিমাণ |
| --- | --- |
| প্রতিদিন | ২ ঘণ্টা |
| মোট সময় | ৫–৭ মাস |
| সপ্তাহে | ৬ দিন study + ১ দিন revision |
| পদ্ধতি | Theory + Exercise + Architecture + Implementation — parallel-ভাবে |

---

## Roadmap Structure

পুরো roadmap ৩৬টি phase-এ ভাগ করা, আর সেগুলো ৭টি পর্ব + capstone হিসেবে সাজানো:

| পর্ব | Phase | Focus |
| --- | --- | --- |
| [পর্ব ১ — Accounting Foundation](/accounting/part-1-foundation) | 1–5 | Debit/Credit, COA, Journal, GL, Trial Balance, Financial Statements |
| [পর্ব ২ — Core Transaction Cycles](/accounting/part-2-core-transactions) | 6–9 | AR, AP, Cash & Bank, Revenue, Accrual, Prepaid |
| [পর্ব ৩ — Business Module Accounting](/accounting/part-3-business-modules) | 10–15 | Inventory, Purchase, Payroll, Fixed Asset, Hospital, School |
| [পর্ব ৪ — Budget, Cost Center ও Subledger](/accounting/part-4-control-dimensions) | 16–18 | Budget control, Cost center/branch/project, Subledger architecture |
| [পর্ব ৫ — Accounting Engine Architecture](/accounting/part-5-architecture) | 19–24 | Event, Posting rule engine, Voucher, Period closing, Reversal, Reconciliation |
| [পর্ব ৬ — Reliability, Control ও Compliance](/accounting/part-6-reliability) | 25–31 | Audit trail, Idempotency, Concurrency, Security, Tax, Multi-currency, Migration |
| [পর্ব ৭ — Reporting, API ও Testing](/accounting/part-7-engineering) | 32–35 | Report engine, API design, Testing strategy, Common bugs |
| [Capstone — Generic Accounting Engine](/accounting/capstone) | 36 | পুরো engine একসাথে design + build |

### 📖 Print Edition

- [**The Book — Print Edition**](/accounting/book) — এই roadmap-এর content থেকে তৈরি ৩ Volume-এর ছাপার উপযোগী বই, workbook ও quick reference। Roadmap বলে *কী পড়বেন*; বই-টাই *পড়ার জিনিস*।

Supporting pages:

- [৬ মাসের Study Plan ও Routine](/accounting/study-plan) — month-by-month plan, daily/weekly routine, study method, competency checklist
- [Career Value ও Positioning](/accounting/career-value) — এই knowledge-এর career impact এবং positioning strategy

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

প্রতিটি phase-এ থাকে **Goal → Topics → Project → Exit Criteria**। পরের phase-এ যাবেন কেবল তখনই, যখন আগের phase-এর Exit Criteria আপনি নিজে verify করতে পেরেছেন।

প্রতিটি topic-এর জন্য mandatory method এবং daily routine আছে [Study Plan](/accounting/study-plan) পেজে — শুরু করার আগে সেটা একবার পড়ে নিন।

---

## Final Target

একজন developer হিসেবে যেকোনো business software-এ accounting layer **design, implement, verify এবং defend** করতে পারা — যেন accounting আপনার কাছে আলাদা কোনো domain না, বরং system-এর একটি নিয়মিত subsystem।
