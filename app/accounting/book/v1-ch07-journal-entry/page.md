# অধ্যায় ৭ — Journal Entry

> **Volume 1 · Part 1 — Accounting Fundamentals · Chapter 7**
>
> পূর্বশর্ত: অধ্যায় ৪ (Debit ও Credit), অধ্যায় ৬ (COA Hierarchy ও Database)

---

## ১. Learning Objective

এই অধ্যায় শেষে আপনি পারবেন:

```text
Journal Entry-র গঠন — header ও line — নকশা করতে
Simple ও Compound entry আলাদা করে লিখতে
Voucher number-এর নিরাপদ নকশা বানাতে
Draft → Submitted → Approved → Posted জীবনচক্র বুঝতে
Approved আর Posted কেন এক নয় তা ব্যাখ্যা করতে
Posted entry কেন অপরিবর্তনীয় তা যুক্তি দিয়ে বলতে
source_type / source_id দিয়ে entry-কে তার উৎসে ফিরিয়ে নিতে
প্রমাণপত্র (attachment) entry-র সাথে বেঁধে রাখতে
ছক (template) ও পুনরাবৃত্ত entry নকশা করতে
```

**সময়:** পড়া ৫০ মিনিট + অনুশীলন ৬০ মিনিট।

---

## ২. Concept Explanation

### Journal কী?

**Journal** হলো সেই খাতা যেখানে প্রতিটি লেনদেন **ঘটনার ক্রমে** প্রথমবার লেখা হয়। একে বলা হয় *book of original entry* — মূল প্রবেশের বই।

```text
    ঘটনা ঘটল
        ↓
    JOURNAL          ← প্রথমে এখানে লেখা হয় (তারিখের ক্রমে)
        ↓
    LEDGER           ← তারপর account অনুযায়ী সাজানো হয়
        ↓
    TRIAL BALANCE
        ↓
    FINANCIAL STATEMENTS
```

এই ক্রমটা গুরুত্বপূর্ণ। Journal-এ সব লেনদেন সময়ের ক্রমে থাকে — ৫ জুলাই, ৬ জুলাই, ৭ জুলাই। Ledger-এ সেই একই তথ্য account অনুযায়ী পুনর্বিন্যস্ত হয় — সব Cash একসাথে, সব Salary একসাথে (অধ্যায় ৯)।

> **একই তথ্য, দুই দৃষ্টিকোণ।** Journal প্রশ্নের উত্তর দেয় "৫ জুলাই কী কী হলো?" আর Ledger উত্তর দেয় "Cash account-এ এ পর্যন্ত কী কী হলো?"

### Journal Entry-র দুটি স্তর

একটি journal entry দুই ভাগে গঠিত — এটা সরাসরি database-এর দুটি table হয়ে যায়:

```text
    ┌─────────────────────────────────────────────┐
    │  HEADER  (journal_entries)                  │
    │                                             │
    │  voucher_no, posting_date, narration,       │
    │  source, status                             │
    │                                             │
    │  ┌───────────────────────────────────────┐  │
    │  │  LINES  (journal_lines)               │  │
    │  │                                       │  │
    │  │  account, debit, credit               │  │
    │  │  account, debit, credit               │  │
    │  │  ...                                  │  │
    │  └───────────────────────────────────────┘  │
    └─────────────────────────────────────────────┘
```

**Header** বলে — কবে, কেন, কীসের ভিত্তিতে, কী অবস্থায়।
**Lines** বলে — কোন account-এ কত।

Header ছাড়া lines অর্থহীন (কবের লেনদেন?), lines ছাড়া header অর্থহীন (কোথায় টাকা?)। **দুটো সবসময় একসাথে জন্মায় এবং একসাথে বাঁচে** — এই কথাটা অধ্যায় ৮-এ atomic posting-এ কেন্দ্রীয় হয়ে উঠবে।

### Simple বনাম Compound Entry

**Simple entry** — ঠিক দুটি line, একটি debit একটি credit:

```text
Office Rent                 Dr    25,000
        Cash                        Cr    25,000
```

**Compound entry** — দুইয়ের বেশি line। বাস্তবে এটাই বেশি দেখা যায়:

```text
Salary Expense              Dr   5,00,000
        Tax Deducted at Source      Cr      50,000
        Provident Fund Payable      Cr      30,000
        Salary Payable              Cr   4,20,000
```

একটি debit, তিনটি credit। যোগফল মিলছে: ৫,০০,০০০ = ৫০,০০০ + ৩০,০০০ + ৪,২০,০০০ ✓

Compound entry-তে দুই পাশেই একাধিক line থাকতে পারে:

```text
Inventory                   Dr   1,00,000
VAT Receivable              Dr      15,000
        Accounts Payable            Cr      90,000
        Cash                        Cr      25,000
```

দুটি debit, দুটি credit। ১,১৫,০০০ = ১,১৫,০০০ ✓

> **নিয়ম একটাই, line সংখ্যা যাই হোক:** `SUM(debit) = SUM(credit)`. অধ্যায় ৪-এ শেখা নিয়মটা এখানে line সংখ্যা নির্বিশেষে খাটে।

### কেন এক line-এ debit ও credit দুটোই রাখবেন না

একটা প্রশ্ন যা প্রায়ই আসে — এক line-এ `debit = 5000, credit = 3000` লেখা যায় না কেন? নিট তো ২০০০ debit।

যায় না, এবং কারণটা গুরুত্বপূর্ণ:

```text
নিট রাখলে যা হারায়:

    আসল লেনদেনের আকার হারিয়ে যায়
    Trial Balance এর যোগফল ভুল হয়
    Ledger এ দুটো আলাদা ঘটনা এক দেখায়
    audit trail অস্পষ্ট হয়
```

**প্রতিটি line-এ debit অথবা credit — একটি, অন্যটি শূন্য।** দুটোই শূন্য নয়, দুটোই অশূন্যও নয়। এটা posting validation-এর একটি বাধ্যতামূলক যাচাই (অধ্যায় ৮)।

### Voucher Number

প্রতিটি entry-র একটা মানুষ-পাঠযোগ্য নম্বর থাকে। `id` নয় — `id` database-এর ভিতরের ব্যাপার, voucher number মানুষের ব্যাপার।

