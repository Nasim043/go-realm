# অধ্যায় ৩ — পাঁচ প্রকার Account

> **Volume 1 · Part 1 — Accounting Fundamentals · Chapter 3**
>
> পূর্বশর্ত: অধ্যায় ১ (Accounting কী), অধ্যায় ২ (Accounting Equation)

---

## ১. Learning Objective

এই অধ্যায় শেষে আপনি পারবেন:

```text
পাঁচ প্রকার account আলাদা করে চিনতে
যেকোনো নতুন account কোন প্রকারে পড়বে তা নির্ধারণ করতে
Current ও Non-current এর পার্থক্য বলতে
Asset আর Expense গুলিয়ে ফেলার ভুল এড়াতে
Contra account কী এবং কেন লাগে তা ব্যাখ্যা করতে
Permanent ও Temporary account আলাদা করতে
account_type কে database-এ কীভাবে রাখতে হয় তা design করতে
```

**সময়:** পড়া ৫০ মিনিট + অনুশীলন ৪৫ মিনিট।

> এই অধ্যায়ে **debit/credit শেখানো হবে না** — সেটা অধ্যায় ৪-এর কাজ। এখানে শুধু শ্রেণিবিভাগ। শ্রেণি ভুল হলে debit/credit নিখুঁত হয়েও report ভুল হবে, তাই এই ধাপটা আগে।

---

## ২. Concept Explanation

### Account আসলে কী?

**Account** হলো একই জাতের লেনদেন জমা রাখার একটা পাত্র। "নগদ" একটা account, "অফিস ভাড়া" একটা account, "ব্যাংক ঋণ" একটা account।

Developer-এর ভাষায় — account হলো সেই key যার বিপরীতে আপনি টাকার অঙ্ক জমা করেন:

```text
    লেনদেনের প্রবাহ                 জমা হচ্ছে
    ──────────────                 ─────────
    ৫ জুলাই ভাড়া 20,000    ──▶
    ৫ আগস্ট ভাড়া 20,000    ──▶     Office Rent  =  60,000
    ৫ সেপ্টে. ভাড়া 20,000   ──▶
```

প্রশ্ন হলো — এরকম কয়েকশো account থাকলে report বানাবেন কীভাবে? উত্তর: প্রতিটি account-কে **পাঁচটি প্রকারের একটিতে** ফেলা হয়। ওই প্রকারই ঠিক করে দেয় account-টা কোন report-এ, কোন জায়গায় যাবে।

```text
                     সব account
                          │
      ┌──────────┬────────┼────────┬──────────┐
      ▼          ▼        ▼        ▼          ▼
    Asset    Liability  Equity  Revenue   Expense
      │          │        │        │          │
      └──────────┴────────┘        └──────────┘
       Balance Sheet এ            Income Statement এ
```

অধ্যায় ২-এর বিস্তৃত সমীকরণে এই পাঁচটিই ছিল:

```text
Assets = Liabilities + Capital + Revenue - Expense - Drawings
```

### ১. Asset — যা কিছু আছে

**সংজ্ঞা:** অতীতের ঘটনার ফলে ব্যবসার নিয়ন্ত্রণে থাকা এমন সম্পদ, যা থেকে ভবিষ্যতে অর্থনৈতিক সুবিধা আসবে।

তিনটি শর্ত লুকিয়ে আছে এই সংজ্ঞায়:

```text
১.  নিয়ন্ত্রণে আছে       (মালিকানা না হলেও চলে — lease করা যন্ত্র)
২.  অতীতে কিছু ঘটেছে     (ভবিষ্যতের পরিকল্পনা asset নয়)
৩.  ভবিষ্যতে সুবিধা দেবে  (এটাই মূল কথা)
```

Asset দুই ভাগে ভাগ হয় — **কত দ্রুত নগদে রূপান্তর হবে** তার ভিত্তিতে:

| | Current Asset | Non-current Asset |
| --- | --- | --- |
| সময় | ১২ মাসের মধ্যে ব্যবহার/নগদ হবে | ১২ মাসের বেশি থাকবে |
| উদাহরণ | নগদ, ব্যাংক, পাওনা, মজুদ, অগ্রিম | জমি, দালান, যন্ত্র, আসবাব, যানবাহন |
| আচরণ | দ্রুত ঘোরে | ধীরে ক্ষয় হয় (depreciation) |

সাধারণ Asset account গুলো:

```text
Current                          Non-current
───────                          ───────────
Cash in Hand                     Land
Cash at Bank                     Building
Accounts Receivable              Plant & Machinery
Inventory                        Furniture & Fixtures
Prepaid Expense                  Vehicles
Advance to Supplier              Computer Equipment
```

### ২. Liability — যা কিছু দেনা

**সংজ্ঞা:** অতীতের ঘটনার ফলে সৃষ্ট এমন বর্তমান বাধ্যবাধকতা, যা মেটাতে ভবিষ্যতে সম্পদ ছাড়তে হবে।

Asset-এর মতোই দুই ভাগ:

| | Current Liability | Non-current Liability |
| --- | --- | --- |
| সময় | ১২ মাসের মধ্যে শোধ | ১২ মাসের বেশি |
| উদাহরণ | সরবরাহকারীর পাওনা, বকেয়া বেতন, বকেয়া কর | দীর্ঘমেয়াদি ঋণ, bond |

```text
Current                          Non-current
───────                          ───────────
Accounts Payable                 Long-term Loan
Salary Payable                   Debenture
Rent Payable                     Lease Liability (দীর্ঘমেয়াদি অংশ)
Tax Payable
Customer Advance
Short-term Loan
```

> **`Customer Advance` কে অনেকে ভুল করে Revenue ধরেন।** গ্রাহক অগ্রিম দিয়েছেন মানে আপনি এখনো সেবা দেননি — টাকাটা আপনার আয় হয়নি, বরং **আপনার দায়** (সেবা দিতে বাধ্য, নয়তো ফেরত)। সেবা দেওয়ার পরে এটা Revenue-তে রূপান্তরিত হবে। বিস্তারিত অধ্যায় ১৭-এ।

### ৩. Equity — মালিকের অংশ

**সংজ্ঞা:** সব দায় মেটানোর পরে সম্পদের যতটুকু অবশিষ্ট থাকে।

Equity নিজে একক কিছু নয়, কয়েকটি অংশের যোগফল:

| Account | মানে |
| --- | --- |
| Capital / Share Capital | মালিক যা ঢেলেছেন |
| Retained Earnings | আগের বছরগুলোর জমা লাভ |
| Current Year Profit | এই বছরের লাভ |
| Drawings | মালিক যা তুলে নিয়েছেন (কমায়) |
| Reserves | নির্দিষ্ট উদ্দেশ্যে সরিয়ে রাখা লাভ |

**Retained Earnings** account-টা বিশেষ। এটাই সেই সেতু যা Income Statement-কে Balance Sheet-এর সাথে জোড়া লাগায়। প্রতি বছর শেষে সব Revenue ও Expense শূন্য করে তাদের নিট ফলাফল এখানে ঢেলে দেওয়া হয় (অধ্যায় ২৬)।

> Software-এ Retained Earnings কখনো হাতে বদলানো যাবে না। এটা **শুধু closing প্রক্রিয়ার ফলাফল**। কেউ সরাসরি এতে entry দিলে পরের বছরের হিসাব আর মিলবে না।

### ৪. Revenue — যা আয় হয়

**সংজ্ঞা:** স্বাভাবিক ব্যবসায়িক কর্মকাণ্ড থেকে অর্জিত অর্থ, যা মালিকানা বাড়ায়।

```text
Operating (মূল ব্যবসা)           Non-operating (আনুষঙ্গিক)
──────────────────────           ────────────────────────
Sales Revenue                    Interest Income
Service Revenue                  Rental Income
Consulting Income                Gain on Asset Sale
Subscription Revenue             Discount Received
```

এই ভাগটা report-এ গুরুত্বপূর্ণ — বিনিয়োগকারী জানতে চান মূল ব্যবসা থেকে কত এল, আর এদিক-ওদিক থেকে কত।

**সবচেয়ে জরুরি কথা:** Revenue ধরা হয় **যখন অর্জিত হয়**, যখন টাকা আসে তখন নয়। পণ্য সরবরাহ করলেই আয় হয়ে গেছে — টাকা তিন মাস পরে এলেও। এটাই accrual (অধ্যায় ১৭)।

### ৫. Expense — যা খরচ হয়

**সংজ্ঞা:** আয় অর্জনের জন্য ভোগ করা সম্পদ, যা মালিকানা কমায়।

```text
Direct (পণ্য/সেবার সাথে সরাসরি)    Indirect (পরিচালন)
─────────────────────────────      ──────────────────
Cost of Goods Sold                 Office Rent
Raw Material Consumed              Salary
Direct Labour                      Utilities
Freight Inward                     Depreciation
                                   Marketing
                                   Bank Charges
```

