# অধ্যায় ৬ — COA Hierarchy ও Database Design

> **Volume 1 · Part 1 — Accounting Fundamentals · Chapter 6**
>
> পূর্বশর্ত: অধ্যায় ৩ (পাঁচ প্রকার Account), অধ্যায় ৫ (Chart of Accounts)

---

## ১. Learning Objective

এই অধ্যায় শেষে আপনি পারবেন:

```text
COA-র গাছ database-এ কীভাবে রাখতে হয় তা নকশা করতে
Adjacency list, materialized path ও closure table এর মধ্যে বেছে নিতে
চক্র (circular reference) ঠেকানোর যুক্তি লিখতে
Group account-এর ব্যালেন্স সন্তানদের থেকে হিসাব করতে
Account নিষ্ক্রিয় বা মুছে ফেলার নিরাপদ নিয়ম বানাতে
Hardcoded account ID পুরোপুরি এড়াতে — account mapping দিয়ে
Multi-company COA template নকশা করতে
```

**সময়:** পড়া ৫৫ মিনিট + অনুশীলন ৬০ মিনিট।

> এটি Part 1-এর সবচেয়ে বেশি engineering-ঘেঁষা অধ্যায়। এখানে যা শিখবেন, তা পরে posting engine (অধ্যায় ৩৮) ও report engine (অধ্যায় ৪৯)-এ সরাসরি কাজে লাগবে।

---

## ২. Concept Explanation

### গাছটাকে database-এ রাখার তিনটি উপায়

COA একটা গাছ। Relational database-এ গাছ রাখার তিনটি প্রচলিত পদ্ধতি আছে, এবং প্রত্যেকটির নিজস্ব লাভ-ক্ষতি।

**পদ্ধতি ১ — Adjacency List (`parent_id`)**

সবচেয়ে সরল। প্রতিটি সারি শুধু তার parent-এর দিকে দেখায়:

```text
id   code   name                parent_id
──   ────   ────                ─────────
 1   1000   Assets              NULL
 2   1100   Current Assets         1
 3   1110   Cash in Hand           2
 4   1120   Bank                   2
 5   1500   Non-current Assets     1
 6   1510   Computer Equipment     5
```

| সুবিধা | অসুবিধা |
| --- | --- |
| বোঝা ও লেখা সহজ | পুরো subtree আনতে recursive query |
| যোগ/সরানো সহজ | গভীরতা বেশি হলে ধীর |
| তথ্যের পুনরাবৃত্তি নেই | পূর্বপুরুষ খুঁজতে বারবার query |

**পদ্ধতি ২ — Materialized Path**

প্রতিটি সারিতে মূল থেকে তার পর্যন্ত পুরো পথ জমা রাখা:

```text
id   code   name                path
──   ────   ────                ────
 1   1000   Assets              /1/
 2   1100   Current Assets      /1/2/
 3   1110   Cash in Hand        /1/2/3/
 4   1120   Bank                /1/2/4/
 5   1500   Non-current Assets  /1/5/
 6   1510   Computer Equipment  /1/5/6/
```

একটা account-এর নিচের পুরো অংশ — তার **subtree** — আনা এখন একটামাত্র সহজ query:

```text
-- 1100 এর নিচের সব account
SELECT * FROM accounts WHERE path LIKE '/1/2/%';
```

| সুবিধা | অসুবিধা |
| --- | --- |
| subtree আনা খুব দ্রুত | account সরালে সব বংশধরের path বদলাতে হয় |
| পূর্বপুরুষ path থেকেই পাওয়া যায় | তথ্যের পুনরাবৃত্তি |
| ক্রম বজায় রাখা সহজ | path আর `parent_id` অমিল হতে পারে |

**পদ্ধতি ৩ — Closure Table**

প্রতিটি পূর্বপুরুষ-বংশধর জোড়া আলাদা সারিতে রাখা:

```text
closure

ancestor_id   descendant_id   depth
───────────   ─────────────   ─────
     1              1            0
     1              2            1
     1              3            2
     2              2            0
     2              3            1
```

| সুবিধা | অসুবিধা |
| --- | --- |
| যেকোনো দিকের query দ্রুত | আলাদা table রক্ষণাবেক্ষণ |
| বহু-স্তরের গাছেও দক্ষ | সারি সংখ্যা অনেক বেশি |
| জটিল প্রশ্নে নমনীয় | যোগ/সরানোর যুক্তি জটিল |

### কোনটা বেছে নেবেন?

সৎ উত্তর — **COA-র জন্য adjacency list-ই যথেষ্ট, সাথে একটা `path` column রাখুন।**

কারণ COA-র দুটি বৈশিষ্ট্য আছে যা একে অন্য গাছ থেকে আলাদা করে:

```text
১.  আকারে ছোট       সাধারণত ৫০–৫০০টি account, লক্ষ নয়
২.  খুব কম বদলায়    বছরে কয়েকবার নতুন account, ব্যস
```

