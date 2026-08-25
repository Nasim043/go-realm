# অধ্যায় ৯ — General Ledger

> **Volume 1 · Part 1 — Accounting Fundamentals · Chapter 9**
>
> পূর্বশর্ত: অধ্যায় ৭ (Journal Entry), অধ্যায় ৮ (Posting ও Validation)

---

## ১. Learning Objective

এই অধ্যায় শেষে আপনি পারবেন:

```text
Journal আর Ledger-এর পার্থক্য স্পষ্ট করে বলতে
একটি account-এর ledger নিজে তৈরি করতে
Opening balance ও brought/carried forward সামলাতে
Normal balance অনুযায়ী running balance হিসাব করতে
Ledger সংরক্ষণ বনাম প্রতিবার হিসাব — সিদ্ধান্ত নিতে
Balance snapshot নকশা করে দ্রুত report বানাতে
বড় data-তে ledger query দ্রুত রাখতে
Control account ও subledger-এর সম্পর্ক ব্যাখ্যা করতে
```

**সময়:** পড়া ৫৫ মিনিট + অনুশীলন ৫০ মিনিট।

---

## ২. Concept Explanation

### একই তথ্য, দুই দৃষ্টিকোণ

Journal আর Ledger আলাদা কোনো তথ্য নয় — **একই journal lines, দুইভাবে সাজানো**:

```text
    JOURNAL — তারিখের ক্রমে          LEDGER — account অনুযায়ী
    ─────────────────────           ────────────────────────

    ৫ জুলাই                          Cash account
      Rent      Dr 25,000              ৫ জুলাই   Rent      Cr 25,000
      Cash         Cr 25,000           ৮ জুলাই   Sales     Dr 50,000
                                       ১২ জুলাই  Salary    Cr 40,000
    ৮ জুলাই
      Cash      Dr 50,000            Sales account
      Sales        Cr 50,000           ৮ জুলাই   Cash      Cr 50,000

    ১২ জুলাই                         Rent account
      Salary    Dr 40,000              ৫ জুলাই   Cash      Dr 25,000
      Cash         Cr 40,000
                                     Salary account
                                       ১২ জুলাই  Cash      Dr 40,000
```

দুটো প্রশ্নের উত্তর দেয়:

| | প্রশ্ন |
| --- | --- |
| **Journal** | "৫ জুলাই কী কী হলো?" |
| **Ledger** | "Cash account-এ এ পর্যন্ত কী কী হলো?" |

> **গুরুত্বপূর্ণ কথা: Ledger নতুন কোনো তথ্য নয়।** প্রতিটি ledger line কোনো না কোনো journal line-ই। শুধু সাজানোর ক্রম আলাদা। এই কথাটা মনে রাখলে পরের অংশের সিদ্ধান্তগুলো সহজ হবে।

### একটি Ledger-এর গঠন

একটি account-এর ledger দেখতে এমন:

```text
                    LEDGER — 1110 Cash in Hand
                    জুলাই ২০২৫

  DATE      VOUCHER          NARRATION            DEBIT     CREDIT    BALANCE
  ────      ───────          ─────────            ─────     ──────    ───────
                             Opening Balance                        2,00,000 Dr
  05-07     PV-07-0012       Office rent                    25,000  1,75,000 Dr
  08-07     RV-07-0021       Sales collection    50,000             2,25,000 Dr
  12-07     PV-07-0025       Salary payment                40,000  1,85,000 Dr
  20-07     RV-07-0030       Customer ABC        80,000             2,65,000 Dr
  28-07     PV-07-0033       Electricity bill              12,000  2,53,000 Dr
                             ─────────────────  ────────  ────────
                             Period Total       1,30,000    77,000
                             Closing Balance                        2,53,000 Dr
```

ছয়টি অংশ:

```text
DATE        posting_date
VOUCHER     কোন entry থেকে এসেছে
NARRATION   কী কারণে
DEBIT       এই line-এর debit
CREDIT      এই line-এর credit
BALANCE     এ পর্যন্ত জমা ব্যালেন্স (running balance)
```

### Running Balance — Normal Balance-এর ভূমিকা

Running balance হিসাব করার নিয়ম account-এর **normal balance**-এর উপর নির্ভর করে (অধ্যায় ৪)।

**Debit-normal account** (Asset, Expense):

```text
নতুন ব্যালেন্স  =  আগের ব্যালেন্স  +  debit  -  credit
```

**Credit-normal account** (Liability, Equity, Revenue):

```text
নতুন ব্যালেন্স  =  আগের ব্যালেন্স  +  credit  -  debit
```

দুটো উদাহরণ পাশাপাশি:

```text
    Cash (Asset — Debit normal)       Accounts Payable (Liability — Credit normal)
    ───────────────────────────       ──────────────────────────────────────────
    Opening        2,00,000 Dr        Opening              80,000 Cr
    + Dr 50,000    2,50,000 Dr        + Cr 30,000        1,10,000 Cr
    - Cr 25,000    2,25,000 Dr        - Dr 50,000          60,000 Cr
```