```text
    JV-2025-07-0001
    │   │    │   │
    │   │    │   └── ক্রমিক সংখ্যা
    │   │    └────── মাস
    │   └─────────── অর্থবছর / সাল
    └─────────────── ধরন (Journal Voucher)
```

প্রচলিত ধরনগুলো:

| উপসর্গ | মানে | কখন |
| --- | --- | --- |
| JV | Journal Voucher | সাধারণ / হাতে লেখা entry |
| RV | Receipt Voucher | টাকা গ্রহণ |
| PV | Payment Voucher | টাকা প্রদান |
| SV | Sales Voucher | বিক্রয় |
| PuV | Purchase Voucher | ক্রয় |
| CN | Credit Note | বিক্রয় ফেরত |
| DN | Debit Note | ক্রয় ফেরত |

**Voucher number-এর তিনটি নিয়ম:**

```text
১.  একটি company-র মধ্যে অনন্য
২.  কখনো পুনর্ব্যবহার নয় — entry বাতিল হলেও নম্বরটা মৃত
৩.  ফাঁক থাকা দোষের নয়, কিন্তু ব্যাখ্যাযোগ্য হতে হবে
```

দ্বিতীয় নিয়মটা নিরীক্ষার জন্য গুরুত্বপূর্ণ। JV-2025-07-0042 বাতিল হলে ওই নম্বর আর কাউকে দেওয়া যাবে না — নইলে ইতিহাসে দুটো ভিন্ন লেনদেন একই নামে থাকবে।

> **Developer-দের ফাঁদ:** voucher number তৈরি করতে `SELECT MAX(...) + 1` ব্যবহার করা। দুজন ব্যবহারকারী একই সময়ে entry দিলে দুজনেই একই নম্বর পাবে। সমাধান database sequence বা যথাযথ lock — বিস্তারিত অধ্যায় ৪৭-এ। এখন শুধু বিপদটা মনে রাখুন।

### দুটি তারিখ

Journal entry-তে দুটি আলাদা তারিখ থাকে, এবং এদের গুলিয়ে ফেলা একটা সাধারণ ভুল:

| Field | মানে | উদাহরণ |
| --- | --- | --- |
| `posting_date` | কোন হিসাবকালে পড়বে | ৩১ জুলাই |
| `document_date` | মূল কাগজের তারিখ | ২৮ জুলাই (bill-এর তারিখ) |

সরবরাহকারীর bill-এর তারিখ ২৮ জুলাই, কিন্তু আপনি সেটা হিসাবে তুললেন ৩১ জুলাই — দুটোই সংরক্ষণ করুন। `posting_date` হিসাব ঠিক করে, `document_date` কাগজের সাথে মেলাতে কাজে লাগে।

আর অধ্যায় ১-এর কথা মনে রাখুন — `created_at` এদের কোনোটাই নয়। ওটা system-এ কখন ঢুকল তার রেকর্ড।

### Narration — যে জিনিসটা সবাই অবহেলা করে

প্রতিটি entry-তে একটা বর্ণনা থাকে। বেশিরভাগ system-এ এটা ঐচ্ছিক, আর ফলে বেশিরভাগ entry-তে এটা ফাঁকা বা অর্থহীন।

```text
    অকেজো                          কাজের
    ──────                         ──────
    "Salary"                       "জুলাই ২০২৫ মাসের বেতন,
                                    ১২ জন কর্মী, TDS ও PF কেটে"

    "Adjustment"                   "জুন মাসের বিদ্যুৎ বিল ভুল
                                    account-এ পড়েছিল, সংশোধন"

    "Payment"                      "সরবরাহকারী ABC Traders,
                                    bill INV-4471 এর আংশিক পরিশোধ"
```

ছয় মাস পরে যখন নিরীক্ষক জিজ্ঞেস করবেন "এই entry-টা কেন?" — narration ছাড়া উত্তর দেওয়া প্রায় অসম্ভব। বিশেষ করে হাতে লেখা adjustment entry গুলোতে narration **বাধ্যতামূলক** করা উচিত।

### প্রমাণপত্র — কাগজটা কোথায়?

Narration বলে *কেন*। প্রমাণপত্র দেখায় *কীসের ভিত্তিতে*। নিরীক্ষক দুটোই চান, এবং দ্বিতীয়টা ছাড়া প্রথমটার দাম কম।

```text
    entry                      প্রমাণপত্র
    ─────                      ──────────
    ভাড়া পরিশোধ                 ভাড়ার রসিদ
    সরবরাহকারীর bill            মূল bill এর ছবি/PDF
    বেতন                        payroll sheet, অনুমোদনের চিঠি
    ব্যাংক চার্জ                 ব্যাংক statement এর পাতা
    হাতে লেখা সমন্বয়            ব্যবস্থাপনার লিখিত নির্দেশ
```

Database-এ এটা একটা সরল সংযুক্তি table:

```text
journal_attachments

id                  BIGINT PK
journal_entry_id    BIGINT FK
file_path           VARCHAR(500)    -- সংরক্ষণাগারের ঠিকানা
file_name           VARCHAR(255)    -- মূল নাম
mime_type           VARCHAR(100)
file_size           BIGINT
checksum            CHAR(64)        -- SHA-256
uploaded_by         BIGINT
uploaded_at         TIMESTAMP

INDEX (journal_entry_id)
```

`checksum` column-টা অনেকে বাদ দেন, কিন্তু এটাই প্রমাণপত্রকে *প্রমাণ* করে তোলে। ফাইলটা পরে বদলে গেছে কিনা — checksum মিলিয়ে দেখলেই জানা যায়।

তিনটি নিয়ম:

```text
১.  Posted entry থেকে সংযুক্তি মোছা যাবে না
    (entry অপরিবর্তনীয়, তার প্রমাণও তাই)

২.  নতুন সংযুক্তি যোগ করা যাবে
    (পরে কাগজ পাওয়া গেলে জুড়ে দেওয়া দরকার)

৩.  কোন voucher_type এ প্রমাণপত্র বাধ্যতামূলক —
    সেটা নীতির প্রশ্ন, কোডে শক্ত করে বাঁধবেন না
```