Closure table-এর জটিলতা এখানে অপ্রয়োজনীয় — সে সমস্যা সমাধান করে যা COA-তে নেই। আর শুধু `parent_id` রাখলে প্রতিটি report-এ recursive query লিখতে হয়।

> **সুপারিশ: `parent_id` (সত্যের উৎস) + `path` ও `level` (দ্রুত query-র জন্য derived)।** `path` ও `level` কখনো হাতে লিখবেন না — `parent_id` বদলালে এরা আপনাআপনি নতুন করে হিসাব হবে।

### চক্র — যে বিপদটা নীরবে সব ভাঙে

গাছে একটা নিয়ম অলঙ্ঘনীয়: **কেউ নিজের পূর্বপুরুষ হতে পারে না।**

```text
    যা হওয়া উচিত                  যা কখনো হতে দেবেন না
    ───────────                    ────────────────────
    A                              A ──▶ B
    └── B                          ▲     │
        └── C                      └─────┘
```

চক্র তৈরি হলে কী ঘটে:

```text
ব্যালেন্স হিসাব করতে গেলে         →  অসীম লুপ, stack overflow
report বানাতে গেলে                →  server hang
path নতুন করে হিসাব করতে গেলে      →  কখনো শেষ হবে না
```

সবচেয়ে খারাপ দিক — চক্র **তৈরির সময় কোনো error দেয় না**। ব্যবহারকারী একটা account-এর parent বদলাল, save হয়ে গেল, সব ঠিক দেখাল। তারপর কেউ report চালাল আর পুরো system আটকে গেল।

তাই চক্র **তৈরির মুহূর্তেই** ঠেকাতে হবে, পরে ধরার আশায় নয়।

চক্র ঠেকানোর যুক্তি সহজ:

```text
A এর parent হিসেবে B সেট করা হচ্ছে

    B কি A নিজেই?                    →  reject
    B কি A এর বংশধর?                 →  reject
    অন্যথায়                          →  অনুমোদন
```

`path` column থাকলে দ্বিতীয় যাচাইটা একটামাত্র তুলনা:

```text
B.path যদি A.path দিয়ে শুরু হয়  →  B হলো A এর বংশধর  →  reject
```

### Group Account-এর ব্যালেন্স

একটা group account-এ কোনো journal line নেই। তাহলে report-এ তার ব্যালেন্স কত?

উত্তর: **তার সব বংশধরের যোগফল।**

```text
1100  Current Assets              6,20,000   ← হিসাব করা
  1110  Cash in Hand              1,50,000   ← আসল entry থেকে
  1120  Bank — Prime Bank         4,00,000   ← আসল entry থেকে
  1130  Accounts Receivable         70,000   ← আসল entry থেকে
```

গুরুত্বপূর্ণ নিয়ম — **এই যোগফল কখনো জমা রাখবেন না।** অধ্যায় ২-এ একই কথা বলেছিলাম সমীকরণ নিয়ে, এখানেও তাই:

```text
সংরক্ষিত রাখলে          →  কোনো একদিন আসল হিসাবের সাথে মিলবে না
হিসাব করে নিলে          →  সবসময় সত্য
```

`path` column থাকলে হিসাবটা সরল:

```text
-- 1100 (id=2) এর মোট ব্যালেন্স
SELECT SUM(l.debit) - SUM(l.credit)
FROM   journal_lines  l
JOIN   accounts       a ON a.id = l.account_id
JOIN   journal_entries e ON e.id = l.journal_entry_id
WHERE  a.path LIKE '/1/2/%'
  AND  e.status = 'posted';
```

> কর্মক্ষমতা নিয়ে চিন্তা হলে — সেটা বাস্তব, কিন্তু সমাধান হলো **snapshot বা running balance আলাদা করে রাখা এবং নিয়মিত মিলিয়ে দেখা**, মূল হিসাবকে সংরক্ষিত মান দিয়ে প্রতিস্থাপন করা নয়। বিস্তারিত অধ্যায় ৯ ও ৪৯-এ।

### সবচেয়ে গুরুত্বপূর্ণ অংশ: Account Mapping

এবার এই অধ্যায়ের — সম্ভবত পুরো Part 1-এর — সবচেয়ে দামি প্রকৌশল-শিক্ষা।

**সমস্যা:** আপনার কোডকে কোনো না কোনোভাবে জানতে হবে "বিক্রির টাকা কোন account-এ যাবে"। নতুনরা যা করেন:

```text
        যা কখনো করবেন না
        ─────────────────

        journal.addLine(accountId = 4110, debit = 0, credit = amount)

        অথবা সামান্য ভালো, কিন্তু এখনো ভুল:

        account = findAccountByCode("4110")
```

কেন এটা ভুল:

```text
প্রতিটি company-র code আলাদা হতে পারে
ব্যবহারকারী account এর code বদলাতে পারেন
ব্যবহারকারী account মুছে নতুন বানাতে পারেন
নতুন company-তে 4110 হয়তো অন্য কিছু
পরীক্ষার data-তে 4110 নাও থাকতে পারে
```

