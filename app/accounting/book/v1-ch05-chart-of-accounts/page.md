# অধ্যায় ৫ — Chart of Accounts

> **Volume 1 · Part 1 — Accounting Fundamentals · Chapter 5**
>
> পূর্বশর্ত: অধ্যায় ৩ (পাঁচ প্রকার Account), অধ্যায় ৪ (Debit ও Credit)

---

## ১. Learning Objective

এই অধ্যায় শেষে আপনি পারবেন:

```text
Chart of Accounts কী এবং কেন এটি system-এর backbone তা ব্যাখ্যা করতে
Account code এর numbering scheme নিজে নকশা করতে
Group, Posting, Control ও System account আলাদা করতে
একটি account আদৌ তৈরি করা উচিত কিনা তা সিদ্ধান্ত নিতে
একটি নতুন ব্যবসার জন্য সম্পূর্ণ COA নিজে বানাতে
ভুল COA নকশার দীর্ঘমেয়াদি ক্ষতি চিনতে
```

**সময়:** পড়া ৫০ মিনিট + অনুশীলন ৬০ মিনিট।

---

## ২. Concept Explanation

### Chart of Accounts কী?

**Chart of Accounts (COA)** হলো একটি প্রতিষ্ঠানের সব account-এর সংগঠিত তালিকা — প্রতিটির একটি code, একটি নাম, একটি প্রকার, এবং একটি নির্দিষ্ট অবস্থান।

Developer-এর ভাষায় সবচেয়ে সৎ তুলনাটা হলো:

> **COA হলো আপনার accounting system-এর schema।**

Database schema যেমন ঠিক করে দেয় কী কী তথ্য রাখা যাবে, COA তেমনি ঠিক করে দেয় কী কী প্রশ্নের উত্তর আপনার system দিতে পারবে। Schema-তে column না থাকলে সেই তথ্য কখনো পাওয়া যাবে না — COA-তে account না থাকলে সেই হিসাবও কখনো আলাদা করে জানা যাবে না।

```text
        Chart of Accounts
                │
        ┌───────┴────────┐
        ▼                ▼
   কী record হবে    কী report পাওয়া যাবে
```

### কেন এটাই সবচেয়ে গুরুত্বপূর্ণ নকশার সিদ্ধান্ত

একটা accounting system-এ COA বদলানো সবচেয়ে ব্যয়বহুল কাজ। কারণ:

```text
COA বদলালে যা যা ভাঙে:

    পুরনো journal entry গুলো পুরনো account-এ বাঁধা
    আগের বছরের report আর reproduce হয় না
    তুলনামূলক report (এ বছর বনাম গত বছর) অর্থহীন হয়ে যায়
    posting rule গুলো নতুন করে লিখতে হয়
    integration করা বাইরের system গুলো ভেঙে যায়
```

তাই নিয়মটা এক লাইনে:

> **COA প্রথমবারেই ঠিকভাবে নকশা করুন। পরে ঠিক করে নেব — এই সুযোগ এখানে নেই।**

বাস্তবে অবশ্যই নতুন account যোগ হবে, সেটা স্বাভাবিক। কিন্তু **কাঠামো** — কয়টি স্তর, numbering কেমন, কোন গভীরতায় কী থাকবে — এটা শুরুতেই স্থির হওয়া দরকার।

### Account Code — সংখ্যায় অর্থ

প্রতিটি account-এর একটা code থাকে। এটা নিছক পরিচয় নয় — **code নিজেই তথ্য বহন করে।**

প্রচলিত রীতি হলো **প্রথম অঙ্ক দিয়ে প্রকার বোঝানো**:

| প্রথম অঙ্ক | প্রকার |
| --- | --- |
| 1 | Asset |
| 2 | Liability |
| 3 | Equity |
| 4 | Revenue |
| 5 | Expense |

এই একটা রীতি মানলেই code দেখেই বোঝা যায় account-টা কী:

```text
1110  →  1 দিয়ে শুরু  →  Asset
4100  →  4 দিয়ে শুরু  →  Revenue
5200  →  5 দিয়ে শুরু  →  Expense
```

কিছু প্রতিষ্ঠান ৫-এর বদলে ৬ থেকে Expense শুরু করে (৫ রাখে Cost of Goods Sold-এর জন্য)। যেটাই নিন, **একবার ঠিক করে সারাজীবন মেনে চলুন**।

