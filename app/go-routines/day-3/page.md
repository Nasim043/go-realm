## 🧠 **WaitGroups & Mutex (Synchronization)**

## 🎯 লক্ষ্য

আজ তুমি শিখবে কীভাবে একাধিক goroutine একসাথে চললেও প্রোগ্রাম **safe এবং predictable** রাখা যায়।
মূলত আমরা শিখবো:

* WaitGroup
* Mutex / RWMutex
* Race Condition
* Race Detector (`go run -race`)
* Channels বনাম Mutex ব্যবহার কবে উপযুক্ত

---
### কেন synchronization দরকার?

Go-তে goroutine গুলো একই সাথে চলতে পারে।

কিন্তু যদি তারা shared data ব্যবহার করে, তখন ভুল মান, অসামঞ্জস্যপূর্ণ অবস্থা, অথবা race condition ঘটতে পারে।

### 1) WaitGroup কী?

`sync.WaitGroup` ব্যবহার করা হয় একাধিক goroutine শেষ হওয়া পর্যন্ত **main function** কে অপেক্ষা করানোর জন্য।

`WaitGroup` দিয়ে আমরা বলতে পারি:

>“এই X সংখ্যক goroutine শেষ না হওয়া পর্যন্ত main() বন্ধ হবে না।”

### 🔹 মূল তিনটি মেথড

| মেথড     | কাজ                                               |
| -------- | ------------------------------------------------- |
| `Add(n)` | n টি goroutine শুরু হবে তা WaitGroup-কে জানানো                     |
| `Done()` | একটি goroutine কাজ শেষ তা WaitGroup-কে জানানো                  |
| `Wait()` | সব Done() না হওয়া পর্যন্ত main() অপেক্ষা করে |

### 🔸 উদাহরণ: ৫টি goroutine চালিয়ে WaitGroup দিয়ে অপেক্ষা

```go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup

    wg.Add(5) // ৫টা goroutine হবে

    for i := 1; i <= 5; i++ {
        go func(id int) {
            defer wg.Done()
            fmt.Println("Goroutine চলছে:", id)
        }(i)
    }

    wg.Wait() // সব goroutine শেষ না হওয়া পর্যন্ত অপেক্ষা
    fmt.Println("সব goroutine শেষ হয়েছে ✅")
}
```

🧩 **কী হলো এখানে:**
`WaitGroup` main function কে ব্লক করে রাখছে যতক্ষণ না সব goroutine শেষ হয়।

---

## 2) Shared Data + Mutex

`Mutex`-এর পূর্ণরূপ হলো “**Mutual Exclusion**” (পারস্পরিক বর্জন)।

এর মূল ধারণা হলো: **একই সময়ে শুধুমাত্র একটি `goroutine`-কে** একটি নির্দিষ্ট ডেটা (shared data) অ্যাক্সেস বা পরিবর্তন করার অনুমতি দেওয়া।

---

### ⚠️ সমস্যা: Data Race

যখন একাধিক `goroutine` 🔥একই data🔥 একযোগে পরিবর্তন করার চেষ্টা করে, তখন **data race** নামক একটি মারাত্মক বাগ তৈরি হয়। এর ফলে ডেটা নষ্ট (corrupt) হয়ে যেতে পারে বা অ্যাপ্লিকেশনটি ক্র্যাশ করতে পারে।

### 🔒 সমাধান: `sync.Mutex`

Go-তে এই data race ঠেকানোর জন্য `sync` প্যাকেজের `Mutex` ব্যবহার করা হয়। এটি একটি তালার (lock) মতো কাজ করে।

এর দুটি প্রধান মেথড রয়েছে:

* **`Lock()`**: ডেটা অ্যাক্সেস করার *আগে* এই মেথড কল করা হয়।
    * যদি তালাটি খোলা থাকে, তবে `goroutine`-টি এটি লক করে এবং কাজ শুরু করে।
    * যদি অন্য `goroutine` আগেই লক করে রাখে, তবে এটি তালা খোলার জন্য অপেক্ষা (block) করে।

* **`Unlock()`**: ডেটা পরিবর্তন করা *শেষ হলে* এই মেথড কল করা হয়।
    * এটি তালাটি খুলে দেয়, যাতে অপেক্ষারত অন্য `goroutine`-গুলি ডেটা অ্যাক্সেস করতে পারে।

### 🔸 উদাহরণ: 1000 বার Counter বৃদ্ধি (Safe)