তৃতীয়টা ব্যাখ্যা দরকার। "সব payment voucher-এ রসিদ লাগবেই" — এটা এক প্রতিষ্ঠানের নিয়ম, সব প্রতিষ্ঠানের নয়। তাই এটা `voucher_types` table-এ একটা `requires_attachment` পতাকা হয়ে থাকুক, `if voucher_type == 'PV'` হয়ে কোডে নয়।

> **একটা বাস্তব সতর্কতা:** ফাইলগুলো database-এ blob হিসেবে রাখবেন না। object storage-এ রাখুন, database-এ শুধু ঠিকানা। কারণ পাঁচ বছর পরে আপনার database backup-এর নব্বই শতাংশই হবে scan করা bill-এর ছবি — আর restore করতে ঘণ্টার পর ঘণ্টা লাগবে।

### জীবনচক্র — Draft থেকে Posted

একটা entry সাথে সাথেই খাতায় বসে যায় না। তার একটা যাত্রা আছে:

```text
    DRAFT
      │  ব্যবহারকারী লিখছেন, বদলাতে পারেন
      ▼
    SUBMITTED
      │  অনুমোদনের জন্য পাঠানো, আর বদলানো যাবে না
      ▼
    APPROVED
      │  অনুমোদিত, কিন্তু এখনো খাতায় ওঠেনি
      ▼
    POSTED
      │  খাতায় উঠে গেছে — এখন অপরিবর্তনীয়
      ▼
    REVERSED
         ভুল ছিল, উল্টো entry দিয়ে বাতিল করা হয়েছে
```

প্রতিটি অবস্থায় কী করা যায়:

| অবস্থা | সম্পাদনা | মুছে ফেলা | Ledger-এ দেখা যায়? |
| --- | --- | --- | --- |
| Draft | ✅ | ✅ | ❌ |
| Submitted | ❌ | ❌ (ফেরত পাঠান) | ❌ |
| Approved | ❌ | ❌ | ❌ |
| Posted | ❌ | ❌ | ✅ |
| Reversed | ❌ | ❌ | ✅ (মূল + উল্টো দুটোই) |

### Approved ≠ Posted — এই পার্থক্যটা কেন গুরুত্বপূর্ণ

এটা সবচেয়ে বেশি ভুল বোঝা অংশ। অনেক developer ভাবেন অনুমোদন হয়ে গেলেই তো খাতায় তুলে দেওয়া যায় — আলাদা দুটো অবস্থা কেন?

কারণ দুটো আলাদা প্রশ্নের উত্তর দেয়:

```text
APPROVED   →  "এই লেনদেনটা কি বৈধ? কর্তৃপক্ষ কি রাজি?"
                (ব্যবসায়িক সিদ্ধান্ত — মানুষের)

POSTED     →  "এটা কি এখন হিসাবের খাতায় আছে?"
                (হিসাবের ঘটনা — system-এর)
```

বাস্তব উদাহরণ যেখানে দুটো আলাদা হয়:

```text
১.  ২৮ জুলাই অনুমোদিত, কিন্তু জুলাই মাস তখনো বন্ধ হয়নি
    → posting হবে ৩১ জুলাই, মাস শেষে একসাথে

২.  অনুমোদিত, কিন্তু যে period-এ পড়ার কথা সেটা বন্ধ
    → posting আটকে থাকবে, নতুন সিদ্ধান্ত লাগবে

৩.  অনুমোদিত হয়েছে আগস্টে, কিন্তু হিসাব জুলাইয়ের
    → অনুমোদনের তারিখ আর posting_date আলাদা

৪.  বহু entry একসাথে অনুমোদিত, posting চলবে batch-এ
    → অনুমোদন তাৎক্ষণিক, posting নির্ধারিত সময়ে
```

> এক বাক্যে: **অনুমোদন একটা ব্যবসায়িক অনুমতি, posting একটা হিসাবের ঘটনা।** এদের একসাথে বেঁধে ফেললে পরে period lock, batch posting বা approval workflow — কোনোটাই যোগ করা যাবে না।

ছোট system-এ শুরুতে হয়তো Draft → Posted, মাঝের ধাপ ছাড়াই। সেটা ঠিক আছে — কিন্তু `status` column-টা এমনভাবে বানান যাতে পরে ধাপ যোগ করা যায়। বিস্তারিত অধ্যায় ৪১-এ।

### Posted entry কেন অপরিবর্তনীয়

এই নীতিটা পুরো বইয়ের মেরুদণ্ড, তাই যুক্তিটা পরিষ্কার হওয়া দরকার।

ধরুন একটা posted entry সম্পাদনা করতে দিলেন। কী কী ভাঙে:

```text
১.  আগের report আর মেলে না
    জুলাই মাসের Balance Sheet ছাপা হয়ে ব্যাংকে গেছে।
    এখন জুলাইয়ের একটা entry বদলে গেল।
    ব্যাংকের কাছে থাকা কাগজ আর system — দুটো আর মিলবে না।

২.  নিরীক্ষার সুতো ছিঁড়ে যায়
    কে কী বদলাল, কখন, কেন — কিছুই থাকে না।

৩.  পরের হিসাব ভুল হয়
    জুলাই বন্ধ করে আগস্টের opening balance বসানো হয়েছে।
    জুলাই বদলালে ওই opening আর ঠিক থাকে না।

৪.  বিশ্বাস নষ্ট হয়
    যদি অতীত বদলানো যায়, তাহলে কোনো report-ই নির্ভরযোগ্য নয়।
```

তাই সংশোধনের একমাত্র পথ — **উল্টো entry (reversal)**:

```text
    মূল entry (ভুল)
    Office Rent      Dr  25,000
        Cash             Cr  25,000

    উল্টো entry (বাতিলকরণ)
    Cash             Dr  25,000
        Office Rent      Cr  25,000

    সঠিক entry
    Electricity      Dr  25,000
        Cash             Cr  25,000
```

তিনটি entry-ই খাতায় থাকে। কেউ কিছু লুকায়নি — ভুলটা হয়েছিল, ধরা পড়েছে, সংশোধন হয়েছে, এবং পুরো গল্পটা পড়া যায়। **এটাই accounting-এর সততা।**