### অঙ্কের সংখ্যা — কত রাখবেন?

```text
৩ অঙ্ক    110       ছোট ব্যবসা, সরল কাঠামো
৪ অঙ্ক    1110      সবচেয়ে প্রচলিত, বেশিরভাগ ক্ষেত্রে যথেষ্ট
৫ অঙ্ক    11100     বড় প্রতিষ্ঠান, অনেক বিভাগ
৬+ অঙ্ক   111000    ERP, multi-branch, বহু স্তর
```

**পরামর্শ: ৪ অঙ্ক দিয়ে শুরু করুন।** কম হলে জায়গা ফুরিয়ে যাবে, বেশি হলে মানুষ মনে রাখতে পারবে না। প্রয়োজনে পরে একটা suffix যোগ করা যায়, কিন্তু মূল দৈর্ঘ্য বদলানো কঠিন।

### সবচেয়ে দামি পরামর্শ: ফাঁক রাখুন

নতুনরা প্রায় সবাই এই ভুলটা করেন — পরপর নম্বর দিয়ে দেন:

```text
    ভুল                     সঠিক
    ────                    ─────
    1101  Cash              1110  Cash
    1102  Bank              1120  Bank
    1103  Receivable        1130  Accounts Receivable
    1104  Inventory         1140  Inventory
```

বাঁ দিকেরটায় সমস্যা কী? ছয় মাস পরে যখন `Petty Cash` যোগ করতে হবে, সেটা `Cash`-এর পাশে বসাতে চাইবেন — কিন্তু ১১০১ আর ১১০২-এর মাঝে কোনো সংখ্যা নেই। তখন হয় ১১০৫ দিয়ে তালিকার শেষে ফেলতে হবে (যেখানে সে বেমানান), নয়তো পুরো numbering বদলাতে হবে।

ডান দিকেরটায় ১১১০ আর ১১২০-এর মাঝে নয়টা ফাঁকা জায়গা আছে। `Petty Cash` পাবে ১১১৫ — ঠিক যেখানে তার থাকা উচিত।

> **নিয়ম: প্রতিটি স্তরে অন্তত ৫০% জায়গা খালি রাখুন।** সংখ্যা সস্তা, পুনর্গঠন ব্যয়বহুল।

### চার ধরনের Account

একটা COA-তে সব account একরকম নয়। চারটি ভূমিকা আলাদা করে বোঝা দরকার — এবং এই চারটি **পরস্পরবিরোধী নয়**, একটা account একাধিক ভূমিকায় থাকতে পারে।

**১. Group Account (Header) — শুধু সাজানোর জন্য**

```text
1000  Assets                 ← Group
1100  Current Assets         ← Group
1110  Cash in Hand           ← Posting
```

Group account-এ **কখনো post করা যায় না**। সে শুধু সন্তানদের ধরে রাখে আর তাদের যোগফল দেখায়। অধ্যায় ৩-এ `is_group` flag দিয়ে এটা চিহ্নিত করার কথা বলেছি।

**২. Posting Account (Leaf) — যেখানে সত্যিকারের entry বসে**

গাছের পাতা। সব journal line কোনো না কোনো posting account-এ যায়।

**৩. Control Account — যার বিস্তারিত অন্য কোথাও**

এটা একটা গুরুত্বপূর্ণ ধারণা। `Accounts Receivable` একটাই account, কিন্তু তার পিছনে হাজার হাজার গ্রাহকের আলাদা হিসাব আছে:

```text
        General Ledger              Subledger
        ──────────────              ─────────
                                    করিম      45,000
   Accounts Receivable              রহিম      30,000
        3,20,000          ◀────▶    সালমা     80,000
                                    ...
                                    ─────────
                                    মোট     3,20,000
```

GL-এ একটা সংখ্যা, subledger-এ বিস্তারিত। দুটো **সবসময় সমান** থাকতে হবে — এটাই reconciliation (অধ্যায় ৪৪)।

এই কারণেই অধ্যায় ৩-এ বলেছিলাম প্রতি গ্রাহকের জন্য আলাদা GL account বানাবেন না। গ্রাহক subledger-এ থাকে, GL-এ থাকে একটাই control account।

Control account সাধারণত: Accounts Receivable, Accounts Payable, Inventory, Fixed Assets.

**৪. System Account — যার উপর আপনার কোড নির্ভর করে**