```go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var counter = 0
    var mu sync.Mutex
    var wg sync.WaitGroup

    wg.Add(1000)

    for i := 0; i < 1000; i++ {
        go func() {
            defer wg.Done()
            mu.Lock()
            counter++ // এখন নিরাপদ
            mu.Unlock()
        }()
    }

    wg.Wait()
    fmt.Println("Final Counter:", counter)
}
```

🔒 এখানে Mutex counter-কে একসাথে এক goroutine দ্বারা পরিবর্তন নিশ্চিত করছে।

---

### 3) Mutex বাদ দিলে কী হয়? (Race Condition!)

```go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var counter = 0
    var wg sync.WaitGroup

    wg.Add(1000)

    for i := 0; i < 1000; i++ {
        go func() {
            defer wg.Done()
            counter++ // ❌ বিপদ! একাধিক goroutine একসাথে লিখছে
        }()
    }

    wg.Wait()
    fmt.Println("Final Counter:", counter)
}
```

💥 **Output পরিবর্তনশীল হবে** — কখনও 800, কখনও 950, কখনও 1000 না।
এটাই **Race Condition**।

---

## 4) Race Detector ব্যবহার

Go-তে বিল্ট-ইন race detector আছে।

```bash
go run -race main.go
```

এটি বলবে:
```
WARNING: DATA RACE
Read at ...
Previous write at ...
```

এর মানে তোমার কোডে একাধিক goroutine একসাথে data অ্যাক্সেস করছে।

### 🚨 Deadlock Prevention (অতি গুরুত্বপূর্ণ)

Deadlock হয় যখন দুটি goroutine একে অপরের lock-এর জন্য অপেক্ষা করে।

```go
// ❌ DEADLOCK RISK: ভিন্ন order-এ lock নেওয়া
func transfer1(mu1, mu2 *sync.Mutex) {
    mu1.Lock()
    mu2.Lock() // এই order
    // ... transfer logic
    mu2.Unlock()
    mu1.Unlock()
}

func transfer2(mu1, mu2 *sync.Mutex) {
    mu2.Lock()
    mu1.Lock() // উল্টো order = Deadlock!
    // ... transfer logic
    mu1.Unlock()
    mu2.Unlock()
}

// ✅ SOLUTION: সবসময় একই order-এ lock নিন
func transfer(from, to *Account) {
    // Consistent ordering by memory address
    first, second := from, to
    if uintptr(unsafe.Pointer(from)) > uintptr(unsafe.Pointer(to)) {
        first, second = to, from
    }
    
    first.mu.Lock()
    defer first.mu.Unlock()
    
    second.mu.Lock()
    defer second.mu.Unlock()
    
    // Safe transfer
    from.balance -= amount
    to.balance += amount
}
```

### 🛡️ Deadlock Prevention Strategies (প্রোডাকশনে অবশ্যই মানুন)

| Strategy | বর্ণনা | উদাহরণ |
|----------|--------|---------|
| **Lock Ordering** | সবসময় একই sequence-এ lock নিন | A→B→C (কখনো C→A→B নয়) |
| **Timeout** | নির্দিষ্ট সময়ের বেশি wait করবেন না | `TryLock()` with timeout |
| **Avoid Nested Locks** | একসাথে একাধিক lock এড়িয়ে চলুন | যদি সম্ভব হয় channel ব্যবহার করুন |
| **Use defer** | সবসময় unlock নিশ্চিত করুন | `defer mu.Unlock()` |

---

### 💼 Production Pattern: Thread-Safe Data Structure

প্রোডাকশনে আমরা Mutex wrap করে thread-safe struct তৈরি করি।

```go
package main

import (
    "fmt"
    "sync"
)

// SafeCounter is a thread-safe counter
type SafeCounter struct {
    mu    sync.Mutex
    value int
}

// Increment safely increments the counter
func (c *SafeCounter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.value++
}

// Value safely returns current value
func (c *SafeCounter) Value() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.value
}

// Add safely adds n to counter
func (c *SafeCounter) Add(n int) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.value += n
}

func main() {
    counter := &SafeCounter{}
    var wg sync.WaitGroup
    
    // 1000 goroutines safely increment
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            counter.Increment()
        }()
    }
    
    wg.Wait()
    fmt.Println("Safe Counter:", counter.Value())
}
```

✅ **Benefits:**
- Encapsulation: Mutex বাইরে থেকে access করা যায় না
- API clear: user দেখতে পায় না internal locking
- Reusable: যেকোনো প্রজেক্টে ব্যবহার করা যায়

---

### 📊 Production Pattern: sync.Map (Built-in Thread-Safe Map)

