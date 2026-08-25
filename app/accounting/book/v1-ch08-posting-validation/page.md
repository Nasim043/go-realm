# অধ্যায় ৮ — Posting ও Validation

> **Volume 1 · Part 1 — Accounting Fundamentals · Chapter 8**
>
> পূর্বশর্ত: অধ্যায় ৭ (Journal Entry), অধ্যায় ৬ (COA Hierarchy ও Database)

---

## ১. Learning Objective

এই অধ্যায় শেষে আপনি পারবেন:

```text
Posting-এর সম্পূর্ণ যাচাই তালিকা নিজে লিখতে
কেন পুরো posting একটিমাত্র database transaction-এ হতে হবে তা ব্যাখ্যা করতে
Event থেকে posted journal পর্যন্ত পুরো প্রবাহ নকশা করতে
একই উৎস থেকে দুবার post হওয়া ঠেকাতে
ব্যর্থতার সময় system কী করবে তা নির্ধারণ করতে
Posting-এর জন্য একটি generic service নকশা করতে
ভবিষ্যৎ ও অতীতের তারিখে posting-এর নীতি ঠিক করতে
কোন যাচাই database-এ আর কোনটা application-এ — সিদ্ধান্ত নিতে
```

**সময়:** পড়া ৫৫ মিনিট + অনুশীলন ৬০ মিনিট।

> এটাই accounting engine-এর হৃদয়। এই অধ্যায়ের যাচাইগুলো ঠিকভাবে বসালে পরের সব module নিরাপদ; একটাও বাদ পড়লে ভুল ডেটা নীরবে জমতে থাকবে।

---

## ২. Concept Explanation

### Posting মানে কী?

**Posting** হলো সেই মুহূর্ত যখন একটি journal entry খসড়া থেকে **সত্যি** হয়ে যায় — খাতায় উঠে যায়, report-এ দেখা দেয়, এবং অপরিবর্তনীয় হয়ে পড়ে।

```text
    posting এর আগে              posting এর পরে
    ─────────────               ──────────────
    বদলানো যায়                  অপরিবর্তনীয়
    মোছা যায়                    কখনো মোছা যায় না
    report-এ নেই                সব report-এ আছে
    কোনো দায় নেই                আর্থিক বিবৃতির অংশ
```

এই দরজাটা একমুখী। তাই দরজার সামনে পাহারা বসাতে হয় — সেটাই validation।

> **মূল নীতি: posting-এর আগে যাচাই সস্তা, posting-এর পরে সংশোধন ব্যয়বহুল।** একটা ভুল entry ধরা পড়লে reversal লাগে, নিরীক্ষায় প্রশ্ন ওঠে, আর কখনো কখনো আগের report আবার ছাপাতে হয়। তাই যাচাইয়ে কার্পণ্য করবেন না।

### যাচাইয়ের আট স্তর

Posting-এর আগে যা যা যাচাই করতেই হবে। ক্রমটাও গুরুত্বপূর্ণ — সস্তা যাচাই আগে, ব্যয়বহুল পরে:

**স্তর ১ — গঠন**

```text
□  lines সংখ্যা >= 2
□  প্রতিটি line এ debit অথবা credit — একটি, দুটি নয়
□  কোনো মান ঋণাত্মক নয়
□  SUM(debit) == SUM(credit)
□  SUM(debit) > 0
```

**স্তর ২ — Account**

```text
□  প্রতিটি account_id বিদ্যমান
□  প্রতিটি account একই company-র
□  প্রতিটি account সক্রিয় (is_active)
□  প্রতিটি account পাতা (is_group = false)
□  হাতে লেখা entry হলে allow_manual_posting = true
```

**স্তর ৩ — Period**

```text
□  posting_date এর জন্য একটি period বিদ্যমান
□  সেই period এর status = 'open'
□  posting_date ভবিষ্যতে অনেক দূরে নয়
```

**স্তর ৪ — অবস্থা**

```text
□  entry এখন approved (বা draft, যদি সরাসরি posting হয়)
□  entry ইতিমধ্যে posted নয়
□  entry reversed নয়
```

**স্তর ৫ — উৎস**

```text
□  এই (source_type, source_id) থেকে আগে post হয়নি
```

**স্তর ৬ — অনুমতি**

```text
□  ব্যবহারকারীর posting করার অধিকার আছে
□  এই voucher_type এ তার অধিকার আছে
□  টাকার অঙ্ক তার সীমার মধ্যে
```

**স্তর ৭ — ব্যবসায়িক নিয়ম**

```text
□  module-নির্দিষ্ট নিয়ম (যেমন: negative stock নয়)
```

**স্তর ৮ — চূড়ান্ত**

```text
□  সব কিছু একটি database transaction এর ভিতরে
```

### কেন ক্রম গুরুত্বপূর্ণ

সস্তা যাচাই আগে করলে ব্যয়বহুল কাজ অপ্রয়োজনে হয় না:

```text
    SUM(debit) == SUM(credit)          ← স্মৃতিতেই হয়ে যায়, খরচ শূন্য
            ↓ ব্যর্থ হলে এখানেই থামুন
    account গুলো database থেকে আনুন     ← কয়েকটি query
            ↓ ব্যর্থ হলে এখানেই থামুন
    period খুঁজুন                       ← আরেকটি query
            ↓ ব্যর্থ হলে এখানেই থামুন
    উৎস আগে post হয়েছে কিনা             ← আরেকটি query
            ↓
    transaction শুরু করুন
```

আর একটা ব্যবহারিক দিক — **একবারে সব ভুল জানানো ভালো, একটা একটা করে নয়।** ব্যবহারকারী পাঁচটা ভুল করলে পাঁচবার চেষ্টা করতে বাধ্য করবেন না। স্তর ১ ও ২-এর সব ভুল একসাথে সংগ্রহ করে ফেরত দিন।