ফলাফল — কোড এক জায়গায় চলে, অন্য জায়গায় নীরবে ভুল account-এ post করে। **এটাই accounting software-এর সবচেয়ে ব্যয়বহুল bug শ্রেণি**, কারণ ভুলটা মাসের পর মাস ধরা পড়ে না।

**সমাধান: একটা নামের স্তর (indirection) যোগ করুন।**

কোড কখনো account চিনবে না — সে চিনবে **ভূমিকা**:

```text
        কোড যা জানে              →   কোথায় সমাধান হয়        →   ফলাফল
        ───────────                  ──────────────             ──────
        'sales_revenue'          →   account_mappings         →   account #47
        'accounts_receivable'    →   (company অনুযায়ী)        →   account #12
        'default_bank'           →                            →   account #9
```

দুটি ভিন্ন company-তে একই কোড ভিন্ন account-এ যাবে, অথচ কোডে একটিও পরিবর্তন লাগবে না।

**দুই ধরনের mapping**

```text
১.  System Account
    accounts টেবিলেই system_account_key column
    যেগুলো প্রতিটি company-তে ঠিক একটাই — retained_earnings, rounding_difference

২.  Configurable Mapping
    আলাদা account_mappings টেবিল
    যেগুলো ব্যবহারকারী বদলাতে পারেন — কোন bank ডিফল্ট, কোন revenue account
```

দ্বিতীয়টা আরও এগিয়ে যায় — mapping কেবল company-ভিত্তিক নয়, প্রেক্ষাপট-ভিত্তিকও হতে পারে:

```text
Sales Revenue কোন account এ?

    সাধারণভাবে              →  4110  Software Income
    Maintenance বিভাগ হলে    →  4120  Maintenance Income
    Consulting হলে          →  4130  Consulting Income
```

এই ধারণাটাই পরে পূর্ণ রূপ নেবে **Posting Rule Engine** হিসেবে (অধ্যায় ৩৮)। এখন শুধু মূল নীতিটা ধরে রাখুন:

> **কোডে কখনো account ID বা account code লিখবেন না। কোড ভূমিকার নাম জানবে, mapping সেই নামকে account-এ রূপান্তর করবে।**

### Account নিষ্ক্রিয় করা ও মুছে ফেলা

**মুছে ফেলা** — সহজ নিয়ম:

```text
account এর কোনো journal line আছে?
        ↓ হ্যাঁ  →  কখনোই মুছবেন না
        ↓ না
system_account_key সেট আছে?
        ↓ হ্যাঁ  →  মুছবেন না
        ↓ না
কোনো সন্তান আছে?
        ↓ হ্যাঁ  →  মুছবেন না
        ↓ না
    মুছতে দিন
```

কেন এত কড়াকড়ি? কারণ একটা account মুছে গেলে তার সাথে জড়িত পুরনো সব entry অর্থহীন হয়ে যায়, আর আগের বছরের report আর কখনো তৈরি করা যায় না। **Accounting-এ ইতিহাস মোছা যায় না** — এই নীতিটা পুরো বইজুড়ে ফিরে আসবে।

**নিষ্ক্রিয় করা** — এটাই স্বাভাবিক পথ:

```text
is_active = false  করলে:

    নতুন entry নেওয়া বন্ধ হবে
    পুরনো entry অক্ষত থাকবে
    আগের report আগের মতোই তৈরি হবে
    দরকার হলে আবার সক্রিয় করা যাবে
```

তবে নিষ্ক্রিয় করার আগেও একটা যাচাই দরকার:

```text
ব্যালেন্স শূন্য নয়?  →  সতর্ক করুন
```

শূন্য নয় এমন account নিষ্ক্রিয় করলে টাকাটা Balance Sheet-এ থেকে যাবে, অথচ কেউ আর সেটা ছুঁতে পারবে না। সাধারণত আগে ব্যালেন্স অন্য account-এ সরিয়ে (একটা journal entry দিয়ে) তারপর নিষ্ক্রিয় করা হয়।

### Multi-company COA

একই software-এ একাধিক প্রতিষ্ঠান চললে COA কীভাবে আসবে?

```text
        coa_templates                     accounts
        ─────────────                     ────────
        "Standard Trading"     ──copy──▶  Company A এর নিজস্ব COA
        "Hospital"             ──copy──▶  Company B এর নিজস্ব COA
        "School"               ──copy──▶  Company C এর নিজস্ব COA
```

গুরুত্বপূর্ণ সিদ্ধান্ত — **copy করুন, ভাগ করে ব্যবহার করবেন না।** Template থেকে একবার copy হবে, তারপর প্রতিটি company নিজের মতো বদলাতে পারবে। Template পরে বদলালেও চালু company-গুলোতে কোনো প্রভাব পড়বে না।

ভাগ করে ব্যবহার করলে একটা company-র জন্য account যোগ করলে সেটা সবার COA-তে দেখা দেবে — যা প্রায় কখনোই কাম্য নয়।

---

## ৩. Accounting Rule

