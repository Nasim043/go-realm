# Projects ও Exit Criteria

বইয়ের প্রতিটি অধ্যায়ে নিজের জন্য Exercises (section ৮) এবং Developer Challenge (section ৯) আছে — সেগুলো এক অধ্যায়ের মাপের।

এই পাতার Project-গুলো তার চেয়ে বড়। একেকটি Project কয়েকটি অধ্যায় জুড়ে থাকে, এবং সেই অধ্যায়গুলো পড়া শেষ হলেই কেবল ধরা যায়। বই পড়ার পাশাপাশি এগুলোই আসল যাচাই — পড়তে পারা আর বানাতে পারা এক জিনিস নয়।

---

## Volume 1 · Part 1 — Fundamentals (অধ্যায় ১–১০)

| Project | প্রয়োজনীয় অধ্যায় |
| --- | --- |
| **Multi-company configurable Chart of Accounts module** design করা | ৫, ৬ |
| **Generic journal posting service** বানানো — interface: `AccountingService.post(event)` | ৭, ৮ |
| **General Ledger, Account Statement ও Trial Balance** তৈরি করা | ৯, ১০ |

### Exit Criteria

এই Part শেষে নিজে যাচাই করুন:

- যেকোনো basic transaction দেখে ৩০–৬০ সেকেন্ডের মধ্যে বলতে পারছেন — কোন account affected, তার type, increase না decrease, debit না credit, এবং পূর্ণ journal entry
- COA schema, hierarchy rules এবং system-account mapping independently design করতে পারছেন
- Robust, transactional, validated journal posting flow design করতে পারছেন
- Journal lines থেকে ledger ও trial balance correctly generate করতে পারছেন

---

## Volume 1 · Part 2 — Core Business Accounting (অধ্যায় ১১–১৯)

| Project | প্রয়োজনীয় অধ্যায় |
| --- | --- |
| **Customer invoice + payment + aging + reconciliation** বানানো | ১৩, ১৪, ১৯ |
| **Supplier bill + payment + payable aging + reconciliation** বানানো | ১৫, ১৬, ১৯ |
| **Bank reconciliation module** বানানো | ১১, ১২ |

### Exit Criteria

- Cash flow এবং revenue/expense recognition গুলিয়ে ফেলছেন না

---

## Volume 1 · Part 3 — Financial Statements (অধ্যায় ২০–২৬)

এই Part-এ আলাদা Project নেই — অধ্যায়গুলোর Developer Challenge-ই যথেষ্ট।

### Exit Criteria

- একটি journal entry P&L, Balance Sheet না Cash Flow-এ কোথায় impact করবে, তা explain করতে পারছেন

---

## Volume 2 · Part 4 — Application-specific Accounting (অধ্যায় ২৭–৩৫)

| Project | প্রয়োজনীয় অধ্যায় |
| --- | --- |
| **Inventory valuation + accounting posting + reconciliation** বানানো | ২৭ |
| **Procure-to-pay accounting lifecycle** design করা | ২৮ |
| **Payroll-to-accounting integration** বানানো | ২৯ |
| **Asset capitalization + depreciation + disposal accounting** বানানো | ৩০ |
| **Patient billing accounting engine** design করা | ৩১ |
| **Student fee billing + collection + aging** বানানো | ৩২ |
| **Budget-control layer** accounting-এর সাথে যুক্ত করে design করা | ৩৩ |
| **Multidimensional ledger reporting** বানানো | ৩৪, ৩৫ |

---

## Volume 3 · Part 5 — Accounting Software Architecture (অধ্যায় ৩৬–৫৩)

| Project | প্রয়োজনীয় অধ্যায় |
| --- | --- |
| **Generic reconciliation service** তৈরি করা | ৩৬, ৪৪ |
| **AccountingEvent DTO/schema** design করা | ৩৭ |
| **Configurable posting-rule engine** বানানো | ৩৮, ৩৯ |
| **Period locking ও closing workflow** বানানো | ৪২ |
| **Journal reversal service** implement করা | ৪৩ |
| **Reconciliation dashboard/service** তৈরি করা | ৪৪ |
| **Idempotent accounting posting** implement করা | ৪৬ |

সবশেষে [অধ্যায় ৫৩ — Capstone](/accounting/book/v3-ch53-capstone-engine), যেখানে এই সবগুলো এক system-এ আসে।

---

## Volume 3 · Part 6 — Advanced ERP Accounting (অধ্যায় ৫৪–৬২)

| Project | প্রয়োজনীয় অধ্যায় |
| --- | --- |
| **Opening-balance import ও validation workflow** তৈরি করা | ৬২ |

---

# Chapter Scope Notes

নিচের সিদ্ধান্তগুলো আগেই নেওয়া — সংশ্লিষ্ট অধ্যায় লেখার সময় এগুলোই scope ঠিক করে দেবে। অধ্যায় লেখা হয়ে গেলে এই note-টুকু অধ্যায়ে চলে যাবে, এখান থেকে বাদ যাবে।

## অধ্যায় ৩১ — Hospital Accounting

Revenue streams (সাতটি): Consultation · Diagnostic · Pharmacy · Bed · Procedure · Surgery · Service Charge

Party/subledgers (চারটি): Patient · Doctor · Insurance Company · Corporate Client

```text
Patient Registration
→ Service
→ Bill
→ Advance Adjustment
→ Due
→ Collection
→ Refund
```

Bill:

```text
Patient Receivable      Dr
    Consultation Revenue    Cr
    Diagnostic Revenue      Cr
    Pharmacy Revenue        Cr
```

Patient advance:

```text
Cash                    Dr
    Patient Advance Liability   Cr
```

Doctor share — অধ্যায়ের সবচেয়ে কঠিন অংশ: revenue gross না net ধরা হবে, doctor-কে payable, এবং commission/share liability।

## অধ্যায় ৩২ — School Accounting

Fee types: Admission · Tuition · Exam · Transport · Fine · Waiver · Scholarship

Party: Student Advance · Student Receivable · Refund

```text
Student Receivable      Dr
    Tuition Revenue         Cr
```

```text
Cash/Bank               Dr
    Student Receivable      Cr
```

```text
Cash                    Dr
    Student Advance Liability   Cr
```

Reconciliation rule:

```text
Student Outstanding = Student Receivable GL
```

## অধ্যায় ৫৫–৫৬ — Tax, VAT ও Withholding Tax

Country-specific implementation আলাদা হবে — অধ্যায় দুটি architecture শেখাবে, নির্দিষ্ট দেশের আইন নয়।

Concepts: VAT · Input Tax · Output Tax · Withholding Tax · Tax Payable · Tax Receivable

Transaction structure:

```text
net_amount
tax_amount
gross_amount
```

যেসব বিষয় cover হবে: inclusive বনাম exclusive tax, tax codes, tax rates, withholding, rounding।