বিস্তারিত অধ্যায় ৪৩-এ।

### উৎসের সাথে সংযোগ

বেশিরভাগ journal entry হাতে লেখা হয় না — কোনো একটা ব্যবসায়িক ঘটনা থেকে আপনাআপনি তৈরি হয়। সেই সংযোগটা ধরে রাখতে হবে:

```text
    Invoice #4471 তৈরি হলো
            ↓
    journal entry তৈরি হলো
            source_type = 'sales_invoice'
            source_id   = 4471
```

এই দুটো column ছাড়া ছয় মাস পরে "এই ১,০০,০০০ টাকার entry কোথা থেকে এল?" প্রশ্নের উত্তর দেওয়া যায় না। আর উল্টো দিকেও দরকার — "এই invoice-টার হিসাব কোথায় গেল?"

```text
    entry থেকে উৎসে      →  source_type + source_id
    উৎস থেকে entry-তে    →  একই দুটি column দিয়ে খুঁজুন
```

এই জোড়াটা পরে idempotency-র ভিত্তিও হবে — একই উৎস থেকে দুবার entry তৈরি হয়ে যাওয়া ঠেকাতে (অধ্যায় ৪৬)।

### ছক ও পুনরাবৃত্ত Entry

হিসাবরক্ষকের কাজের একটা বড় অংশ **একই entry বারবার লেখা** — প্রতি মাসের ভাড়া, প্রতি মাসের অবচয়, প্রতি মাসের bank চার্জ। হাতে লিখলে প্রতিবারই ভুল account বেছে নেওয়ার সুযোগ থাকে।

দুটো আলাদা জিনিস, প্রায়ই গুলিয়ে ফেলা হয়:

```text
    ছক (Template)                  পুনরাবৃত্ত (Recurring)
    ─────────────                  ────────────────────
    account গুলো আগে থেকে বসানো     ছক + একটা সময়সূচি
    টাকা প্রতিবার ব্যবহারকারী দেন    নির্দিষ্ট দিনে আপনাআপনি entry
    মানুষ শুরু করে                  system শুরু করে
```

**ছক** — শুধু একটা প্রস্তুত কাঠামো:

```text
journal_templates                journal_template_lines

id                               id
company_id                       template_id
name          "মাসিক অবচয়"        line_no
voucher_type  JV                 account_key    'depreciation_expense'
narration     "…মাসের অবচয়"       side           Dr
is_active                        amount NULL      ← ব্যবহারকারী দেবেন
                                 amount_formula   ← অথবা হিসাব হবে
```

লক্ষ করুন এখানেও `account_key`, `account_id` নয় — অধ্যায় ৬-এর mapping। ছক একবার লেখা হয়, কিন্তু COA বদলাতে পারে।

**পুনরাবৃত্ত entry** — ছকের সাথে একটা সময়সূচি জোড়া:

```text
recurring_entries

template_id
frequency        monthly | quarterly | yearly
day_of_period    31        ← মাসের কত তারিখে
start_date       2025-01-01
end_date         2025-12-31 (বা NULL)
next_run_date    2025-08-31
last_run_id      কোন entry সর্বশেষ তৈরি হয়েছে
auto_post        false     ← সবচেয়ে গুরুত্বপূর্ণ পতাকা
```

`auto_post` নিয়ে একটা সিদ্ধান্ত নিতে হবে, আর এটা হালকা সিদ্ধান্ত নয়:

```text
    auto_post = false (সুপারিশ)        auto_post = true
    ─────────────────────────         ────────────────
    entry draft হয়ে অপেক্ষা করে         সরাসরি posted
    মানুষ দেখে, তারপর post করে         কেউ দেখে না

    ভাড়া প্রতি মাসে একই — ঠিক আছে      ভাড়া বেড়েছে, কেউ জানল না
    কিন্তু ২৫টা ছক হলে ২৫টা কাজ         তিন মাস পরে ধরা পড়ল
```

**সুপারিশ: `auto_post = false` দিয়ে শুরু করুন।** যে ছকগুলো সত্যিই কখনো বদলায় না (যেমন straight-line অবচয়) শুধু সেগুলোতে পরে `true` করুন — এবং সেসব ক্ষেত্রেও একটা মাসিক প্রতিবেদন রাখুন "এই মাসে কী কী আপনাআপনি post হয়েছে"।

পুনরাবৃত্ত entry-তে তিনটি ফাঁদ:

```text
১.  ৩১ তারিখ, কিন্তু ফেব্রুয়ারিতে ৩১ নেই
    → "মাসের শেষ দিন" হিসেবে ব্যাখ্যা করুন, ৩১ নয়

২.  job দুবার চলল, দুবার entry হলো
    → source_type = 'recurring', source_id = ঐ মাসের run id
       তারপর অধ্যায় ৮-এর UNIQUE constraint কাজ করবে

৩.  Period বন্ধ, তবু job entry বানাতে চাইল
    → ব্যর্থ হোক, এবং কাউকে জানাক — চুপ করে বাদ দেওয়া নয়
```

দ্বিতীয়টা লক্ষ করুন — পুনরাবৃত্ত entry-ও অন্য সব entry-র মতোই একটা **উৎস** পায়। এটাই এই বইয়ের বারবার ফিরে আসা নকশা: system-এর প্রতিটি entry কোনো না কোনো উৎস থেকে আসে, এবং সেই উৎসই তার duplicate ঠেকানোর চাবি।

---

## ৩. Accounting Rule

**Journal Entry-র গঠনগত নিয়ম**

```text
১.  প্রতিটি entry-তে অন্তত দুটি line
২.  প্রতিটি line-এ debit অথবা credit — একটি, দুটি নয়
৩.  SUM(debit) = SUM(credit)
৪.  SUM(debit) > 0
৫.  প্রতিটি line একটি সক্রিয় posting account-এ
```

**জীবনচক্রের নিয়ম**