### ভবিষ্যতের তারিখে posting

স্তর ৩-এর তৃতীয় যাচাইটা — "posting_date ভবিষ্যতে অনেক দূরে নয়" — দেখতে তুচ্ছ, কিন্তু এটা না থাকলে বাস্তবে যা ঘটে:

```text
    ব্যবহারকারী টাইপ করলেন   2052-07-15     (2025 এর জায়গায়)
                    ↓
    entry post হয়ে গেল
                    ↓
    জুলাই ২০২৫ এর কোনো report এ নেই
                    ↓
    Trial Balance মিলছে, কিন্তু টাকাটা কোথাও দেখা যাচ্ছে না
                    ↓
    ২৭ বছর পরে হঠাৎ দেখা দেবে
```

Trial Balance এটা ধরবে না (দুই পাশ তো মিলছে), ledger-এ চোখে পড়বে না (কেউ ২০৫২ সাল খোলে না)। **এটা নীরব ভুলের আদর্শ উদাহরণ।**

কিন্তু "ভবিষ্যতের তারিখ নিষিদ্ধ" — এই সরল নিয়মটাও ভুল, কারণ বৈধ কারণেও ভবিষ্যতের তারিখ লাগে:

```text
    বৈধ                              সন্দেহজনক
    ────                             ─────────
    আজ ২৮ জুলাই, entry ৩১ জুলাইয়ের    entry ২০৫২ সালের
    (মাস শেষের বেতন আগেই তৈরি)

    আগাম ভাড়ার entry পরের মাসের      entry পরের অর্থবছরের,
    (period খোলা থাকলে)               যে period এখনো তৈরিই হয়নি
```

তাই নিয়মটা তারিখের নয়, **period-এর**:

```text
১.  posting_date এর জন্য একটা period থাকতে হবে
    → নেই মানে সেই সময়টা এখনো হিসাবের আওতায় আসেনি

২.  সেই period এর status = 'open'
    → ভবিষ্যতের period সাধারণত 'future', 'open' নয়

৩.  তার উপরে একটা নরম সীমা — যেমন আজ থেকে ৯০ দিন
    → সীমা ছাড়ালে সতর্কতা, নিষেধ নয়
```

তৃতীয়টা লক্ষ করুন — **নিষেধ নয়, সতর্কতা**। "আপনি ৩ মাস পরের তারিখে entry দিচ্ছেন, নিশ্চিত?" — এই এক প্রশ্নটাই বেশিরভাগ টাইপো ধরে ফেলে, অথচ বৈধ কাজ আটকায় না।

উল্টো দিকেও একই যুক্তি খাটে। অনেক দূর অতীতের তারিখ — ধরুন ২০১৯ সালের — সাধারণত ভুল, কিন্তু migration বা সংশোধনের সময় বৈধ। সেখানেও period-এর `status`-ই আসল পাহারাদার, তারিখ নয়।

### Atomic Posting — সবচেয়ে গুরুত্বপূর্ণ অংশ

Posting একটা কাজ নয়, অনেকগুলো কাজ:

```text
    journal header লেখা
    সবগুলো line লেখা
    উৎস record কে 'posted' চিহ্নিত করা
    running balance হালনাগাদ করা (যদি রাখেন)
    voucher number বরাদ্দ করা
```

এদের মধ্যে যেকোনো একটা ব্যর্থ হলে **কোনোটাই হওয়া উচিত নয়**।

কল্পনা করুন header লেখা হলো, তারপর তৃতীয় line লেখার সময় server বন্ধ হয়ে গেল:

```text
    journal_entries              journal_lines
    ───────────────              ─────────────
    id 5001, posted              5001 → Salary Dr 5,00,000
                                 5001 → TDS    Cr    50,000
                                 (বাকি দুটো line কখনো লেখা হয়নি)
```

এখন খাতায় একটা entry আছে যার debit ৫,০০,০০০ আর credit ৫০,০০০। **Trial Balance চিরতরে ৪,৫০,০০০ টাকা বেঁকে গেল** — এবং কেউ জানবে না কেন।

সমাধান একটাই:

```text
BEGIN TRANSACTION

    সব যাচাই
    header লেখা
    সব line লেখা
    উৎস চিহ্নিত করা
    status = 'posted'

COMMIT

    যেকোনো ধাপে ব্যর্থ হলে  →  ROLLBACK
                                কিছুই হয়নি, যেন চেষ্টাই করা হয়নি
```

> **এটা আলোচনাসাপেক্ষ নয়।** Accounting system-এ atomic posting না থাকা মানে সেই system নির্ভরযোগ্য নয়। যত ছোট প্রকল্পই হোক, এটা প্রথম দিন থেকে থাকতে হবে।

### Transaction-এর ভিতরে কী রাখবেন না

একটা গুরুত্বপূর্ণ সূক্ষ্মতা — সব কিছু transaction-এ ঢোকাবেন না:

```text
    transaction এর ভিতরে              transaction এর বাইরে
    ──────────────────                ────────────────────
    database লেখালেখি                 email পাঠানো
    যাচাই                             SMS পাঠানো
    উৎস চিহ্নিতকরণ                    বাইরের API কল
                                      PDF তৈরি
                                      cache মোছা
```

কারণ দুটো:

```text
১.  বাইরের কাজ ধীর — transaction দীর্ঘ সময় খোলা থাকলে
    database-এ lock জমে, অন্য সবাই আটকে যায়

২.  বাইরের কাজ ফেরানো যায় না — email পাঠানোর পরে
    ROLLBACK হলে email ফিরিয়ে আনা যাবে না
```

তাই নিয়ম: **transaction commit হওয়ার পরে বাইরের কাজ।**

