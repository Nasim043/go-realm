# অধ্যায় ৪ — Debit ও Credit

> **Volume 1 · Part 1 — Accounting Fundamentals · Chapter 4**
>
> পূর্বশর্ত: অধ্যায় ১ (Accounting কী), অধ্যায় ২ (Accounting Equation), অধ্যায় ৩ (পাঁচ প্রকার Account)

---

## ১. Learning Objective

এই অধ্যায় শেষে আপনি পারবেন:

```text
Asset increase হলে কেন Debit হয় — কারণসহ ব্যাখ্যা করতে
Liability increase হলে কেন Credit হয় — কারণসহ ব্যাখ্যা করতে
পাঁচটি rule মুখস্থ না করে Accounting Equation থেকে derive করতে
যেকোনো business transaction থেকে নিজে journal entry তৈরি করতে
একটি journal entry balanced কিনা ৫ সেকেন্ডে যাচাই করতে
Debit/Credit কে database-এ কীভাবে রাখতে হয় তা design করতে
```

**সময়:** পড়া ৪৫ মিনিট + অনুশীলন ৬০ মিনিট। তাড়াহুড়ো করবেন না — পুরো বইয়ের বাকি অংশ এই একটি অধ্যায়ের উপর দাঁড়িয়ে আছে।

---

## ২. Concept Explanation

### প্রথমেই একটা ভুল ধারণা ভাঙা দরকার

বেশিরভাগ developer Debit/Credit শিখতে গিয়ে আটকে যান, কারণ তাঁরা এমন কিছু ধরে নেন যা সত্যি নয়:

| ভুল ধারণা | কেন ভুল |
| --- | --- |
| Debit মানে টাকা আসা, Credit মানে টাকা যাওয়া | Salary Payable বাড়লে Credit হয়, অথচ কোনো টাকা যায় না |
| Debit মানে ভালো, Credit মানে খারাপ | Revenue (আয়) হলো Credit — সেটা খারাপ নয় |
| Bank-এ টাকা জমা দিলে ব্যাংক "credited" বলে, তাই জমা = Credit | ব্যাংক তার **নিজের** খাতার কথা বলছে, আপনার খাতার নয় |

শেষ পয়েন্টটা সবচেয়ে বেশি বিভ্রান্তি তৈরি করে। ব্যাংক যখন SMS পাঠায় "your account has been credited" — ব্যাংকের কাছে আপনার জমা টাকা একটা **দায় (Liability)**, কারণ টাকাটা ব্যাংককে আপনাকে ফেরত দিতে হবে। দায় বাড়লে Credit। কিন্তু **আপনার** খাতায় ওই একই টাকা একটা **সম্পদ (Asset)**, তাই আপনার খাতায় সেটা Debit।

> একই ঘটনা, দুই পক্ষের খাতায় দুই রকম। এটাই বুঝে ফেললে অর্ধেক কাজ শেষ।

### তাহলে Debit/Credit আসলে কী?

সবচেয়ে সৎ উত্তরটা হলো: **Debit মানে বাঁ দিক, Credit মানে ডান দিক। ব্যাস।**

শব্দ দুটো ল্যাটিন থেকে এসেছে (*debere* = দেনা, *credere* = পাওনা), কিন্তু আজকের accounting-এ এদের আভিধানিক অর্থ কাজে লাগে না। এগুলো এখন নিছক **দিক নির্দেশক** — অনেকটা `+` আর `-` এর মতো, বা programming-এ `left` আর `right` এর মতো।

প্রশ্ন হলো — কীসের বাঁ দিক, কীসের ডান দিক?

### উত্তর: Accounting Equation-এর বাঁ দিক ও ডান দিক

অধ্যায় ২-এ শেখা equation মনে করুন:

```text
        Assets      =     Liabilities   +   Equity
    ┌─────────────┐     ┌──────────────────────────┐
    │    LEFT     │     │          RIGHT           │
    │    DEBIT    │     │          CREDIT          │
    └─────────────┘     └──────────────────────────┘
         বাঁ দিক                   ডান দিক
```

এখান থেকেই পুরো নিয়মটা বেরিয়ে আসে। মূল সূত্র মাত্র একটাই:

> **একটি account যে দিকে বসে, সেই দিকে বাড়ে। উল্টো দিকে কমে।**

- Asset বসে **বাঁ** দিকে → Asset বাড়লে **Debit**, কমলে Credit
- Liability বসে **ডান** দিকে → Liability বাড়লে **Credit**, কমলে Debit
- Equity বসে **ডান** দিকে → Equity বাড়লে **Credit**, কমলে Debit

তিনটা হয়ে গেল। বাকি দুটো — Revenue আর Expense — কোথায়?

### Revenue ও Expense আসলে Equity-র ছদ্মবেশ

Revenue আর Expense আলাদা কোনো জাত নয়। এরা **Equity-র ভিতরের অংশ**, যাদের আলাদা করে রাখা হয় যাতে বছর শেষে লাভ-ক্ষতি হিসাব করা যায়।

```text
                    Equity
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    Capital       Revenue        Expense
   (বিনিয়োগ)      (Equity ↑)     (Equity ↓)
```

এখন derive করুন:

- **Revenue** আয় হলে মালিকের মালিকানা **বাড়ে** → Equity বাড়ে → Equity ডান দিকে → **Credit**
- **Expense** খরচ হলে মালিকের মালিকানা **কমে** → Equity কমে → Equity-র উল্টো দিক → **Debit**

পাঁচটাই বেরিয়ে এল, একটাও মুখস্থ না করে।

> **এটাই এই অধ্যায়ের আসল শিক্ষা:** আপনি একটা জিনিস মনে রাখবেন — `Assets = Liabilities + Equity` এবং কোনটা কোন দিকে। বাকি পাঁচটা নিয়ম প্রতিবার নিজে বের করে নেবেন। প্রথম কয়েক সপ্তাহে ৫ সেকেন্ড লাগবে; দুই মাস পরে লাগবে না।

### Normal Balance মানে কী

একটা account যে দিকে **বাড়ে**, সেটাই তার **normal balance**। অর্থাৎ স্বাভাবিক অবস্থায় ওই account-এর ব্যালেন্স ওই দিকেই থাকে।

Cash একটা Asset, তাই তার normal balance Debit — স্বাভাবিকভাবে আপনার হাতে টাকা থাকবে (debit balance)। যদি কখনো Cash account-এ credit balance দেখা যায়, তার মানে হিসাবমতে আপনার হাতে **ঋণাত্মক টাকা** আছে — যা বাস্তবে অসম্ভব। এটা একটা bug.

> Developer হিসেবে এটা মনে রাখুন: **normal balance লঙ্ঘিত হওয়া মানে প্রায় সবসময়ই কোথাও একটা ভুল posting হয়েছে।** এটা report-এ একটা দারুণ validation check হিসেবে কাজ করে — অধ্যায় ২৭-এ আমরা এটা দিয়ে automated test লিখব।

---

## ৩. Accounting Rule

উপরের derivation-এর ফলাফল এক টেবিলে:

| Account Type | Increase | Decrease | Normal Balance | Equation-এ অবস্থান |
| --- | --- | --- | --- | --- |
| Asset | **Debit** | Credit | Debit | বাঁ দিক |
| Expense | **Debit** | Credit | Debit | Equity ↓ |
| Liability | **Credit** | Debit | Credit | ডান দিক |
| Equity | **Credit** | Debit | Credit | ডান দিক |
| Revenue | **Credit** | Debit | Credit | Equity ↑ |

লক্ষ করুন — **Debit-এ বাড়ে দুটি: Asset আর Expense। Credit-এ বাড়ে তিনটি: Liability, Equity, Revenue।** এটুকু ছন্দে মনে রাখা যায়।

### Double Entry-র মূল নিয়ম

প্রতিটি transaction-এ অন্তত দুটি account প্রভাবিত হয়, এবং সবসময়:

```text
Total Debit  =  Total Credit
```

এটা কোনো convention নয়, এটা equation-এর সরাসরি ফলাফল। যেহেতু `Assets = Liabilities + Equity` সবসময় সত্য থাকতে হবে, তাই কোনো পরিবর্তন হলে সমীকরণের ভারসাম্য বজায় রাখতেই হবে।