লক্ষ করুন — দুটোতেই ব্যালেন্স **ধনাত্মক** দেখাচ্ছে, শুধু দিকটা আলাদা (Dr বনাম Cr)। এটাই সঠিক উপস্থাপনা।

### একটি নকশার সিদ্ধান্ত: signed নাকি দিক-সহ?

Balance রাখার দুটি পদ্ধতি:

```text
    পদ্ধতি ক — signed number              পদ্ধতি খ — মান + দিক
    ──────────────────────                ──────────────────
    balance = debit - credit              balance = 2,53,000
                                          side    = 'Dr'
    Cash:      +2,53,000
    Payable:     -60,000
```

**সুপারিশ: ভিতরে signed রাখুন (`debit - credit`), দেখানোর সময় দিক-সহ রূপান্তর করুন।**

কারণ signed সংখ্যায় যোগ করা সহজ ও নির্ভুল — group account-এর যোগফল বের করতে (অধ্যায় ৬) কোনো শর্ত লাগে না। শুধু ব্যবহারকারীকে দেখানোর সময় normal balance দেখে ঠিক করুন কোন দিক দেখাবেন:

```text
displayBalance(account, signed):

    যদি account.normal_balance == 'debit':
        যদি signed >= 0:  return (signed, 'Dr')
        অন্যথায়:          return (-signed, 'Cr')    ← অস্বাভাবিক!
    অন্যথায়:
        যদি signed <= 0:  return (-signed, 'Cr')
        অন্যথায়:          return (signed, 'Dr')     ← অস্বাভাবিক!
```

> "অস্বাভাবিক" চিহ্নিত লাইন দুটো গুরুত্বপূর্ণ। Cash account-এ credit balance মানে হিসাবমতে ঋণাত্মক নগদ — বাস্তবে অসম্ভব (অধ্যায় ৪)। এমন হলে report-এ **সতর্কতা দেখান**। এটা একটা চমৎকার bug-ধরা যন্ত্র।

### Opening Balance

একটা ledger শূন্য থেকে শুরু হয় না। মাসের শুরুতে আগের সব লেনদেনের ফলাফল নিয়ে সে শুরু করে — এটাই **opening balance**।

```text
    জুন মাসের closing         =    জুলাই মাসের opening
    ─────────────────              ──────────────────
       2,00,000 Dr        ────▶       2,00,000 Dr

    (carried forward, c/f)          (brought forward, b/f)
```

দুটি প্রেক্ষাপটে opening balance আসে:

**১. সময়কালভিত্তিক opening** — জুলাইয়ের ledger দেখলে জুন পর্যন্ত সব লেনদেনের যোগফল:

```text
opening(account, 2025-07-01)
    =  SUM(debit - credit)  যেখানে posting_date < 2025-07-01
```

এটা হিসাব করা তথ্য, সংরক্ষিত নয়।

**২. System শুরুর opening** — নতুন system চালু করার সময় পুরনো system থেকে ব্যালেন্স আনা:

```text
    পুরনো system-এ ছিল:
        Cash            5,00,000 Dr
        Bank           12,00,000 Dr
        Accounts Payable 3,00,000 Cr
        Capital        14,00,000 Cr

    নতুন system-এ একটি opening journal entry:
        1110  Cash                 Dr   5,00,000
        1120  Bank                 Dr  12,00,000
        2110  Accounts Payable         Cr   3,00,000
        3100  Capital                  Cr  14,00,000
```

লক্ষ করুন — এটাও একটা সাধারণ journal entry, বিশেষ কিছু নয়। `voucher_type = 'OB'`, `posting_date` = অর্থবছরের প্রথম দিন।

দুই পাশ না মিললে (পুরনো system থেকে অসম্পূর্ণ তথ্য এলে) পার্থক্যটা একটা `Opening Balance Equity` account-এ রাখা হয় — সেটাই অধ্যায় ৫-এ উল্লেখ করা system account গুলোর একটি। বিস্তারিত অধ্যায় ৬২-এ।

### Control Account ও Subledger

একটা প্রশ্ন এখানে না তুললে পরের অধ্যায়গুলো অস্পষ্ট থেকে যাবে: **আপনার ৪০০ জন গ্রাহকের প্রত্যেকের জন্য কি আলাদা account বানাবেন?**

উত্তর — না। COA-তে থাকবে একটাই:

```text
    1130  Accounts Receivable
```

কিন্তু তাহলে "করিম ট্রেডার্স আমাকে কত টাকা দেবে?" — এই প্রশ্নের উত্তর কোথায়? উত্তর **subledger**-এ:

```text
    GENERAL LEDGER                    SUBLEDGER
    ──────────────                    ─────────
    1130  Accounts Receivable         করিম ট্রেডার্স      3,00,000 Dr
          মোট  12,00,000 Dr           ABC Ltd            5,00,000 Dr
                                      রহিম এন্টারপ্রাইজ   2,50,000 Dr
                                      XYZ Corp           1,50,000 Dr
                                      ─────────────────────────────
                                      মোট               12,00,000 Dr
```