যদি map concurrent access করতে হয়, `sync.Map` ব্যবহার করুন (Mutex দিয়ে wrap করার চেয়ে ভালো)।

```go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var m sync.Map
    var wg sync.WaitGroup
    
    // Write from multiple goroutines
    for i := 0; i < 100; i++ {
        wg.Add(1)
        go func(key int) {
            defer wg.Done()
            m.Store(key, key*2)
        }(i)
    }
    
    wg.Wait()
    
    // Read safely
    m.Range(func(key, value interface{}) bool {
        fmt.Printf("Key: %v, Value: %v\n", key, value)
        return true // continue iteration
    })
}
```

### 🆚 sync.Map বনাম map + Mutex

| Scenario | Use | কারণ |
|----------|-----|------|
| Read-heavy (90%+) | `sync.Map` | Better performance |
| Write-heavy | `map + Mutex` | Simpler, better for writes |
| Key stable (rarely change) | `sync.Map` | Optimized for stable keys |
| Known keys at start | `map + Mutex` | Simpler initialization |

---

<details>
<summary> 📌 5) RWMutex (Reader-Writer Mutex)</summary>
## 🔐 RWMutex (Reader–Writer Mutex)

`sync.RWMutex` হলো এমন একটি লক যা **read⬆️ বেশি ও write⬇️ কম** কাজের ক্ষেত্রে পারফরম্যান্স বাড়ায়।

---

### ⚙️ কাজের নিয়ম

RWMutex দুটি আলাদা লক দেয়:

* **`RLock()`** → একাধিক goroutine একসাথে data *read* করতে পারে
* **`Lock()`** → শুধুমাত্র একটি goroutine data *write* করতে পারে (সব readers ও writers ব্লক হয়)

---

### 📖 উদাহরণ

```go
var (
	value int
	mu    sync.RWMutex
)

func reader(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	mu.RLock()
	fmt.Println("Reader", id, "read:", value)
	mu.RUnlock()
}

func writer(wg *sync.WaitGroup) {
	defer wg.Done()
	mu.Lock()
	value++
	fmt.Println("Writer updated value:", value)
	mu.Unlock()
}
```

🔹 এখানে:

* একাধিক `reader()` একই সময়ে চালতে পারে
* কিন্তু `writer()` আসলে, অন্য সবাই 🔥 থেমে যায় যতক্ষণ না writer কাজ শেষ করে

---

## ⚡ কেন RWMutex দরকার?

ধরো তোমার প্রোগ্রাম ৯০% সময় শুধু **read** করে, আর ১০% সময় **write** করে।
যদি সাধারণ `Mutex` ব্যবহার করো, তাহলে সব reader একে একে চলবে — পারফরম্যান্স কমে যাবে।

`RWMutex` এই সমস্যা সমাধান করে:

* একাধিক reader একসাথে read করতে পারে (concurrent read)
* কিন্তু writer আসলে সবাই ব্লক হবে যতক্ষণ না writer কাজ শেষ করে

---

### ⚖️ Mutex বনাম RWMutex

| দিক                               | Mutex                 | RWMutex                 |
| --------------------------------- | --------------------- | ----------------------- |
| একাধিক reader একসাথে              | ❌ না                  | ✅ হ্যাঁ                 |
| একাধিক writer একসাথে              | ❌ না                  | ❌ না                    |
| Read-heavy workload এ performance | ধীর                   | দ্রুত                   |
| ব্যবহার                           | Shared data কম পড়া হয় | Shared data বেশি পড়া হয় |

---

### ✅ মনে রাখো

> RWMutex তখন ব্যবহার করো, যখন **read অনেক বেশি** আর **write কম**।
> Write এলে সবাই অপেক্ষা করবে; Read এলে সবাই একসাথে কাজ করবে।

</details>


### 🔍 Channels বনাম Mutex

| পরিস্থিতি                                    | ব্যবহার | কারণ                         |
| -------------------------------------------- | ------- | ---------------------------- |
| Shared variable রক্ষা করতে হবে               | Mutex   | সহজ ও কার্যকর                |
| Data goroutine-এর মধ্যে আদান-প্রদান করতে হবে | Channel | Ownership স্পষ্ট ও race-free |
| Pipeline বা Worker-Pool ডিজাইন               | Channel | Natural fit                  |

---

## 🧩 অনুশীলন