### Event থেকে Journal — সম্পূর্ণ প্রবাহ

বাস্তবে বেশিরভাগ posting হাতে হয় না। একটা ব্যবসায়িক ঘটনা থেকে আপনাআপনি হয়। পুরো পথটা:

```text
    ব্যবসায়িক কাজ ঘটল
    (invoice তৈরি হলো)
            │
            ▼
    ACCOUNTING EVENT ঘোষণা
    { type: 'INVOICE_ISSUED', invoice_id: 4471, amount: 500000 }
            │
            ▼
    ┌───────────────────────────────────────┐
    │  BEGIN TRANSACTION                    │
    │                                       │
    │   ১. উৎস যাচাই — invoice আছে? বৈধ?     │
    │   ২. period নির্ধারণ                   │
    │   ৩. posting rule খুঁজুন                │
    │   ৪. account mapping resolve করুন      │
    │   ৫. journal lines তৈরি করুন           │
    │   ৬. ভারসাম্য যাচাই                    │
    │   ৭. header সংরক্ষণ                    │
    │   ৮. lines সংরক্ষণ                     │
    │   ৯. উৎসকে posted চিহ্নিত করুন         │
    │                                       │
    │  COMMIT                               │
    └───────────────────────────────────────┘
            │
            ▼
    transaction এর বাইরে:
    notification, cache, report queue
```

ধাপ ৩ ও ৪ এখন হয়তো সরল — কোডে লেখা একটা mapping। পরে এটাই পূর্ণ **Posting Rule Engine** হয়ে উঠবে (অধ্যায় ৩৮)। কাঠামোটা এখন থেকেই এভাবে রাখুন, তাহলে পরে জায়গা বদলাতে হবে না।

### দুবার post হওয়া ঠেকানো

একটা বাস্তব দৃশ্য: ব্যবহারকারী "Post" বোতামে চাপ দিলেন, network ধীর, তিনি আবার চাপ দিলেন। দুটো অনুরোধ গেল।

অথবা: একটা background job invoice গুলো post করছে, কোনো কারণে সে দুবার চলল।

ফলাফল — একই invoice-এর জন্য দুটো journal entry। আয় দ্বিগুণ দেখাবে, পাওনা দ্বিগুণ দেখাবে।

সবচেয়ে সরল ও কার্যকর প্রতিরোধ — **database-এ একটা unique constraint**:

```text
UNIQUE (company_id, source_type, source_id)
    WHERE status IN ('posted', 'reversed')
```

দ্বিতীয় চেষ্টা database স্তরেই আটকে যাবে, application-এর যুক্তি যাই বলুক।

> **কেন application-এ যাচাই যথেষ্ট নয়?** কারণ দুটো অনুরোধ একই মুহূর্তে চললে দুজনেই "আগে post হয়নি" দেখবে, তারপর দুজনেই লিখবে। এই দৌড়টা কেবল database-ই থামাতে পারে। বিস্তারিত অধ্যায় ৪৬ ও ৪৭-এ।

আংশিক posting-এর ক্ষেত্রে (যেমন একটা invoice-এর কয়েকটা কিস্তি) এই সরল constraint কাজ করবে না — তখন একটা আলাদা `idempotency_key` লাগবে। সেটাও অধ্যায় ৪৬-এ।

### ব্যর্থতার সময় কী করবেন

Posting ব্যর্থ হলে তিনটি জিনিস দরকার:

**১. পরিষ্কার বার্তা** — কী ভুল, কোথায়, কী করতে হবে:

```text
    অকেজো                     কাজের
    ──────                    ──────
    "Posting failed"          "জুলাই ২০২৫ period বন্ধ (৩১ জুলাই
                               বন্ধ করা হয়েছে)। posting_date
                               বদলান অথবা period খুলুন।"

    "Invalid account"         "Line ৩: account 1100 'Current
                               Assets' একটি group account —
                               এতে post করা যায় না।"
```

**২. কিছুই না বদলানো** — ROLLBACK নিশ্চিত করে।

**৩. রেকর্ড রাখা** — কোন চেষ্টা কেন ব্যর্থ হলো, সেটা log-এ থাকা দরকার। বারবার একই ব্যর্থতা মানে কোথাও একটা কাঠামোগত সমস্যা।

> একটা জিনিস কখনো করবেন না — **ব্যর্থতা লুকিয়ে "কিছু একটা" post করে দেওয়া।** কিছু system-এ দেখা যায় account না মিললে একটা "Suspense Account"-এ ফেলে দেওয়া হয় যাতে কাজ আটকে না যায়। এতে ভুল টাকা নীরবে জমতে থাকে, আর কেউ suspense account-এর দিকে তাকায় না। **স্পষ্ট ব্যর্থতা সবসময় নীরব ভুলের চেয়ে ভালো** — অধ্যায় ৬-এও একই কথা বলেছি।

---

## ৩. Accounting Rule

**Posting-এর আগে বাধ্যতামূলক যাচাই**

```text
গঠন     lines >= 2
        প্রতি line এ debit অথবা credit
        কোনো ঋণাত্মক মান নয়
        SUM(debit) == SUM(credit)
        SUM(debit) > 0

Account প্রতিটি বিদ্যমান, একই company, সক্রিয়, পাতা

Period  বিদ্যমান এবং open

অবস্থা   এখনো posted নয়

উৎস      এই উৎস থেকে আগে post হয়নি

অনুমতি   ব্যবহারকারীর অধিকার আছে
```

**Atomicity-র নিয়ম**

```text
পুরো posting একটিমাত্র database transaction এ।
যেকোনো ধাপে ব্যর্থ হলে সম্পূর্ণ ROLLBACK।
আংশিক posting বলে কিছু নেই।
```

**Transaction-এর সীমানা**