```text
Draft      →  বদলানো যায়, মোছা যায়
Submitted  →  বদলানো যায় না, ফেরত পাঠানো যায়
Approved   →  অনুমোদিত, কিন্তু খাতায় ওঠেনি
Posted     →  খাতায় উঠেছে, অপরিবর্তনীয়
Reversed   →  উল্টো entry দিয়ে বাতিল, মূলটা থেকে যায়
```

**অলঙ্ঘনীয় নীতি**

```text
Posted entry কখনো সম্পাদনা বা মুছে ফেলা যাবে না।
সংশোধন হবে শুধু reversal দিয়ে।
```

**Voucher Number**

```text
company-র মধ্যে অনন্য
কখনো পুনর্ব্যবহার নয়
MAX()+1 দিয়ে তৈরি করবেন না
```

---

## ৪. Real Business Example

### উদাহরণ ১ — Simple entry, হাতে লেখা

```text
৫ জুলাই ২০২৫ — জুলাই মাসের অফিস ভাড়া ২৫,০০০ টাকা
নগদে পরিশোধ করা হলো।
```

```text
HEADER
    voucher_no      PV-2025-07-0012
    posting_date    2025-07-05
    document_date   2025-07-05
    narration       জুলাই ২০২৫ মাসের অফিস ভাড়া, নগদে পরিশোধ
    source_type     manual
    source_id       NULL
    status          posted

LINES
    5220  Office Rent            Dr    25,000
    1110  Cash in Hand                    Cr    25,000
```

### উদাহরণ ২ — Compound entry, payroll থেকে

```text
৩১ জুলাই ২০২৫ — জুলাই মাসের বেতন ৫,০০,০০০ টাকা।
TDS কাটা হয়েছে ৫০,০০০, PF ৩০,০০০।
নিট ৪,২০,০০০ আগস্টে দেওয়া হবে।
```

```text
HEADER
    voucher_no      JV-2025-07-0089
    posting_date    2025-07-31
    document_date   2025-07-31
    narration       জুলাই ২০২৫ বেতন, ১২ জন কর্মী, TDS ও PF কেটে
    source_type     payroll_run
    source_id       57
    status          posted

LINES
    5210  Salary & Allowance     Dr   5,00,000
    2150  Tax Deducted at Source          Cr      50,000
    2170  Provident Fund Payable          Cr      30,000
    2120  Salary Payable                  Cr   4,20,000
```

যাচাই: ৫,০০,০০০ = ৫০,০০০ + ৩০,০০০ + ৪,২০,০০০ ✓

লক্ষ করুন `source_type = 'payroll_run'`, `source_id = 57` — payroll module-এর ৫৭ নম্বর run থেকে এটা তৈরি হয়েছে। ছয় মাস পরেও এই সূত্র ধরে মূল হিসাবে পৌঁছানো যাবে।

### উদাহরণ ৩ — ভুল ধরা পড়ল, সংশোধন

```text
১০ আগস্ট — ধরা পড়ল যে ৫ জুলাইয়ের ২৫,০০০ টাকা আসলে
বিদ্যুৎ বিল ছিল, অফিস ভাড়া নয়।
```

জুলাই মাস তখনো খোলা আছে ধরে নিলে, তিনটি entry হবে:

```text
মূল entry — অপরিবর্তিত থাকবে
    PV-2025-07-0012    posting_date 2025-07-05    status: reversed
        5220  Office Rent          Dr  25,000
        1110  Cash in Hand             Cr  25,000

উল্টো entry
    JV-2025-08-0034    posting_date 2025-08-10
        narration: PV-2025-07-0012 এর বাতিলকরণ, ভুল account
        1110  Cash in Hand         Dr  25,000
        5220  Office Rent              Cr  25,000

সঠিক entry
    JV-2025-08-0035    posting_date 2025-08-10
        narration: জুলাই মাসের বিদ্যুৎ বিল, PV-2025-07-0012 এর সংশোধন
        5230  Electricity          Dr  25,000
        1110  Cash in Hand             Cr  25,000
```

তিনটিই খাতায় রইল। Cash-এর নিট প্রভাব শূন্য নয় — ২৫,০০০ কমেছে, যা সঠিক। শুধু খরচটা এখন ঠিক account-এ।

> লক্ষ করুন উল্টো ও সঠিক entry-র `posting_date` আগস্ট, জুলাই নয়। কারণ ভুলটা আগস্টে ধরা পড়েছে। জুলাইয়ের report ইতিমধ্যে দেওয়া হয়ে থাকলে সেটা অপরিবর্তিত থাকবে — আর এটাই কাম্য। কখন জুলাইয়ে ফিরে সংশোধন করা উচিত আর কখন নয়, সেটা অধ্যায় ৪৩-এর বিষয়।

---

## ৫. Implementation — Software ও Database

### সম্পূর্ণ schema

```text
journal_entries

id                  BIGINT PK
company_id          BIGINT FK
voucher_no          VARCHAR(40)
voucher_type        VARCHAR(10)     -- JV, RV, PV, SV ...
posting_date        DATE            -- কোন period-এ পড়বে
document_date       DATE            -- মূল কাগজের তারিখ
period_id           BIGINT FK       -- posting_date থেকে নির্ধারিত
narration           TEXT

source_type         VARCHAR(60)     -- 'sales_invoice', 'payroll_run', 'manual'
source_id           BIGINT NULL

status              VARCHAR(20)     -- draft|submitted|approved|posted|reversed
reversal_of_id      BIGINT FK NULL  -- এটি কোন entry-র উল্টো
reversed_by_id      BIGINT FK NULL  -- এটিকে কে উল্টেছে

created_by          BIGINT
created_at          TIMESTAMP
submitted_by        BIGINT NULL
submitted_at        TIMESTAMP NULL
approved_by         BIGINT NULL
approved_at         TIMESTAMP NULL
posted_by           BIGINT NULL
posted_at           TIMESTAMP NULL

UNIQUE (company_id, voucher_no)
INDEX  (company_id, posting_date)
INDEX  (company_id, source_type, source_id)
INDEX  (company_id, status)
```