**গাছের চারটি অলঙ্ঘনীয় নিয়ম**

```text
১.  কোনো account নিজের পূর্বপুরুষ হতে পারে না
২.  সন্তানের account_type parent-এর সমান হতে হবে
৩.  Post শুধু পাতায় (is_group = false)
৪.  Group এর ব্যালেন্স = বংশধরদের যোগফল (হিসাব করা, সংরক্ষিত নয়)
```

**Account Mapping-এর মূল নীতি**

```text
কোড ভূমিকা জানে, account জানে না।

    কোডে:      'sales_revenue'
    কখনো নয়:   account_id 47  বা  code '4110'
```

**জীবনচক্রের নিয়ম**

```text
journal line আছে      →  মুছবেন না, কখনোই
system account        →  মুছবেন না, নিষ্ক্রিয়ও করবেন না
সন্তান আছে            →  মুছবেন না
ব্যালেন্স শূন্য নয়      →  নিষ্ক্রিয় করার আগে সতর্ক করুন
```

---

## ৪. Real Business Example

অধ্যায় ৫-এর software company-র COA থেকে কয়েকটি বাস্তব পরিস্থিতি দেখি।

### পরিস্থিতি ১ — গাছটা database-এ

```text
id  code  name                      parent  level  path        is_group
──  ────  ────                      ──────  ─────  ────        ────────
 1  1000  Assets                    NULL      0    /1/         true
 2  1100  Current Assets               1      1    /1/2/       true
 3  1110  Cash in Hand                 2      2    /1/2/3/     false
 4  1120  Bank — Prime Bank            2      2    /1/2/4/     false
 5  1130  Accounts Receivable          2      2    /1/2/5/     false
 6  1500  Non-current Assets           1      1    /1/6/       true
 7  1510  Computer Equipment           6      2    /1/6/7/     false
 8  1515  Accum. Dep. — Computer       6      2    /1/6/8/     false
```

`path` দেখেই বোঝা যাচ্ছে কে কার নিচে, কোনো recursive query ছাড়াই।

### পরিস্থিতি ২ — ব্যালেন্স উপরে জমা হওয়া

ধরুন posting account গুলোর ব্যালেন্স:

```text
1110  Cash in Hand                1,50,000
1120  Bank — Prime Bank           4,00,000
1130  Accounts Receivable           70,000
1510  Computer Equipment          8,00,000
1515  Accum. Dep. — Computer      (3,00,000)   ← contra
```

গাছ বেয়ে উপরে উঠলে:

```text
1000  Assets                     11,20,000
  1100  Current Assets            6,20,000
    1110  Cash in Hand            1,50,000
    1120  Bank — Prime Bank       4,00,000
    1130  Accounts Receivable       70,000
  1500  Non-current Assets        5,00,000
    1510  Computer Equipment      8,00,000
    1515  Accum. Dep. — Computer (3,00,000)
```

লক্ষ করুন `1500` এর ব্যালেন্স ৫,০০,০০০ — কারণ contra account বিয়োগ হয়েছে, ৮,০০,০০০ − ৩,০০,০০০।

এখানে একটা প্রশ্ন ওঠে: বিয়োগটা কে করল? উত্তরটা নির্ভর করে আপনি ব্যালেন্স কীভাবে রাখছেন তার উপর:

```text
    signed রাখলে (debit − credit)           মান + দিক রাখলে
    ─────────────────────────────           ────────────────
    1510  Computer      +8,00,000           1510   8,00,000 Dr
    1515  Accum. Dep.   −3,00,000           1515   3,00,000 Cr

    যোগফল = 5,00,000                        সরল যোগ = 11,00,000  ✗
    কোনো শর্ত লাগেনি ✓                       is_contra দেখে বিয়োগ করতে হবে
```

উপরের query-টা (`SUM(debit) - SUM(credit)`) signed, তাই সে আপনাআপনি ঠিক উত্তর দেয়। **এটাই signed রাখার সবচেয়ে বড় লাভ — গাছ বেয়ে উপরে যোগ করতে কোনো বিশেষ যুক্তি লাগে না** (অধ্যায় ৯-এ এই সিদ্ধান্তটা আবার আসবে)।

তাহলে `is_contra` কী কাজে লাগে? **উপস্থাপনায়।** Balance Sheet-এ Accumulated Depreciation দেখাতে হয় বন্ধনীর ভিতরে, তার parent-এর নিচে, বিয়োগ চিহ্ন সহ — আর ওই সিদ্ধান্তটা যোগফলের নয়, ছাপার।

> **ফাঁদটা তাই যোগফলে নয়, সংরক্ষণে।** কেউ যদি ব্যালেন্স "মান + দিক" হিসেবে জমা রাখেন, তখন প্রতিটি যোগফলের যুক্তিতে `is_contra` ধরতে হবে — আর কোনো একদিন কোথাও কেউ ভুলে যাবে, আর ১১,০০,০০০ ছাপা হয়ে যাবে।

