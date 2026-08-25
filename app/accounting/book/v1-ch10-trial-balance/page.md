# অধ্যায় ১০ — Trial Balance

> **Volume 1 · Part 1 — Accounting Fundamentals · Chapter 10**
>
> পূর্বশর্ত: অধ্যায় ৯ (General Ledger), অধ্যায় ২ (Accounting Equation)

---

## ১. Learning Objective

এই অধ্যায় শেষে আপনি পারবেন:

```text
Trial Balance-এর গঠন ও ছয়টি column বুঝতে
কেন দুই পাশ মিলতেই হবে তা সমীকরণ দিয়ে ব্যাখ্যা করতে
Trial Balance কোন ভুলগুলো ধরে তা বলতে
কোন ভুলগুলো এটি কখনোই ধরতে পারে না — তা চিনতে
অমিল পেলে ধাপে ধাপে কারণ খুঁজে বের করতে
Trial Balance থেকে P&L ও Balance Sheet তৈরি করতে
system-এর স্বাস্থ্য যাচাই হিসেবে এটি ব্যবহার করতে
তুলনামূলক যাচাই দিয়ে সেই ভুলগুলো ধরতে যা Trial Balance ধরে না
```

**সময়:** পড়া ৫০ মিনিট + অনুশীলন ৫০ মিনিট।

---

## ২. Concept Explanation

### Trial Balance কী?

**Trial Balance** হলো একটি নির্দিষ্ট তারিখে সব account-এর ব্যালেন্সের তালিকা — debit আর credit আলাদা দুই column-এ।

```text
        সব account এর ledger
                  │
                  ▼  প্রতিটির শুধু closing balance নিন
        TRIAL BALANCE
                  │
                  ▼
        মোট Debit  =  মোট Credit  ?
```

নামটাই বলে দেয় উদ্দেশ্য — এটা একটা **পরীক্ষা (trial)**। খাতা ঠিকভাবে ভারসাম্যে আছে কিনা যাচাই করার প্রথম ধাপ।

### কেন দুই পাশ মিলতেই হবে

কারণটা অধ্যায় ২ ও ৪-এ শেখা নিয়ম থেকেই আসে, নতুন কিছু নয়:

```text
প্রতিটি journal entry-তে:       SUM(debit) = SUM(credit)
                                        ↓
সব entry যোগ করলে:              মোট debit = মোট credit
                                        ↓
account অনুযায়ী সাজালে:          মোট debit = মোট credit
                                        ↓
                                TRIAL BALANCE মিলবে
```

**তাই Trial Balance মেলা কোনো অর্জন নয় — এটা স্বাভাবিক।** না মেলাটাই অস্বাভাবিক এবং সেটা একটা জরুরি সংকেত।

> Developer-এর দৃষ্টিতে: Trial Balance হলো আপনার posting engine-এর **integration test**। প্রতিটি entry balanced ছিল — এটা unit test. সব মিলিয়ে খাতা balanced আছে — এটা integration test। দ্বিতীয়টা ব্যর্থ হওয়া মানে কোথাও data সরাসরি ঢোকানো হয়েছে, কোনো posting অসম্পূর্ণ হয়েছে, বা migration ভুল হয়েছে।

### ছয় column-এর গঠন

সরল Trial Balance-এ দুটি column থাকে, কিন্তু কাজের রূপটি ছয় column-এর:

```text
                        TRIAL BALANCE — জুলাই ২০২৫

  CODE  ACCOUNT                 OPENING              PERIOD             CLOSING
                                  Dr        Cr        Dr        Cr        Dr        Cr
  ────  ───────                 ────      ────      ────      ────      ────      ────
  1110  Cash                2,00,000            1,30,000    77,000  2,53,000
  1120  Bank                8,00,000            5,00,000  1,90,000 11,10,000
  ...
                            ────────  ────────  ────────  ────────  ────────  ────────
        TOTAL              23,00,000 23,00,000 19,42,000 19,42,000 32,05,000 32,05,000
```

তিনটি জোড়া:

| জোড়া | মানে |
| --- | --- |
| **Opening** | period শুরুর ব্যালেন্স (আগের period-এর closing) |
| **Period** | এই period-এ কত debit, কত credit হলো |
| **Closing** | period শেষের ব্যালেন্স |

**তিনটি জোড়াই আলাদাভাবে মিলতে হবে।** এটা গুরুত্বপূর্ণ — কোনটা মেলেনি সেটা দেখেই বোঝা যায় সমস্যা কোথায়:

```text
Opening মেলেনি     →  আগের period বা migration-এ সমস্যা
Period মেলেনি      →  এই period-এর কোনো posting অসম্পূর্ণ
Closing মেলেনি     →  উপরের দুটোর একটা (বা হিসাবের ভুল)
```

### Trial Balance কী কী ধরে

মিল না হলে নিচের যেকোনো একটা ঘটেছে:

```text
✓  একটা entry-র শুধু এক পাশ লেখা হয়েছে
✓  একটা entry-র debit আর credit আলাদা অঙ্কের
✓  কোনো line যোগ করতে বাদ পড়েছে
✓  সরাসরি database-এ data ঢোকানো হয়েছে
✓  migration-এ কিছু line হারিয়েছে
✓  একটা posting মাঝপথে ব্যর্থ হয়েছে (অধ্যায় ৮)
✓  যোগফলের হিসাবে ভুল হয়েছে
```

### Trial Balance যা কখনোই ধরতে পারে না

**এটাই এই অধ্যায়ের সবচেয়ে গুরুত্বপূর্ণ অংশ।** অনেকে ভাবেন Trial Balance মিলে গেলে হিসাব ঠিক। সেটা সম্পূর্ণ ভুল ধারণা।

নিচের প্রতিটি ভুলে **Trial Balance নিখুঁতভাবে মিলে যায়**, অথচ হিসাব ভুল:

**১. ভুল account, ঠিক দিক**

```text
    যা হওয়া উচিত ছিল           যা হলো
    ─────────────────           ──────
    Electricity  Dr 25,000      Office Rent  Dr 25,000
        Cash        Cr 25,000       Cash        Cr 25,000

    যোগফল অভিন্ন → Trial Balance মেলে ✓
    কিন্তু বিদ্যুৎ খরচ ০, ভাড়া দ্বিগুণ  ✗
```