GL-এর ওই account-টাকে বলা হয় **control account** — সে নিয়ন্ত্রণ করে, বিস্তারিত রাখে না। আর নিয়মটা একটাই, কিন্তু কঠোর:

```text
    control account এর ব্যালেন্স  ==  তার subledger এর সব ব্যালেন্সের যোগফল

    সবসময়। ব্যতিক্রম নেই।
```

কোন account গুলো সাধারণত control account হয়:

| Control Account | Subledger-এর মাত্রা |
| --- | --- |
| Accounts Receivable | গ্রাহক |
| Accounts Payable | সরবরাহকারী |
| Inventory | পণ্য/গুদাম |
| Fixed Assets | সম্পদ |
| Salary Payable | কর্মী |
| Bank | প্রতিটি ব্যাংক হিসাব |

**কেন গ্রাহকপ্রতি account নয়?** কয়েকটা কারণ, প্রতিটিই বাস্তব:

```text
৪০০ গ্রাহক  →  ৪০০টি account
        ↓
COA পড়া অসম্ভব হয়ে যায়
Trial Balance ৪০০ সারি লম্বা হয়
Balance Sheet এ ৪০০ লাইন?
নতুন গ্রাহক মানে COA বদলানো — একটা কাঠামোগত পরিবর্তন
গ্রাহকের নাম বদলালে account এর নাম বদলাতে হয়
```

সঠিক নকশাটা তাই দুই স্তরের:

```text
    COA        →  ব্যবসার কাঠামো      (স্থিতিশীল, ছোট, নকশা করা)
    Subledger  →  ব্যবসার অংশীদার     (পরিবর্তনশীল, বড়, তৈরি হতে থাকে)
```

Journal line-এ এটা দেখতে এমন:

```text
journal_lines

account_id       1130          ← GL এ যাবে
party_type       'customer'    ← subledger এর মাত্রা
party_id         57            ← কোন গ্রাহক
```

`cost_center_id` আর `project_id`-র মতোই (অধ্যায় ৭-এর schema) — একই line, একাধিক দৃষ্টিকোণ। GL report `account_id` দিয়ে যোগ করে; subledger report `account_id + party_id` দিয়ে।

> **এখান থেকে একটা রাতের যাচাই বেরিয়ে আসে**, আর এটা প্রায় বিনা খরচে বহু bug ধরে:
>
> ```text
> প্রতিটি control account এর জন্য:
>     GL balance  ==  SUM(subledger balances) ?
>     অমিল পেলে alert
> ```
>
> অমিল হওয়ার সবচেয়ে সাধারণ কারণ — কোনো একটা entry-তে `party_id` বসাতে ভুলে যাওয়া। টাকাটা GL-এ আছে, কিন্তু কারো নামে নেই।

Subledger-এর পূর্ণ স্থাপত্য — আলাদা table নাকি একই journal_lines, reconciliation, aging report — অধ্যায় ৩৬-এর বিষয়। এখানে শুধু ধারণাটা গেঁথে নিন, কারণ Part 2-এর প্রায় প্রতিটি অধ্যায়ে (গ্রাহক, সরবরাহকারী, ব্যাংক) এই দুই স্তরের কাঠামোটাই ফিরে আসবে।

### Ledger কি সংরক্ষণ করবেন?

এবার এই অধ্যায়ের কেন্দ্রীয় প্রকৌশল-সিদ্ধান্ত। তিনটি পথ আছে:

**পথ ১ — প্রতিবার journal lines থেকে হিসাব**

```text
SELECT ... FROM posted_lines WHERE account_id = ? ORDER BY posting_date
```

| সুবিধা | অসুবিধা |
| --- | --- |
| সবসময় সঠিক | data বাড়লে ধীর |
| আলাদা কিছু রক্ষণাবেক্ষণ নেই | প্রতিটি report-এ পুরো ইতিহাস পড়তে হয় |
| কখনো অসামঞ্জস্য নয় | ৫ বছরের data-তে অসহনীয় |

**পথ ২ — আলাদা ledger table রাখা**

Posting-এর সময় journal lines-এর পাশাপাশি একটা `general_ledger` table-এও লিখুন, running balance সহ।

| সুবিধা | অসুবিধা |
| --- | --- |
| পড়া দ্রুত | দুই জায়গায় একই তথ্য |
| running balance তৈরি আছে | অসামঞ্জস্য হতে পারে |
| | পিছনের তারিখে entry এলে সব হালনাগাদ |

শেষ অসুবিধাটা মারাত্মক। ১০ জুলাইয়ের একটা entry ২০ জুলাইয়ে ঢুকলে তার পরের সব running balance নতুন করে হিসাব করতে হবে।

**পথ ৩ — Snapshot (সুপারিশ)**

মূল তথ্য journal lines-এই থাকবে, কিন্তু **প্রতি period-এর শেষে প্রতিটি account-এর ব্যালেন্স জমা রাখুন**:

```text
account_period_balances

company_id
account_id
period_id
opening_debit    opening_credit
period_debit     period_credit
closing_debit    closing_credit
```

তখন যেকোনো ledger query হয়ে যায়:

```text
    snapshot থেকে opening নিন           ← একটি সারি
              +
    শুধু এই period-এর lines পড়ুন         ← কয়েকশো সারি
```

পুরো ইতিহাস পড়তে হয় না। আর snapshot ভুল হলেও **মূল তথ্য অক্ষত** — যেকোনো সময় journal lines থেকে নতুন করে বানানো যায়।

### তিনটি পথের তুলনা

| | পথ ১: হিসাব | পথ ২: ledger table | পথ ৩: snapshot |
| --- | --- | --- | --- |
| সঠিকতা | নিখুঁত | ঝুঁকিপূর্ণ | নিখুঁত (পুনর্নির্মাণযোগ্য) |
| গতি | ধীর | দ্রুত | দ্রুত |
| রক্ষণাবেক্ষণ | নেই | ভারী | হালকা |
| পিছনের তারিখে entry | সমস্যা নেই | সব হালনাগাদ | ওই period পুনর্গণনা |
| কখন | ছোট system | এড়িয়ে চলুন | বেশিরভাগ ক্ষেত্রে |

> **সুপারিশ: পথ ১ দিয়ে শুরু করুন, ধীর হলে পথ ৩-এ যান।** পথ ২ প্রলুব্ধ করে কিন্তু দীর্ঘমেয়াদে ভোগায় — কারণ দুটো সত্যের উৎস তৈরি হয়, আর একদিন তারা আলাদা হয়ে যায়।

এটা অধ্যায় ২ ও ৬-এর সেই একই নীতি: **derived তথ্য জমা রাখা যায়, কিন্তু সেটা কখনো মূল সত্যের বিকল্প নয়।**

---

## ৩. Accounting Rule

**Journal বনাম Ledger**

```text
Journal  =  তারিখের ক্রমে, লেনদেনভিত্তিক
Ledger   =  account অনুযায়ী, একই তথ্যের পুনর্বিন্যাস
```

**Running Balance**

```text
Debit-normal (Asset, Expense):
    নতুন = আগের + debit - credit

Credit-normal (Liability, Equity, Revenue):
    নতুন = আগের + credit - debit
```

**Opening ও Closing**

```text
আগের period-এর closing  =  এই period-এর opening

closing  =  opening + period_debit - period_credit    (debit-normal)
closing  =  opening + period_credit - period_debit    (credit-normal)
```

**সংরক্ষণের নীতি**

```text
সত্যের একমাত্র উৎস  =  journal_lines
snapshot  =  গতির জন্য, যেকোনো সময় পুনর্নির্মাণযোগ্য
```

**Control Account**

```text
control account এর ব্যালেন্স  ==  তার subledger এর যোগফল

COA        →  ব্যবসার কাঠামো   (স্থিতিশীল)
Subledger  →  ব্যবসার অংশীদার  (পরিবর্তনশীল)

গ্রাহকপ্রতি আলাদা GL account নয়
```

---

## ৪. Real Business Example

### একটি সম্পূর্ণ ledger তৈরি

জুলাই মাসের posted entry গুলো:

```text
তারিখ    Voucher        Debit                   Credit
─────    ───────        ─────                   ──────
05-07    PV-07-0012     5220 Office Rent 25,000    1110 Cash 25,000
08-07    RV-07-0021     1110 Cash 50,000           4110 Sales 50,000
12-07    PV-07-0025     2120 Salary Pay 40,000     1110 Cash 40,000
20-07    RV-07-0030     1110 Cash 80,000           1130 A/R 80,000
28-07    PV-07-0033     5220 Office Rent 12,000    1110 Cash 12,000
```

Cash-এর opening ২,০০,০০০ Dr ধরে নিয়ে **1110 Cash** এর ledger:

```text
  DATE    VOUCHER       NARRATION           DEBIT     CREDIT   BALANCE
  ────    ───────       ─────────           ─────     ──────   ───────
                        Opening b/f                          2,00,000 Dr
  05-07   PV-07-0012    Office rent                  25,000  1,75,000 Dr
  08-07   RV-07-0021    Sales collection   50,000            2,25,000 Dr
  12-07   PV-07-0025    Salary payment              40,000  1,85,000 Dr
  20-07   RV-07-0030    Collection from A/R 80,000          2,65,000 Dr
  28-07   PV-07-0033    Electricity bill            12,000  2,53,000 Dr
                        ──────────────────  ───────  ───────
                        Period Total       1,30,000   77,000
                        Closing c/f                          2,53,000 Dr
```

যাচাই:

```text
2,00,000 + 1,30,000 - 77,000  =  2,53,000  ✓
```

### একই মাস, একটি credit-normal account

**2120 Salary Payable** (Liability), opening ৪,২০,০০০ Cr:

```text
  DATE    VOUCHER       NARRATION           DEBIT     CREDIT   BALANCE
  ────    ───────       ─────────           ─────     ──────   ───────
                        Opening b/f                          4,20,000 Cr
  12-07   PV-07-0025    Salary payment     40,000              3,80,000 Cr
                        ──────────────────  ───────  ───────
                        Period Total        40,000        0
                        Closing c/f                          3,80,000 Cr
```

লক্ষ করুন — Credit-normal account-এ **debit ব্যালেন্স কমায়**। বেতন দেওয়া হলো, তাই দায় কমল। সূত্র: ৪,২০,০০০ + ০ − ৪০,০০০ = ৩,৮০,০০০ ✓

### অস্বাভাবিক ব্যালেন্স ধরা পড়ল

ধরুন Cash-এর opening ছিল মাত্র ৫০,০০০:

```text
  DATE    VOUCHER       NARRATION           DEBIT     CREDIT   BALANCE
  ────    ───────       ─────────           ─────     ──────   ───────
                        Opening b/f                            50,000 Dr
  05-07   PV-07-0012    Office rent                  25,000    25,000 Dr
  12-07   PV-07-0025    Salary payment              40,000    15,000 Cr  ⚠
```

**Cash account-এ credit balance** — হিসাবমতে হাতে ঋণাত্মক ১৫,০০০ টাকা। বাস্তবে অসম্ভব।

সম্ভাব্য কারণ:

```text
    কোনো একটা receipt entry দিতে ভুলে গেছেন
    ভুল account থেকে টাকা দেওয়া দেখানো হয়েছে
    opening balance ভুল বসানো হয়েছে
    debit/credit উল্টে গেছে কোথাও
```

> Report-এ এই সতর্কতাটা স্বয়ংক্রিয়ভাবে দেখানো উচিত। **এটা একটা bug-ধরা যন্ত্র যা প্রায় বিনা খরচে পাওয়া যায়** — আর বহু ভুল ধরে ফেলে।

---

## ৫. Implementation — Software ও Database

### Ledger query — সরল রূপ (পথ ১)

```text
-- একটি account এর ledger, একটি সময়সীমায়

-- ধাপ ১: opening
SELECT COALESCE(SUM(debit - credit), 0) AS opening_signed
FROM   posted_lines
WHERE  company_id   = :company
  AND  account_id   = :account
  AND  posting_date < :from_date;

-- ধাপ ২: period এর lines
SELECT posting_date, voucher_no, narration, debit, credit
FROM   posted_lines
WHERE  company_id   = :company
  AND  account_id   = :account
  AND  posting_date >= :from_date
  AND  posting_date <= :to_date
ORDER BY posting_date, journal_entry_id, line_no;

-- ধাপ ৩: running balance application-এ হিসাব করুন
```

`posted_lines` হলো অধ্যায় ৮-এর সেই view — `status = 'posted'` শর্ত ভুলে যাওয়ার সুযোগ নেই।

### ক্রম নির্ধারণ — একটা সূক্ষ্ম কিন্তু গুরুত্বপূর্ণ বিষয়

`ORDER BY posting_date` একা যথেষ্ট নয়। একই দিনে একাধিক entry থাকলে ক্রম কী হবে?

```text
ORDER BY posting_date, journal_entry_id, line_no
```

তিনটি স্তরের ক্রম দরকার, কারণ:

```text
posting_date       একই দিনে অনেক entry থাকতে পারে
journal_entry_id   entry গুলোর মধ্যে স্থিতিশীল ক্রম
line_no            একটি entry-র line গুলোর ক্রম
```

**ক্রম স্থিতিশীল না হলে** একই ledger দুবার চালালে running balance-এর মাঝের সংখ্যাগুলো বদলে যাবে (শেষ ব্যালেন্স একই থাকবে, কিন্তু পথটা আলাদা)। ব্যবহারকারী দুবার print করে মেলাতে গেলে বিভ্রান্ত হবেন।

### Snapshot table (পথ ৩)

```text
account_period_balances

id                  BIGINT PK
company_id          BIGINT FK
account_id          BIGINT FK
period_id           BIGINT FK

opening_signed      DECIMAL(18,4)   -- debit - credit
period_debit        DECIMAL(18,4)
period_credit       DECIMAL(18,4)
closing_signed      DECIMAL(18,4)

computed_at         TIMESTAMP
is_stale            BOOLEAN

UNIQUE (company_id, account_id, period_id)
```

`is_stale` column-টা গুরুত্বপূর্ণ। কোনো period-এ নতুন posting হলে (বা reversal) ওই period ও তার **পরের সব period**-এর snapshot বাসি হয়ে যায়:

```text
posting হলো July 2025 এ
        ↓
July 2025 এবং তার পরের সব period → is_stale = true
        ↓
পরে background job নতুন করে হিসাব করবে
        ↓
অথবা report চাওয়ার সময় দেখা যাবে stale, তখনই হিসাব
```

### Snapshot পুনর্নির্মাণ