### সবচেয়ে বড় বিভ্রান্তি: Asset নাকি Expense?

এই একটা প্রশ্নে developer-রা সবচেয়ে বেশি ভুল করেন, এবং ভুলটার প্রভাবও সবচেয়ে বেশি।

পার্থক্যটা আসলে একটাই — **সুবিধাটা কখন ভোগ করা হবে:**

```text
    টাকা খরচ হলো
          │
          ▼
   সুবিধা কি এই মাসেই শেষ?
          │
     ┌────┴────┐
    হ্যাঁ        না
     │           │
     ▼           ▼
  EXPENSE      ASSET
             (পরে ধীরে ধীরে
              Expense হবে)
```

উদাহরণ দিয়ে দেখুন:

| খরচ | Asset না Expense? | কেন |
| --- | --- | --- |
| এ মাসের অফিস ভাড়া ২০,০০০ | Expense | সুবিধা এ মাসেই শেষ |
| আগামী ৬ মাসের ভাড়া ১,২০,০০০ অগ্রিম | **Asset** (Prepaid Rent) | সুবিধা ভবিষ্যতে |
| ল্যাপটপ ৮০,০০০ | **Asset** | ৩-৪ বছর সুবিধা দেবে |
| ল্যাপটপ মেরামত ৫,০০০ | Expense | চালু রাখার খরচ, নতুন সুবিধা নয় |
| কর্মীর বেতন | Expense | কাজ ওই মাসেই ভোগ করা হয়েছে |
| এক বছরের software license | **Asset** → ধীরে Expense | সুবিধা এক বছর ধরে |
| এক মাসের বিদ্যুৎ বিল | Expense | ভোগ হয়ে গেছে |

**ভুল হলে কী ঘটে?** ল্যাপটপকে Expense ধরলে:

```text
এ মাসের লাভ            80,000 টাকা কম দেখাবে      ❌
পরের ৩ বছরের লাভ        বেশি দেখাবে (depreciation নেই)  ❌
Balance Sheet-এ         ল্যাপটপটা কোথাও নেই        ❌
সম্পদের হিসাব            কম দেখাবে                 ❌
কর                     ভুল হিসাব হবে              ❌
```

একটা ভুল শ্রেণিবিভাগ, পাঁচ জায়গায় বিপর্যয়। **তাই শ্রেণিবিভাগ debit/credit-এর চেয়েও আগে।**

### Contra Account — উল্টো দিকে বসা account

কিছু account নিজের প্রকারের **উল্টো** আচরণ করে। এদের বলে contra account।

সবচেয়ে পরিচিত উদাহরণ — **Accumulated Depreciation**:

```text
   Balance Sheet এ যেভাবে দেখায়:

   Computer Equipment                 80,000
   (-) Accumulated Depreciation      (30,000)
   ─────────────────────────────────────────
   Net Book Value                     50,000
```

`Accumulated Depreciation` একটা Asset প্রকারের account, কিন্তু সে Asset **কমায়**। কেন এভাবে করা হয়, সরাসরি ল্যাপটপের মূল্য কমিয়ে দিলেই তো হতো?

কারণ — **দুটো তথ্যই দরকার**। মূল দাম কত ছিল (৮০,০০০) আর এখন পর্যন্ত কতটা ক্ষয় হয়েছে (৩০,০০০)। সরাসরি কমিয়ে দিলে মূল দামের তথ্যটা চিরতরে হারিয়ে যেত।

প্রচলিত contra account গুলো:

| Contra Account | কোন account কমায় | প্রকার |
| --- | --- | --- |
| Accumulated Depreciation | Fixed Asset | Asset (contra) |
| Allowance for Doubtful Debts | Accounts Receivable | Asset (contra) |
| Sales Return | Sales Revenue | Revenue (contra) |
| Sales Discount | Sales Revenue | Revenue (contra) |
| Purchase Return | Purchase | Expense (contra) |
| Drawings | Capital | Equity (contra) |

> Database-এ contra account আলাদা করে চিহ্নিত করতে হবে — `is_contra` একটা boolean। নইলে report তৈরির সময় এদের যোগ করে ফেলবেন, বিয়োগের বদলে। এটা একটা খুব সাধারণ ও ধরা-কঠিন bug।

### Permanent বনাম Temporary

শেষ একটা ভাগ, যা period closing-এর জন্য অপরিহার্য:

| | Permanent (Real) | Temporary (Nominal) |
| --- | --- | --- |
| কোনগুলো | Asset, Liability, Equity | Revenue, Expense |
| Report | Balance Sheet | Income Statement |
| বছর শেষে | চলতে থাকে | **শূন্য করা হয়** |
| Balance | পরের বছরে যায় | পরের বছরে যায় না |

```text
    বছর ১ শেষ                 বছর ২ শুরু
    ─────────                 ──────────
    Cash        6,20,000  ──▶  Cash        6,20,000   (চলে গেল)
    Loan        2,00,000  ──▶  Loan        2,00,000   (চলে গেল)
    Capital     5,00,000  ──▶  Capital     5,00,000   (চলে গেল)

    Sales       8,00,000  ──▶  Sales               0   (শূন্য)
    Expense     6,50,000  ──▶  Expense             0   (শূন্য)
                    │
                    └──▶ নিট 1,50,000 গেল Retained Earnings এ
```

**কেন শূন্য করা হয়?** কারণ "এ বছর কত বিক্রি হলো" প্রশ্নের উত্তর প্রতি বছর নতুন করে দিতে হয়। আগের বছরের বিক্রি এ বছরের সাথে মিশে গেলে P&L অর্থহীন হয়ে যাবে। কিন্তু "হাতে কত নগদ আছে" — এটা বছর বদলালেও বদলায় না।

---

## ৩. Accounting Rule

**পাঁচটি প্রকার এবং তাদের অবস্থান**

| Type | সমীকরণে | Statement | বছর শেষে |
| --- | --- | --- | --- |
| Asset | বাঁ দিক | Balance Sheet | চলতে থাকে |
| Liability | ডান দিক | Balance Sheet | চলতে থাকে |
| Equity | ডান দিক | Balance Sheet | চলতে থাকে |
| Revenue | Equity বাড়ায় | Income Statement | শূন্য হয় |
| Expense | Equity কমায় | Income Statement | শূন্য হয় |

**শ্রেণি নির্ধারণের সিদ্ধান্ত-ক্রম**

যেকোনো নতুন account পেলে ক্রমে এই প্রশ্নগুলো করুন:

```text
১.  এটা কি ভবিষ্যতে সুবিধা দেবে এমন কিছু?          → ASSET
২.  এটা কি অন্যকে দিতে হবে এমন বাধ্যবাধকতা?         → LIABILITY
৩.  এটা কি মালিকের বিনিয়োগ বা জমা লাভ?             → EQUITY
৪.  এটা কি ব্যবসা থেকে অর্জিত আয়?                  → REVENUE
৫.  এটা কি ভোগ হয়ে যাওয়া সম্পদ?                    → EXPENSE
```

**Asset বনাম Expense নির্ধারণ**

```text
সুবিধা এই হিসাবকালেই শেষ  →  EXPENSE
সুবিধা ভবিষ্যতেও থাকবে     →  ASSET
```

---

## ৪. Real Business Example

একটি hospital management software-এর জন্য account গুলো শ্রেণিবদ্ধ করি। বাস্তব প্রকল্পে ঠিক এই কাজটাই প্রথমে করতে হয়।

| Account | প্রকার | উপশ্রেণি | কেন |
| --- | --- | --- | --- |
| Cash at Counter | Asset | Current | হাতে থাকা নগদ |
| Bank — Prime Bank | Asset | Current | ব্যাংকে জমা |
| Patient Receivable | Asset | Current | রোগীর কাছে পাওনা |
| Medicine Inventory | Asset | Current | মজুদ ওষুধ |
| MRI Machine | Asset | Non-current | বহু বছর ব্যবহার হবে |
| Accumulated Dep. — MRI | Asset | **Contra** | MRI-র মূল্য কমায় |
| Hospital Building | Asset | Non-current | স্থায়ী সম্পদ |
| Supplier Payable | Liability | Current | ওষুধ সরবরাহকারীর পাওনা |
| Doctor Fee Payable | Liability | Current | ডাক্তারের বকেয়া অংশ |
| Patient Advance | Liability | Current | ভর্তির সময় জমা, সেবা বাকি |
| Bank Loan (৫ বছর) | Liability | Non-current | দীর্ঘমেয়াদি ঋণ |
| Owner's Capital | Equity | — | মালিকের বিনিয়োগ |
| Retained Earnings | Equity | — | জমা লাভ |
| OPD Consultation Income | Revenue | Operating | মূল সেবা থেকে আয় |
| Pathology Income | Revenue | Operating | পরীক্ষা থেকে আয় |
| Pharmacy Sales | Revenue | Operating | ওষুধ বিক্রি |
| Interest on FDR | Revenue | Non-operating | মূল ব্যবসা নয় |
| Medicine Cost | Expense | Direct | বিক্রীত ওষুধের খরচ |
| Nurse Salary | Expense | Indirect | পরিচালন ব্যয় |
| Electricity | Expense | Indirect | পরিচালন ব্যয় |
| Depreciation — MRI | Expense | Indirect | সম্পদের ক্ষয় |