**২. debit ও credit সম্পূর্ণ উল্টে যাওয়া**

```text
    যা হওয়া উচিত ছিল           যা হলো
    ─────────────────           ──────
    Cash         Dr 50,000      Sales        Dr 50,000
        Sales       Cr 50,000       Cash        Cr 50,000

    মোট debit 50,000, মোট credit 50,000 → মেলে ✓
    কিন্তু নগদ কমে গেল, আয় ঋণাত্মক হলো  ✗
```

**৩. পুরো entry বাদ পড়া**

```text
    একটা entry কখনো লেখাই হয়নি।
    যা নেই তা যোগফলে প্রভাব ফেলে না → মেলে ✓
    কিন্তু একটা লেনদেন হিসাবে নেই  ✗
```

**৪. একই entry দুবার**

```text
    পুরো entry (দুই পাশসহ) দুবার লেখা হয়েছে।
    দুই পাশই দ্বিগুণ → মেলে ✓
    কিন্তু বিক্রি দ্বিগুণ দেখাচ্ছে  ✗
```

**৫. দুই পাশেই সমান অঙ্কের ভুল**

```text
    ৫০,০০০ এর জায়গায় দুই পাশেই ৫,০০০ লেখা হয়েছে।
    মেলে ✓  কিন্তু অঙ্ক ভুল  ✗
```

**৬. পরস্পর ক্ষতিপূরণকারী ভুল**

```text
    একটা account-এ ১০,০০০ বেশি debit,
    অন্য একটায় ১০,০০০ বেশি credit।
    দুটো ভুল একে অন্যকে ঢেকে দেয় → মেলে ✓
```

> **সারকথা: Trial Balance মেলা মানে "গণিত ঠিক", "হিসাব ঠিক" নয়।**
>
> এটা যাচাই করে যোগফল, বিচার করে না অর্থ। তাই Trial Balance মিলে যাওয়ার পরেও ledger পড়া, reconciliation করা, আর অস্বাভাবিক ব্যালেন্স খোঁজা — সবই দরকার।

Developer হিসেবে এর মানে: **Trial Balance-কে একমাত্র test হিসেবে ব্যবহার করবেন না।** অধ্যায় ৫১-এ দেখব কেন প্রতিটি module-এর জন্য আলাদা test লাগে যা account-ভিত্তিক প্রত্যাশা যাচাই করে।

### অমিল পেলে কী করবেন

একটা পদ্ধতিগত অনুসন্ধান, আন্দাজে খোঁজা নয়:

**ধাপ ১ — পার্থক্যের অঙ্ক দেখুন**

পার্থক্যের সংখ্যাটাই প্রায়ই সূত্র দেয়:

```text
পার্থক্য ৯ দিয়ে বিভাজ্য?        →  সম্ভবত অঙ্ক উল্টে গেছে
                                    (৫৪০০ এর জায়গায় ৪৫০০, পার্থক্য ৯০০)

পার্থক্য দ্বিগুণ কোনো সংখ্যা?      →  একটা line ভুল পাশে
                                    (৫০,০০০ credit এর জায়গায় debit,
                                     পার্থক্য ১,০০,০০০)

পার্থক্য গোল সংখ্যা?            →  একটা পুরো line বাদ পড়েছে

পার্থক্য খুব ছোট (পয়সা)?        →  দশমিকের সমস্যা, FLOAT ব্যবহার
```

**ধাপ ২ — কোন স্তরে অমিল**

```text
Opening মেলে?  →  না হলে আগের period দেখুন
Period মেলে?   →  না হলে এই period-এর posting দেখুন
```

**ধাপ ৩ — entry-ভিত্তিক যাচাই**

প্রতিটি entry আলাদাভাবে balanced কিনা দেখুন:

```text
SELECT e.id, e.voucher_no,
       SUM(l.debit)  AS total_debit,
       SUM(l.credit) AS total_credit
FROM   journal_entries e
JOIN   journal_lines   l ON l.journal_entry_id = e.id
WHERE  e.company_id = :company
  AND  e.status     = 'posted'
GROUP BY e.id, e.voucher_no
HAVING SUM(l.debit) <> SUM(l.credit);
```

এই query-টাই সাধারণত দোষী entry ধরে ফেলে। **ফলাফল শূন্য সারি হওয়া উচিত** — না হলে ওই entry গুলোই সমস্যা।

**ধাপ ৪ — অনাথ line খুঁজুন**

```text
-- header ছাড়া line
SELECT l.* FROM journal_lines l
LEFT JOIN journal_entries e ON e.id = l.journal_entry_id
WHERE e.id IS NULL;

-- line ছাড়া header
SELECT e.* FROM journal_entries e
LEFT JOIN journal_lines l ON l.journal_entry_id = e.id
WHERE l.id IS NULL AND e.status = 'posted';
```

দ্বিতীয়টা অধ্যায় ৮-এর সেই অসম্পূর্ণ posting-এর চিহ্ন।

### Adjusted Trial Balance

মাস শেষে কিছু সমন্বয় (adjusting entry) দিতে হয় — অবচয়, বকেয়া খরচ, অগ্রিম সমন্বয় (অধ্যায় ২৫)। তাই দুটি Trial Balance হয়:

```text
    Unadjusted Trial Balance
            │
            ▼  adjusting entries যোগ করুন
    Adjusted Trial Balance
            │
            ▼
    Financial Statements
```

**Financial statement সবসময় adjusted Trial Balance থেকে তৈরি হয়।** Unadjusted-টা কাজের মধ্যবর্তী ধাপ।

### Trial Balance থেকে Statement

এটাই Trial Balance-এর চূড়ান্ত উদ্দেশ্য। সব account-এর closing balance-কে প্রকার অনুযায়ী ভাগ করলেই statement বেরিয়ে আসে:

```text
        ADJUSTED TRIAL BALANCE
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
  Revenue, Expense    Asset, Liability, Equity
        │                   │
        ▼                   ▼
  INCOME STATEMENT     BALANCE SHEET
        │                   ▲
        └───────────────────┘
          নিট লাভ Equity তে
```