```text
ভিতরে   database লেখালেখি, যাচাই
বাইরে   email, SMS, বাইরের API, PDF, cache
```

**তারিখের নীতি**

```text
নিয়মটা তারিখের নয়, period এর —
    period থাকতে হবে, এবং open হতে হবে

তার উপরে নরম সীমা (যেমন ৯০ দিন) → সতর্কতা, নিষেধ নয়
```

**যাচাই কোথায়**

```text
যে নিয়ম সময়ের সাথে বদলায় না  →  database
যে নিয়ম বদলায়                →  application
```

**ব্যর্থতার নীতি**

```text
স্পষ্ট ব্যর্থতা  >  নীরব ভুল
কখনো suspense account এ ফেলবেন না
```

---

## ৪. Real Business Example

### দৃশ্য ১ — সফল posting

```text
Invoice #4471 তৈরি হলো — ABC Ltd, ৫,০০,০০০ + VAT ৭৫,০০০
```

```text
BEGIN TRANSACTION

  ১. উৎস যাচাই
     invoice 4471 আছে ✓  status = 'confirmed' ✓
     আগে post হয়নি ✓

  ২. period নির্ধারণ
     posting_date = 2025-07-08
     → period 'July 2025' (id 7), status = 'open' ✓

  ৩. posting rule
     event 'INVOICE_ISSUED' → rule পাওয়া গেল ✓

  ৪. account mapping resolve
     'accounts_receivable'  → 1130  (সক্রিয়, পাতা) ✓
     'sales_revenue'        → 4110  (সক্রিয়, পাতা) ✓
     'vat_payable'          → 2140  (সক্রিয়, পাতা) ✓

  ৫. lines তৈরি
     1130  Accounts Receivable   Dr  5,75,000
     4110  Software Income           Cr  5,00,000
     2140  VAT Payable               Cr    75,000

  ৬. ভারসাম্য যাচাই
     5,75,000 == 5,00,000 + 75,000  ✓

  ৭. header সংরক্ষণ — voucher SV-2025-07-0031
  ৮. lines সংরক্ষণ
  ৯. invoice 4471 কে 'posted' চিহ্নিত

COMMIT ✓

transaction এর বাইরে:
  → গ্রাহককে invoice email
  → report cache মুছুন
```

### দৃশ্য ২ — Period বন্ধ, posting ব্যর্থ

```text
একই invoice, কিন্তু posting_date = 2025-06-28
জুন মাস ৩০ জুন বন্ধ করা হয়েছে।
```

```text
BEGIN TRANSACTION

  ১. উৎস যাচাই ✓

  ২. period নির্ধারণ
     posting_date = 2025-06-28
     → period 'June 2025', status = 'closed'   ✗

ROLLBACK

বার্তা:
  "জুন ২০২৫ period বন্ধ (৩০ জুন ২০২৫ তারিখে বন্ধ করা হয়েছে,
   বন্ধ করেছেন: করিম আহমেদ)।

   বিকল্প:
   ১. posting_date জুলাই মাসে বদলান
   ২. অথবা period পুনরায় খোলার অনুরোধ করুন"
```

কিছুই লেখা হয়নি। Invoice এখনো `confirmed`, `posted` নয়। ব্যবহারকারী সিদ্ধান্ত নিয়ে আবার চেষ্টা করতে পারবেন।

### দৃশ্য ৩ — দুবার চাপ দেওয়া হলো

```text
ব্যবহারকারী "Post" এ দুবার চাপ দিলেন।
দুটো অনুরোধ প্রায় একই সময়ে পৌঁছাল।
```

```text
    অনুরোধ ক                        অনুরোধ খ
    ────────                        ────────
    BEGIN                           BEGIN
    যাচাই: আগে post হয়নি ✓          যাচাই: আগে post হয়নি ✓
    header লেখা                     header লেখা
    lines লেখা                      lines লেখা
    COMMIT ✓                        COMMIT ✗
                                    UNIQUE constraint লঙ্ঘন
                                    (company, 'sales_invoice', 4471)
                                    ROLLBACK
```

দুজনেই যাচাইয়ে পাস করেছিল — কারণ দুজনেই একই মুহূর্তে দেখেছে যে আগে post হয়নি। **কেবল database-এর constraint দ্বিতীয়টাকে থামাতে পেরেছে।**

ব্যবহারকারীকে দেখানো বার্তা হবে বন্ধুত্বপূর্ণ:

```text
"এই invoice ইতিমধ্যে post হয়েছে (voucher SV-2025-07-0031)।"
```

ভুল নয় — শুধু জানানো। কারণ ব্যবহারকারী যা চেয়েছিলেন তা তো হয়েই গেছে।

### দৃশ্য ৪ — Group account-এ posting চেষ্টা

```text
কেউ হাতে একটা entry লিখলেন, ভুল করে 1100 বেছে নিলেন।
```

```text
  স্তর ২ যাচাই:
     line 1: account 1130 ✓
     line 2: account 1100 → is_group = true   ✗

ROLLBACK (আসলে transaction শুরুই হয়নি)

বার্তা:
  "Line ২: '1100 — Current Assets' একটি group account।
   Group account এ post করা যায় না।
   এর নিচের কোনো account বেছে নিন:
     1110  Cash in Hand
     1120  Bank — Prime Bank
     1130  Accounts Receivable"
```

লক্ষ করুন বার্তাটা শুধু ভুল বলছে না — **কী করতে হবে সেটাও বলছে**। ভালো error বার্তার এটাই লক্ষণ।

---

## ৫. Implementation — Software ও Database

### PostingService-এর কাঠামো