### তিনটি জোড়া বিশেষভাবে লক্ষ করুন

**১. `MRI Machine` (Asset) বনাম `Depreciation — MRI` (Expense)**

একই যন্ত্র, দুটি account। যন্ত্রটা সম্পদ; প্রতি বছর তার যতটুকু ক্ষয় হয় সেটুকু খরচ। আর জমা ক্ষয়টা `Accumulated Depreciation`-এ জমে থাকে।

**২. `Patient Advance` (Liability) বনাম `OPD Income` (Revenue)**

রোগী ভর্তির সময় ১০,০০০ টাকা জমা দিলেন — এটা **দায়**, আয় নয়। চিকিৎসা হওয়ার পর যতটুকু সেবা দেওয়া হলো, ততটুকুই Revenue-তে যাবে। বাকিটা ফেরতযোগ্য দায় হিসেবে থেকে যাবে।

**৩. `Patient Receivable` (Asset) বনাম `Pathology Income` (Revenue)**

পরীক্ষা হয়ে গেছে কিন্তু বিল বাকি — আয় **হয়ে গেছে** (Revenue), সাথে পাওনা তৈরি হয়েছে (Asset)। টাকা আসেনি বলে আয় হয়নি, এমন নয়।

> এই তিনটি জোড়া বুঝে ফেললে hospital, school, ERP — যেকোনো domain-এর account structure আপনি নিজে বানাতে পারবেন। প্যাটার্নটা সব জায়গায় এক।

---

## ৫. Implementation — Software ও Database

### accounts table

```text
accounts

id                  BIGINT PK
company_id          BIGINT FK
code                VARCHAR       -- '1010', '4100'
name                VARCHAR       -- 'Cash at Counter'
account_type        VARCHAR       -- ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE
sub_type            VARCHAR       -- CURRENT_ASSET, FIXED_ASSET, ...
parent_id           BIGINT FK     -- গাছের কাঠামোর জন্য
is_group            BOOLEAN       -- true হলে এতে post করা যাবে না
is_contra           BOOLEAN       -- উল্টো আচরণ করে কিনা
is_active           BOOLEAN
```

চারটি সিদ্ধান্ত ব্যাখ্যা করা দরকার:

**১. `account_type` একটা সীমাবদ্ধ enum — free text নয়**

মাত্র পাঁচটি মান, এবং কখনো বাড়বে না। Database-এ `CHECK` constraint বা enum type দিয়ে বেঁধে দিন:

```text
CHECK (account_type IN ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE'))
```

কেউ typo করে `'ASSETS'` লিখলে ওই account কোনো report-এ দেখাবে না — এবং কেউ টের পাবে না। Constraint দিয়ে এই সম্ভাবনাটাই বন্ধ করে দিন।

**২. `is_group` — শুধু পাতায় post করা যাবে**

Account গুলো গাছের মতো সাজানো থাকে:

```text
1000  Assets                    is_group = true    ← post করা যাবে না
  1100  Current Assets          is_group = true    ← post করা যাবে না
    1110  Cash at Counter       is_group = false   ← এখানে post হবে
    1120  Bank — Prime Bank     is_group = false   ← এখানে post হবে
```

Group account-এ post করলে যোগফল দুবার গোনা হবে — একবার নিজের entry, একবার সন্তানদের যোগফল হিসেবে। Report চুপচাপ ভুল হবে। **Posting validation-এ `is_group = false` যাচাই বাধ্যতামূলক।**

**৩. `is_contra` — নইলে report ভুল হবে**

Report তৈরির সময় contra account-এর মান **বিয়োগ** হবে, যোগ নয়:

```text
Net Fixed Assets  =  SUM(Fixed Asset accounts)
                   - SUM(Fixed Asset accounts WHERE is_contra)
```