| Exercise | কাজ                                                           |
| -------- | ------------------------------------------------------------- |
| 1️⃣      | ৫টি goroutine চালাও ও WaitGroup দিয়ে শেষ পর্যন্ত অপেক্ষা করাও |
| 2️⃣      | Counter 1000 বার বৃদ্ধি করো Mutex ব্যবহার করে                 |
| 3️⃣      | Mutex সরাও ও দেখো কী হয়                                       |
| 4️⃣      | `go run -race main.go` দিয়ে race detector চালাও               |
| 5️⃣      | RWMutex দিয়ে এক Writer ও একাধিক Reader চালাও                  |

---

## 🧭 সারসংক্ষেপ

| ধারণা                  | কাজ                                                     |
| ---------------------- | ------------------------------------------------------- |
| **WaitGroup**          | একাধিক goroutine শেষ হওয়া পর্যন্ত অপেক্ষা               |
| **Mutex**              | Shared variable কে একসময় এক goroutine পরিবর্তন করতে দেয় |
| **RWMutex**            | একাধিক reader একই সাথে, কিন্তু writer একা               |
| **Race Condition**     | একাধিক goroutine একসাথে shared data পরিবর্তন করলে হয়    |
| **`-race` flag**       | Race Condition শনাক্ত করার টুল                          |
| **Channel বনাম Mutex** | Channel data pass করতে, 🔥Mutex data protect করতে 🔥        |


## Select Statement & Multiplexing

`select`-কে আপনি `goroutine`-দের "ট্রাফিক কন্ট্রোলার" বলতে পারেন। এটি একটি `goroutine`-কে *একাধিক* চ্যানেলের উপর একবারে নজর রাখতে সাহায্য করে এবং যেটি আগে প্রস্তুত (ready) হয়, সেটির উপর ভিত্তি করে কাজ করে।


### 🧠 কনসেপ্ট বোঝা

### 🤔 `select` কেন প্রয়োজন?

ধরুন, আপনার দুটি চ্যানেল আছে, `ch1` এবং `ch2`। আপনি দুটো থেকেই ডেটা আশা করছেন। আপনি যদি এভাবে লেখেন:

```go
data1 := <-ch1 // এখানে আটকে গেল
data2 := <-ch2 // এটি আর চলবে না, যদি ch1 এ ডেটা না আসে
```

যদি `ch1`-এ কোনো ডেটা না আসে, কিন্তু `ch2`-তে ডেটা চলে আসে, তবুও আপনার প্রোগ্রাম 🔥`ch1`-এর জন্য অনন্তকাল অপেক্ষা (block) করতে থাকবে।🔥

`select` এই সমস্যার সমাধান করে। এটি সব চ্যানেলের দিকে "তাকিয়ে" থাকে এবং যে চ্যানেলটি প্রথম ডেটা পাঠাতে বা গ্রহণ করতে প্রস্তুত হয়, সেটির কোড ব্লকটি চালায়।

-----


### 🔹 1. `select` কী করে এবং `select` সিনট্যাক্স

`select` অনেকটা `switch` এর মতো,
কিন্তু এটি কাজ করে **চ্যানেল অপারেশন** (send/receive) এর উপর।

👉 কাজ:
একাধিক চ্যানেলের মধ্যে **যে চ্যানেল আগে ready হয়**, সেটার case execute হয়।

### 📜 `select` সিনট্যাক্স এবং "First Ready Wins"

`select`-এর সিনট্যাক্স `switch`-এর মতোই।

```go
select {
case data := <-ch1:
    // ch1 থেকে ডেটা রিসিভ হলে এটি চলবে
    fmt.Println("ch1 থেকে পেলাম:", data)
case ch2 <- "Hi":
    // ch2-তে ডেটা সেন্ড করা সম্ভব হলে এটি চলবে
    fmt.Println("ch2-তে 'Hi' পাঠালাম")
case <-ch3:
    // ch3 থেকে ডেটা রিসিভ হলে (কিন্তু ডেটা ব্যবহার না করলে)
    fmt.Println("ch3 থেকে সিগন্যাল পেলাম")
}
```
---

#### 🚦 চিত্র: `select` যেভাবে কাজ করে

`select` স্টেটমেন্টকে একটি ফানেল হিসেবে ভাবুন:

```
           [goroutine]
               |
          <--select-->
         /      |     \
        /       |      \
   (অপেক্ষা) (প্রস্তুত) (অপেক্ষা)
      |         |        |
    [ch1]     [ch2]    [ch3]
```

  * `select` তিনটি চ্যানেলের দিকেই নজর রাখে।
  * ধরুন, `ch2` প্রথমে ডেটা রিসিভ করার জন্য প্রস্তুত হলো।
  * `select` *অবিলম্বে* `ch2`-এর `case` ব্লকটি নির্বাচন করবে এবং চালাবে। অন্য `case`-গুলো উপেক্ষা করা হবে।
  * **"First Ready Wins"**: এটিই মূল নিয়ম। যে প্রথম প্রস্তুত হবে, সেই জিতবে।
  * যদি একাধিক `case` *একই সাথে* প্রস্তুত থাকে (খুব বিরল, তবে সম্ভব), `select` তখন তাদের মধ্যে থেকে *এলোমেলোভাবে* (randomly) একটিকে বেছে নেয়। এটি কোনো একটি চ্যানেলের প্রতি পক্ষপাত (bias) দূর করতে সাহায্য করে।

-----

### 🔹 2. `select` এর রুল: “First Ready Wins”

* একাধিক চ্যানেল ready থাকলে → Go র‍্যান্ডমলি একটি বেছে নেয়।
* কোনো চ্যানেল ready না থাকলে → ব্লক করে (অপেক্ষা করে)।
* যদি `default` থাকে → ব্লক করে না।
* একবারে শুধু একটাই case চলে।

---

### 🔹 3. 💨 নন-ব্লকিং অপারেশন: `default`

যদি আপনি চান যে `select` কোনো চ্যানেলের জন্য *একটুও* অপেক্ষা না করুক, তবে `default` কেস ব্যবহার করতে পারেন।

🧩 `default` কেস তখনই চলে যখন *অন্য কোনো `case`* তাৎক্ষণিকভাবে প্রস্তুত থাকে না।

```go
select {
case data := <-ch:
    fmt.Println("ডেটা রিসিভড:", data)
default:
    // কোনো চ্যানেল রেডি না থাকলে এটি সাথে সাথে চলবে
    fmt.Println("এখনো কোনো ডেটা নেই, আমি অন্য কাজ করছি...")
}
```

এটি "try-receive" বা "non-blocking receive" করার একটি সহজ উপায়।

-----
### 🔹 4. ⏳ `time.After` দিয়ে টাইমআউট (Timeout)

অনেক সময় আমরা অনন্তকাল অপেক্ষা করতে চাই না। আমরা একটি নির্দিষ্ট সময় পর্যন্ত অপেক্ষা করতে পারি। `time.After(duration)` একটি চ্যানেল রিটার্ন করে, যা নির্দিষ্ট সময় (duration) পার হওয়ার পর *একটি* সিগন্যাল পাঠায়।

এটি `select`-এর সাথে টাইমআউট তৈরির জন্য দুর্দান্ত:

```go
select {
case data := <-longRunningTaskCh:
    fmt.Println("কাজ সম্পন্ন:", data)
case <-time.After(2 * time.Second):
    // 2 সেকেন্ড পার হয়ে গেলে এটি চলবে
    fmt.Println("টাইমআউট! আর অপেক্ষা করা সম্ভব না।")
}
```

> এটি একটি ক্লাসিক প্যাটার্ন: হয় কাজটি সম্পন্ন হবে, অথবা টাইমআউট হবে—দুটির মধ্যে 🔥যেটি *আগে* ঘটবে।🔥

-----

### 🔀 প্যাটার্ন: ফ্যান-ইন (Fan-In) / মাল্টিপ্লেক্সিং

ফ্যান-ইন হলো এমন একটি প্যাটার্ন যেখানে আপনি একাধিক ইনপুট চ্যানেল থেকে ডেটা নিয়ে একটিমাত্র আউটপুট চ্যানেলে একত্রিত করেন। এটি `select`-এর একটি খুব সাধারণ ব্যবহার।

ধরুন, আপনার দুটি সোর্স (producer) আছে, যারা প্রত্যেকে নিজেদের চ্যানেলে ডেটা পাঠাচ্ছে। আপনি সেই দুটি চ্যানেলকে "merge" করে একটি চ্যানেলে আনতে চান।

আমরা এই কাজটি করার জন্য একটি ফাংশন তৈরি করতে পারি।

### 🔹 Production-grade Fan-In pattern implementation

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

// Fan-In: Multiple inputs → Single output
func fanIn(inputs ...<-chan string) <-chan string {
    out := make(chan string)
    var wg sync.WaitGroup
    
    for _, ch := range inputs {
        wg.Add(1)
        go func(c <-chan string) {
            defer wg.Done()
            for msg := range c {
                out <- msg
            }
        }(ch)
    }
    
    go func() {
        wg.Wait()
        close(out)
    }()
    
    return out
}