```text
PostingService.post(entryId, userId):

    // ── transaction এর বাইরে: সস্তা যাচাই ──
    entry = load(entryId)
    errors = []

    errors += validateStructure(entry)      // স্তর ১
    errors += validateAccounts(entry)       // স্তর ২
    errors += validatePeriod(entry)         // স্তর ৩
    errors += validateStatus(entry)         // স্তর ৪
    errors += validateSource(entry)         // স্তর ৫
    errors += validatePermission(entry, userId)  // স্তর ৬

    যদি errors খালি না হয়:
        return Failure(errors)              // সব ভুল একসাথে

    // ── transaction এর ভিতরে ──
    BEGIN

        entry = lockForUpdate(entryId)      // আবার পড়ুন, lock নিয়ে
        যদি entry.status == 'posted':
            ROLLBACK
            return AlreadyPosted(entry.voucher_no)

        entry.voucher_no = allocateVoucherNumber(...)
        entry.status     = 'posted'
        entry.posted_at  = now
        entry.posted_by  = userId
        save(entry)

        markSourceAsPosted(entry.source_type, entry.source_id)

    COMMIT

    // ── transaction এর বাইরে ──
    publishEvent('JOURNAL_POSTED', entry.id)

    return Success(entry)
```

তিনটি জিনিস লক্ষ করুন:

**১. যাচাই দুবার হচ্ছে।** transaction-এর বাইরে একবার (দ্রুত ব্যর্থতার জন্য), ভিতরে আবার lock নিয়ে (দৌড় ঠেকাতে)। এটা অপচয় নয় — বাইরেরটা ব্যবহারকারীর সুবিধার জন্য, ভিতরেরটা সঠিকতার জন্য।

**২. সব ভুল একসাথে সংগ্রহ।** প্রথম ভুলেই থেমে যাচ্ছে না।

**৩. `publishEvent` transaction-এর বাইরে।** notification, cache — সব commit-এর পরে।

### যাচাইয়ের ফলাফল কেমন হবে

Error গুলো এমনভাবে ফেরত দিন যাতে UI সেগুলো সঠিক জায়গায় দেখাতে পারে:

```text
Failure([
    { line: 2,    code: 'ACCOUNT_IS_GROUP',
      message: "'1100 — Current Assets' একটি group account",
      suggestion: [1110, 1120, 1130] },

    { line: null, code: 'PERIOD_CLOSED',
      message: "জুন ২০২৫ period বন্ধ",
      closed_at: '2025-06-30', closed_by: 'করিম আহমেদ' },
])
```

`code` দিয়ে কোড সিদ্ধান্ত নেবে, `message` মানুষ পড়বে, `line` দিয়ে UI ঠিক জায়গায় দেখাবে।

### গঠন যাচাইয়ের সম্পূর্ণ যুক্তি

```text
validateStructure(entry):

    errors = []

    যদি entry.lines.length < 2:
        errors += 'অন্তত দুটি line প্রয়োজন'

    totalDebit  = 0
    totalCredit = 0

    প্রতিটি line এর জন্য:
        যদি line.debit < 0 বা line.credit < 0:
            errors += line নম্বর সহ 'ঋণাত্মক মান'

        যদি line.debit > 0 এবং line.credit > 0:
            errors += line নম্বর সহ 'debit ও credit দুটোই'

        যদি line.debit == 0 এবং line.credit == 0:
            errors += line নম্বর সহ 'দুটোই শূন্য'

        totalDebit  += line.debit
        totalCredit += line.credit

    যদি totalDebit != totalCredit:
        errors += 'ভারসাম্যহীন: debit ' + totalDebit +
                  ', credit ' + totalCredit +
                  ', পার্থক্য ' + (totalDebit - totalCredit)

    যদি totalDebit == 0:
        errors += 'মোট শূন্য'

    return errors
```

ভারসাম্যহীনতার বার্তায় **পার্থক্যটা দেখানো** একটা ছোট কিন্তু দারুণ সাহায্য — ব্যবহারকারী সাথে সাথে বুঝে যান কোথায় খুঁজতে হবে।

### দশমিকের ফাঁদ

অধ্যায় ৪-এ `FLOAT` না ব্যবহারের কথা বলেছি। এখানে তার ব্যবহারিক রূপ:

```text
        FLOAT দিয়ে
        ──────────
        debit  = 0.1 + 0.2 = 0.30000000000000004
        credit = 0.3

        debit == credit ?   →  false
        posting ব্যর্থ, অথচ কোনো ভুল নেই
```

```text
        DECIMAL দিয়ে
        ────────────
        debit  = 0.30
        credit = 0.30

        debit == credit ?   →  true  ✓
```

শুধু database-এ `DECIMAL` রাখলেই হবে না — application-এর ভাষাতেও যথাযথ দশমিক প্রকার ব্যবহার করুন (Go-তে `shopspring/decimal`, PHP-তে `bcmath`/`brick/math`, Java-তে `BigDecimal`)। মাঝপথে `float` এ রূপান্তর হলে সব লাভ শেষ।

আর তুলনার সময় **ঠিক সমতা** যাচাই করুন, "প্রায় সমান" নয়:

```text
    করবেন না:  abs(debit - credit) < 0.01
    করুন:      debit == credit
```

"প্রায় সমান" মেনে নিলে প্রতিটি entry-তে এক পয়সা করে হারাবে, আর এক বছরে সেটা বড় অঙ্ক হয়ে দাঁড়াবে।

### কোন যাচাই কোথায় বসবে

আটটি স্তরের সব যাচাই application-এ লেখা যায়। কিন্তু কিছু যাচাই **database-এও** বসানো যায় — আর যেগুলো যায়, সেগুলো সেখানে বসানো উচিত।

কারণটা অধ্যায় ৭-এ বলেছি: application-ই একমাত্র পথ নয়। Migration script, সরাসরি SQL, অন্য কোনো service, ভবিষ্যতের কোনো developer-এর "একটু দ্রুত ঠিক করে দিই" — সবাই আপনার সুন্দর যুক্তিটা এড়িয়ে যেতে পারে। Database পারে না এড়াতে।