```text
rebuildSnapshot(company, account, period):

    prev = আগের period এর snapshot
    opening = prev ? prev.closing_signed : 0

    SELECT SUM(debit), SUM(credit)
    FROM   posted_lines
    WHERE  account_id = ? AND period_id = ?

    closing = opening + period_debit - period_credit

    সংরক্ষণ করুন, is_stale = false
```

লক্ষ করুন — snapshot **আগের snapshot-এর উপর নির্ভর করে**। তাই একটা period পুনর্গণনা করলে পরের সবগুলোও করতে হবে, ক্রমানুসারে।

### নিরাপত্তার জাল: snapshot যাচাই

Snapshot যেহেতু derived, সে ভুল হতে পারে। তাই নিয়মিত মিলিয়ে দেখুন:

```text
প্রতি রাতে:

    প্রতিটি account, প্রতিটি period এর জন্য:

        snapshot.closing_signed
             বনাম
        SUM(debit - credit) FROM posted_lines
            WHERE posting_date <= period.end_date

        অমিল পেলে  →  alert + স্বয়ংক্রিয় পুনর্নির্মাণ
```

এটা অধ্যায় ২-এর রাতের ভারসাম্য যাচাইয়ের সঙ্গী। **Derived তথ্য রাখলে তার যাচাইও রাখতে হবে** — এটা আপসযোগ্য নয়।

### Index — যা ছাড়া ledger ধীর হবেই

```text
-- ledger query র মূল index
INDEX (company_id, account_id, posting_date)

-- journal_lines এ
INDEX (account_id)
INDEX (journal_entry_id)

-- journal_entries এ
INDEX (company_id, posting_date)
INDEX (company_id, status)
```

প্রথমটা সবচেয়ে গুরুত্বপূর্ণ। `journal_lines`-এ `posting_date` নেই (সেটা header-এ), তাই দুটো table জুড়তে হয়। বড় system-এ অনেকে `posting_date` ও `company_id` কে `journal_lines`-এও নকল করে রাখেন — শুধু index-এর সুবিধার জন্য।

> এটা ইচ্ছাকৃত denormalization, এবং এখানে গ্রহণযোগ্য — কারণ posted entry অপরিবর্তনীয়, তাই নকল করা মান কখনো বাসি হবে না। **অপরিবর্তনীয়তার একটা অপ্রত্যাশিত সুবিধা।**

---

## ৬. Financial Statement Impact

Ledger নিজে একটা report, আর সব statement-এর সিঁড়ি:

```text
        journal_lines
              │
              ▼
        LEDGER              ← account অনুযায়ী, বিস্তারিত
              │
              ▼
        TRIAL BALANCE       ← প্রতিটি account এর শুধু যোগফল
              │
    ┌─────────┴─────────┐
    ▼                   ▼
  P&L              Balance Sheet
```

ব্যবহারিক দিক থেকে ledger তিনটি কাজে লাগে:

| ব্যবহার | কে চায় |
| --- | --- |
| Account Statement | গ্রাহক/সরবরাহকারীকে পাঠানো হয় |
| নিরীক্ষার প্রমাণ | নিরীক্ষক সংখ্যা যাচাই করেন |
| ভুল খোঁজা | হিসাবরক্ষক অমিল খোঁজেন |

**Account Statement** বিশেষভাবে গুরুত্বপূর্ণ — গ্রাহককে পাঠানো "আপনার হিসাব" আসলে তার subledger ledger। এটা reconciliation-এর ভিত্তি (অধ্যায় ৪৪)।

Ledger থেকে Trial Balance-এ যাওয়া সহজ — প্রতিটি account-এর শুধু closing balance নিলেই হয়। সেটাই পরের অধ্যায়।

---

## ৭. Common Developer Mistakes

| ভুল | কী ঘটে | সঠিক পথ |
| --- | --- | --- |
| `ORDER BY posting_date` একা | একই ledger দুবার ভিন্ন ক্রমে | তিন স্তরের ক্রম |
| Normal balance না ধরে balance | Liability-তে উল্টো চিহ্ন | normal balance অনুযায়ী |
| আলাদা ledger table রাখা (পথ ২) | দুই সত্যের উৎস, একদিন আলাদা হয় | snapshot ব্যবহার করুন |
| Snapshot রাখা কিন্তু যাচাই না করা | নীরবে ভুল ব্যালেন্স | রাতের যাচাই |
| পিছনের তারিখে entry-তে snapshot না বাসি করা | পুরনো ব্যালেন্স দেখায় | পরের সব period stale |
| Opening প্রতিবার পুরো ইতিহাস থেকে | ৫ বছর পরে অসহনীয় | আগের period-এর snapshot |
| Index না দেওয়া | ledger খুলতে কয়েক সেকেন্ড | `(company, account, date)` |
| অস্বাভাবিক ব্যালেন্স উপেক্ষা | ভুল ধরা পড়ে না | সতর্কতা দেখান |
| `status='posted'` ভুলে যাওয়া | draft entry ledger-এ | `posted_lines` view |
| Running balance database-এ হিসাব | জটিল query, ধীর | application-এ হিসাব |
| গ্রাহকপ্রতি আলাদা GL account | COA ফুলে যায়, TB অপাঠ্য | control account + subledger |
| Control account-এ `party_id` ছাড়া line | টাকা GL-এ আছে, কারো নামে নেই | party বাধ্যতামূলক করুন |
| GL বনাম subledger না মেলানো | অমিল মাসের পর মাস চলে | রাতের যাচাইয়ে যোগ করুন |