### পরিস্থিতি ৩ — চক্র তৈরির চেষ্টা

ব্যবহারকারী `1100 Current Assets` (id=2)-এর parent হিসেবে `1130 Accounts Receivable` (id=5) সেট করতে চাইছেন।

```text
যাচাই:

    5 কি 2 নিজেই?           →  না
    5 কি 2 এর বংশধর?

        accounts[5].path  =  /1/2/5/
        accounts[2].path  =  /1/2/

        /1/2/5/  কি  /1/2/  দিয়ে শুরু?   →  হ্যাঁ

    →  5 হলো 2 এর বংশধর  →  REJECT
```

বার্তা: *"Accounts Receivable কে Current Assets এর parent বানানো যাবে না, কারণ সে নিজেই Current Assets এর নিচে আছে।"*

### পরিস্থিতি ৪ — Account Mapping কাজে

একটি invoice তৈরি হচ্ছে ১,০০,০০০ টাকার:

```text
কোড যা লেখে:

    ar    = mapping.resolve('accounts_receivable')
    rev   = mapping.resolve('sales_revenue')

    journal.line(ar,  debit  = 100000)
    journal.line(rev, credit = 100000)
```

Company A-তে:

```text
'accounts_receivable'  →  account #5   (code 1130)
'sales_revenue'        →  account #21  (code 4110)
```

Company B-তে (একটি hospital):

```text
'accounts_receivable'  →  account #88  (code 1210, 'Patient Receivable')
'sales_revenue'        →  account #94  (code 4210, 'OPD Income')
```

**একই কোড, দুই company, সম্পূর্ণ ভিন্ন account — কোডে একটি অক্ষরও বদলায়নি।** এটাই account mapping-এর পুরো উদ্দেশ্য।

---

## ৫. Implementation — Software ও Database

### সম্পূর্ণ accounts table

```text
accounts

id                      BIGINT PK
company_id              BIGINT FK
code                    VARCHAR(20)
name                    VARCHAR(200)
account_type            VARCHAR(20)
sub_type                VARCHAR(40)

parent_id               BIGINT FK NULL   -- সত্যের উৎস
level                   SMALLINT         -- derived
path                    VARCHAR(500)     -- derived, '/1/2/5/'

is_group                BOOLEAN
is_control_account      BOOLEAN
is_contra               BOOLEAN
allow_manual_posting    BOOLEAN
system_account_key      VARCHAR(60) NULL
is_active               BOOLEAN

created_at              TIMESTAMP
updated_at              TIMESTAMP

UNIQUE (company_id, code)
UNIQUE (company_id, system_account_key)
INDEX  (company_id, path)
INDEX  (company_id, parent_id)
FOREIGN KEY (parent_id) REFERENCES accounts(id)
```

### account_mappings table

```text
account_mappings

id                      BIGINT PK
company_id              BIGINT FK
mapping_key             VARCHAR(60)      -- 'sales_revenue'
account_id              BIGINT FK
context                 VARCHAR(60) NULL -- ভবিষ্যতের জন্য: বিভাগ, ধরন
description             VARCHAR(200)
updated_at              TIMESTAMP

UNIQUE (company_id, mapping_key, context)
```

`context` column-টা এখন হয়তো NULL-ই থাকবে, কিন্তু রেখে দিন। যখন "Maintenance বিভাগের বিক্রি আলাদা account-এ যাবে" এমন দাবি আসবে, তখন schema বদলাতে হবে না।

### path ও level রক্ষণাবেক্ষণ

এই দুটি derived, তাই `parent_id` বদলালে নতুন করে হিসাব হতে হবে:

```text
account সংরক্ষণ করার সময়:

    parent_id বদলেছে?
            ↓ না  →  কিছু করার নেই
            ↓ হ্যাঁ

    চক্র যাচাই করুন          →  ব্যর্থ হলে reject
            ↓
    account_type মিলছে?      →  না হলে reject
            ↓
    নিজের path ও level নতুন করে হিসাব করুন
            ↓
    সব বংশধরের path ও level নতুন করে হিসাব করুন
            ↓
    পুরোটা একটি database transaction এ
```

শেষ লাইনটা গুরুত্বপূর্ণ। মাঝপথে ব্যর্থ হলে কিছু account-এর path ঠিক, কিছুর ভুল — আর গাছটা নীরবে ভেঙে থাকবে।

### চক্র যাচাইয়ের সম্পূর্ণ যুক্তি

```text
canSetParent(childId, newParentId):

    newParentId কি NULL?          →  অনুমোদন (মূল account)

    newParentId == childId?       →  reject "নিজেই নিজের parent হতে পারে না"

    child   = load(childId)
    parent  = load(newParentId)

    parent.company_id != child.company_id?
                                  →  reject "ভিন্ন company"

    parent.account_type != child.account_type?
                                  →  reject "প্রকার মিলছে না"

    parent.path শুরু হয় child.path দিয়ে?
                                  →  reject "চক্র তৈরি হবে"

    parent.is_group == false?     →  reject "posting account এর নিচে
                                             account বসতে পারে না"

    অনুমোদন
```