অধ্যায় ৩-এর permanent/temporary বিভাজনটা এখানে সরাসরি কাজে লাগছে। বিস্তারিত অধ্যায় ২০ ও ২১-এ।

---

## ৩. Accounting Rule

**মূল নিয়ম**

```text
মোট Debit  =  মোট Credit

তিনটি জোড়ার প্রতিটিতে আলাদাভাবে:
    Opening Dr = Opening Cr
    Period  Dr = Period  Cr
    Closing Dr = Closing Cr
```

**Closing-এর সূত্র**

```text
Debit-normal:   closing = opening + period_debit  - period_credit
Credit-normal:  closing = opening + period_credit - period_debit
```

**যা Trial Balance ধরে**

```text
এক পাশ লেখা, অসম অঙ্ক, বাদ পড়া line,
সরাসরি data ঢোকানো, অসম্পূর্ণ posting
```

**যা Trial Balance কখনোই ধরে না**

```text
ভুল account (ঠিক দিকে)
debit/credit উল্টে যাওয়া
পুরো entry বাদ পড়া
পুরো entry দুবার
দুই পাশেই সমান ভুল
পরস্পর ক্ষতিপূরণকারী ভুল
```

**অলঙ্ঘনীয়**

```text
Trial Balance মেলা  ≠  হিসাব সঠিক
```

---

## ৪. Real Business Example

### একটি সম্পূর্ণ Trial Balance

অধ্যায় ৯-এর সেই জুলাই মাসের data নিয়ে। প্রথমে মাসের সব posted entry এক জায়গায়:

```text
তারিখ    Voucher        Debit                          Credit
─────    ───────        ─────                          ──────
02-07    RV-07-0001     1120 Bank            3,00,000    1130 A/R             3,00,000
05-07    PV-07-0012     5220 Office Rent       25,000    1110 Cash              25,000
06-07    PV-07-0002     2110 A/P             1,50,000    1120 Bank            1,50,000
08-07    RV-07-0021     1110 Cash              50,000    4110 Sales             50,000
10-07    SV-07-0003     1130 A/R             5,00,000    4110 Sales           5,00,000
12-07    PV-07-0025     2120 Salary Payable    40,000    1110 Cash              40,000
15-07    PV-07-0004     5220 Office Rent       40,000    1120 Bank              40,000
20-07    RV-07-0030     1110 Cash              80,000    1130 A/R               80,000
22-07    RV-07-0005     1120 Bank            2,00,000    1130 A/R             2,00,000
28-07    PuV-07-0006    1140 Inventory       1,80,000    2110 A/P             1,80,000
28-07    PV-07-0033     5220 Office Rent       12,000    1110 Cash              12,000
31-07    PV-07-0007     5210 Salary          3,50,000    2120 Salary Payable  3,50,000
31-07    JV-07-0040     5290 Depreciation      15,000    1515 Accum. Dep.       15,000
```

প্রতিটি entry balanced, তাই মোট period debit = মোট period credit — এটা আগে থেকেই জানা।

এবার opening balance সহ পূর্ণ Trial Balance:

```text
                        TRIAL BALANCE — জুলাই ২০২৫
                          (সব অঙ্ক টাকায়)

  CODE  ACCOUNT                 OPENING              PERIOD             CLOSING
                                  Dr        Cr        Dr        Cr        Dr        Cr
  ────  ───────                 ────      ────      ────      ────      ────      ────
  1110  Cash                2,00,000            1,30,000    77,000  2,53,000
  1120  Bank                8,00,000            5,00,000  1,90,000 11,10,000
  1130  A/R                 4,00,000            5,00,000  5,80,000  3,20,000
  1140  Inventory           3,00,000            1,80,000            4,80,000
  1510  Computer Equip.     6,00,000                                6,00,000
  1515  Accum. Dep.                   2,40,000              15,000            2,55,000
  2110  A/P                           2,50,000  1,50,000  1,80,000            2,80,000
  2120  Salary Payable                4,20,000    40,000  3,50,000            7,30,000
  3100  Capital                      14,00,000                               14,00,000
  3200  Retained Earnings                    0                                       0
  4110  Sales                                0            5,50,000            5,50,000
  5210  Salary                     0            3,50,000            3,50,000
  5220  Office Rent                0              77,000              77,000
  5230  Electricity                0                   0                   0
  5290  Depreciation               0              15,000              15,000
                            ────────  ────────  ────────  ────────  ────────  ────────
        TOTAL              23,00,000 23,10,000 19,42,000 19,42,000 32,05,000 32,15,000
                             ✗ ১০,০০০ অমিল          ✓ মিলছে          ✗ ১০,০০০ অমিল
```

> লক্ষ করুন opening মিলছে না — ২৩,০০,০০০ বনাম ২৩,১০,০০০। Period নিখুঁত মিলছে, আর closing-এ সেই একই ১০,০০০ পার্থক্য রয়ে গেছে। এটা ইচ্ছাকৃত; পরের অংশে এই অমিলটাই খুঁজব।

### অমিল অনুসন্ধান — বাস্তব দৃশ্য

```text
Opening পার্থক্য = 23,10,000 - 23,00,000 = 10,000 (credit বেশি)
Period  পার্থক্য = 0
Closing পার্থক্য = 32,15,000 - 32,05,000 = 10,000 (credit বেশি)
```

**ধাপ ১ — পার্থক্যের প্রকৃতি**

```text
১০,০০০ — গোল সংখ্যা, ৯ দিয়ে বিভাজ্য নয়, দ্বিগুণ কোনো
পরিচিত সংখ্যা নয়।

→ সম্ভবত একটা line বাদ পড়েছে, অথবা opening ভুল বসেছে।
```

**ধাপ ২ — কোন স্তরে**

```text
Opening মেলেনি, Period মিলছে, Closing-এ একই ১০,০০০।

→ পার্থক্যটা period-এর ভিতরে জন্ম নেয়নি, সে opening থেকে
   ভেসে এসে closing পর্যন্ত চলে গেছে।
→ এই মাসের posting নিরপরাধ। সমস্যা আগের অবস্থায়।
```