```text
journal_lines

id                  BIGINT PK
journal_entry_id    BIGINT FK
line_no             SMALLINT        -- প্রদর্শনের ক্রম
account_id          BIGINT FK
debit               DECIMAL(18,4) NOT NULL DEFAULT 0
credit              DECIMAL(18,4) NOT NULL DEFAULT 0
line_narration      TEXT NULL

-- ভবিষ্যতের মাত্রা (অধ্যায় ৩৪)
cost_center_id      BIGINT FK NULL
project_id          BIGINT FK NULL

INDEX (journal_entry_id)
INDEX (account_id)

CHECK (debit >= 0 AND credit >= 0)
CHECK (NOT (debit > 0 AND credit > 0))
```

### দুটি CHECK constraint কেন গুরুত্বপূর্ণ

```text
CHECK (debit >= 0 AND credit >= 0)
```

ঋণাত্মক মান ঠেকায়। `debit = -5000` লিখে credit-এর কাজ করানো একটা প্রলোভন — কিন্তু তাতে Trial Balance-এর যোগফল ভুল হবে, আর report-এ সংখ্যা উল্টে যাবে।

```text
CHECK (NOT (debit > 0 AND credit > 0))
```

এক line-এ দুটোই থাকা ঠেকায় — উপরে যে কারণে বলেছি।

> এই দুটো **application-এ যাচাই করলেই যথেষ্ট নয়**। Database-এ constraint দিন। কারণ data migration, সরাসরি SQL, বা অন্য কোনো service — সবাই application-এর যুক্তির ভিতর দিয়ে যায় না।

### অবস্থা পরিবর্তনের যুক্তি

কোন অবস্থা থেকে কোথায় যাওয়া যায়, সেটা একটাই জায়গায় লিখে রাখুন:

```text
draft      →  submitted, (মুছে ফেলা)
submitted  →  approved, draft (ফেরত পাঠানো)
approved   →  posted, draft (ফেরত পাঠানো)
posted     →  reversed
reversed   →  (কোথাও নয় — শেষ অবস্থা)
```

এর বাইরের যেকোনো পরিবর্তন প্রত্যাখ্যাত হবে:

```text
canTransition(from, to):

    allowed = {
        draft:      [submitted],
        submitted:  [approved, draft],
        approved:   [posted, draft],
        posted:     [reversed],
        reversed:   [],
    }

    return to in allowed[from]
```

লক্ষ করুন `posted → draft` কোথাও নেই। একবার খাতায় উঠলে আর ফেরার পথ নেই — শুধু reversal।

### Voucher number নিরাপদে তৈরি করা

```text
        যা করবেন না
        ───────────
        next = SELECT MAX(seq) + 1 FROM journal_entries WHERE ...

        দুজন একসাথে চাইলে দুজনেই একই সংখ্যা পাবে
```

```text
        যা করবেন
        ────────
        একটা আলাদা counter table, সারি-ভিত্তিক lock সহ:

        voucher_sequences
        ─────────────────
        company_id
        voucher_type
        fiscal_year
        period_no
        last_number

        UNIQUE (company_id, voucher_type, fiscal_year, period_no)
```

নম্বর নেওয়ার সময় ওই একটি সারিতে lock নিয়ে বাড়ান, তারপর ছেড়ে দিন। বিস্তারিত ও বিকল্প পদ্ধতি অধ্যায় ৪৭-এ।

### Entry তৈরির পরিষ্কার interface

Business module গুলো যেন সরাসরি table-এ না লেখে। একটাই দরজা রাখুন:

```text
JournalService.create({
    company_id,
    voucher_type,
    posting_date,
    document_date,
    narration,
    source_type,
    source_id,
    lines: [
        { account_key: 'salary_expense',  debit:  500000 },
        { account_key: 'tds_payable',     credit:  50000 },
        { account_key: 'pf_payable',      credit:  30000 },
        { account_key: 'salary_payable',  credit: 420000 },
    ],
})
```

লক্ষ করুন lines-এ `account_key`, `account_id` নয় — অধ্যায় ৬-এর account mapping এখানে কাজে আসছে। Payroll module জানে না salary কোন account-এ যায়; সে শুধু ভূমিকার নাম বলে।

এই service-টাই পরে posting validation ও atomic posting ধারণ করবে — সেটাই পরের অধ্যায়।

---

## ৬. Financial Statement Impact

Journal entry নিজে কোনো report নয়, কিন্তু **সব report-এর একমাত্র উৎস**:

```text
        journal_lines
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
  Ledger  Trial Bal.  Statements
```

তাই একটা entry-র প্রতিটি line কোন report-এ যাবে, সেটা তার account-এর প্রকার দিয়েই ঠিক হয় (অধ্যায় ৩):

উদাহরণ ২-এর payroll entry ধরুন:

```text
5210  Salary & Allowance      Dr  5,00,000   →  P&L, লাভ কমাবে
2150  Tax Deducted at Source      Cr  50,000 →  Balance Sheet, দায়
2170  Provident Fund Payable      Cr  30,000 →  Balance Sheet, দায়
2120  Salary Payable              Cr 4,20,000→  Balance Sheet, দায়
```

একটি entry, দুই statement। P&L-এ ৫,০০,০০০ খরচ দেখাবে, Balance Sheet-এ ৫,০০,০০০ দায় বাড়বে। সমীকরণ মিলছে — Equity কমল ৫,০০,০০০ (খরচের মাধ্যমে), Liability বাড়ল ৫,০০,০০০।

> **কেবল posted entry report-এ যায়।** Draft, submitted, approved — কোনোটাই নয়। এটা report query-র প্রতিটি জায়গায় `status = 'posted'` শর্ত হিসেবে থাকতে হবে। এই একটা শর্ত ভুলে যাওয়া একটা মারাত্মক bug — অনুমোদিত-কিন্তু-অপোস্টেড entry গুলো report-এ ঢুকে পড়বে।

---

## ৭. Common Developer Mistakes