তৃতীয় সারিটা নিয়ে একটু জোর দিতে চাই। আলাদা ledger table রাখার প্রলোভন খুব বেশি — মনে হয় "posting-এর সময় একবার লিখে রাখলেই তো হয়"। কিন্তু তারপর reversal আসে, পিছনের তারিখের entry আসে, period পুনরায় খোলা হয় — আর প্রতিটি ক্ষেত্রে ledger table হালনাগাদ করতে হয়। **কোনো একটা ক্ষেত্রে কেউ ভুলে যাবেই**, আর তখন থেকে ledger আর journal আলাদা কথা বলবে।

---

## ৮. Exercises

**সেট ক — Ledger তৈরি করুন**

জুলাই মাসের posted entry:

```text
তারিখ    Voucher      Debit                    Credit
─────    ───────      ─────                    ──────
02-07    RV-0001      1120 Bank 3,00,000       1130 A/R 3,00,000
06-07    PV-0002      2110 A/P 1,50,000        1120 Bank 1,50,000
10-07    SV-0003      1130 A/R 5,00,000        4110 Sales 5,00,000
15-07    PV-0004      5220 Rent 40,000         1120 Bank 40,000
22-07    RV-0005      1120 Bank 2,00,000       1130 A/R 2,00,000
28-07    PuV-0006     1140 Inventory 1,80,000  2110 A/P 1,80,000
31-07    PV-0007      5210 Salary 3,50,000     2120 Sal.Pay 3,50,000
```

Opening balance:

```text
1120  Bank                 8,00,000 Dr
1130  Accounts Receivable  4,00,000 Dr
2110  Accounts Payable     2,50,000 Cr
```

```text
১।   1120 Bank এর সম্পূর্ণ ledger বানান (opening, সব line,
     period total, closing সহ)।

২।   1130 Accounts Receivable এর ledger বানান।

৩।   2110 Accounts Payable এর ledger বানান।
     মনে রাখবেন এটা credit-normal।

৪।   তিনটি ledger-এর closing balance লিখুন, দিক (Dr/Cr) সহ।
```

**সেট খ — Running balance**

```text
৫।   একটি Revenue account, opening 0।
     পরপর: Cr 50,000 → Cr 30,000 → Dr 10,000 → Cr 20,000
     প্রতি ধাপের পরে balance কত ও কোন দিকে?

৬।   একটি Expense account, opening 25,000 Dr।
     পরপর: Dr 15,000 → Cr 40,000 → Dr 5,000
     প্রতি ধাপের পরে balance কত ও কোন দিকে?
     তৃতীয় ধাপের পরে কি কিছু অস্বাভাবিক?

৭।   একটি Bank account (Asset), opening 30,000 Dr।
     Cr 50,000 হলো। Balance কত, কোন দিকে?
     এটা কি সম্ভব? কোন পরিস্থিতিতে?
```

**সেট গ — নকশা**

```text
৮।   আপনার system-এ ৫ বছরের data আছে, ৫০ লক্ষ journal line।
     একজন ব্যবহারকারী জুলাই ২০২৫-এর Cash ledger চাইলেন।
     পথ ১ (প্রতিবার হিসাব) দিয়ে কী কী পড়তে হবে?
     পথ ৩ (snapshot) দিয়ে কী কী?

৯।   ২০ জুলাইয়ে কেউ ১০ জুলাইয়ের তারিখে একটা entry post করল।
     কোন কোন snapshot বাসি হলো? ধাপে ধাপে লিখুন।

১০।  রাতের যাচাইয়ে দেখা গেল account 1120-র জুন মাসের
     snapshot ভুল। কী কী করবেন, কোন ক্রমে?

১১।  একটি গ্রাহককে তার Account Statement পাঠাতে হবে।
     এটা কি GL ledger, নাকি অন্য কিছু? পার্থক্য কী?

১২।  আপনার 1130 Accounts Receivable এর GL ব্যালেন্স
     ১২,০০,০০০ Dr। Subledger এর যোগফল ১১,৫০,০০০ Dr।
     পার্থক্য ৫০,০০০। অন্তত তিনটি সম্ভাব্য কারণ লিখুন,
     আর প্রতিটির জন্য একটি করে যাচাইয়ের ধাপ।

১৩।  নিচের কোনগুলো GL account হওয়া উচিত আর কোনগুলো
     subledger এর মাত্রা — সিদ্ধান্ত ও যুক্তি লিখুন:

     (ক)  Prime Bank চলতি হিসাব       (ঙ)  গ্রাহক "ABC Ltd"
     (খ)  Bank — Current              (চ)  বিক্রয় বিভাগ
     (গ)  ল্যাপটপ (সম্পদ নং A-114)     (ছ)  ভাড়া খরচ
     (ঘ)  Fixed Asset — Computer      (জ)  কর্মী "করিম আহমেদ"
```