কিছু account আপনার software-এর যুক্তির অংশ। যেমন — বছর শেষে লাভ কোথায় যাবে? `Retained Earnings`-এ। ওই account মুছে গেলে closing চলবে না।

```text
system_account_key            কোন কাজে লাগে
──────────────────            ─────────────
retained_earnings             বছর শেষে closing
default_cash_account          নগদ লেনদেনের ডিফল্ট
accounts_receivable           গ্রাহকের বিল
accounts_payable              সরবরাহকারীর বিল
rounding_difference           পয়সার হেরফের সমন্বয়
opening_balance_equity        প্রাথমিক ব্যালেন্স স্থাপন
```

> System account **মুছে ফেলা বা নিষ্ক্রিয় করা নিষিদ্ধ**। Database-এ একটা flag দিয়ে এদের সুরক্ষিত রাখুন — নইলে কোনো একদিন কেউ "অপ্রয়োজনীয়" ভেবে মুছে দেবে, আর বছর শেষে closing ভেঙে পড়বে।

### কতটা বিস্তারিত COA বানাবেন?

এটাই COA নকশার আসল শিল্প। দুই দিকেই বিপদ:

```text
    খুব কম account                 খুব বেশি account
    ──────────────                 ────────────────
    "Expenses" একটাই account       প্রতিটি খরচের আলাদা account

    report অর্থহীন                  data entry-তে ভুল বাড়ে
    কোথায় টাকা যাচ্ছে বোঝা যায় না    কেউ সঠিক account খুঁজে পায় না
                                   report পড়া অসম্ভব
```

সিদ্ধান্তের নিয়মটা সহজ:

> **একটা আলাদা account তখনই বানাবেন, যখন কেউ সত্যিই এমন প্রশ্ন করবে যার উত্তর ওই account ছাড়া দেওয়া যায় না।**

উদাহরণ:

| প্রশ্ন কেউ করে? | আলাদা account দরকার? |
| --- | --- |
| "বিদ্যুতে কত খরচ হলো?" | ✅ হ্যাঁ — `Electricity Expense` |
| "চা-বিস্কুটে কত গেল?" | ❌ না — `Office Supplies`-এ ঢুকিয়ে দিন |
| "কোন শাখায় কত বিক্রি?" | ❌ না — এটা account নয়, **dimension** |
| "ডাক্তারদের কত দেওয়া হলো?" | ✅ হ্যাঁ (hospital-এ) — `Doctor Fee` |

তৃতীয় সারিটা বিশেষভাবে গুরুত্বপূর্ণ। **শাখা, বিভাগ, প্রকল্প — এগুলো account নয়, এগুলো মাত্রা (dimension)।** এদের জন্য আলাদা account বানালে account সংখ্যা গুণিতক হারে বাড়ে:

```text
    ভুল পথ                              সঠিক পথ
    ──────                              ────────
    5210  Salary — Dhaka                5210  Salary
    5211  Salary — Chittagong                 + cost_center মাত্রা
    5212  Salary — Sylhet
    5213  Rent — Dhaka                  5220  Rent
    5214  Rent — Chittagong                   + cost_center মাত্রা
    5215  Rent — Sylhet
    ...  (৩ শাখা × ২০ খরচ = ৬০টি account)   (২০টি account + ৩টি মাত্রা)
```

শাখা বাড়লে বাঁ পাশে account বিস্ফোরণ ঘটে, ডান পাশে শুধু একটা নতুন cost center যোগ হয়। বিস্তারিত অধ্যায় ৩৪-এ।

### নামকরণের শৃঙ্খলা

ছোট মনে হলেও এটা বাস্তবে অনেক ভোগায়:

```text
    এড়িয়ে চলুন                    করুন
    ───────────                   ────
    "Misc"                        "Miscellaneous Expense"
    "Bank"                        "Bank — Prime Bank CA 1234"
    "Salary A/C"                  "Salary Expense"
    "Exp - Elec"                  "Electricity Expense"
```

নিয়ম: **পুরো নাম লিখুন, সংক্ষেপ নয়। প্রকার নামেই বোঝা যাক।** একাধিক ব্যাংক থাকলে account নম্বরের শেষ কয়েকটি অঙ্ক নামে রাখুন — নইলে তিনটা "Bank" account দেখে কেউ বুঝবে না কোনটা কোনটা।

---

## ৩. Accounting Rule

**Code-এর প্রথম অঙ্ক = প্রকার**