একটা transaction-এ দুইয়ের বেশি line-ও থাকতে পারে (একে **compound entry** বলে) — কিন্তু নিয়ম একই: সব debit-এর যোগফল = সব credit-এর যোগফল।

### লেখার ফরম্যাট

প্রথাগতভাবে journal এভাবে লেখা হয় — **Debit line আগে, বাঁ ঘেঁষে; Credit line পরে, একটু ডানে সরিয়ে:**

```text
Computer Equipment          Dr    80,000
        Cash                        Cr    80,000
```

এই indentation-টা নিছক অভ্যাস নয় — এটাই বাঁ/ডান দিকের ধারণাটাকে চোখে দেখায়।

---

## ৪. Real Business Example

### উদাহরণ ১ — নগদে ল্যাপটপ কেনা

```text
কোম্পানি নগদ টাকা দিয়ে একটি ল্যাপটপ কিনল — ৮০,০০০ টাকা।
```

ধাপে ধাপে reasoning (এই ৫টা প্রশ্ন প্রতিবার করবেন):

```text
প্রশ্ন ১: কী কী প্রভাবিত হলো?
    → ল্যাপটপ পেলাম, নগদ গেল।  দুটি account: Computer Equipment, Cash

প্রশ্ন ২: প্রতিটির type কী?
    → Computer Equipment = Asset   (এক বছরের বেশি ব্যবহার হবে)
    → Cash               = Asset

প্রশ্ন ৩: বাড়ল না কমল?
    → Computer Equipment ↑ বাড়ল
    → Cash               ↓ কমল

প্রশ্ন ৪: তাহলে Debit না Credit?
    → Asset বাড়ল  → Debit
    → Asset কমল   → Credit

প্রশ্ন ৫: Debit = Credit মিলছে?
    → 80,000 = 80,000  ✓
```

Journal:

```text
Computer Equipment          Dr    80,000
        Cash                        Cr    80,000
```

Equation-এ প্রভাব:

```text
Assets          =  Liabilities  +  Equity
+80,000 (ল্যাপটপ)
-80,000 (নগদ)
────────────
      0         =       0       +     0     ✓ ভারসাম্য অটুট
```

মোট সম্পদ বদলায়নি — শুধু **রূপ** বদলেছে। টাকা ছিল, এখন ল্যাপটপ হয়েছে।

### উদাহরণ ২ — বাকিতে ল্যাপটপ কেনা

একই ল্যাপটপ, কিন্তু এখন টাকা পরে দেবেন:

```text
Computer Equipment ↑ = Asset বাড়ল      → Debit
Accounts Payable   ↑ = Liability বাড়ল  → Credit
```

```text
Computer Equipment          Dr    80,000
        Accounts Payable            Cr    80,000
```

```text
Assets  = Liabilities + Equity
+80,000 =   +80,000   +   0        ✓
```

এবার দুই পাশই বেড়েছে। কোম্পানির সম্পদ বেড়েছে, সাথে দেনাও বেড়েছে।

### উদাহরণ ৩ — বেতন হয়েছে কিন্তু দেওয়া হয়নি

এটাই সেই জায়গা যেখানে "Debit মানে টাকা যাওয়া" ধারণাটা ভেঙে পড়ে:

```text
মাস শেষ হয়েছে। কর্মীদের বেতন ৫,০০,০০০ টাকা হয়েছে,
কিন্তু এখনো পরিশোধ করা হয়নি।
```

```text
বেতনের খরচ হয়ে গেছে (কাজ তো হয়েই গেছে)
    → Expense বাড়ল → Debit

কিন্তু টাকা এখনো দেওয়া হয়নি, কর্মীদের পাওনা রয়ে গেছে
    → Liability বাড়ল → Credit
```

```text
Salary Expense              Dr   500,000
        Salary Payable              Cr   500,000
```

**কোনো টাকা নড়েনি**, অথচ পূর্ণাঙ্গ একটা journal entry হয়েছে। এটাই accrual accounting-এর মূল কথা — যেটা অধ্যায় ১৮-এ বিস্তারিত আসবে।

পরে যখন বেতন দেওয়া হবে:

```text
Salary Payable              Dr   500,000     (দেনা মিটল → Liability কমল)
        Bank                        Cr   500,000     (ব্যাংক কমল → Asset কমল)
```

লক্ষ করুন — **দ্বিতীয় entry-তে কোনো Expense নেই।** খরচটা আগেই ধরা হয়েছে। এখানে আবার Expense লিখলে খরচ দ্বিগুণ হয়ে যাবে। এটা accounting software-এর সবচেয়ে সাধারণ bug গুলোর একটি।

---

## ৫. Implementation — Software ও Database

### Business flow থেকে Journal পর্যন্ত

উদাহরণ ২ (বাকিতে asset কেনা) software-এ কীভাবে ঘটে:

```text
User: Purchase Order approve করল
            ↓
     Asset record তৈরি হলো (assets table)
            ↓
     Supplier bill receive হলো
            ↓
  ┌──────────────────────────────────┐
  │  ACCOUNTING EVENT:               │
  │  ASSET_PURCHASED_ON_CREDIT       │
  │  { asset_id, amount, supplier }  │
  └──────────────────────────────────┘
            ↓
     Posting Rule খুঁজে বের করল কোন account
            ↓
     Journal Entry তৈরি ও post হলো
            ↓
     General Ledger আপডেট হলো
```

গুরুত্বপূর্ণ নকশার সিদ্ধান্ত: **business module সরাসরি journal লেখে না।** সে শুধু একটা *event* ঘোষণা করে, আর accounting engine সিদ্ধান্ত নেয় কোন account-এ কী বসবে। এতে ভবিষ্যতে account mapping বদলালে business code ছুঁতে হয় না। এই architecture অধ্যায় ৩২ ও ৩৩-এ বিস্তারিত আসবে — এখন শুধু ধারণাটা মাথায় থাকুক।

### Database Design

দুটি table — একটা header, একটা line:

```text
journal_entries

id                  BIGINT PK
voucher_no          VARCHAR      -- মানুষের পড়ার জন্য, unique
posting_date        DATE         -- কোন হিসাবকালে পড়বে
narration           TEXT         -- কী কারণে এই entry
source_type         VARCHAR      -- 'asset_purchase', 'payroll', ...
source_id           BIGINT       -- মূল business record-এর id
status              VARCHAR      -- 'draft' | 'posted' | 'reversed'
posted_at           TIMESTAMP
created_by          BIGINT
```

```text
journal_lines

id                  BIGINT PK
journal_entry_id    BIGINT FK
account_id          BIGINT FK
debit               DECIMAL(18,4)   DEFAULT 0
credit              DECIMAL(18,4)   DEFAULT 0
line_narration      TEXT
```

### নকশার চারটি সিদ্ধান্ত — এবং কেন

**১. `debit` ও `credit` আলাদা column, একটা signed `amount` নয়।**

অনেকে ভাবেন একটা column-এ ধনাত্মক/ঋণাত্মক রাখলেই হয়। কাজ চলে, কিন্তু হারায় অনেক কিছু: accountant-রা debit/credit ভাষায় কথা বলেন, report-এ দুটো column-ই দেখাতে হয়, আর `SUM(debit) = SUM(credit)` check-টা তখন আর সরাসরি লেখা যায় না। আলাদা রাখুন।

**২. `DECIMAL`, কখনোই `FLOAT` নয়।**

```text
FLOAT ব্যবহার করলে:
    0.1 + 0.2 = 0.30000000000000004
    → Debit আর Credit কখনো ঠিক সমান হবে না
    → Trial Balance মিলবে না
    → কেউ ধরতেও পারবে না কেন
```

টাকার হিসাবে কখনো floating point নয়। `DECIMAL(18,4)` অথবা পূর্ণসংখ্যায় পয়সা (minor unit) রাখুন।

**৩. `source_type` + `source_id` রাখুন।**

এটাই সেই সুতো যা journal entry থেকে মূল ঘটনায় ফিরে যায়। ছয় মাস পরে যখন কেউ জিজ্ঞেস করবে "এই ৮০,০০০ টাকার entry কোথা থেকে এল?" — এই দুটো column ছাড়া উত্তর দেওয়া প্রায় অসম্ভব।