```text
    যাচাই                          কোথায়            কেন
    ─────                          ──────           ───
১   debit >= 0, credit >= 0        DB (CHECK)       নিরঙ্কুশ নিয়ম
    এক line এ একটাই দিক            DB (CHECK)       নিরঙ্কুশ নিয়ম
    lines >= 2                     App              DB-তে কঠিন
    SUM(debit) == SUM(credit)      App (+ trigger)  নিচে দেখুন

২   account বিদ্যমান               DB (FK)          FK-ই যথেষ্ট
    একই company                    App              cross-table শর্ত
    সক্রিয় ও পাতা                  App              পরিবর্তনশীল অবস্থা

৩   period বিদ্যমান                DB (FK)          FK
    period open                    App              পরিবর্তনশীল অবস্থা

৪   ইতিমধ্যে posted নয়             App (lock সহ)    অবস্থা পরিবর্তন
৫   এই উৎস থেকে আগে হয়নি          DB (UNIQUE)      দৌড় ঠেকায়
৬   ব্যবহারকারীর অধিকার            App              প্রসঙ্গনির্ভর
৭   module-নির্দিষ্ট নিয়ম          App              ব্যবসায়িক যুক্তি
```

দুটো সারি ব্যাখ্যা দরকার।

**`SUM(debit) == SUM(credit)`** — এটা একটা সারির নিয়ম নয়, একটা সারিগুচ্ছের নিয়ম। সাধারণ `CHECK` দিয়ে হয় না। তিনটি বিকল্প:

```text
ক.  শুধু application-এ যাচাই
    সহজ, কিন্তু সরাসরি SQL এড়িয়ে যেতে পারে

খ.  deferred constraint / trigger — commit-এর সময় যাচাই
    শক্তিশালী, কিন্তু database-নির্ভর ও debug করা কঠিন

গ.  application-এ যাচাই + রাতের স্বাস্থ্য-যাচাই (অধ্যায় ১০)
    সুপারিশ — সরল, আর ফাঁক গলে গেলেও পরদিন ধরা পড়ে
```

**সক্রিয় ও পাতা** — কেন database-এ নয়? কারণ একটা account আজ সক্রিয়, কাল নিষ্ক্রিয় হতে পারে। Constraint দিলে **পুরনো posted entry গুলোও অবৈধ হয়ে যাবে** — অথচ সেগুলো লেখার সময় account সক্রিয়ই ছিল। নিয়মটা লেখার মুহূর্তের, চিরকালের নয়।

> এখান থেকে একটা সাধারণ নীতি বেরোয়: **যে নিয়ম সময়ের সাথে বদলায় না, সেটা database-এ। যে নিয়ম বদলায়, সেটা application-এ।** এই একটা প্রশ্ন করলেই বেশিরভাগ ক্ষেত্রে উত্তর পেয়ে যাবেন।

### একটাই দরজা

অধ্যায় ৭-এ বলেছি, এখানে জোর দিয়ে বলছি:

```text
        যা করবেন না                      যা করবেন
        ───────────                      ────────
    InvoiceModule  ──▶ journal_lines     InvoiceModule  ──┐
    PayrollModule  ──▶ journal_lines     PayrollModule  ──┼──▶ PostingService ──▶ DB
    AssetModule    ──▶ journal_lines     AssetModule    ──┘
```

বাঁ দিকে প্রতিটি module নিজের যাচাই লিখবে, আর কেউ না কেউ কিছু একটা ভুলে যাবে। ডান দিকে যাচাই একটাই জায়গায় — একবার ঠিক করলে সবার জন্য ঠিক।

এই নীতিটা পরীক্ষার জন্যও গুরুত্বপূর্ণ: একটাই service মানে একটাই জায়গায় test লিখলেই সব module সুরক্ষিত (অধ্যায় ৫১)।

---

## ৬. Financial Statement Impact

Posting-ই সেই মুহূর্ত যখন একটা entry report-এ ঢোকে:

```text
    draft / submitted / approved   →  কোনো report-এ নেই
                    │
                    ▼  POST
    posted                         →  সব report-এ
```

তাই প্রতিটি report query-তে ব্যতিক্রমহীনভাবে:

```text
WHERE journal_entries.status = 'posted'
```

**এই শর্তটা বাদ পড়লে কী হয়:** কেউ একটা ৫০ লক্ষ টাকার draft entry বানিয়ে রেখেছে পরীক্ষার জন্য — সেটা Balance Sheet-এ দেখা দেবে। কেউ টের পাবে না, কারণ report তো ঠিকই তৈরি হচ্ছে।

এই ভুলটা এড়ানোর সবচেয়ে নিরাপদ উপায় — report গুলোকে সরাসরি table-এ যেতে না দিয়ে একটা view বা একটাই query layer দিয়ে যেতে দিন:

```text
CREATE VIEW posted_lines AS
SELECT l.*, e.posting_date, e.period_id, e.company_id, e.voucher_no
FROM   journal_lines   l
JOIN   journal_entries e ON e.id = l.journal_entry_id
WHERE  e.status = 'posted';
```

এরপর প্রতিটি report `posted_lines` ব্যবহার করবে, কাঁচা table নয়। **শর্তটা ভুলে যাওয়ার সুযোগই থাকবে না।**

---

## ৭. Common Developer Mistakes