```text
1xxx  Asset          4xxx  Revenue
2xxx  Liability      5xxx  Expense
3xxx  Equity
```

**COA নকশার ছয়টি নিয়ম**

```text
১.  প্রথম অঙ্কে প্রকার বোঝাবে
২.  প্রতিটি স্তরে অন্তত ৫০% জায়গা খালি রাখবেন
৩.  Group account-এ কখনো post নয়
৪.  System account মুছে ফেলা যাবে না
৫.  Account শুধু তখনই বানাবেন, যখন কেউ প্রশ্ন করবে
৬.  শাখা/বিভাগ/প্রকল্প account নয় — মাত্রা
```

**Account তৈরির সিদ্ধান্ত-ক্রম**

```text
কেউ কি এই তথ্য আলাদা করে জানতে চাইবে?
        ↓ না  →  আলাদা account নয়
        ↓ হ্যাঁ
এটা কি শাখা / বিভাগ / প্রকল্প ভিত্তিক পার্থক্য?
        ↓ হ্যাঁ  →  মাত্রা ব্যবহার করুন, account নয়
        ↓ না
এটা কি গ্রাহক / সরবরাহকারী ভিত্তিক পার্থক্য?
        ↓ হ্যাঁ  →  subledger ব্যবহার করুন, account নয়
        ↓ না
    নতুন account বানান
```

---

## ৪. Real Business Example

একটি software company-র জন্য সম্পূর্ণ COA নকশা করি। মনোযোগ দিন **কোথায় ফাঁক রাখা হয়েছে** এবং **কোনটা group আর কোনটা posting**।

```text
CODE   NAME                              TYPE        GROUP?
────   ────                              ────        ──────
1000   Assets                            ASSET       group
1100     Current Assets                  ASSET       group
1110       Cash in Hand                  ASSET       post
1115       Petty Cash                    ASSET       post
1120       Bank — Prime Bank CA 4471     ASSET       post
1125       Bank — City Bank SND 8890     ASSET       post
1130       Accounts Receivable           ASSET       post   ← control
1140       Advance to Supplier           ASSET       post
1150       Prepaid Expense               ASSET       post
1160       VAT Receivable                ASSET       post
1500     Non-current Assets              ASSET       group
1510       Computer Equipment            ASSET       post
1515       Accum. Dep. — Computer        ASSET       post   ← contra
1520       Furniture & Fixtures          ASSET       post
1525       Accum. Dep. — Furniture       ASSET       post   ← contra
1530       Vehicles                      ASSET       post
1535       Accum. Dep. — Vehicles        ASSET       post   ← contra

2000   Liabilities                       LIABILITY   group
2100     Current Liabilities             LIABILITY   group
2110       Accounts Payable              LIABILITY   post   ← control
2120       Salary Payable                LIABILITY   post
2130       Rent Payable                  LIABILITY   post
2140       VAT Payable                   LIABILITY   post
2150       Tax Deducted at Source         LIABILITY   post
2160       Customer Advance              LIABILITY   post
2500     Non-current Liabilities         LIABILITY   group
2510       Bank Loan — Long Term         LIABILITY   post

3000   Equity                            EQUITY      group
3100     Share Capital                   EQUITY      post   ← system
3200     Retained Earnings               EQUITY      post   ← system
3300     Current Year Profit             EQUITY      post   ← system
3400     Drawings                        EQUITY      post   ← contra

4000   Revenue                           REVENUE     group
4100     Operating Revenue               REVENUE     group
4110       Software Development Income   REVENUE     post
4120       Maintenance & Support Income  REVENUE     post
4130       Consulting Income             REVENUE     post
4500     Non-operating Revenue           REVENUE     group
4510       Interest Income               REVENUE     post
4520       Gain on Asset Disposal        REVENUE     post

5000   Expenses                          EXPENSE     group
5100     Direct Cost                     EXPENSE     group
5110       Developer Salary — Billable   EXPENSE     post
5120       Cloud & Hosting Cost          EXPENSE     post
5130       Third-party Software          EXPENSE     post
5200     Operating Expense               EXPENSE     group
5210       Salary & Allowance            EXPENSE     post
5220       Office Rent                   EXPENSE     post
5230       Electricity                   EXPENSE     post
5240       Internet & Telephone          EXPENSE     post
5250       Office Supplies               EXPENSE     post
5260       Travel & Conveyance           EXPENSE     post
5270       Professional Fee              EXPENSE     post
5280       Bank Charges                  EXPENSE     post
5290       Depreciation                  EXPENSE     post
5500     Non-operating Expense           EXPENSE     group
5510       Interest Expense              EXPENSE     post
5520       Loss on Asset Disposal        EXPENSE     post
```