| ভুল | কী ঘটে | সঠিক পথ |
| --- | --- | --- |
| Posted entry সম্পাদনা করতে দেওয়া | আগের report আর মেলে না | Reversal দিয়ে সংশোধন |
| Approved আর Posted এক করে ফেলা | Period lock, batch posting যোগ করা যায় না | দুটি আলাদা অবস্থা |
| এক line-এ debit ও credit দুটোই | Trial Balance ভুল, ledger অস্পষ্ট | CHECK constraint |
| ঋণাত্মক debit দিয়ে credit বোঝানো | যোগফল ভুল, report উল্টো | CHECK (debit >= 0) |
| `MAX()+1` দিয়ে voucher number | দুজন একসাথে হলে সংঘর্ষ | sequence বা lock |
| Voucher number পুনর্ব্যবহার | ইতিহাসে দুটো লেনদেন একই নামে | কখনো পুনর্ব্যবহার নয় |
| `source_type`/`source_id` না রাখা | entry-র উৎস আর খুঁজে পাওয়া যায় না | সবসময় রাখুন |
| Report-এ `status = 'posted'` না দেওয়া | draft entry report-এ ঢুকে পড়ে | প্রতিটি report query-তে |
| Narration ফাঁকা রাখতে দেওয়া | নিরীক্ষায় ব্যাখ্যা দেওয়া যায় না | manual entry-তে বাধ্যতামূলক |
| `document_date` না রাখা | কাগজের সাথে মেলানো যায় না | দুটো তারিখই রাখুন |
| Business module সরাসরি table-এ লেখা | যাচাই এড়িয়ে যায় | একটাই JournalService |
| প্রমাণপত্র database-এ blob হিসেবে | backup ফুলে যায়, restore ধীর | object storage, DB-তে ঠিকানা |
| Posted entry-র সংযুক্তি মুছতে দেওয়া | প্রমাণ হারায়, নিরীক্ষা আটকায় | যোগ করা যায়, মোছা নয় |
| ছকে `account_id` বসানো | COA বদলালে ছক ভুল account-এ পাঠায় | `account_key` দিয়ে mapping |
| পুনরাবৃত্ত entry সরাসরি auto-post | বদলে যাওয়া অঙ্ক কেউ দেখে না | draft রাখুন, মানুষ post করুক |
| পুনরাবৃত্ত entry-তে উৎস না রাখা | job দুবার চললে দুবার entry | `source_type='recurring'` |

শেষ সারিটা বিশেষভাবে গুরুত্বপূর্ণ। প্রতিটি module যদি নিজে নিজে `INSERT INTO journal_lines` করে, তাহলে কোনো একটা module কোনো একটা যাচাই ভুলে যাবেই। **একটাই দরজা রাখুন, সব যাচাই সেখানে।**

---

## ৮. Exercises

**সেট ক — Journal Entry লিখুন**

প্রতিটির জন্য সম্পূর্ণ entry লিখুন — header (voucher type, narration, source) ও lines সহ:

```text
১।   ১ জুলাই — মালিক ব্যাংকে ১০,০০,০০০ টাকা বিনিয়োগ করলেন।

২।   ৩ জুলাই — ৩,০০,০০০ টাকার আসবাব কেনা হলো। ১,০০,০০০ নগদে,
     বাকি ২,০০,০০০ বাকিতে।

৩।   ৮ জুলাই — গ্রাহক ABC Ltd কে ৫,০০,০০০ টাকার সেবার বিল
     পাঠানো হলো। VAT ৭৫,০০০ যোগ করে মোট ৫,৭৫,০০০।

৪।   ১৫ জুলাই — ABC Ltd ৩,০০,০০০ টাকা পরিশোধ করল ব্যাংকে।

৫।   ২০ জুলাই — সরবরাহকারীর bill এল ২,০০,০০০ টাকার মালামালের।
     VAT ৩০,০০০ যোগ করে মোট ২,৩০,০০০।

৬।   ৩১ জুলাই — মাসিক অবচয় ধরা হলো: কম্পিউটার ১৫,০০০,
     আসবাব ৫,০০০, গাড়ি ২০,০০০।

৭।   ৩১ জুলাই — ব্যাংক সার্ভিস চার্জ কাটল ২,০০০ টাকা এবং
     সুদ দিল ৮,০০০ টাকা।
```

> ৭ নম্বরে একটাই entry হবে না দুটো — সিদ্ধান্ত নিন এবং যুক্তি দিন।

**সেট খ — জীবনচক্র**

```text
৮।   একটি entry `approved` অবস্থায় আছে। ব্যবহারকারী দেখলেন
     একটা line-এর টাকা ভুল। কী করা উচিত? ধাপে ধাপে লিখুন।

৯।   একটি entry `posted` হয়ে গেছে, তারপর দেখা গেল একটা line
     ভুল account-এ গেছে। কী করবেন?

১০।  একটি entry `posted`, কিন্তু সেই period এখন `closed`।
     ভুল ধরা পড়েছে। এখন কী করবেন?

১১।  একজন ব্যবহারকারী `posted` entry-র `narration` ঠিক করতে
     চাইছেন — শুধু বানান ভুল, টাকা ঠিক আছে। অনুমতি দেবেন?
     আপনার যুক্তি লিখুন।
```

**সেট গ — নকশা**

```text
১২।  নিচের প্রতিটি ঘটনার জন্য `source_type` কী হবে ঠিক করুন:

     (ক)  গ্রাহকের invoice
     (খ)  গ্রাহকের payment
     (গ)  মাসিক payroll
     (ঘ)  মাসিক depreciation
     (ঙ)  হাতে লেখা সমন্বয়
     (চ)  ব্যাংক statement থেকে আমদানি করা লেনদেন

১৩।  একটি entry-র lines এভাবে এল:

         account 1110   debit 5000   credit 3000

     আপনার system কী করবে? error বার্তাটা কী হবে?

১৪।  দুজন ব্যবহারকারী একই মুহূর্তে entry save করলেন।
     দুজনেই voucher number পেল JV-2025-07-0045।
     এটা কীভাবে ঠেকাবেন — দুটি ভিন্ন সমাধান লিখুন।

১৫।  একটি posted entry-র সাথে ভুল bill-এর ছবি জুড়ে গেছে।
     সঠিক ছবিটা এখন যোগ করতে হবে। ভুলটা কি মুছে ফেলবেন?
     আপনার নীতি ও তার যুক্তি লিখুন।

১৬।  "প্রতি মাসের ৩১ তারিখে অবচয়" — একটি পুনরাবৃত্ত ছক।
     ২০২৫ সালের ১২ মাসে কোন কোন তারিখে entry হবে?
     ফেব্রুয়ারি ও এপ্রিলে কী হবে?

১৭।  একটি পুনরাবৃত্ত ছক থেকে জুলাইয়ের entry তৈরি হলো।
     তারপর দেখা গেল job-টা আবার চলেছে। দ্বিতীয়বার কী হবে —
     আপনার নকশায় ঠিক কোন জায়গায় এটা আটকাবে?
```