| ভুল | কী ঘটে | সঠিক পথ |
| --- | --- | --- |
| Header ও lines আলাদা transaction-এ | অসম্পূর্ণ entry, Trial Balance চিরতরে বেঁকে যায় | একটিমাত্র transaction |
| Email/API transaction-এর ভিতরে | lock জমে; ROLLBACK-এ email ফেরানো যায় না | commit-এর পরে |
| শুধু application-এ duplicate যাচাই | দুটো একসাথে চললে দুটোই ঢুকে যায় | database UNIQUE constraint |
| `FLOAT` দিয়ে ভারসাম্য যাচাই | সঠিক entry-ও ব্যর্থ হয় | `DECIMAL`, ঠিক সমতা |
| "প্রায় সমান" মেনে নেওয়া | প্রতি entry-তে পয়সা হারায় | ঠিক সমতা |
| প্রথম ভুলেই থেমে যাওয়া | ব্যবহারকারীকে বারবার চেষ্টা করতে হয় | সব ভুল একসাথে |
| অস্পষ্ট error বার্তা | ব্যবহারকারী বুঝতে পারেন না কী করবেন | কী, কোথায়, কী করতে হবে |
| Suspense account-এ ফেলে দেওয়া | ভুল টাকা নীরবে জমে | স্পষ্ট ব্যর্থতা |
| Report-এ `status='posted'` ভুলে যাওয়া | draft entry report-এ | `posted_lines` view |
| প্রতিটি module নিজে post করা | কোনো একটা যাচাই কোথাও বাদ পড়ে | একটাই PostingService |
| Lock ছাড়া অবস্থা যাচাই | দৌড়ে দুবার post | `lockForUpdate` |
| Period যাচাই না করা | বন্ধ মাসে entry ঢোকে | স্তর ৩ বাধ্যতামূলক |
| ভবিষ্যতের তারিখ যাচাই না করা | ২০৫২ সালের entry নীরবে হারিয়ে যায় | period + নরম সীমা |
| ভবিষ্যতের তারিখ পুরোপুরি নিষেধ | মাস শেষের বৈধ entry আটকায় | সতর্কতা দিন, নিষেধ নয় |
| সব যাচাই কেবল application-এ | migration/সরাসরি SQL এড়িয়ে যায় | স্থির নিয়ম DB constraint-এ |
| `is_active` কে DB constraint বানানো | পুরনো posted entry অবৈধ হয়ে যায় | application-এ যাচাই |

প্রথম সারিটা সবচেয়ে ভয়ংকর, কারণ ক্ষতিটা **স্থায়ী এবং নীরব**। একবার অসম্পূর্ণ entry ঢুকে গেলে সেটা খুঁজে বের করা অত্যন্ত কঠিন — আর ততদিনে হয়তো মাসের পর মাস report ভুল বেরিয়ে গেছে।

---

## ৮. Exercises

**সেট ক — যাচাই ধরুন**

প্রতিটি entry post করার চেষ্টা হচ্ছে। কোন কোন যাচাই ব্যর্থ হবে, আর error বার্তা কী হবে?

```text
১।   1110  Cash          Dr  50,000
     4110  Sales             Cr  50,000
     posting_date = 2025-07-15, জুলাই খোলা
     account দুটোই সক্রিয় ও পাতা

২।   5210  Salary        Dr  1,00,000
     (আর কোনো line নেই)

৩।   1110  Cash          Dr  50,000
     4110  Sales             Cr  45,000

৪।   1100  Current Assets Dr  50,000     (group account)
     4110  Sales             Cr  50,000

৫।   1110  Cash          Dr  50,000  Cr  20,000
     4110  Sales             Cr  30,000

৬।   1110  Cash          Dr  0
     4110  Sales             Cr  0

৭।   1110  Cash          Dr  50,000
     4110  Sales             Cr  50,000
     posting_date = 2025-06-10, জুন বন্ধ

৮।   1110  Cash          Dr  -50,000
     4110  Sales             Cr  -50,000
```

**সেট খ — Transaction সীমানা**

নিচের কাজগুলোর প্রতিটি transaction-এর ভিতরে না বাইরে — সিদ্ধান্ত ও কারণ লিখুন:

```text
৯।   journal header লেখা
১০।  গ্রাহককে invoice email পাঠানো
১১।  invoice কে 'posted' চিহ্নিত করা
১২।  report cache মুছে ফেলা
১৩।  voucher number বরাদ্দ
১৪।  বাইরের VAT portal-এ তথ্য পাঠানো
১৫।  stock কমানো
১৬।  ব্যবস্থাপনাকে SMS পাঠানো
```

**সেট গ — নকশা**

```text
১৭।  একটা posting মাঝপথে ব্যর্থ হলো — lines লেখা হয়ে গেছে,
     কিন্তু উৎস চিহ্নিত করার সময় ব্যর্থ। কী ঘটবে?
     আপনার নকশায় এটা কীভাবে সামলাবেন?

১৮।  ১০০০টি invoice একসাথে post করতে হবে (batch)।
     সবগুলো একটা transaction-এ, নাকি প্রতিটি আলাদা?
     দুটোর সুবিধা-অসুবিধা লিখুন এবং একটা বেছে নিন।

১৯।  একটা invoice post করার সময় দেখা গেল 'sales_revenue'
     mapping সেট করা নেই। তিনটি সম্ভাব্য আচরণ লিখুন,
     এবং কোনটা বেছে নেবেন ও কেন।

২০।  আপনার system-এ posting খুব ধীর হয়ে গেছে — একেকটা
     posting-এ ৩ সেকেন্ড। কোথায় কোথায় খুঁজবেন?
     অন্তত পাঁচটি সম্ভাব্য কারণ লিখুন।

২১।  আজ ২৮ জুলাই ২০২৫। নিচের প্রতিটি posting_date এ কী হবে —
     গ্রহণ, সতর্কতা, নাকি প্রত্যাখ্যান? যুক্তি সহ লিখুন।

     (ক)  2025-07-31        (ঘ)  2019-03-15
     (খ)  2025-08-15        (ঙ)  2052-07-15
     (গ)  2025-12-31        (চ)  2025-06-28  (জুন বন্ধ)

২২।  আটটি স্তরের প্রতিটি যাচাইয়ের জন্য বলুন — database-এ
     বসাবেন না application-এ? প্রতিটির পক্ষে এক লাইনে যুক্তি।

২৩।  আপনার team-এর একজন `SUM(debit) == SUM(credit)` কে
     একটা database trigger বানাতে চাইছেন। পক্ষে ও বিপক্ষে
     যুক্তি লিখুন, তারপর সিদ্ধান্ত নিন।
```

