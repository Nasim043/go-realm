# The Book — Print Edition

এটাই মূল পড়ার জিনিস — যেটা print করে binding করবেন। কী পড়বেন, কোন ক্রমে, আর কী পারলে পরের ধাপে যাবেন — সবই এই বইয়ের কাঠামোতেই আছে।

প্রতিটি Part শেষে যা নিজে বানাবেন, তা আছে [Projects ও Exit Criteria](/accounting/projects) পাতায়।

তিনটি Volume, ছয়টি Part। প্রতিটি Volume আলাদা binding হবে।

---

## লেখার অগ্রগতি

| | Chapter | অবস্থা |
| --- | --- | --- |
| ✅ | [অধ্যায় ১ — Accounting কী](/accounting/book/v1-ch01-accounting-ki) | **সম্পূর্ণ** |
| ✅ | [অধ্যায় ২ — Accounting Equation](/accounting/book/v1-ch02-accounting-equation) | **সম্পূর্ণ** |
| ✅ | [অধ্যায় ৩ — পাঁচ প্রকার Account](/accounting/book/v1-ch03-account-types) | **সম্পূর্ণ** |
| ✅ | [অধ্যায় ৪ — Debit ও Credit](/accounting/book/v1-ch04-debit-credit) | **সম্পূর্ণ** |
| ✅ | [অধ্যায় ৫ — Chart of Accounts](/accounting/book/v1-ch05-chart-of-accounts) | **সম্পূর্ণ** |
| ✅ | [অধ্যায় ৬ — COA Hierarchy ও Database](/accounting/book/v1-ch06-coa-hierarchy-database) | **সম্পূর্ণ** |
| ✅ | [অধ্যায় ৭ — Journal Entry](/accounting/book/v1-ch07-journal-entry) | **সম্পূর্ণ** |
| ✅ | [অধ্যায় ৮ — Posting ও Validation](/accounting/book/v1-ch08-posting-validation) | **সম্পূর্ণ** |
| ✅ | [অধ্যায় ৯ — General Ledger](/accounting/book/v1-ch09-general-ledger) | **সম্পূর্ণ** |
| ✅ | [অধ্যায় ১০ — Trial Balance](/accounting/book/v1-ch10-trial-balance) | **সম্পূর্ণ** |
| 📝 | [অধ্যায় ৫৩ — Capstone: Generic Accounting Engine](/accounting/book/v3-ch53-capstone-engine) | **খসড়া** — spec লেখা আছে |
| | বাকি অধ্যায় (১১–৫২, ৫৪–৬২) | পরিকল্পিত |

> **🎉 Part 1 সম্পূর্ণ।** দশটি অধ্যায়, প্রায় ১৪৫ পাতা। Accounting কী থেকে Trial Balance পর্যন্ত পুরো ভিত্তি — এটাই প্রথম binding-এ যাবে।

---

## Volume 1 — Accounting Fundamentals & Core

আনুমানিক ২৪০–৩১০ পাতা। এটাই প্রথম binding, এবং সবচেয়ে ধীরে পড়ার অংশ।

### Part 1 — Fundamentals (৮০–১০০ পাতা)

| ক্রম | Chapter |
| --- | --- |
| ১ | **Accounting কী** ✅ |
| ২ | **Accounting Equation** ✅ |
| ৩ | **পাঁচ প্রকার Account** ✅ |
| ৪ | **Debit ও Credit** ✅ |
| ৫ | **Chart of Accounts** ✅ |
| ৬ | **COA Hierarchy ও Database Design** ✅ |
| ৭ | **Journal Entry** ✅ |
| ৮ | **Posting ও Validation** ✅ |
| ৯ | **General Ledger** ✅ |
| ১০ | **Trial Balance** ✅ |

### Part 2 — Core Business Accounting (১০০–১৩০ পাতা)

| ক্রম | Chapter |
| --- | --- |
| ১১ | Cash ও Bank |
| ১২ | Bank Reconciliation |
| ১৩ | Sales ও Revenue |
| ১৪ | Accounts Receivable |
| ১৫ | Purchase |
| ১৬ | Accounts Payable |
| ১৭ | Revenue ও Expense Recognition |
| ১৮ | Accrual ও Prepaid |
| ১৯ | Advance, Credit Note ও Debit Note |

### Part 3 — Financial Statements (৬০–৮০ পাতা)

| ক্রম | Chapter |
| --- | --- |
| ২০ | Income Statement |
| ২১ | Balance Sheet |
| ২২ | Cash Flow Statement |
| ২৩ | Statement of Changes in Equity |
| ২৪ | Trial Balance থেকে Statement |
| ২৫ | Adjusting Entry |
| ২৬ | Opening, Closing ও Period Closing |

---

## Volume 2 — Accounting in Business Applications

আনুমানিক ১৫০–১৮০ পাতা। আপনার দৈনন্দিন development-এর reference book।