এই flag না থাকলে `Accumulated Depreciation` যোগ হয়ে যাবে, আর আপনার সম্পদ দ্বিগুণ দেখাবে।

**৪. `account_type` সন্তানের কাছে বংশানুক্রমে যাবে**

একটা Asset group-এর নিচে কখনো Revenue account বসতে পারে না। Account তৈরির সময় যাচাই করুন:

```text
নতুন account তৈরি হচ্ছে
        ↓
parent_id দেওয়া আছে?
        ↓ হ্যাঁ
parent.account_type == new.account_type ?
        ↓ না
    reject: "প্রকার parent-এর সাথে মিলছে না"
```

### শ্রেণি থেকে Report — mapping

`account_type` থেকেই ঠিক হয় account-টা কোন report-এ যাবে। এটাই report engine-এর ভিত্তি:

```text
account_type          →   Statement          →   Section
──────────────────────────────────────────────────────────
ASSET                 →   Balance Sheet      →   Assets
LIABILITY             →   Balance Sheet      →   Liabilities
EQUITY                →   Balance Sheet      →   Equity
REVENUE               →   Income Statement   →   Income
EXPENSE               →   Income Statement   →   Expenses
```

এটা **hardcode করা নিরাপদ** — কারণ পাঁচটি প্রকার কখনো বদলাবে না। কিন্তু কোন account কোন প্রকারে পড়বে, সেটা কখনো hardcode করবেন না — ওটা data.

### Permanent বনাম Temporary — closing-এর ভিত্তি

```text
বছর শেষে closing:

    account_type IN ('REVENUE', 'EXPENSE')
            ↓
    ব্যালেন্স শূন্য করো
            ↓
    নিট ফলাফল Retained Earnings এ পাঠাও

    account_type IN ('ASSET', 'LIABILITY', 'EQUITY')
            ↓
    কিছু করো না — ব্যালেন্স পরের বছরে চলে যাবে
```

লক্ষ করুন — পুরো closing যুক্তিটা **শুধু `account_type` দেখে** কাজ করে। শ্রেণিবিভাগ ঠিক থাকলে closing নিজে থেকেই ঠিক হয়। ভুল থাকলে closing ভুল হবে, এবং সেটা প্রতি বছর জমতে থাকবে।

---

## ৬. Financial Statement Impact

```text
                    সব account
                          │
        ┌─────────────────┴─────────────────┐
        ▼                                   ▼
  Asset, Liability, Equity            Revenue, Expense
        │                                   │
        ▼                                   ▼
   BALANCE SHEET                     INCOME STATEMENT
   "এই তারিখে কী আছে"                "এই সময়ে কী হলো"
        ▲                                   │
        │                                   ▼
        │                          Profit = Revenue - Expense
        │                                   │
        └───────────────────────────────────┘
              বছর শেষে Retained Earnings এ
```

এই বৃত্তটাই accounting-এর কেন্দ্রীয় প্রবাহ। Income Statement এক বছরের গল্প বলে, তারপর তার ফলাফল Balance Sheet-এ জমা হয়ে যায়, আর পরের বছর আবার নতুন করে শুরু।

উপশ্রেণি (`sub_type`) report-এর ভিতরের সাজানোয় কাজে লাগে:

```text
BALANCE SHEET

  Assets
    Current Assets          ← sub_type = CURRENT_ASSET
    Non-current Assets      ← sub_type = FIXED_ASSET

  Liabilities
    Current Liabilities     ← sub_type = CURRENT_LIABILITY
    Non-current Liabilities ← sub_type = LONG_TERM_LIABILITY
```

Current বনাম Non-current এর ভাগটা কেবল সাজানোর জন্য নয় — বিশ্লেষকরা এখান থেকেই **liquidity ratio** বের করেন:

```text
Current Ratio  =  Current Assets / Current Liabilities
```

এটা বলে দেয় কোম্পানি স্বল্পমেয়াদি দেনা মেটাতে পারবে কিনা। তাই `sub_type` ঠিকভাবে না দিলে ratio ভুল হবে।

---

## ৭. Common Developer Mistakes