এই যুক্তিটা মনে রাখার মতো। **তিনটি জোড়া আলাদা করে মেলানোর আসল লাভ এখানেই** — একটা মাত্র সংখ্যা দেখে বোঝা যায় কোন সময়ে ভুলটা জন্মেছে।

**ধাপ ৩ — Opening কোথা থেকে এল**

Opening এসেছে জুন মাসের closing থেকে। জুনের Trial Balance দেখুন:

```text
জুন মাসের closing:  23,00,000 Dr  |  23,00,000 Cr    ✓ মিলছে
```

জুন মিলছে, জুলাইয়ের opening মিলছে না — **মানে জুন থেকে জুলাইয়ে ব্যালেন্স আনার ধাপে সমস্যা**। জুনের সংখ্যা ঠিক, জুলাইয়ে বসা সংখ্যা ভুল।

**ধাপ ৪ — কোন account-টা**

জুনের closing আর জুলাইয়ের opening — দুটো তালিকা account ধরে ধরে মেলান:

```text
SELECT  j.account_id,
        j.closing_signed  AS june_closing,
        u.opening_signed  AS july_opening
FROM    account_period_balances j
JOIN    account_period_balances u
          ON u.account_id = j.account_id
WHERE   j.period_id = (জুন)
  AND   u.period_id = (জুলাই)
  AND   j.closing_signed <> u.opening_signed;
```

একটাই সারি ফিরল:

```text
account 1515  Accumulated Depreciation
    জুনের closing    2,30,000 Cr
    জুলাইয়ের opening 2,40,000 Cr      ← ১০,০০০ বেশি
```

**ধাপ ৫ — কেন**

`account_period_balances` দেখুন:

```text
SELECT account_id, period_id, is_stale, computed_at
FROM   account_period_balances
WHERE  account_id = 1515;
```

ধরা পড়ল — জুনে 1515-এ একটা reversal হয়েছিল, কিন্তু ওই reversal-টা পরের period-গুলোকে `is_stale` চিহ্নিত করেনি। জুলাইয়ের snapshot তাই reversal-এর আগের সংখ্যা ধরে বসে আছে।

**সমাধান:**

```text
১.  1515 এর জুন snapshot পুনর্নির্মাণ
২.  জুলাই ও তার পরের সব period পুনর্নির্মাণ, ক্রমানুসারে
৩.  Trial Balance আবার চালান

    opening   23,00,000  |  23,00,000   ✓
    period    19,42,000  |  19,42,000   ✓
    closing   32,05,000  |  32,05,000   ✓

৪.  reversal কেন snapshot বাসি করেনি — সেই bug খুঁজে ঠিক করুন
৫.  একটা test লিখুন: "reversal-এর পরে পরের সব period stale হয়"
```

চতুর্থ ও পঞ্চম ধাপটাই সবচেয়ে গুরুত্বপূর্ণ। **সংখ্যা ঠিক করে থেমে যাবেন না — কারণটা ঠিক করুন, আর কারণটা ফিরে আসা ঠেকাতে একটা test রেখে দিন।** নইলে পরের মাসে আবার হবে, আর তখন আপনি আবার এই পাঁচটা ধাপ হাঁটবেন।

### যে ভুল Trial Balance ধরল না

Snapshot ঠিক হলো, Trial Balance এখন নিখুঁত মিলছে। কিন্তু একই মাসে আরেকটা ভুল বসে আছে — আর সেটা Trial Balance কোনোদিনই ধরবে না।

খরচের account গুলো দেখুন:

```text
5210  Salary          3,50,000
5220  Office Rent        77,000     ← ভাড়া হঠাৎ এত বেশি কেন?
5230  Electricity             0     ← বিদ্যুৎ খরচ শূন্য?
5290  Depreciation       15,000
```

উপরের entry তালিকায় ফিরে যান, ২৮ জুলাইয়ের সারিটা দেখুন:

```text
28-07    PV-07-0033     5220 Rent  12,000    1110 Cash  12,000
```

Voucher-টা ছিল বিদ্যুৎ বিলের (অধ্যায় ৯-এর ledger-এ এর narration লেখা আছে "Electricity bill")। কিন্তু account বসেছে 5220 Office Rent-এ।

```text
    যা হওয়া উচিত ছিল          যা হলো
    ─────────────────          ──────
    5220  Office Rent  65,000   5220  Office Rent  77,000
    5230  Electricity  12,000   5230  Electricity       0
```

Trial Balance-এ এর কোনো চিহ্ন নেই — দুই পাশ নিখুঁত। খরচের মোটও ঠিক (৪,৪২,০০০)। শুধু খরচটা ভুল account-এ বসে আছে, আর তাতে লাভও বদলায়নি। **এটাই সেই "১ নম্বর — ভুল account, ঠিক দিক"।**

**কীভাবে ধরা পড়বে?** Trial Balance দিয়ে নয় — অন্য উপায়ে:

```text
    তুলনামূলক report      গত মাসে বিদ্যুৎ ১২,০০০ ছিল, এ মাসে ০ কেন?
    বাজেট তুলনা           ভাড়ার বাজেট ৬৫,০০০, খরচ ৭৭,০০০ কেন?
    ledger পড়া            5220 এর ledger-এ একটা অদ্ভুত narration
    subledger যাচাই        বিদ্যুৎ সরবরাহকারীর হিসাব খালি
    হিসাবরক্ষকের চোখ       "বিদ্যুৎ খরচ শূন্য হয় কীভাবে?"
```

তৃতীয়টা লক্ষ করুন — **narration আর account একে অপরের সাথে মেলে না**। অধ্যায় ৭-এ narration নিয়ে যে জোর দিয়েছিলাম, তার প্রতিদান এখানে: ভালো narration থাকলে ভুল account নিজেই ধরা পড়ে।

> এটাই প্রমাণ করে কেন Trial Balance যথেষ্ট নয়। **তুলনামূলক report (এ মাস বনাম গত মাস) আসলে ভুল ধরার সবচেয়ে কার্যকর যন্ত্র** — Trial Balance-এর চেয়েও। শূন্য হয়ে যাওয়া বা হঠাৎ দ্বিগুণ হওয়া account গুলো সাথে সাথে চোখে পড়ে। পরের অংশে এটাকে একটা স্বয়ংক্রিয় যাচাইয়ে রূপ দেব।