শেষ যাচাইটা লক্ষ করুন — একটা posting account কখনো অন্য account-এর parent হতে পারে না। কারণ তাহলে সে একই সাথে group আর posting হয়ে যাবে, আর তার ব্যালেন্স দুবার গোনা হবে।

### Mapping resolve করার যুক্তি

```text
resolve(key, context = null):

    mapping = খুঁজুন (company_id, key, context)

    না পেলে এবং context দেওয়া ছিল?
            ↓
    mapping = খুঁজুন (company_id, key, NULL)     -- সাধারণ mapping-এ ফিরে যান

    না পেলে?
            ↓
    থামুন এবং স্পষ্ট error দিন:
        "Account mapping 'sales_revenue' এই company-তে সেট করা নেই"

    account = load(mapping.account_id)

    account.is_active == false?   →  error
    account.is_group  == true?    →  error

    return account
```

**"না পেলে থামুন" অংশটা আপসযোগ্য নয়।** অনেকে এখানে একটা "suspense account"-এ ফেলে দেওয়ার ব্যবস্থা রাখেন যাতে কাজ আটকে না যায় — কিন্তু তাতে ভুল posting নীরবে চলতে থাকে আর কেউ টের পায় না। **স্পষ্ট ব্যর্থতা নীরব ভুলের চেয়ে সবসময় ভালো।**

### শুরুতেই যে যাচাইগুলো চালু রাখবেন

Application চালু হওয়ার সময় একবার যাচাই করে নিন যে COA সুস্থ আছে:

```text
□  প্রতিটি company-তে সব আবশ্যক mapping_key সেট আছে
□  প্রতিটি mapping এমন account দেখাচ্ছে যা সক্রিয় ও পাতা
□  কোনো চক্র নেই
□  প্রতিটি account এর path তার parent_id এর সাথে সামঞ্জস্যপূর্ণ
□  কোনো posting account এর সন্তান নেই
□  প্রতিটি সন্তানের account_type তার parent-এর সমান
```

এই যাচাইগুলো একটা test হিসেবেও লিখে রাখুন। COA হাতে বদলানো যায় বলে এখানে ভুল ঢোকা খুব সহজ।

---

## ৬. Financial Statement Impact

গাছের কাঠামোই report-এর কাঠামো — অধ্যায় ৫-এ দেখেছি। এখানে যোগ হচ্ছে **কীভাবে সংখ্যাগুলো উপরে উঠে আসে**:

```text
        journal_lines                (আসল তথ্য)
              │
              ▼
        posting account এর ব্যালেন্স   (যোগফল)
              │
              ▼  path ধরে উপরে
        group account এর ব্যালেন্স     (বংশধরদের যোগফল, contra বিয়োগ)
              │
              ▼
        Financial Statement          (গাছের ক্রমে সাজানো)
```

Report engine-এর জন্য এর ব্যবহারিক অর্থ:

| দরকার | কীভাবে |
| --- | --- |
| Balance Sheet-এর Assets অংশ | `path LIKE '/1/%'` এর সব account |
| Current Assets উপশিরোনাম | `path LIKE '/1/2/%'` |
| শুধু বিস্তারিত লাইন | `is_group = false` |
| সংক্ষিপ্ত report | `level <= 1` পর্যন্ত |

শেষ সারিটা একটা চমৎকার সুবিধা — **`level` দিয়ে report-এর গভীরতা নিয়ন্ত্রণ করা যায়।** ব্যবস্থাপনার জন্য `level <= 1`, নিরীক্ষকের জন্য পুরোটা। একই তথ্য, একই query, শুধু একটা parameter।

---

## ৭. Common Developer Mistakes

| ভুল | কী ঘটে | সঠিক পথ |
| --- | --- | --- |
| কোডে account ID / code লেখা | অন্য company-তে ভুল account-এ post | account mapping |
| চক্র যাচাই না করা | report চালালে server আটকে যায় | parent সেট করার সময় যাচাই |
| `path` হাতে লেখা | `parent_id` এর সাথে অমিল | `parent_id` থেকে derive করুন |
| Parent বদলে বংশধরের path না বদলানো | গাছ নীরবে ভাঙা থাকে | সব বংশধর একসাথে হালনাগাদ |
| Group ব্যালেন্স জমা রাখা | আসল হিসাবের সাথে মিলবে না | প্রতিবার হিসাব করুন |
| ব্যালেন্স "মান + দিক" হিসেবে জমা রাখা | প্রতিটি যোগফলে `is_contra` ধরতে হয়, কেউ ভুলবেই | signed রাখুন (`debit − credit`) |
| Mapping না পেলে suspense-এ ফেলা | ভুল posting নীরবে চলে | স্পষ্ট error দিন |
| Posting account-এর নিচে account | ব্যালেন্স দুবার গোনা | parent অবশ্যই group |
| Journal line থাকা account মোছা | পুরনো report আর তৈরি হয় না | নিষ্ক্রিয় করুন |
| Template COA ভাগ করে ব্যবহার | এক company-র বদল সবার COA-তে | copy করুন |
| Path হালনাগাদ transaction ছাড়া | অর্ধেক ঠিক, অর্ধেক ভুল | একটি transaction-এ |