### এই নকশার সিদ্ধান্তগুলো লক্ষ করুন

**১. ফাঁক পরিকল্পিত।** `1110` এর পরে `1115`, তারপর `1120` — নতুন account বসানোর জায়গা আছে। `1160` এর পরে সরাসরি `1500` — Current Asset-এ আরও ৩০টির বেশি জায়গা খালি।

**২. প্রতিটি Fixed Asset-এর পাশে তার contra।** `1510` এর ঠিক পরে `1515`। এতে report-এ পাশাপাশি দেখানো সহজ হয়, আর কেউ contra বানাতে ভোলে না।

**৩. Direct আর Operating খরচ আলাদা group-এ।** `5110` Developer Salary (প্রকল্পের সাথে সরাসরি জড়িত) আর `5210` Salary (প্রশাসনিক) — দুটো আলাদা। এতে gross profit বের করা যায়:

```text
Gross Profit  =  Operating Revenue (4100)  -  Direct Cost (5100)
Net Profit    =  Gross Profit  -  Operating Expense (5200)  ± Non-operating
```

COA-র কাঠামোই এখানে report-এর কাঠামো ঠিক করে দিচ্ছে। **এটাই ভালো COA নকশার লক্ষণ।**

**৪. শাখাভিত্তিক কোনো account নেই।** কোম্পানির তিনটি অফিস থাকলেও `Office Rent` একটাই — শাখা আসবে মাত্রা হিসেবে।

**৫. গ্রাহকভিত্তিক কোনো account নেই।** `1130 Accounts Receivable` একটাই control account।

---

## ৫. Implementation — Software ও Database

### COA-র জন্য accounts table

অধ্যায় ৩-এ ভিত্তিটা দেখেছি। এখন COA-র প্রয়োজনীয় column গুলো যোগ করা যাক:

```text
accounts

id                      BIGINT PK
company_id              BIGINT FK
code                    VARCHAR(20)     -- '1110'
name                    VARCHAR(200)    -- 'Cash in Hand'
account_type            VARCHAR(20)     -- ASSET | LIABILITY | ...
sub_type                VARCHAR(40)     -- CURRENT_ASSET, FIXED_ASSET, ...
parent_id               BIGINT FK       -- গাছের কাঠামো
level                   SMALLINT        -- 0, 1, 2 ...

is_group                BOOLEAN         -- true হলে post নিষিদ্ধ
is_control_account      BOOLEAN         -- বিস্তারিত subledger-এ
is_contra               BOOLEAN         -- উল্টো আচরণ
allow_manual_posting    BOOLEAN         -- হাতে entry দেওয়া যাবে?
system_account_key      VARCHAR(60)     -- 'retained_earnings' ইত্যাদি
is_active               BOOLEAN

UNIQUE (company_id, code)
UNIQUE (company_id, system_account_key)
```

তিনটি column-এর ব্যাখ্যা দরকার:

**`allow_manual_posting`** — কিছু account-এ শুধু system entry দেবে, মানুষ নয়। যেমন `Accounts Receivable` — এতে entry আসবে invoice module থেকে। কেউ হাতে AR-এ entry দিলে subledger আর GL-এর মিল নষ্ট হবে। তাই control account-এ সাধারণত `allow_manual_posting = false`.

**`system_account_key`** — কোডে account খোঁজার চাবি। এই একটা column আপনাকে hardcoded ID থেকে বাঁচাবে (বিস্তারিত অধ্যায় ৬-এ)।

**`UNIQUE (company_id, code)`** — code শুধু একটি company-র মধ্যে অনন্য, বিশ্বব্যাপী নয়। দুটি company-র দুজনেরই `1110` থাকতে পারে।

### Code থেকে প্রকার যাচাই

Code-এর প্রথম অঙ্ক আর `account_type` — দুটোর মধ্যে অমিল হলে বিভ্রান্তি অনিবার্য। তৈরির সময় যাচাই করুন:

```text
প্রথম অঙ্ক    প্রত্যাশিত প্রকার
──────────    ────────────────
    1         ASSET
    2         LIABILITY
    3         EQUITY
    4         REVENUE
    5         EXPENSE

code '4210' + account_type 'EXPENSE'  →  reject
```

এটা একটা সস্তা যাচাই, কিন্তু বহু ভুল ধরে ফেলে।

### পরবর্তী code স্বয়ংক্রিয়ভাবে প্রস্তাব করা

Data entry সহজ করার একটা ছোট কিন্তু কার্যকর ব্যবস্থা — নতুন account বানানোর সময় parent দেখে পরের ফাঁকা code প্রস্তাব করুন:

```text
parent = 1100 (Current Assets)
        ↓
ওই parent-এর সব সন্তান খুঁজুন:  1110, 1115, 1120, 1125, 1130, 1140, 1150, 1160
        ↓
সর্বোচ্চ = 1160
        ↓
ধাপ যোগ করুন (সাধারণত 10):  প্রস্তাব = 1170
```

ব্যবহারকারী চাইলে বদলাতে পারবেন — কিন্তু ডিফল্টটা যেন সবসময় ফাঁক-বজায়-রাখা হয়। এতে মানুষ নিজে থেকে ১১৬১, ১১৬২ দেওয়া শুরু করবে না।

### Report-এ COA-র কাঠামোই কাঠামো

Report তৈরির সময় আলাদা করে গঠন লিখতে হয় না — COA-র গাছটাই report-এর গঠন:

```text
        accounts (গাছ)                    Income Statement
        ──────────────                    ────────────────
        4000 Revenue                      Revenue
          4100 Operating                    Operating Revenue
            4110 Software Income              Software Income      12,00,000
            4120 Maintenance                  Maintenance           3,50,000
                                              ────────────────────────────
                                              Total Operating      15,50,000
```

এই কারণেই COA নকশা ভালো হলে report engine সহজ হয়ে যায়। খারাপ হলে report-এ জোড়াতালি দিতে হয় — আর প্রতিটি নতুন report-এ সেই জোড়াতালি আবার লিখতে হয়।

---

## ৬. Financial Statement Impact

COA-র প্রতিটি অংশ সরাসরি report-এর অংশে রূপ নেয়:

| COA-র শাখা | কোন Statement | কোন অংশে |
| --- | --- | --- |
| 1000 Assets | Balance Sheet | Assets |
| 2000 Liabilities | Balance Sheet | Liabilities |
| 3000 Equity | Balance Sheet | Equity |
| 4000 Revenue | Income Statement | Income |
| 5000 Expenses | Income Statement | Expenses |

আর উপশাখাগুলো report-এর ভিতরের উপশিরোনাম:

```text
INCOME STATEMENT

  Operating Revenue                       ← 4100
      Software Development Income             4110
      Maintenance & Support Income            4120
                                          ─────────
  Less: Direct Cost                       ← 5100
      Developer Salary — Billable             5110
      Cloud & Hosting Cost                    5120
                                          ─────────
  GROSS PROFIT

  Less: Operating Expense                 ← 5200
      Salary & Allowance                      5210
      Office Rent                             5220
      ...
                                          ─────────
  OPERATING PROFIT

  Add/Less: Non-operating                 ← 4500, 5500
                                          ─────────
  NET PROFIT
```

লক্ষ করুন — **Gross Profit, Operating Profit, Net Profit — এই তিনটি স্তর COA-র group কাঠামো থেকে আপনাআপনি বেরিয়ে আসছে।** COA-তে Direct Cost আর Operating Expense আলাদা না থাকলে Gross Profit কখনো বের করা যেত না।

এটাই এই অধ্যায়ের কেন্দ্রীয় কথা: **যে প্রশ্নের উত্তর আপনি ভবিষ্যতে চাইবেন, তার জায়গা COA-তে আজই রাখতে হবে।**

---

## ৭. Common Developer Mistakes