উত্তর আছে Workbook-এর Answer Key, অধ্যায় ৯-এ।

---

## ৯. Developer Challenge

> একটি **LedgerService** নকশা করুন যা ledger ও account statement তৈরি করবে।
>
> যা যা নকশা করবেন:
>
> ১. `getLedger(account, fromDate, toDate)` এর সম্পূর্ণ যুক্তি — opening, lines, running balance, closing।
> ২. Snapshot ব্যবহার করে opening দ্রুত বের করার যুক্তি। Snapshot না থাকলে বা বাসি হলে কী করবেন?
> ৩. `is_stale` চিহ্নিত করার যুক্তি — কোন কোন ঘটনায় কোন কোন snapshot বাসি হয়? (posting, reversal, period পুনরায় খোলা, migration)
> ৪. রাতের যাচাইয়ের কাজটি নকশা করুন। ৫০০টি account ও ৬০টি period হলে কতগুলো তুলনা? এটা কি প্রতি রাতে সম্ভব? না হলে কী কৌশল নেবেন?
> ৫. একটি ledger-এ ১০,০০০ line আছে। ব্যবহারকারীকে কীভাবে দেখাবেন — সব একসাথে, নাকি পাতায় পাতায়? পাতায় পাতায় হলে running balance কীভাবে ঠিক রাখবেন?
> ৬. Ledger export করতে হবে Excel-এ। কী কী column দেবেন, আর কোন ক্রমে? নিরীক্ষক কী কী চাইবেন?
>
> ৫ নম্বরটা দেখতে UI-র সমস্যা, কিন্তু আসলে নয় — দ্বিতীয় পাতার প্রথম line-এর running balance জানতে হলে প্রথম পাতার সব line লাগবে। এর একটা পরিচ্ছন্ন সমাধান বের করুন।

---

## ১০. Summary Card

**Journal বনাম Ledger**

```text
Journal   তারিখের ক্রমে      "৫ জুলাই কী হলো?"
Ledger    account অনুযায়ী   "Cash এ কী কী হলো?"

একই তথ্য, দুই দৃষ্টিকোণ
```

**Ledger-এর ছয়টি অংশ**

```text
DATE   VOUCHER   NARRATION   DEBIT   CREDIT   BALANCE
```

**Running Balance**

```text
Debit-normal (Asset, Expense):
    নতুন = আগের + debit - credit

Credit-normal (Liability, Equity, Revenue):
    নতুন = আগের + credit - debit
```

**Opening ও Closing**

```text
আগের closing (c/f)  =  এই period এর opening (b/f)

ভিতরে signed রাখুন (debit - credit)
দেখানোর সময় Dr / Cr এ রূপান্তর
```

**তিনটি পথ**

| পথ | সঠিকতা | গতি | সুপারিশ |
| --- | --- | --- | --- |
| প্রতিবার হিসাব | নিখুঁত | ধীর | ছোট system |
| আলাদা ledger table | ঝুঁকিপূর্ণ | দ্রুত | এড়িয়ে চলুন |
| Snapshot | নিখুঁত | দ্রুত | বেশিরভাগ ক্ষেত্রে |

**অস্বাভাবিক ব্যালেন্স**

```text
Asset এ credit balance      →  সতর্কতা
Liability তে debit balance  →  সতর্কতা

প্রায় সবসময় কোথাও একটা ভুল
```

**Developer checklist**

```text
□  ORDER BY posting_date, journal_entry_id, line_no
□  normal balance অনুযায়ী running balance
□  ভিতরে signed, দেখানোর সময় Dr/Cr
□  আলাদা ledger table নয় — snapshot
□  snapshot এর রাতের যাচাই
□  posting/reversal এ পরের সব period stale
□  INDEX (company_id, account_id, posting_date)
□  সব query posted_lines view দিয়ে
□  অস্বাভাবিক ব্যালেন্সে সতর্কতা
□  running balance application-এ, SQL-এ নয়
□  গ্রাহক/সরবরাহকারী subledger এ, COA তে নয়
□  control account এর line এ party_id বাধ্যতামূলক
□  রাতে GL বনাম subledger মিলিয়ে দেখা
```

---

## পরবর্তী অধ্যায়

**অধ্যায় ১০ — Trial Balance:** প্রতিটি account-এর ledger তৈরি। এবার সবগুলোকে এক পাতায় এনে দেখা — **Trial Balance**। পরের অধ্যায়ে দেখব এর গঠন, কেন দুই পাশ মিলতেই হবে, এটা কোন ভুল ধরে ফেলে — আর সবচেয়ে গুরুত্বপূর্ণ, **কোন ভুলগুলো এটা কখনোই ধরতে পারে না।**