উত্তর আছে Workbook-এর Answer Key, অধ্যায় ৭-এ।

---

## ৯. Developer Challenge

> একটি **JournalService** নকশা করুন যার ভিতর দিয়ে system-এর প্রতিটি entry যাবে।
>
> যা যা নকশা করবেন:
>
> ১. `create`, `submit`, `approve`, `post`, `reverse` — প্রতিটির signature ও আচরণ লিখুন। কোনটা কী ফেরত দেবে?
> ২. অবস্থা পরিবর্তনের সম্পূর্ণ তালিকা লিখুন। অনুমোদিত নয় এমন পরিবর্তনের চেষ্টা হলে কী হবে?
> ৩. `lines` এ `account_key` আসবে না `account_id`? দুটোই সমর্থন করবেন? আপনার সিদ্ধান্তের পক্ষে যুক্তি দিন।
> ৪. Voucher number তৈরির সম্পূর্ণ যুক্তি লিখুন — concurrency সহ। একই সময়ে ১০০টি অনুরোধ এলে কী হবে?
> ৫. `reverse` কীভাবে কাজ করবে? উল্টো entry-র `posting_date` কী হবে — মূল entry-র তারিখ, নাকি আজকের? কখন কোনটা?
> ৬. একটা entry-র lines পড়ে দেখাতে হবে ledger-এ। কিন্তু account-এর নাম পরে বদলে গেছে। Report-এ কোন নাম দেখাবেন — তখনকার, নাকি এখনকার? এটা একটা নকশার সিদ্ধান্ত — আপনার পছন্দ ও কারণ লিখুন।
>
> ৬ নম্বরটা দেখতে তুচ্ছ কিন্তু বাস্তবে গভীর — এটা আসলে "ইতিহাস কতটা হিমায়িত রাখবেন" প্রশ্নের ছোট সংস্করণ। উত্তর নিয়ে ভাবুন, অধ্যায় ৪৫-এ (Audit Trail) এই প্রশ্নটাই বড় আকারে ফিরে আসবে।

---

## ১০. Summary Card

**গঠন**

```text
HEADER  (journal_entries)     কবে, কেন, কীসের ভিত্তিতে, কী অবস্থায়
   └─ LINES  (journal_lines)  কোন account এ কত
```

**পাঁচটি গঠনগত নিয়ম**

```text
১.  অন্তত দুটি line
২.  প্রতি line এ debit অথবা credit — একটি
৩.  SUM(debit) = SUM(credit)
৪.  SUM(debit) > 0
৫.  প্রতিটি account সক্রিয় ও পাতা
```

**জীবনচক্র**

| অবস্থা | সম্পাদনা | Ledger-এ |
| --- | --- | --- |
| Draft | ✅ | ❌ |
| Submitted | ❌ | ❌ |
| Approved | ❌ | ❌ |
| Posted | ❌ | ✅ |
| Reversed | ❌ | ✅ |

```text
Approved  →  ব্যবসায়িক অনুমতি (মানুষের সিদ্ধান্ত)
Posted    →  হিসাবের ঘটনা (system এর কাজ)

এই দুটো কখনো এক করবেন না
```

**তিনটি তারিখ**

| Field | মানে |
| --- | --- |
| `posting_date` | কোন period-এ পড়বে |
| `document_date` | মূল কাগজের তারিখ |
| `created_at` | কখন system-এ ঢুকল |

**অলঙ্ঘনীয়**

```text
Posted entry কখনো edit বা delete নয়
সংশোধন শুধু reversal দিয়ে
মূল entry খাতায় থেকে যাবে
```

**ছক বনাম পুনরাবৃত্ত**

```text
ছক          account বসানো, টাকা মানুষ দেয়, মানুষ শুরু করে
পুনরাবৃত্ত   ছক + সময়সূচি, system শুরু করে

ডিফল্ট auto_post = false — মানুষ দেখে তারপর post
"মাসের ৩১" নয়, "মাসের শেষ দিন"
```

**প্রমাণপত্র**

```text
object storage এ ফাইল, database এ ঠিকানা + checksum
posted entry তে যোগ করা যায়, মোছা যায় না
requires_attachment একটা নীতি, কোডে শক্ত নিয়ম নয়
```

**Developer checklist**

```text
□  CHECK (debit >= 0 AND credit >= 0)
□  CHECK (NOT (debit > 0 AND credit > 0))
□  UNIQUE (company_id, voucher_no)
□  voucher number sequence/lock দিয়ে, MAX()+1 নয়
□  voucher number কখনো পুনর্ব্যবহার নয়
□  source_type + source_id সবসময়
□  status পরিবর্তন একটাই যুক্তিতে
□  posted → draft কোথাও নেই
□  প্রতিটি report query তে status = 'posted'
□  manual entry তে narration বাধ্যতামূলক
□  সব module একটাই JournalService দিয়ে
□  সংযুক্তি object storage এ, checksum সহ
□  posted entry র সংযুক্তি যোগ হয়, মোছা যায় না
□  ছকে account_key, account_id নয়
□  পুনরাবৃত্ত entry ডিফল্টে draft, auto_post নয়
□  পুনরাবৃত্ত entry র source_id = ঐ run
```

---

## পরবর্তী অধ্যায়

**অধ্যায় ৮ — Posting ও Validation:** entry-র গঠন জানা হলো, জীবনচক্র জানা হলো। পরের অধ্যায়ে সবচেয়ে গুরুত্বপূর্ণ মুহূর্তটা — **posting**। কী কী যাচাই না করে কখনো post করা যাবে না, পুরো কাজটা কেন একটিমাত্র database transaction-এ হতে হবে, আর মাঝপথে ব্যর্থ হলে কী ঘটে।