---

## ৫. Implementation — Software ও Database

### Trial Balance query

```text
-- একটি period এর সম্পূর্ণ Trial Balance

WITH opening AS (
    SELECT account_id,
           SUM(debit - credit) AS signed
    FROM   posted_lines
    WHERE  company_id   = :company
      AND  posting_date < :period_start
    GROUP BY account_id
),
movement AS (
    SELECT account_id,
           SUM(debit)  AS period_debit,
           SUM(credit) AS period_credit
    FROM   posted_lines
    WHERE  company_id   = :company
      AND  posting_date >= :period_start
      AND  posting_date <= :period_end
    GROUP BY account_id
)
SELECT a.code, a.name, a.account_type, a.normal_balance,
       COALESCE(o.signed, 0)         AS opening_signed,
       COALESCE(m.period_debit,  0)  AS period_debit,
       COALESCE(m.period_credit, 0)  AS period_credit,
       COALESCE(o.signed, 0)
         + COALESCE(m.period_debit, 0)
         - COALESCE(m.period_credit, 0)  AS closing_signed
FROM       accounts a
LEFT JOIN  opening  o ON o.account_id = a.id
LEFT JOIN  movement m ON m.account_id = a.id
WHERE      a.company_id = :company
  AND      a.is_group   = false
ORDER BY   a.code;
```

তিনটি বিষয় লক্ষ করুন:

**১. `LEFT JOIN` ব্যবহার** — যেসব account-এ কোনো লেনদেন হয়নি সেগুলোও তালিকায় থাকবে (শূন্য সহ)। `INNER JOIN` দিলে তারা হারিয়ে যাবে।

**২. `is_group = false`** — শুধু posting account। Group account যোগ করলে সবকিছু দুবার গোনা হবে।

**৩. `COALESCE`** — NULL থেকে ০ তে রূপান্তর, নইলে যোগফলে NULL ছড়াবে।

### Signed থেকে Dr/Cr column

Query থেকে signed মান আসে; উপস্থাপনায় দুই column করতে হয়:

```text
প্রতিটি সারির জন্য:

    যদি closing_signed > 0:   closing_dr = closing_signed,  closing_cr = 0
    যদি closing_signed < 0:   closing_dr = 0,  closing_cr = -closing_signed
    যদি closing_signed == 0:  দুটোই 0
```

লক্ষ করুন — এখানে normal balance দেখার দরকার নেই। **যেদিকে ব্যালেন্স, সেই column-এ বসবে।** Asset-এ credit balance থাকলে সেটা credit column-এই দেখাবে, আর সেটাই দেখা উচিত (অস্বাভাবিকতা লুকানো ঠিক নয়)।

তবে **সতর্কতা** দেখানোর জন্য normal balance লাগবে:

```text
যদি account.normal_balance == 'debit' এবং closing_signed < 0:
    সতর্কতা: "অস্বাভাবিক credit balance"

যদি account.normal_balance == 'credit' এবং closing_signed > 0:
    সতর্কতা: "অস্বাভাবিক debit balance"
```

### স্বাস্থ্য যাচাই হিসেবে Trial Balance

Trial Balance শুধু report নয় — এটা আপনার system-এর সবচেয়ে গুরুত্বপূর্ণ automated check:

```text
প্রতি রাতে চালান:

    ১.  মোট debit == মোট credit ?
    ২.  প্রতিটি entry আলাদাভাবে balanced ?
    ৩.  কোনো অনাথ line বা header আছে ?
    ৪.  কোনো account এ অস্বাভাবিক ব্যালেন্স ?
    ৫.  snapshot গুলো আসল হিসাবের সাথে মেলে ?

    যেকোনো একটা ব্যর্থ হলে  →  সাথে সাথে alert
```

এটা অধ্যায় ২-এর রাতের যাচাইয়ের পূর্ণ রূপ। **প্রথম তিনটি ব্যর্থ হলে posting বন্ধ করে দেওয়ার কথা ভাবুন** — কারণ ভাঙা খাতায় আরও entry ঢোকানো পরিস্থিতি খারাপ করবে।

### তুলনামূলক যাচাই — একটি সরল anomaly detector

উপরের বিদ্যুৎ-বিলের ভুলটা Trial Balance ধরেনি, কিন্তু একটা তুলনামূলক report ধরে ফেলত। সেটা মানুষের চোখের উপর ছেড়ে না দিয়ে **স্বয়ংক্রিয় করে ফেলুন** — খরচটা প্রায় শূন্য, আর ফলটা অসাধারণ।

মূল ধারণা: প্রতিটি account-এর এই period-এর নড়াচড়া আগের কয়েক period-এর সাথে মেলান।

```text
detectAnomalies(company, period):

    এই period এর প্রতিটি account এর জন্য:

        current  = এই period এর নিট নড়াচড়া
        history  = আগের ৩ period এর নড়াচড়া
        avg      = history এর গড়

        ১.  ছিল, এখন নেই
            যদি avg > 0 এবং current == 0:
                সতর্কতা: "গত ৩ মাসে গড়ে {avg}, এ মাসে শূন্য"

        ২.  ছিল না, হঠাৎ আছে
            যদি avg == 0 এবং current > 0:
                তথ্য: "প্রথমবার ব্যবহৃত হলো"

        ৩.  হঠাৎ অনেক বেশি
            যদি avg > 0 এবং current > avg * 2:
                সতর্কতা: "গড়ের {current/avg} গুণ"

        ৪.  অস্বাভাবিক দিক
            যদি closing এর দিক normal_balance এর উল্টো:
                সতর্কতা: "অস্বাভাবিক ব্যালেন্স"
```

জুলাই মাসে চালালে যা বেরোত:

```text
  5230  Electricity     ⚠  গত ৩ মাসে গড়ে ১১,৫০০, এ মাসে ০
```

একটাই সতর্কতা, আর সেটাই যথেষ্ট — হিসাবরক্ষক এটা দেখেই বুঝে যাবেন কোথায় তাকাতে হবে।