প্রথম সারিটা এই অধ্যায়ের সবচেয়ে গুরুত্বপূর্ণ শিক্ষা, আর শেষেরটা সবচেয়ে অবহেলিত। দুটোই এমন ভুল যা **তৈরির সময় কোনো লক্ষণ দেখায় না** — অনেক পরে, যখন কেউ report মেলাতে বসে, তখন ধরা পড়ে।

---

## ৮. Exercises

**সেট ক — গাছের যাচাই**

নিচের গাছটি দেখুন:

```text
id  code  name                parent  path
──  ────  ────                ──────  ────
 1  1000  Assets              NULL    /1/
 2  1100  Current Assets         1    /1/2/
 3  1110  Cash                   2    /1/2/3/
 4  1120  Bank                   2    /1/2/4/
 5  4000  Revenue             NULL    /5/
 6  4100  Sales                  5    /5/6/
```

প্রতিটি অনুরোধ অনুমোদিত না প্রত্যাখ্যাত — কারণসহ লিখুন:

```text
১।   3 এর parent হবে 4
২।   2 এর parent হবে 3
৩।   6 এর parent হবে 2
৪।   1 এর parent হবে 2
৫।   4 এর parent হবে 1
৬।   6 এর parent হবে NULL
```

**সেট খ — ব্যালেন্স হিসাব**

```text
1110  Cash                      2,00,000
1120  Bank                      5,50,000
1130  Accounts Receivable       1,20,000
1510  Computer Equipment        6,00,000
1515  Accum. Dep. — Computer   (2,40,000)   contra
1520  Furniture                 1,50,000
1525  Accum. Dep. — Furniture     (45,000)  contra
```

গাছের কাঠামো: `1100` এর নিচে 1110, 1120, 1130। `1500` এর নিচে 1510, 1515, 1520, 1525। দুটোই `1000` এর নিচে।

```text
৭।   1100 Current Assets এর ব্যালেন্স কত?
৮।   1500 Non-current Assets এর ব্যালেন্স কত?
৯।   1000 Assets এর ব্যালেন্স কত?
১০।  ব্যালেন্স যদি signed (`debit − credit`) হিসেবে রাখা হয়,
     উপরের যোগফলগুলো বের করতে কি `is_contra` দেখার দরকার আছে?

১১।  কেউ ব্যালেন্স "মান + দিক" হিসেবে রেখেছেন এবং যোগ করার সময়
     `is_contra` ধরতে ভুলে গেছেন। 1000 এর ব্যালেন্স কত দেখাবে,
     আর ভুলটা কত টাকার?

১২।  তাহলে `is_contra` column-টা আদৌ কেন রাখবেন? এক বাক্যে লিখুন।
```

**সেট গ — Account Mapping**

```text
১৩।  নিচের প্রতিটি কাজের জন্য কী কী mapping_key লাগবে তালিকা করুন:

     (ক)  গ্রাহকের invoice তৈরি
     (খ)  গ্রাহকের কাছ থেকে টাকা আদায়
     (গ)  সরবরাহকারীর bill নেওয়া
     (ঘ)  বেতন হিসাব করা (কর কেটে)
     (ঙ)  বছর শেষে closing

১৪।  একটি company-তে 'sales_revenue' mapping সেট করা নেই।
     ব্যবহারকারী invoice বানাতে চাইছেন। আপনার system কী করবে?
     তিনটি সম্ভাব্য আচরণ লিখুন, এবং কোনটা বেছে নেবেন ও কেন।

১৫।  ব্যবহারকারী 'accounts_receivable' mapping বদলে একটা
     Revenue account দেখিয়ে দিলেন। এটা কি ঠেকানো উচিত?
     ঠেকালে কীভাবে?
```

**সেট ঘ — চিন্তার প্রশ্ন**

```text
১৬।  `path` column ছাড়া শুধু `parent_id` দিয়ে "1100 এর নিচের সব
     account" বের করতে হলে কী করতে হতো? সেটা কেন ধীর?

১৭।  একটা account এর ব্যালেন্স ১০ লক্ষ, কিন্তু ব্যবহারকারী সেটা
     নিষ্ক্রিয় করতে চান। আপনার system কী করবে? ধাপে ধাপে লিখুন।

১৮।  দুটি company-র COA সম্পূর্ণ আলাদা। ব্যবস্থাপনা চায় দুটো
     মিলিয়ে একটা consolidated Balance Sheet। কী কী সমস্যা হবে,
     আর কী কী তথ্য অতিরিক্ত লাগবে?
```

উত্তর আছে Workbook-এর Answer Key, অধ্যায় ৬-এ।

---

## ৯. Developer Challenge