**৪. `status` রাখুন — এবং posted entry কখনো মুছবেন না।**

Draft অবস্থায় সম্পাদনা করা যায়। একবার `posted` হয়ে গেলে entry **অপরিবর্তনীয়**। ভুল হলে সংশোধন হয় উল্টো entry (reversal) দিয়ে, মুছে বা edit করে নয়। এটা শুধু ভালো অভ্যাস নয় — নিরীক্ষার (audit) মৌলিক শর্ত। অধ্যায় ৩৬-এ বিস্তারিত।

### Posting-এর সময় যে validation বাধ্যতামূলক

```text
১. lines.length >= 2
২. SUM(debit) == SUM(credit)          ← কখনো বাদ দেবেন না
৩. SUM(debit) > 0                     ← সব শূন্য entry ঠেকাতে
৪. প্রতিটি line-এ debit বা credit, দুটোই নয়
৫. account_id বৈধ ও is_active
৬. account leaf node (group account-এ post করা যায় না)
৭. posting_date খোলা হিসাবকালে পড়ে
৮. পুরোটা একটি database transaction-এর ভিতরে
```

৮ নম্বরটা সবচেয়ে বেশি অবহেলিত। header লেখা হলো কিন্তু line লেখার সময় server crash করল — তখন খাতায় একটা অসম্পূর্ণ entry রয়ে গেল, আর Trial Balance চিরতরে বেঁকে গেল। **Header আর সব line একসাথে commit হবে, নয়তো কিছুই হবে না।**

---

## ৬. Financial Statement Impact

প্রতিটি journal line শেষ পর্যন্ত কোনো না কোনো report-এ গিয়ে দেখা দেয়। কোনটা কোথায় যায়:

| Account Type | কোন Statement-এ | কীভাবে |
| --- | --- | --- |
| Asset | Balance Sheet | বাঁ দিকে / উপরে |
| Liability | Balance Sheet | ডান দিকে |
| Equity | Balance Sheet | ডান দিকে |
| Revenue | Income Statement (P&L) | আয় হিসেবে |
| Expense | Income Statement (P&L) | খরচ হিসেবে |

এই অধ্যায়ের উদাহরণগুলো ধরে দেখুন:

```text
উদাহরণ ১ (নগদে ল্যাপটপ):
    দুটো line-ই Asset → দুটোই Balance Sheet-এ
    → P&L-এ কোনো প্রভাব নেই, লাভ বদলায় না

উদাহরণ ৩ (বেতন বকেয়া):
    Salary Expense  → P&L-এ, লাভ কমায়
    Salary Payable  → Balance Sheet-এ, দেনা বাড়ায়
    → এই entry-টা দুই statement-কেই ছোঁয়
```

লক্ষণীয়: বছর শেষে **Revenue ও Expense শূন্য করে দেওয়া হয়**, আর নিট ফলাফল Equity-তে জমা হয় (একে closing বলে, অধ্যায় ২১)। কিন্তু Asset, Liability, Equity কখনো শূন্য হয় না — তারা বছরের পর বছর চলতে থাকে।

তাই accounting-এ account দুই ভাগে ভাগ হয়:

```text
Permanent (Real) accounts    →  Asset, Liability, Equity     →  Balance Sheet
Temporary (Nominal) accounts →  Revenue, Expense             →  P&L, বছরান্তে শূন্য
```

---

## ৭. Common Developer Mistakes

বাস্তব production system-এ যেসব ভুল বারবার দেখা যায়:

| ভুল | কী ঘটে | সঠিক পথ |
| --- | --- | --- |
| ল্যাপটপ কেনাকে সরাসরি Expense ধরা | ওই মাসের লাভ ভুলভাবে কমে যায়, সম্পদ খাতায় ওঠে না | Asset হিসেবে ধরে প্রতি মাসে অবচয় (depreciation) |
| Debit/Credit উল্টে যাওয়া | Trial Balance মিলে যায় (!) কিন্তু report সম্পূর্ণ ভুল | Unit test-এ প্রতিটি line-এর দিক আলাদা করে assert করুন |
| Journal imbalance রেখে দেওয়া | Trial Balance মেলে না, সমস্ত report অবিশ্বাস্য হয়ে যায় | Post করার আগে বাধ্যতামূলক check |
| Posted entry delete বা edit করা | Audit trail নষ্ট, আগের report আর reproduce হয় না | Reversal entry দিন |
| `FLOAT` দিয়ে টাকার হিসাব | কয়েক পয়সার অমিল, ধরা প্রায় অসম্ভব | `DECIMAL` অথবা integer minor unit |
| Payment-এর সময় আবার Expense ধরা | খরচ দ্বিগুণ গোনা হয় | Payment শুধু Liability কমায় |
| Header ও line আলাদা transaction-এ লেখা | Crash হলে অসম্পূর্ণ entry | একটাই DB transaction |
| Group account-এ post করা | Ledger গাছের যোগফল ভুল হয় | শুধু leaf account-এ post |

দ্বিতীয় সারিটা বিশেষভাবে বিপজ্জনক — কারণ **Debit/Credit উল্টে গেলেও Trial Balance দিব্যি মিলে যায়**। যোগফল তো সমানই থাকে। এই bug শুধু তখনই ধরা পড়ে যখন কেউ report দেখে বলে "আমাদের আয় ঋণাত্মক কেন?" তাই automated test ছাড়া এটা ঠেকানো যায় না।

---

## ৮. Exercises

কাগজ-কলম নিন। প্রতিটির জন্য অধ্যায় ৪.৪-এর **পাঁচটি প্রশ্ন** ধাপে ধাপে লিখুন, তারপর journal।

**সেট ক — মৌলিক**

```text
১।  মালিক ব্যবসায় নগদ ৫,০০,০০০ টাকা বিনিয়োগ করলেন।
২।  অফিস ভাড়া নগদে পরিশোধ ২৫,০০০ টাকা।
৩।  বাকিতে কম্পিউটার কেনা হলো ১,০০,০০০ টাকা।
৪।  গ্রাহক আগের বকেয়া পরিশোধ করল ৪০,০০০ টাকা।
৫।  নগদে পণ্য বিক্রি ৬০,০০০ টাকা।
```

**সেট খ — বাকি ও সময়ের হিসাব**

```text
৬।  বাকিতে সেবা প্রদান করা হলো ১,২০,০০০ টাকা।
৭।  সরবরাহকারীর বিল পাওয়া গেল ৭৫,০০০ টাকা (এখনো দেওয়া হয়নি)।
৮।  সরবরাহকারীকে আংশিক পরিশোধ ৫০,০০০ টাকা।
৯।  বিদ্যুৎ বিল হয়েছে ৮,০০০ টাকা, পরের মাসে দেওয়া হবে।
১০। ছয় মাসের অফিস ভাড়া অগ্রিম দেওয়া হলো ১,৮০,০০০ টাকা।
```

**সেট গ — একটু কঠিন**

```text
১১। গ্রাহক ভবিষ্যৎ কাজের জন্য অগ্রিম দিল ২,০০,০০০ টাকা।
১২। ব্যাংক ঋণ নেওয়া হলো ১০,০০,০০০ টাকা।
১৩। ঋণের কিস্তি পরিশোধ ১,০০,০০০ (এর মধ্যে সুদ ১৫,০০০)।   ← compound entry
১৪। ২,০০,০০০ টাকার পণ্য ১,৪০,০০০ টাকায় বিক্রি হলো (বাকিতে)।  ← দুটি entry লাগবে
১৫। মালিক ব্যক্তিগত প্রয়োজনে ব্যবসা থেকে ৩০,০০০ টাকা নিলেন।
```

> ১৩ ও ১৪ নম্বরে দুইয়ের বেশি line লাগবে। আটকে গেলে equation-এ ফিরে যান — কোনটা বাড়ল, কোনটা কমল, কোন দিকে বসে।

**উত্তর দেখবেন না** যতক্ষণ না তিনটি সেটই শেষ করেছেন। উত্তর আছে Workbook-এর Answer Key, অধ্যায় ৪-এ।

---

## ৯. Developer Challenge