### Part 4 — Application-specific Accounting

| ক্রম | Chapter |
| --- | --- |
| ২৭ | Inventory Accounting |
| ২৮ | Purchase ও GRNI |
| ২৯ | HRM ও Payroll Accounting |
| ৩০ | Fixed Asset Accounting |
| ৩১ | Hospital Accounting |
| ৩২ | School Accounting |
| ৩৩ | Budget Accounting ও Control |
| ৩৪ | Cost Center, Department ও Branch |
| ৩৫ | Project Accounting |

প্রতিটি module একই কাঠামোয় লেখা হবে — এতে accounting আর development আলাদা মনে হবে না:

```text
Business Flow
      ↓
Financial Event
      ↓
Debit / Credit
      ↓
Journal Entry
      ↓
Subledger
      ↓
General Ledger
      ↓
Financial Statement Impact
      ↓
Database Design
      ↓
API / Service Design
```

---

## Volume 3 — Accounting Software Engineering

আনুমানিক ১৬০–২০০ পাতা। Developer হিসেবে সবচেয়ে মূল্যবান reference।

### Part 5 — Accounting Software Architecture (১০০–১২০ পাতা)

| ক্রম | Chapter |
| --- | --- |
| ৩৬ | Subledger Architecture |
| ৩৭ | Accounting Event Architecture |
| ৩৮ | Posting Rule Engine |
| ৩৯ | Account Mapping |
| ৪০ | Voucher System |
| ৪১ | Approval বনাম Posting |
| ৪২ | Period Lock ও Closing |
| ৪৩ | Reversal ও Correction |
| ৪৪ | Reconciliation Architecture |
| ৪৫ | Audit Trail |
| ৪৬ | Idempotency ও Duplicate Prevention |
| ৪৭ | Database Transaction ও Concurrency |
| ৪৮ | Permissions ও Security |
| ৪৯ | Financial Report Engine |
| ৫০ | Accounting API Design |
| ৫১ | Testing Strategy |
| ৫২ | Common Accounting Bugs |
| ৫৩ | [**Capstone — Generic Accounting Engine**](/accounting/book/v3-ch53-capstone-engine) 📝 |

### Part 6 — Advanced ERP Accounting

Foundation শেষ হওয়ার পরে। এই Part-এর বেশ কিছু বিষয় মূল roadmap-এ ছিল না।

| ক্রম | Chapter |
| --- | --- |
| ৫৪ | Multi-Currency |
| ৫৫ | Tax ও VAT |
| ৫৬ | Withholding Tax |
| ৫৭ | Cost Accounting |
| ৫৮ | Manufacturing Accounting |
| ৫৯ | Provision, Bad Debt ও Impairment |
| ৬০ | Inter-branch ও Intercompany |
| ৬১ | Consolidation |
| ৬২ | Opening Balance ও Migration |

---

## প্রতিটি Chapter-এর কাঠামো

সব chapter একই ছাঁচে লেখা হবে:

| # | Section | উদ্দেশ্য |
| --- | --- | --- |
| ১ | Learning Objective | শেষে কী পারবেন |
| ২ | Concept Explanation | সহজ বাংলায় মূল ধারণা |
| ৩ | Accounting Rule | নিয়ম, টেবিল আকারে |
| ৪ | Real Business Example | ধাপে ধাপে reasoning সহ |
| ৫ | Implementation | Event, flow, database — একসাথে |
| ৬ | Financial Statement Impact | কোন report-এ গিয়ে দেখা যাবে |
| ৭ | Common Developer Mistakes | বাস্তব bug এবং সমাধান |
| ৮ | Exercises | নিজে solve করার জন্য (উত্তর Workbook-এ) |
| ৯ | Developer Challenge | নিজে design করার কাজ |
| ১০ | Summary Card | এক পাতার সারসংক্ষেপ |

---

## তিনটি Output, একটাই Source

Workbook আর Quick Reference আলাদা করে লেখা হবে না — chapter থেকেই তৈরি হবে। এতে কখনো mismatch হবে না।

```text
chapter .md ──┬──▶ Nextra          (web, searchable)
              ├──▶ Master Book     (পুরো chapter)
              ├──▶ Workbook        (section ৮ + answer key)
              └──▶ Quick Reference (section ১০ এর summary card)
```

---

## Print Format

```text
Page Size    A4 portrait
Body font    Noto Serif Bengali, 11.5 pt
Margins      ভিতরের দিক ১.২৫", বাইরের ০.৭৫", উপর/নিচ ০.৭৫"
Printing     Double-sided, black & white
Chapter      প্রতিটি নতুন পাতা থেকে (বিজোড় পৃষ্ঠায়)
```

ভিতরের margin বেশি রাখা হয়েছে — binding করলে ওই অংশ ভাঁজে ঢুকে যায়। Double-sided print-এ বাঁ/ডান পাতায় margin উল্টে যাবে (mirrored)।