> একটি সম্পূর্ণ **COA Service** নকশা করুন — শুধু schema নয়, আচরণসহ।
>
> যা যা নকশা করবেন:
>
> ১. `createAccount`, `moveAccount`, `deactivateAccount`, `deleteAccount` — প্রতিটির জন্য যাচাইয়ের সম্পূর্ণ তালিকা লিখুন। কোন যাচাই কোন ক্রমে চলবে?
> ২. `moveAccount` এ বংশধরদের `path` হালনাগাদ করার যুক্তি লিখুন। ১০০টি বংশধর থাকলে কতগুলো query চলবে? কমানো যায়?
> ৩. `resolveMapping(key, context)` এর সম্পূর্ণ যুক্তি লিখুন, না-পাওয়ার আচরণসহ।
> ৪. একটা `validateChartOfAccounts()` ফাংশন নকশা করুন যা পুরো COA-র স্বাস্থ্য যাচাই করে এবং সমস্যার তালিকা ফেরত দেয়। অন্তত ছয়টি যাচাই রাখুন।
> ৫. নতুন company তৈরির সময় template থেকে COA copy করার যুক্তি লিখুন। `parent_id` গুলো নতুন id-তে কীভাবে মেলাবেন? `system_account_key` ও mapping কীভাবে সেট হবে?
> ৬. আপনার system-এ কেউ সরাসরি database-এ গিয়ে একটা account-এর `parent_id` বদলে দিল, `path` বদলাল না। এটা কীভাবে ধরবেন, আর ধরার পরে কীভাবে সারাবেন?
>
> ৫ নম্বরটা দেখতে সহজ কিন্তু বাস্তবে বেশ কৌশলী — template-এর `parent_id` গুলো template-এর id, নতুন company-তে সেগুলো নতুন id হবে। এই মিলকরণটা কীভাবে করবেন তার একটা পরিষ্কার অ্যালগরিদম লিখুন।

---

## ১০. Summary Card

**গাছ রাখার পদ্ধতি**

| পদ্ধতি | সুবিধা | কখন |
| --- | --- | --- |
| Adjacency (`parent_id`) | সরল, বদলানো সহজ | সত্যের উৎস |
| Materialized path | subtree query দ্রুত | derived, সাথে রাখুন |
| Closure table | সবদিকে দ্রুত | COA-তে অতিরিক্ত |

```text
সুপারিশ:  parent_id  (সত্য)  +  path, level  (derived)
```

**গাছের চারটি নিয়ম**

```text
১.  কেউ নিজের পূর্বপুরুষ হতে পারে না
২.  সন্তানের account_type = parent-এর account_type
৩.  Post শুধু পাতায়
৪.  Group এর ব্যালেন্স = বংশধরদের যোগফল (contra বিয়োগ করে)
```

**চক্র যাচাই**

```text
parent.path শুরু হয় child.path দিয়ে?   →  চক্র  →  reject
```

**Account Mapping — মূল নীতি**

```text
কোড জানে ভূমিকা, account নয়

    করুন:      resolve('sales_revenue')
    করবেন না:  account_id 47
    করবেন না:  findByCode('4110')

না পেলে থামুন — suspense account এ ফেলবেন না
```

**জীবনচক্র**

| অবস্থা | মুছবেন? | নিষ্ক্রিয় করবেন? |
| --- | --- | --- |
| journal line আছে | কখনো নয় | হ্যাঁ |
| system account | কখনো নয় | কখনো নয় |
| সন্তান আছে | কখনো নয় | সতর্কতাসহ |
| ব্যালেন্স শূন্য নয় | কখনো নয় | আগে সরান |
| একদম নতুন, অব্যবহৃত | হ্যাঁ | হ্যাঁ |

**Developer checklist**

```text
□  parent_id সত্যের উৎস, path ও level derived
□  parent বদলালে সব বংশধরের path হালনাগাদ
□  পুরোটা একটি DB transaction এ
□  চক্র যাচাই প্রতিবার parent সেট করার সময়
□  parent অবশ্যই is_group = true
□  account_type parent ও সন্তানে মিলছে
□  group ব্যালেন্স হিসাব করা, সংরক্ষিত নয়
□  ব্যালেন্স signed — যোগফলে contra আপনাআপনি বিয়োগ
□  is_contra উপস্থাপনার জন্য, যোগফলের জন্য নয়
□  কোডে কোনো account ID / code নেই
□  mapping না পেলে স্পষ্ট error
□  template COA copy হয়, ভাগ হয় না
□  startup এ validateChartOfAccounts()
```

---

## পরবর্তী অধ্যায়

**অধ্যায় ৭ — Journal Entry:** COA তৈরি, গাছ দাঁড়িয়ে গেছে, account mapping কাজ করছে। এবার আসল কাজ — **entry লেখা**। পরের অধ্যায়ে দেখব একটি journal entry-র গঠন কী, তার জীবনচক্র কেমন, draft থেকে posted পর্যন্ত সে কী কী অবস্থায় থাকে, আর কেন posted entry কখনো বদলানো যায় না।