| ভুল | কী ঘটে | সঠিক পথ |
| --- | --- | --- |
| Fixed Asset কে Expense ধরা | এ বছরের লাভ কম, পরের বছরগুলোর বেশি | সুবিধার মেয়াদ দেখে সিদ্ধান্ত |
| Customer Advance কে Revenue ধরা | আয় বেশি দেখায়, দায় লুকিয়ে যায় | Liability, সেবা দিলে Revenue |
| `is_contra` না রাখা | Contra যোগ হয়ে যায়, সম্পদ দ্বিগুণ | flag রাখুন, report-এ বিয়োগ |
| `is_group` যাচাই না করা | যোগফল দুবার গোনা হয় | পাতা ছাড়া post নিষিদ্ধ |
| `account_type` free text | typo হলে account report থেকে হারায় | enum / CHECK constraint |
| Parent-child প্রকার না মেলানো | Asset-এর নিচে Revenue বসে যায় | তৈরির সময় যাচাই |
| Retained Earnings-এ হাতে entry | closing-এর হিসাবের সাথে দ্বন্দ্ব | শুধু closing প্রক্রিয়া বদলাবে |
| Current/Non-current ভাগ না করা | liquidity ratio ভুল | `sub_type` ঠিকমতো দিন |
| প্রতি গ্রাহকের জন্য আলাদা GL account | হাজার হাজার account, COA অচল | একটি AR account + subledger |

শেষেরটা বিশেষভাবে গুরুত্বপূর্ণ এবং খুব সাধারণ। প্রতিটি গ্রাহকের জন্য আলাদা GL account বানানোর প্রলোভন হয় — কিন্তু ১০,০০০ গ্রাহক হলে COA-তে ১০,০০০ account! সঠিক পথ হলো **একটি `Accounts Receivable` account, আর গ্রাহকভিত্তিক বিস্তারিত হিসাব রাখা subledger-এ** (অধ্যায় ৩৬)।

---

## ৮. Exercises

**সেট ক — শ্রেণিবিভাগ**

প্রতিটির জন্য লিখুন: প্রকার, উপশ্রেণি (প্রযোজ্য হলে), এবং contra কিনা।

```text
১।   Petty Cash
২।   Office Rent Paid
৩।   Prepaid Insurance
৪।   Salary Payable
৫।   Delivery Van
৬।   Accumulated Depreciation — Van
৭।   Sales Revenue
৮।   Sales Return
৯।   Owner's Drawings
১০।  Bank Overdraft
১১।  Goodwill
১২।  Interest Received
১৩।  Advance from Customer
১৪।  Advance to Supplier
১৫।  Allowance for Doubtful Debts
১৬।  Retained Earnings
১৭।  Freight Inward
১৮।  Loan to Director
১৯।  Provident Fund Payable
২০।  Loss on Sale of Asset
```

> ১৩ আর ১৪ পাশাপাশি রাখা হয়েছে ইচ্ছাকৃতভাবে — নাম প্রায় এক, প্রকার সম্পূর্ণ আলাদা। কেন, সেটাও লিখুন।

**সেট খ — Asset নাকি Expense?**

প্রতিটির জন্য সিদ্ধান্ত এবং **কারণ** লিখুন:

```text
২১।  ৫,০০০ টাকায় অফিসের চেয়ার মেরামত
২২।  ৫০,০০০ টাকায় নতুন অফিস চেয়ার কেনা
২৩।  ২ বছরের ডোমেইন নিবন্ধন ৬,০০০ টাকা
২৪।  এ মাসের ইন্টারনেট বিল ৩,০০০ টাকা
২৫।  ১,২০,০০০ টাকায় একটি software license (স্থায়ী)
২৬।  ৪০,০০০ টাকায় কর্মীদের প্রশিক্ষণ
২৭।  গাড়ির ইঞ্জিন পাল্টানো ১,৫০,০০০ টাকা
২৮।  গাড়ির নিয়মিত সার্ভিসিং ৮,০০০ টাকা
```

> ২৬ আর ২৭ নিয়ে ভাবুন — এদের উত্তর তর্কসাপেক্ষ। আপনার যুক্তিটাই এখানে আসল উত্তর।

**সেট গ — চিন্তার প্রশ্ন**

```text
২৯।  একটি account একই সাথে Asset ও Expense হতে পারে কি?
     না পারলে কেন নয় — সমীকরণ দিয়ে ব্যাখ্যা করুন।

৩০।  `Bank Overdraft` কেন Asset নয়, যদিও সেটা ব্যাংক account?

৩১।  আপনার system-এ কেউ একটা Revenue account-এর parent হিসেবে
     একটা Asset group সেট করে দিল। কী কী ভুল হবে — তিনটি লিখুন।
```

উত্তর আছে Workbook-এর Answer Key, অধ্যায় ৩-এ।

---

## ৯. Developer Challenge