লক্ষ করুন 5220 Office Rent **ধরা পড়েনি**: ৬৫,০০০ থেকে ৭৭,০০০ মানে গড়ের ১.১৮ গুণ, দ্বিগুণের অনেক নিচে। এটা এই যন্ত্রের সীমা, আর এটা মেনে নেওয়াই ভালো — সীমা কমিয়ে ১.১ করলে প্রতি মাসে চল্লিশটা সতর্কতা আসবে, আর তখন কেউ আর কোনোটাই পড়বে না। **একটা পড়া-হয় সতর্কতা চল্লিশটা উপেক্ষিত সতর্কতার চেয়ে ভালো।**

তিনটি ব্যবহারিক পরামর্শ:

```text
১.  সীমাগুলো ছোট অঙ্কে চালাবেন না
    ৫০০ টাকার account ১,০০০ হলে "দ্বিগুণ" — কিন্তু অর্থহীন।
    একটা ন্যূনতম অঙ্ক রাখুন (যেমন ১০,০০০)।

২.  মৌসুমি account বাদ দিন
    বোনাস, উৎসব ভাতা, বার্ষিক বীমা — এগুলো বছরে একবার।
    account-এ একটা `expect_irregular` পতাকা রাখুন।

৩.  সতর্কতা কাউকে আটকাবে না
    এটা report, gate নয়। posting বন্ধ করার প্রশ্নই নেই।
```

> **কেন এটা এত কার্যকর:** Trial Balance যাচাই করে *যোগফল*, আর এই যাচাইটা দেখে *আচরণ*। একটা account গত এক বছর যেভাবে ব্যবহৃত হয়েছে, এ মাসে হঠাৎ অন্যভাবে ব্যবহৃত হলে প্রায় নিশ্চিতভাবেই কিছু একটা ঘটেছে — হয় ব্যবসায় নতুন কিছু, নয় একটা ভুল। দুটোই জানার মতো খবর।

এটাকে রাতের স্বাস্থ্য-যাচাইয়ের সাথে না মিশিয়ে **মাস শেষে একবার** চালানোই যথেষ্ট — period বন্ধ করার ঠিক আগে, একটা checklist হিসেবে।

### Test হিসেবে

```text
test "যেকোনো কাজের পরে Trial Balance মেলে":

    সব business operation চালান
    (invoice, payment, payroll, depreciation, reversal)

    tb = trialBalance(company, period)

    assert  tb.total_opening_dr  == tb.total_opening_cr
    assert  tb.total_period_dr   == tb.total_period_cr
    assert  tb.total_closing_dr  == tb.total_closing_cr
```

এই test প্রতিটি module-এর test suite-এ থাকা উচিত। কোনো module যদি Trial Balance ভাঙে, সে module-এর posting logic ভুল — আর সেটা সাথে সাথে ধরা পড়বে।

কিন্তু মনে রাখবেন — উপরে যে ছয়টি ভুলের কথা বলেছি, এই test সেগুলো ধরবে না। তাই **প্রতিটি module-এ account-ভিত্তিক প্রত্যাশাও যাচাই করুন**:

```text
test "invoice তৈরির পরে সঠিক account গুলো বদলায়":

    before = balances()
    createInvoice(customer, 100000, vat = 15000)
    after  = balances()

    assert  after['1130'] - before['1130'] == 115000   -- A/R বাড়ল
    assert  after['4110'] - before['4110'] == -100000  -- Revenue (credit)
    assert  after['2140'] - before['2140'] == -15000   -- VAT payable
```

এই দ্বিতীয় ধরনের test-ই "ভুল account" আর "উল্টো দিক" ধরে ফেলে। বিস্তারিত অধ্যায় ৫১-এ।

---

## ৬. Financial Statement Impact

Trial Balance হলো ledger আর financial statement-এর মাঝের সেতু:

```text
        journal_lines
              ▼
           LEDGER
              ▼
      TRIAL BALANCE  (unadjusted)
              ▼  + adjusting entries
      TRIAL BALANCE  (adjusted)
              │
      ┌───────┴────────┐
      ▼                ▼
  Revenue,         Asset,
  Expense          Liability, Equity
      ▼                ▼
   INCOME          BALANCE
  STATEMENT         SHEET
```

**Statement তৈরির যুক্তি** — অধ্যায় ৩-এর প্রকার অনুযায়ী ভাগ:

```text
প্রতিটি account এর closing_signed নিন:

    account_type IN ('REVENUE', 'EXPENSE')
            →  Income Statement
            →  নিট = Revenue - Expense = লাভ

    account_type IN ('ASSET', 'LIABILITY', 'EQUITY')
            →  Balance Sheet

    লাভটা Equity তে যোগ হবে
            →  তখন Balance Sheet মিলবে
```

শেষ ধাপটা গুরুত্বপূর্ণ। Trial Balance-এ Revenue ও Expense আলাদা থাকে; Balance Sheet-এ তারা থাকে না — তাদের **নিট ফলাফল** Equity-তে থাকে। এই রূপান্তরটা না করলে Balance Sheet মিলবে না।

যাচাই:

```text
Balance Sheet মিলছে?
    Assets  ==  Liabilities + Equity + লাভ    ✓
```

এটাই অধ্যায় ২-এর সমীকরণ, শুধু লাভটা আলাদা করে দেখানো।

---

## ৭. Common Developer Mistakes

| ভুল | কী ঘটে | সঠিক পথ |
| --- | --- | --- |
| Trial Balance মিলে গেলে নিশ্চিন্ত হওয়া | ছয় ধরনের ভুল অধরা থেকে যায় | account-ভিত্তিক test-ও লিখুন |
| Group account যোগ করা | সব দুবার গোনা হয় | `is_group = false` |
| `INNER JOIN` দিয়ে account আনা | শূন্য ব্যালেন্সের account হারায় | `LEFT JOIN` |
| `COALESCE` না দেওয়া | NULL যোগফলে ছড়ায় | সব যোগফলে `COALESCE` |
| অস্বাভাবিক ব্যালেন্স লুকানো | ভুল ধরা পড়ে না | সতর্কতাসহ দেখান |
| Unadjusted থেকে statement | অবচয়, বকেয়া বাদ পড়ে | adjusted থেকে |
| লাভ Equity-তে না নেওয়া | Balance Sheet মেলে না | নিট লাভ Equity-তে |
| অমিল পেলে সংখ্যা ঠিক করে থামা | পরের মাসে আবার হবে | কারণ খুঁজে ঠিক করুন |
| রাতের যাচাই না রাখা | ভাঙা খাতা মাসের পর মাস চলে | স্বয়ংক্রিয় alert |
| `status='posted'` ভুলে যাওয়া | draft entry Trial Balance-এ | `posted_lines` view |