func producer(name string, count int) <-chan string {
    ch := make(chan string)
    go func() {
        defer close(ch)
        for i := 1; i <= count; i++ {
            ch <- fmt.Sprintf("%s: message %d", name, i)
            time.Sleep(100 * time.Millisecond)
        }
    }()
    return ch
}

func main() {
    ch1 := producer("Service-A", 3)
    ch2 := producer("Service-B", 3)
    
    merged := fanIn(ch1, ch2)
    
    for msg := range merged {
        fmt.Println("Received:", msg)
    }
}
```

✅ **প্রোডাকশন Use Cases:** Multiple microservices response merge, Log aggregation

---

### 🛑 Production Pattern: Graceful Shutdown

```go
package main

import (
    "fmt"
    "os"
    "os/signal"
    "sync"
    "syscall"
    "time"
)

func worker(id int, jobs <-chan int, done <-chan struct{}, wg *sync.WaitGroup) {
    defer wg.Done()
    
    for {
        select {
        case job, ok := <-jobs:
            if !ok {
                fmt.Printf("Worker %d: channel closed\n", id)
                return
            }
            fmt.Printf("Worker %d processing %d\n", id, job)
            time.Sleep(500 * time.Millisecond)
            
        case <-done:
            fmt.Printf("Worker %d: shutdown signal\n", id)
            return
        }
    }
}

func main() {
    jobs := make(chan int, 10)
    done := make(chan struct{})
    var wg sync.WaitGroup
    
    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go worker(i, jobs, done, &wg)
    }
    
    go func() {
        for j := 1; j <= 10; j++ {
            jobs <- j
            time.Sleep(200 * time.Millisecond)
        }
        close(jobs)
    }()
    
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
    
    <-sigChan
    fmt.Println("\n🛑 Gracefully stopping...")
    
    close(done)
    wg.Wait()
    fmt.Println("✅ Clean shutdown")
}
```

---

### 💻 Exercises

### ⚡ Example 1: Two Channels, First Ready Wins

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)

    go func() {
        time.Sleep(1 * time.Second)
        ch1 <- "🍎 From channel 1"
    }()
    go func() {
        time.Sleep(2 * time.Second)
        ch2 <- "🍌 From channel 2"
    }()

    select {
    case msg1 := <-ch1:
        fmt.Println(msg1)
    case msg2 := <-ch2:
        fmt.Println(msg2)
    }
}
```

<details>
<summary>💬 প্রশ্ন ১: **go routine** থাকা সত্ত্বেও আমরা কেন `WaitGroup` ব্যবহার করিনি?</summary>

**উত্তর:**
কারণ `select` নিজেই **channel থেকে data পাওয়ার জন্য ব্লক করে থাকে**।
যতক্ষণ না কোনো চ্যানেল ready হয়, main goroutine অপেক্ষা করে।
অর্থাৎ main আগেভাগে terminate হয় না।

`WaitGroup` দরকার হয় যখন:

* কোনো channel নেই, শুধু goroutine চলছে, অথবা
* তুমি manualভাবে goroutine শেষ হওয়া পর্যন্ত অপেক্ষা করতে চাও।

🧩 উদাহরণ:

```go
// select নিজেই ব্লক করবে
select {
case msg := <-ch:
    fmt.Println(msg)
}

// WaitGroup দরকার যখন কোনো channel নেই
var wg sync.WaitGroup
wg.Add(1)
go func() {
    defer wg.Done()
    fmt.Println("working...")
}()
wg.Wait()
```

✅ সারসংক্ষেপ:
যখন `select` বা `<-ch` আছে → main goroutine নিজেই wait করে → `WaitGroup` দরকার নেই।

</details>

<details>
<summary>💬 প্রশ্ন ২: কেন go routine সরিয়ে দিলেও কোডে “fatal error: all goroutines are asleep - deadlock!” আসে?</summary>

**উত্তর:**
কারণ কোনো goroutine চ্যানেলে data পাঠাচ্ছে না, অথচ `select` চ্যানেল থেকে data **receive করার চেষ্টা করছে**।

```go
ch1 := make(chan string)
ch2 := make(chan string)

select {
case msg1 := <-ch1:
    fmt.Println(msg1)
case msg2 := <-ch2:
    fmt.Println(msg2)
}
```

👉 এখানে:

* `ch1` ও `ch2` থেকে কেউ send করছে না।
* `select` দুইটিতেই receive অপেক্ষা করছে।
* ফলে main goroutine ব্লক হয়ে যায় এবং অন্য কোনো goroutineও চলছে না।