> একটি **school management system**-এর জন্য account শ্রেণিবিভাগ নকশা করুন।
>
> যা যা করবেন:
>
> ১. অন্তত ২৫টি account তালিকা করুন, প্রতিটির `account_type`, `sub_type`, `is_contra` সহ। বাস্তব school-এ যা যা লাগে — টিউশন ফি, ভর্তি ফি, পরীক্ষার ফি, শিক্ষকের বেতন, বাস, হোস্টেল, লাইব্রেরি, ল্যাব।
> ২. `Tuition Fee Received in Advance` (আগামী বছরের ফি আগেই নেওয়া) কোন প্রকারে ফেলবেন এবং কেন?
> ৩. School bus-টিকে কীভাবে রাখবেন — একটি account, নাকি একাধিক? Depreciation-এর হিসাব কোথায় বসবে?
> ৪. ২,০০০ ছাত্রের প্রত্যেকের বকেয়া আলাদা করে জানতে হবে। GL-এ কয়টি account বানাবেন? বাকি তথ্য কোথায় রাখবেন?
> ৫. আপনার `accounts` table-এ এমন কী কী constraint দেবেন যাতে ভুল শ্রেণিবিভাগ database পর্যন্ত পৌঁছাতেই না পারে? অন্তত চারটি লিখুন।
>
> ৪ নম্বরের উত্তরটাই subledger architecture-এর মূল ধারণা। নিজের সমাধান লিখে রাখুন — অধ্যায় ৩৬-এ মিলিয়ে দেখবেন।

---

## ১০. Summary Card

**পাঁচটি প্রকার**

| Type | কী | Statement | বছর শেষে |
| --- | --- | --- | --- |
| Asset | যা আছে | Balance Sheet | চলে |
| Liability | যা দেনা | Balance Sheet | চলে |
| Equity | মালিকের অংশ | Balance Sheet | চলে |
| Revenue | যা আয় | Income Statement | শূন্য |
| Expense | যা খরচ | Income Statement | শূন্য |

**শ্রেণি নির্ধারণের ক্রম**

```text
১.  ভবিষ্যতে সুবিধা দেবে?        →  ASSET
২.  অন্যকে দিতে হবে?             →  LIABILITY
৩.  মালিকের বিনিয়োগ / জমা লাভ?   →  EQUITY
৪.  ব্যবসা থেকে অর্জিত?          →  REVENUE
৫.  ভোগ হয়ে গেছে?               →  EXPENSE
```

**Asset নাকি Expense — একটাই প্রশ্ন**

```text
সুবিধা এই হিসাবকালেই শেষ?   →  EXPENSE
ভবিষ্যতেও সুবিধা দেবে?      →  ASSET
```

**Current বনাম Non-current**

```text
১২ মাসের মধ্যে?    →  Current
১২ মাসের বেশি?     →  Non-current
```

**Contra Account**

| Contra | কমায় |
| --- | --- |
| Accumulated Depreciation | Fixed Asset |
| Allowance for Doubtful Debts | Receivable |
| Sales Return / Discount | Revenue |
| Drawings | Capital |

**যে জোড়াগুলো গুলিয়ে যায়**

```text
Customer Advance      →  LIABILITY   (সেবা এখনো দেওয়া হয়নি)
Advance to Supplier   →  ASSET       (পণ্য এখনো পাওয়া যায়নি)

Machine               →  ASSET
Depreciation          →  EXPENSE

Receivable            →  ASSET
Revenue               →  REVENUE
```

**Developer checklist**

```text
□  account_type enum / CHECK constraint দিয়ে বাঁধা
□  is_group = true হলে post নিষিদ্ধ
□  is_contra রাখা ও report-এ বিয়োগ
□  parent ও child এর account_type মিলছে
□  sub_type দিয়ে current / non-current
□  Retained Earnings শুধু closing বদলাবে
□  গ্রাহক-প্রতি GL account নয় — subledger
□  closing শুধু account_type দেখে চলে
```

---

## পরবর্তী অধ্যায়

**অধ্যায় ৪ — Debit ও Credit:** এখন আমরা জানি account গুলো কোন প্রকারের এবং সমীকরণে কোথায় বসে। পরের অধ্যায়ে জানব — **তারা কোন দিকে বাড়ে আর কোন দিকে কমে**। মাত্র পাঁচটি নিয়ম, যা মুখস্থ করতে হবে না — সমীকরণ থেকেই বের করে নেবেন।