প্রথম সারিটা এই অধ্যায়ের মূল বার্তা, তাই আবার বলি: **Trial Balance মেলা মানে গণিত ঠিক, হিসাব ঠিক নয়।** এই একটা ভুল ধারণার কারণে বহু accounting software মাসের পর মাস ভুল report দিয়েছে — আর সবাই নিশ্চিন্ত ছিল, কারণ "Trial Balance তো মিলছে"।

---

## ৮. Exercises

**সেট ক — Trial Balance তৈরি**

নিচের closing balance গুলো থেকে একটি Trial Balance বানান (Dr ও Cr column আলাদা করে), এবং যোগফল মিলিয়ে দেখুন:

```text
১।   Cash                   2,53,000 Dr
     Bank                  11,10,000 Dr
     Accounts Receivable    3,20,000 Dr
     Inventory              4,80,000 Dr
     Computer Equipment     6,00,000 Dr
     Accum. Depreciation    2,45,000 Cr
     Accounts Payable       2,80,000 Cr
     Salary Payable         7,30,000 Cr
     Capital               14,00,000 Cr
     Sales                  5,50,000 Cr
     Salary Expense         3,50,000 Dr
     Office Rent               77,000 Dr
     Electricity                    0
     Depreciation              15,000 Dr

     (ক)  মোট Debit = ?   মোট Credit = ?   মিলছে?
     (খ)  মিলে গেলেও কি হিসাব সঠিক? তালিকাটা আরেকবার
          পড়ুন — কোন সারিটা সন্দেহজনক, আর কেন?
     (গ)  আপনার সন্দেহ সত্যি কিনা যাচাই করতে কোন
          report বা query চালাবেন?

২।   একই তালিকা, কিন্তু Accum. Depreciation ২,৫৫,০০০ Cr
     ধরুন। এখন মোট কত, পার্থক্য কত, আর কোথায় খুঁজবেন?
```

**সেট খ — ভুল চিনুন**

প্রতিটির জন্য বলুন: Trial Balance মিলবে কি না, এবং হিসাব সঠিক কি না:

```text
৩।   ৫০,০০০ টাকার বিক্রি লেখা হয়নি।
৪।   ৫০,০০০ টাকার বিক্রিতে Cash Dr আর Sales Dr লেখা হয়েছে।
৫।   ৫০,০০০ এর জায়গায় Cash Dr ৫০,০০০ আর Sales Cr ৫,০০০।
৬।   বিদ্যুৎ বিল ভুল করে ভাড়ার account-এ গেছে।
৭।   একই invoice দুবার post হয়েছে।
৮।   Cash Dr ৫০,০০০, Sales Cr ৫০,০০০ — কিন্তু আসল অঙ্ক ছিল ৫,০০০।
৯।   একটা account-এ ৮,০০০ বেশি debit, অন্যটায় ৮,০০০ বেশি credit।
১০।  একটা entry-র শুধু debit line লেখা হয়েছে, credit line হারিয়ে গেছে।
১১।  একটা entry-র posting_date ভুল করে ২০৫২ সাল হয়ে গেছে।
```

শেষটার জন্য বাড়তি প্রশ্ন: জুলাই ২০২৫-এর Trial Balance মিলবে কি? আর ২০৫২ সালের? (ইঙ্গিত: অধ্যায় ৮)

**সেট গ — অনুসন্ধান**

```text
১২।  Trial Balance-এ পার্থক্য ৯০০ টাকা। প্রথমে কী সন্দেহ করবেন,
     আর কীভাবে যাচাই করবেন?

১৩।  পার্থক্য ১,২০,০০০ টাকা, আর আপনি জানেন একটা ৬০,০০০ টাকার
     লেনদেন হয়েছে। কী সন্দেহ করবেন?

১৪।  পার্থক্য ০.০৩ টাকা। কারণ কী হতে পারে?

১৫।  Opening মিলছে না কিন্তু Period মিলছে। কোথায় খুঁজবেন?
     ধাপে ধাপে লিখুন।

১৬।  Opening মিলছে, Period মিলছে না। এবার কোথায় খুঁজবেন?
     আগেরটার সাথে পার্থক্য কী?

১৭।  Trial Balance নিখুঁত মিলছে, কিন্তু হিসাবরক্ষক বলছেন
     "বিদ্যুৎ খরচ শূন্য দেখাচ্ছে, এটা অসম্ভব।"
     কীভাবে অনুসন্ধান করবেন?
```

**সেট ঘ — নকশা**

```text
১৮।  একটি রাতের স্বাস্থ্য-যাচাই কাজ নকশা করুন। কী কী যাচাই
     করবেন, কোন ক্রমে, আর কোনটা ব্যর্থ হলে কতটা গুরুতর?

১৯।  Trial Balance ভেঙে গেছে ধরা পড়ল। আপনার system কি নতুন
     posting বন্ধ করে দেবে? পক্ষে ও বিপক্ষে যুক্তি লিখুন,
     তারপর সিদ্ধান্ত নিন।

২০।  ৫০০টি account ও ৫ বছরের data। Trial Balance query
     চালাতে ৩০ সেকেন্ড লাগছে। কী কী করবেন?

২১।  anomaly detector-এর চারটি নিয়মে (ছিল-এখন-নেই, ছিল-না-হঠাৎ-আছে,
     হঠাৎ বেশি, অস্বাভাবিক দিক) কোনটিতে সবচেয়ে বেশি মিথ্যা
     সতর্কতা আসবে বলে মনে করেন? কীভাবে কমাবেন?
```