Go runtime বুঝে যায় “সবাই ঘুমিয়ে আছে” 😴
তখন panic দেয়:

```
fatal error: all goroutines are asleep - deadlock!
```

✅ সমাধান:
একটা goroutine থেকে data পাঠাও বা buffered channel ব্যবহার করো।

```go
go func() { ch1 <- "🍎 From channel 1" }()
go func() { ch2 <- "🍌 From channel 2" }()
```

অথবা

```go
ch1 := make(chan string, 1)
ch1 <- "🍎 From buffered channel"
select {
case msg := <-ch1:
    fmt.Println(msg)
}
```

🧠 সারসংক্ষেপ:
**Deadlock হয় যখন সবাই অপেক্ষা করে কিন্তু কেউ কাজ করে না।**

## 💡 Deadlock Rule সহজভাবে

| অবস্থা                                                 | ফলাফল             |
| ------------------------------------------------------ | ----------------- |
| Channel থেকে receive হচ্ছে কিন্তু কেউ send করছে না     | Deadlock          |
| Channel-এ send হচ্ছে কিন্তু কেউ receive করছে না        | Deadlock          |
| Unbuffered channel → send & receive একসাথে না হলে      | Deadlock          |
| Buffered channel → capacity শেষ হয়ে গেলে send ব্লক হবে | Possible Deadlock |

</details>


---

### ⚙️ Example 2: Add Default Case (Non-blocking)

```go
select {
case msg := <-ch1:
    fmt.Println("Received:", msg)
default:
    fmt.Println("No channel ready — moving on 🚀")
}
```

---

### ⏰ Example 3: Add Timeout

```go
select {
case msg := <-ch1:
    fmt.Println("Got:", msg)
case <-time.After(2 * time.Second):
    fmt.Println("Timeout! ⏰ No data received.")
}
```

---

## 🧩 Bonus: Context Cancellation

যদি নির্দিষ্ট সময় পরে সব বন্ধ করতে চাও 👇

```go
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()

for {
    select {
    case msg := <-out:
        fmt.Println(msg)
    case <-ctx.Done():
        fmt.Println("🛑 Stopped by context timeout.")
        return
    }
}
```

---

## 🧾 **Mini Cheat Sheet — `select` Quick Recall**

| Feature        | Syntax                         | Behavior                    |
| -------------- | ------------------------------ | --------------------------- |
| Basic select   | `select { case msg := <-ch: }` | Waits for any ready channel |
| Default case   | `default:`                     | Prevents blocking           |
| Timeout        | `case <-time.After(d):`        | Triggers after duration     |
| Fan-in         | Combine multiple channels      | Use select inside goroutine |
| Context cancel | `case <-ctx.Done():`           | Stop gracefully             |
| Rule           | “First ready wins”             | Random if multiple ready    |

---

## 🧠 Summary (বাংলায় সারাংশ)

* `select` একাধিক চ্যানেল একসাথে মনিটর করে।
* যে চ্যানেল আগে ready হয়, সেটার case চালু হয়।
* `default` case দিলে ব্লক হয় না।
* `time.After` দিয়ে timeout সেট করা যায়।
* **Fan-in pattern** দিয়ে একাধিক channel merge করা যায়।
* `context.WithTimeout` দিয়ে clean stop করা যায়।

-----
### 🏭 Production-Ready Application জ্ঞান

### ⚠️ Common Production Pitfalls (এড়িয়ে চলুন)

#### 1. time.After in Loop (Memory Leak)

```go
// ❌ BAD: Memory leak
for {
    select {
    case <-ch:
        // process
    case <-time.After(1 * time.Second): // প্রতিবার নতুন timer
        // timeout
    }
}

// ✅ GOOD: Timer reuse
timer := time.NewTimer(1 * time.Second)
defer timer.Stop()
for {
    select {
    case <-ch:
        timer.Reset(1 * time.Second)
    case <-timer.C:
        // timeout
    }
}
```

#### 2. Goroutine Leak

```go
// ❌ Leak হবে
func leaky() {
    ch := make(chan int)
    go func() {
        val := <-ch // চিরকাল blocked
        fmt.Println(val)
    }()
} // channel close হয়নি

// ✅ Proper cleanup
func proper(done <-chan struct{}) {
    ch := make(chan int)
    go func() {
        select {
        case val := <-ch:
            fmt.Println(val)
        case <-done:
            return
        }
    }()
}
```

---

### 🛠️ Production Debugging Tools