| ভুল | কী ঘটে | সঠিক পথ |
| --- | --- | --- |
| পরপর code দেওয়া (1101, 1102) | নতুন account বসানোর জায়গা নেই | প্রতি স্তরে ৫০% ফাঁক |
| শাখা/বিভাগভিত্তিক account | account সংখ্যা গুণিতক হারে বাড়ে | cost center মাত্রা |
| গ্রাহকভিত্তিক GL account | হাজার হাজার account, COA অচল | control account + subledger |
| System account সুরক্ষিত না রাখা | কেউ মুছে দিলে closing ভাঙে | `system_account_key` + delete নিষিদ্ধ |
| Code-এর প্রথম অঙ্ক আর type-এ অমিল | রিপোর্টে বিভ্রান্তি | তৈরির সময় যাচাই |
| Control account-এ হাতে entry | GL আর subledger মেলে না | `allow_manual_posting = false` |
| খুব কম account | report থেকে কিছু জানা যায় না | প্রশ্ন-ভিত্তিক সিদ্ধান্ত |
| খুব বেশি account | ভুল account-এ entry, report অপাঠ্য | একই নিয়ম, উল্টো দিকে |
| `code` কে integer রাখা | '0110' এর শূন্য হারিয়ে যায় | `VARCHAR` রাখুন |
| Global unique code | multi-company-তে সংঘর্ষ | `UNIQUE (company_id, code)` |

`code` কে integer রাখার ভুলটা সূক্ষ্ম কিন্তু বাস্তব। কেউ যদি তিন অঙ্কের scheme ব্যবহার করে `0110` লেখে, integer-এ সেটা `110` হয়ে যাবে — আর sort করলে ভুল ক্রমে আসবে। **Code একটা পরিচয়, সংখ্যা নয়।**

---

## ৮. Exercises

**সেট ক — Code নির্ধারণ**

উপরের software company-র COA দেখে নিচের নতুন account গুলোর জন্য উপযুক্ত code ঠিক করুন, এবং কেন সেটা বেছে নিলেন লিখুন:

```text
১।   Mobile Banking — bKash Merchant
২।   Insurance Premium (অগ্রিম দেওয়া, ১ বছরের)
৩।   Training Income (নতুন ব্যবসার ধারা)
৪।   Software Subscription Expense (প্রশাসনিক)
৫।   Provident Fund Payable
৬।   Office Equipment (নতুন asset শ্রেণি)
৭।   Accumulated Depreciation — Office Equipment
৮।   Audit Fee
```

**সেট খ — Account বানাবেন কি না?**

প্রতিটির জন্য সিদ্ধান্ত নিন: নতুন account, নাকি বিদ্যমান account, নাকি মাত্রা, নাকি subledger। কারণসহ।

```text
৯।   "ঢাকা অফিসের বিদ্যুৎ খরচ আলাদা জানতে চাই"
১০।  "চা-কফির খরচ আলাদা জানতে চাই"
১১।  "প্রতিটি client থেকে কত আয় হলো জানতে চাই"
১২।  "সরকারি প্রকল্প আর বেসরকারি প্রকল্পের আয় আলাদা চাই"
১৩।  "প্রতিটি কর্মীর বেতন আলাদা জানতে চাই"
১৪।  "কুরিয়ার খরচ আলাদা জানতে চাই"
১৫।  "মোবাইল বিল আর ইন্টারনেট বিল আলাদা চাই"
```

**সেট গ — COA নকশা**

```text
১৬।  একটি রেস্টুরেন্টের জন্য সম্পূর্ণ COA বানান।
     অন্তত ৩০টি account, ৪ অঙ্কের code, group ও posting আলাদা করে,
     contra ও system account চিহ্নিত করে।

     মনে রাখবেন — রেস্টুরেন্টে কাঁচামাল (খাদ্য উপকরণ),
     রান্নাঘরের কর্মী, ওয়েটার, gas, এবং নষ্ট হওয়া খাবার
     সবই হিসাবে আসে।

১৭।  আপনার বানানো COA থেকে Gross Profit বের করা যায় কি?
     না গেলে কী কী বদলাতে হবে?
```

**সেট ঘ — চিন্তার প্রশ্ন**

```text
১৮।  একটি কোম্পানি ৫ বছর ধরে COA ব্যবহার করছে। এখন তারা
     সব code ৪ অঙ্ক থেকে ৬ অঙ্কে বদলাতে চায়। কী কী ভাঙবে —
     অন্তত পাঁচটি লিখুন। আপনি কী পরামর্শ দেবেন?

১৯।  `is_group` আর `allow_manual_posting` — এই দুটোর পার্থক্য কী?
     একটা account কি group নয় অথচ manual posting নিষিদ্ধ হতে পারে?
     উদাহরণ দিন।
```

উত্তর আছে Workbook-এর Answer Key, অধ্যায় ৫-এ।

---