> আপনার পরিচিত যেকোনো stack-এ (Go / Laravel / Node) **Asset Purchase** post করার জন্য নকশা করুন — কোড লিখতে হবে না, নকশাটাই যথেষ্ট।
>
> যা যা ঠিক করবেন:
>
> ১. কোন কোন table লাগবে, তাদের সম্পর্ক কী
> ২. Event-এর payload-এ কী কী field থাকবে
> ৩. কোন account-এ Debit, কোনটায় Credit — এবং সেটা **hardcode না করে** কোথা থেকে আসবে
> ৪. নগদে কেনা আর বাকিতে কেনা — একই code path না আলাদা? কেন?
> ৫. একই bill ভুলবশত দুবার post হলে কী হবে, আর সেটা কীভাবে ঠেকাবেন
>
> ৫ নম্বরটার সহজ উত্তর নেই — এটা নিয়ে ভাবুন, নিজের অনুমান লিখে রাখুন। অধ্যায় ৩৭ (Idempotency)-এ যখন পৌঁছাবেন, নিজের লেখা উত্তরটার সাথে মিলিয়ে দেখবেন। এই তুলনাটাই আপনাকে সবচেয়ে বেশি শেখাবে।

---

## ১০. Summary Card

> এই অংশটুকু Quick Reference booklet-এ স্বয়ংক্রিয়ভাবে চলে যাবে। ডেস্কের পাশে রাখার জন্য।

**মূল কাঠামো**

```text
   Assets     =     Liabilities     +     Equity
   ──────           ─────────────────────────────
   DEBIT                      CREDIT
   (left)                     (right)
```

> একটি account যে দিকে বসে, সেই দিকে **বাড়ে**। উল্টো দিকে **কমে**।

| Type | বাড়লে | কমলে | Normal Balance |
| --- | --- | --- | --- |
| Asset | **Debit** | Credit | Debit |
| Expense | **Debit** | Credit | Debit |
| Liability | **Credit** | Debit | Credit |
| Equity | **Credit** | Debit | Credit |
| Revenue | **Credit** | Debit | Credit |

- Debit-এ বাড়ে **২টি** → Asset, Expense
- Credit-এ বাড়ে **৩টি** → Liability, Equity, Revenue

সবসময়: `Total Debit = Total Credit`

**যেকোনো transaction-এর জন্য পাঁচটি প্রশ্ন**

```text
১. কোন কোন account প্রভাবিত?
২. প্রতিটির type কী?
৩. বাড়ল না কমল?
৪. তাই Debit না Credit?
৫. Debit আর Credit সমান হলো তো?
```

**যে entry গুলো বারবার লাগবে**

```text
নগদে বিক্রয়                 Cash                    Dr
                                Sales Revenue           Cr

বাকিতে বিক্রয়               Accounts Receivable     Dr
                                Sales Revenue           Cr

গ্রাহকের টাকা আদায়          Cash / Bank             Dr
                                Accounts Receivable     Cr

বেতন হলো (অপরিশোধিত)        Salary Expense          Dr
                                Salary Payable          Cr

বেতন পরিশোধ                 Salary Payable          Dr
                                Bank                    Cr

সম্পদ ক্রয়                  Fixed Asset             Dr
                                Cash / Accounts Payable Cr

সরবরাহকারীর বিল             Inventory / Expense     Dr
                                Accounts Payable        Cr

সরবরাহকারীকে পরিশোধ         Accounts Payable        Dr
                                Bank                    Cr
```

**Developer checklist — post করার আগে**

```text
□  lines >= 2
□  SUM(debit) == SUM(credit)
□  SUM(debit) > 0
□  প্রতি line-এ debit বা credit, দুটো নয়
□  account সক্রিয় ও leaf
□  posting_date খোলা period-এ
□  DECIMAL, FLOAT নয়
□  পুরোটা এক DB transaction-এ
□  source_type + source_id সেট করা
```

---

## পরবর্তী অধ্যায়

**অধ্যায় ৫ — Chart of Accounts:** এই অধ্যায়ে আমরা জেনেছি কোন দিকে Debit আর কোন দিকে Credit। পরের অধ্যায়ে জানব — **account গুলো আসলে কোথা থেকে আসে**, কীভাবে তাদের সাজাতে হয়, আর কেন একটা ভুল COA নকশা পুরো system-কে বছরের পর বছর ভোগায়।