```go
// Race Detector
// go run -race main.go

// Goroutine count
import "runtime"
fmt.Println("Goroutines:", runtime.NumGoroutine())

// pprof for profiling
import _ "net/http/pprof"
go func() {
    http.ListenAndServe("localhost:6060", nil)
}()
// Visit: http://localhost:6060/debug/pprof/
```

---

### 📊 Performance Considerations

| সমস্যা | প্রভাব | সমাধান |
|--------|--------|---------|
| Unbounded goroutines | Memory exhaustion | Worker pool ব্যবহার |
| Large critical section | High contention | Section ছোট রাখুন |
| Wrong buffer size | Deadlock/waste | Load test করে tune করুন |
| Mutex on hot path | Poor performance | RWMutex বা lock-free |

---

### 🎯 Decision Matrix: কখন কী ব্যবহার করবেন

| Scenario | Use | কারণ |
|----------|-----|------|
| Simple counter | `sync.Mutex` | সহজ ও efficient |
| Read-heavy (90%+) | `sync.RWMutex` | Concurrent reads |
| Data passing | `Channel` | Ownership clear |
| Worker pool | `Channel + WaitGroup` | Bounded concurrency |
| Multiple ops | `select` | Non-blocking choice |
| Graceful stop | `context.Context` | Clean cancellation |
| Thread-safe map | `sync.Map` | Optimized |

---

## 🏆 Production Checklist (Deploy করার আগে)

### অবশ্যই করুন ✅

- [ ] `go test -race ./...` দিয়ে test করেছেন
- [ ] Goroutine leak check করেছেন
- [ ] Graceful shutdown implement করেছেন
- [ ] Error handling complete
- [ ] Timeout সব blocking operation-এ
- [ ] `defer wg.Done()` everywhere
- [ ] Sender-ই channel close করছে
- [ ] Critical section minimal
- [ ] Worker pool pattern (bounded goroutines)
- [ ] Monitoring metrics setup

### কখনো করবেন না ❌

- [ ] Mutex copy (সবসময় pointer)
- [ ] Receiver close channel
- [ ] WaitGroup copy
- [ ] `time.After` in loop
- [ ] Unbounded goroutines
- [ ] Race detector skip
- [ ] Blocking I/O in critical section

---

## 📈 Real-World Metrics Monitoring

```go
type AppMetrics struct {
    GoroutineCount int
    ActiveWorkers  int
    QueueSize      int
    ProcessedJobs  int64
    FailedJobs     int64
}

func monitor() {
    ticker := time.NewTicker(10 * time.Second)
    for range ticker.C {
        m := AppMetrics{
            GoroutineCount: runtime.NumGoroutine(),
        }
        log.Printf("Metrics: Goroutines=%d", m.GoroutineCount)
    }
}
```

---

## 🎓 প্রোডাকশন Tips

1. **সবসময় context ব্যবহার করুন** - Cancellation ও timeout-এর জন্য
2. **Worker pool size tune করুন** - CPU core count অনুযায়ী
3. **Channel buffer size test করুন** - Load test দিয়ে
4. **pprof দিয়ে regular profiling করুন** - Memory leak ধরতে
5. **Graceful shutdown mandatory** - Kubernetes/Docker-এ
6. **Monitoring setup করুন** - Goroutine count, error rate track করুন

---

## 📚 এই Document-এ যা শিখলেন

✅ **WaitGroup** - Multiple goroutine coordination  
✅ **Mutex/RWMutex** - Shared data protection  
✅ **Race Detector** - Data race খুঁজে বের করা  
✅ **Select** - Multiple channel operations  
✅ **Fan-In/Fan-Out** - Concurrency patterns  
✅ **Graceful Shutdown** - Clean application stop  
✅ **Production Patterns** - Worker pool, rate limiting  
✅ **Debugging Tools** - pprof, race detector  
✅ **Best Practices** - যা করতে হবে এবং এড়াতে হবে

---

## 🚀 Next Steps

এখন আপনি প্রোডাকশন-ready concurrent Go application লিখতে পারবেন। পরবর্তী topics:

- **Context Package** (Cancellation, Timeout, Deadline)
- **Advanced Patterns** (Circuit breaker, Bulkhead, Retry)
- **Distributed Systems** (gRPC, Message queues)
- **Observability** (Logging, Tracing, Metrics)

---

**মনে রাখবেন:** প্রোডাকশনে performance এবং correctness দুটোই গুরুত্বপূর্ণ। সবসময় race detector দিয়ে test করুন এবং monitoring setup করুন। 🎯