## ৯. Developer Challenge

> একটি **multi-company COA module** নকশা করুন, যেখানে একই software-এ একাধিক প্রতিষ্ঠান চলবে।
>
> যা যা ঠিক করবেন:
>
> ১. নতুন company তৈরি হলে তার COA কোথা থেকে আসবে — শূন্য থেকে, নাকি একটা template থেকে copy? Template কীভাবে রাখবেন?
> ২. দুটি company-র COA আলাদা হলে সমন্বিত (consolidated) report কীভাবে বানাবেন? এখনই সমাধান না জানলেও সমস্যাটা স্পষ্ট করে লিখুন।
> ৩. একটি account নিষ্ক্রিয় করার আগে কী কী যাচাই করবেন? ব্যালেন্স শূন্য না হলে কী করবেন?
> ৪. একটি account **মুছে ফেলা** কখন অনুমোদিত? কখনোই নয়, নাকি কিছু শর্তে?
> ৫. `system_account_key` গুলোর তালিকা কে ঠিক করবে — কোড, নাকি ব্যবহারকারী? নতুন company-তে এগুলো কীভাবে সেট হবে?
> ৬. ব্যবহারকারী যদি একটা group account-কে posting account-এ বদলাতে চান (বা উল্টোটা) — অনুমতি দেবেন? কী কী শর্তে?
>
> ৬ নম্বরটা বাস্তব প্রকল্পে বারবার আসে। উত্তরটা "না" নয়, "নির্ভর করে" — কীসের উপর নির্ভর করে সেটাই আসল প্রশ্ন। নিজের যুক্তি লিখে রাখুন, পরের অধ্যায়ে মিলিয়ে দেখবেন।

---

## ১০. Summary Card

**COA কী**

```text
COA  =  accounting system এর schema

    যা COA তে নেই, তা কখনো report এ পাওয়া যাবে না
```

**Code Numbering**

| প্রথম অঙ্ক | প্রকার |
| --- | --- |
| 1 | Asset |
| 2 | Liability |
| 3 | Equity |
| 4 | Revenue |
| 5 | Expense |

```text
৪ অঙ্ক দিয়ে শুরু করুন
প্রতি স্তরে অন্তত ৫০% ফাঁক রাখুন
code এর type VARCHAR, integer নয়
```

**চার ধরনের Account**

| ধরন | মানে |
| --- | --- |
| Group (Header) | শুধু সাজানোর জন্য, post নিষিদ্ধ |
| Posting (Leaf) | এখানে entry বসে |
| Control | বিস্তারিত subledger-এ |
| System | কোড এর উপর নির্ভরশীল, মুছবেন না |

**Account বানাবেন কি না**

```text
কেউ কি এই তথ্য আলাদা চাইবে?
    না      →  আলাদা account নয়
    হ্যাঁ, কিন্তু শাখা/বিভাগভিত্তিক  →  মাত্রা
    হ্যাঁ, কিন্তু গ্রাহকভিত্তিক        →  subledger
    হ্যাঁ, অন্য কিছু                 →  নতুন account
```

**যে তিনটি কখনো account হবে না**

```text
শাখা / বিভাগ / প্রকল্প   →  cost center মাত্রা
গ্রাহক / সরবরাহকারী      →  subledger
কর্মী                    →  payroll subledger
```

**Developer checklist — COA তৈরির সময়**

```text
□  UNIQUE (company_id, code)
□  code এর প্রথম অঙ্ক ও account_type মিলছে
□  code এর type VARCHAR
□  is_group = true হলে post নিষিদ্ধ
□  control account এ allow_manual_posting = false
□  system_account_key সেট ও সুরক্ষিত
□  system account delete নিষিদ্ধ
□  নতুন code প্রস্তাবে ফাঁক বজায় থাকে
□  contra account তার মূল account এর পাশে
```

---

## পরবর্তী অধ্যায়

**অধ্যায় ৬ — COA Hierarchy ও Database Design:** এই অধ্যায়ে COA-র নকশা শিখলাম। পরের অধ্যায়ে শিখব **গাছটাকে database-এ কীভাবে রাখতে হয়** — parent-child সম্পর্ক, চক্র ঠেকানো, ব্যালেন্স উপরে জমা করা, আর সবচেয়ে গুরুত্বপূর্ণ: **account ID কখনো কোডে hardcode না করে account mapping দিয়ে কাজ চালানো।**