উত্তর আছে Workbook-এর Answer Key, অধ্যায় ১০-এ।

---

## ৯. Developer Challenge

> একটি **TrialBalanceService** ও তার সঙ্গী **HealthCheckService** নকশা করুন।
>
> যা যা নকশা করবেন:
>
> ১. `getTrialBalance(company, periodId)` এর সম্পূর্ণ যুক্তি — ছয় column সহ। Snapshot থাকলে কীভাবে ব্যবহার করবেন?
> ২. অস্বাভাবিক ব্যালেন্স চিহ্নিত করার যুক্তি। কোন কোন ক্ষেত্রে এটা আসলে স্বাভাবিক হতে পারে? (ইঙ্গিত: bank overdraft)
> ৩. একটি `diagnoseImbalance()` ফাংশন নকশা করুন যা অমিল পেলে সম্ভাব্য কারণ অনুসন্ধান করে একটা প্রতিবেদন দেয়। অন্তত পাঁচটি যাচাই রাখুন, আর পার্থক্যের অঙ্ক থেকে সূত্র বের করার যুক্তি রাখুন।
> ৪. রাতের স্বাস্থ্য-যাচাই কাজটি নকশা করুন — কী কী যাচাই, কোন ক্রমে, ব্যর্থতার গুরুত্ব অনুযায়ী কী পদক্ষেপ।
> ৫. Trial Balance থেকে P&L ও Balance Sheet তৈরির যুক্তি লিখুন। নিট লাভ কীভাবে Equity-তে যাবে? Balance Sheet মেলার যাচাই কোথায় বসাবেন?
> ৬. এমন একটা test suite নকশা করুন যা উপরের ছয় ধরনের "Trial Balance যা ধরে না" ভুলগুলো ধরতে পারে। প্রতিটির জন্য একটি করে test.
>
> ৭. একটি `detectAnomalies(company, period)` নকশা করুন। কোন কোন নিয়ম রাখবেন, সীমাগুলো কত, আর মিথ্যা সতর্কতা কমাতে কী কৌশল নেবেন? মৌসুমি account গুলো কীভাবে চিনবেন — হাতে চিহ্নিত, নাকি ইতিহাস দেখে?
>
> ৬ নম্বরটাই আসল চ্যালেঞ্জ। Trial Balance যা ধরতে পারে না, সেটা ধরার জন্য কী ধরনের test লাগে — এই প্রশ্নের উত্তরই আপনাকে একজন সাধারণ developer থেকে accounting-সচেতন developer বানাবে।

---

## ১০. Summary Card

**Trial Balance কী**

```text
সব account এর closing balance, Dr ও Cr আলাদা column এ
```

**ছয় column**

```text
        OPENING          PERIOD           CLOSING
       Dr     Cr        Dr     Cr        Dr     Cr

তিনটি জোড়াই আলাদাভাবে মিলতে হবে
```

**অমিল হলে কোথায় সমস্যা**

```text
Opening মেলেনি   →  আগের period / migration
Period মেলেনি    →  এই period এর posting
Closing মেলেনি   →  উপরের দুটোর একটা
```

**পার্থক্যের অঙ্ক থেকে সূত্র**

| পার্থক্য | সম্ভাব্য কারণ |
| --- | --- |
| ৯ দিয়ে বিভাজ্য | অঙ্ক উল্টে গেছে |
| দ্বিগুণ কোনো সংখ্যা | line ভুল পাশে |
| গোল সংখ্যা | পুরো line বাদ |
| খুব ছোট (পয়সা) | FLOAT ব্যবহার |

**যা ধরে না — ছয়টি**

```text
১.  ভুল account, ঠিক দিক
২.  debit/credit উল্টে যাওয়া
৩.  পুরো entry বাদ
৪.  পুরো entry দুবার
৫.  দুই পাশেই সমান ভুল
৬.  পরস্পর ক্ষতিপূরণকারী ভুল
```

```text
Trial Balance মেলা  =  গণিত ঠিক
Trial Balance মেলা  ≠  হিসাব ঠিক
```

**Statement এ রূপান্তর**

```text
Revenue, Expense          →  Income Statement  →  লাভ
Asset, Liability, Equity  →  Balance Sheet
লাভ                       →  Equity তে যোগ
```

**Developer checklist**

```text
□  is_group = false, শুধু posting account
□  LEFT JOIN, নইলে শূন্য account হারায়
□  সব যোগফলে COALESCE
□  posted_lines view দিয়ে
□  তিনটি জোড়াই আলাদা যাচাই
□  অস্বাভাবিক ব্যালেন্সে সতর্কতা
□  adjusted TB থেকে statement
□  প্রতি রাতে স্বাস্থ্য যাচাই + alert
□  প্রতি module এ TB test
□  সাথে account-ভিত্তিক test — TB যা ধরে না তার জন্য
□  অমিলে কারণ ঠিক করুন, শুধু সংখ্যা নয়
□  কারণ ঠিক করার পরে একটা test রেখে দিন
□  মাস শেষে তুলনামূলক anomaly যাচাই
□  anomaly যাচাইয়ে ন্যূনতম অঙ্কের সীমা
```

---

## পরবর্তী অধ্যায়

**Part 1 সম্পূর্ণ।** Accounting কী থেকে শুরু করে Trial Balance পর্যন্ত পুরো ভিত্তি এখন দাঁড়িয়ে গেছে — আপনি একটা লেনদেন চিনতে পারেন, তার debit/credit বের করতে পারেন, account structure নকশা করতে পারেন, entry লিখতে ও নিরাপদে post করতে পারেন, আর ledger ও Trial Balance তৈরি করতে পারেন।

**Part 2 — Core Business Accounting** শুরু হবে অধ্যায় ১১ (Cash ও Bank) দিয়ে। সেখান থেকে বাস্তব ব্যবসার প্রবাহ — বিক্রয়, পাওনা, ক্রয়, দেনা, accrual — একে একে আসবে। প্রতিটি ক্ষেত্রেই ভিত্তি এই Part 1-ই থাকবে; শুধু প্রয়োগ বদলাবে।