উত্তর আছে Workbook-এর Answer Key, অধ্যায় ৮-এ।

---

## ৯. Developer Challenge

> একটি সম্পূর্ণ **PostingService** নকশা করুন, যা system-এর প্রতিটি posting সামলাবে।
>
> যা যা নকশা করবেন:
>
> ১. `post(entryId, userId)` এর সম্পূর্ণ যুক্তি লিখুন — যাচাইয়ের ক্রম, transaction সীমানা, ফেরত মান।
> ২. যাচাইয়ের ফলাফলের গঠন নকশা করুন। UI যেন প্রতিটি ভুল সঠিক line-এ দেখাতে পারে।
> ৩. আটটি স্তরের প্রতিটির জন্য অন্তত একটি করে test case লিখুন (ছদ্মকোডে চলবে)।
> ৪. Duplicate posting ঠেকানোর সম্পূর্ণ কৌশল লিখুন — application ও database দুই স্তরেই। আংশিক posting (একটা invoice-এর একাধিক কিস্তি) থাকলে কী বদলাবে?
> ৫. একটা `postBatch(entryIds)` নকশা করুন। একটা ব্যর্থ হলে বাকিগুলোর কী হবে? তিনটি সম্ভাব্য নীতি লিখুন এবং একটা বেছে নিন।
> ৬. Posting-এর গতি মাপার জন্য কী কী metric রাখবেন? কোন সংখ্যাটা দেখলে বুঝবেন সমস্যা হচ্ছে?
>
> ৫ নম্বরটা বাস্তবে সবচেয়ে বেশি তর্কের জন্ম দেয়। "সব বা কিছুই না" নাকি "যতগুলো পারা যায়" — দুটোরই বৈধ যুক্তি আছে, আর উত্তরটা নির্ভর করে batch-টা কীসের। নিজের সিদ্ধান্ত ও শর্ত লিখে রাখুন।

---

## ১০. Summary Card

**আট স্তরের যাচাই**

```text
১.  গঠন        lines >= 2, debit==credit, ঋণাত্মক নয়
২.  Account    বিদ্যমান, একই company, সক্রিয়, পাতা
৩.  Period     বিদ্যমান ও open
৪.  অবস্থা      এখনো posted নয়
৫.  উৎস        আগে post হয়নি
৬.  অনুমতি      ব্যবহারকারীর অধিকার
৭.  ব্যবসা      module-নির্দিষ্ট নিয়ম
৮.  Atomic     একটিমাত্র transaction
```

**Atomicity**

```text
BEGIN
    যাচাই → header → lines → উৎস চিহ্নিত → status = posted
COMMIT

যেকোনো ধাপে ব্যর্থ  →  সম্পূর্ণ ROLLBACK
আংশিক posting বলে কিছু নেই
```

**Transaction সীমানা**

| ভিতরে | বাইরে |
| --- | --- |
| database লেখালেখি | email, SMS |
| যাচাই | বাইরের API |
| উৎস চিহ্নিতকরণ | PDF, cache |

**Duplicate ঠেকানো**

```text
UNIQUE (company_id, source_type, source_id)
    WHERE status IN ('posted', 'reversed')

application-এর যাচাই যথেষ্ট নয় — database লাগবেই
```

**দশমিক**

```text
DECIMAL ব্যবহার করুন, FLOAT নয়
ঠিক সমতা যাচাই করুন, "প্রায় সমান" নয়
```

**ব্যর্থতার নীতি**

```text
স্পষ্ট ব্যর্থতা  >  নীরব ভুল
কখনো suspense account এ ফেলবেন না
সব ভুল একসাথে জানান
বার্তায় বলুন: কী, কোথায়, কী করতে হবে
```

**Developer checklist**

```text
□  আট স্তরের যাচাই, সস্তা আগে
□  সব ভুল একসাথে সংগ্রহ
□  পুরো posting একটি DB transaction এ
□  email/API transaction এর বাইরে
□  UNIQUE constraint দিয়ে duplicate ঠেকানো
□  transaction এর ভিতরে lockForUpdate দিয়ে আবার যাচাই
□  DECIMAL, ঠিক সমতা
□  সব report posted_lines view দিয়ে
□  একটাই PostingService, সব module তার ভিতর দিয়ে
□  error বার্তায় করণীয় বলা আছে
□  posting_date এর period আছে ও open
□  দূর ভবিষ্যতের তারিখে সতর্কতা
□  স্থির নিয়ম DB constraint এ, পরিবর্তনশীল নিয়ম app এ
```

---

## পরবর্তী অধ্যায়

**অধ্যায় ৯ — General Ledger:** entry এখন খাতায় উঠেছে। কিন্তু journal তারিখের ক্রমে সাজানো — "Cash account-এ এ পর্যন্ত কী কী হলো" জানতে হলে একই তথ্য **account অনুযায়ী** সাজাতে হবে। পরের অধ্যায়ে সেই পুনর্বিন্যাস, opening balance, running balance, আর সবচেয়ে গুরুত্বপূর্ণ প্রশ্ন — ledger কি সংরক্ষণ করবেন, নাকি প্রতিবার হিসাব করবেন?
