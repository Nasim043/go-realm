## 🍀 Go Channel

Go-তে **Concurrency** হ্যান্ডেল করার জন্য সবচেয়ে শক্তিশালী টুল হলো **Channel**।

Goroutine গুলো স্বাধীনভাবে চলে, তাই তাদের মধ্যে **Safe Data Transfer** এবং **Synchronization** জন্য দরকার হয় একটি **safe communication mechanism**।

**Channel** হচ্ছে সেই নিরাপদ পাইপলাইন, যেখানে:

* এক Goroutine তথ্য পাঠায় (`chan <-`)
* অন্য Goroutine তথ্য গ্রহণ করে (`<- chan`)

**channel** দিয়ে গোরুটিনগুলো একে অপরের সাথে "কথা বলে"।

> **Go Philosophy:**
> *"Do not communicate by sharing memory; instead, share memory by communicating."*

---

## ১. Channel-এর ধরণ (Types of Channels)

Channel প্রধানত দুই ধরণের হয়। এদের আচরণ বোঝা প্রোডাকশন কোডের জন্য জরুরি।

### ক. Unbuffered Channel (Synchronous)

এতে কোনো ডেটা জমা রাখার ক্ষমতা নেই।

* **Send:** Sender ডেটা পাঠানোর পর **Receiver** সেটি গ্রহণ না করা পর্যন্ত অপেক্ষা করে (Block হয়)।
* **Receive:** Receiver অপেক্ষা করে যতক্ষণ না Sender ডেটা পাঠায়।
* **ব্যবহার:** যখন আপনি নিশ্চিত করতে চান যে ডেটা প্রসেস হওয়ার পরই পরের ধাপে যাবে (Perfect Synchronization)।

**উদাহরণ - Unbuffered Channel:**

```go
package main
import (
    "fmt"
    "time"
)

func main() {
    ch := make(chan string) // Unbuffered channel
    
    go func() {
        fmt.Println("Goroutine: Sending data...")
        ch <- "Hello" // এখানে block হবে যতক্ষণ না main goroutine receive করে
        fmt.Println("Goroutine: Data sent!")
    }()
    
    time.Sleep(2 * time.Second) // ২ সেকেন্ড অপেক্ষা করি
    fmt.Println("Main: Receiving data...")
    msg := <-ch // এখন goroutine unblock হবে
    fmt.Println("Main: Received:", msg)
}

// Output:
// Goroutine: Sending data...
// (2 seconds pause)
// Main: Receiving data...
// Main: Received: Hello
// Goroutine: Data sent!
```

### খ. Buffered Channel (Asynchronous)

এতে নির্দিষ্ট পরিমাণ ডেটা জমা রাখার ক্ষমতা (Capacity) থাকে।

> Buffer = Queue = Channel-এর ভেতরে memory।
* **Send:** যতক্ষণ বাফার (Buffer) পূর্ণ না হয়, ততক্ষণ Sender ব্লক হয় না।
* **Receive:** যতক্ষণ বাফার খালি না হয়, ততক্ষণ Receiver ব্লক হয় না।
* **ব্যবহার:** যখন Sender এবং Receiver-এর গতির পার্থক্য থাকে (Rate Limiting, Job Queue)।

**উদাহরণ - Buffered Channel:**

```go
package main
import "fmt"

func main() {
    ch := make(chan int, 3) // Capacity 3
    
    // Buffer পূর্ণ না হওয়া পর্যন্ত block হবে না
    ch <- 1
    fmt.Println("Sent: 1")
    ch <- 2
    fmt.Println("Sent: 2")
    ch <- 3
    fmt.Println("Sent: 3")
    
    // ch <- 4 // এটা করলে deadlock হবে, কারণ buffer পূর্ণ
    
    // Receive করি
    fmt.Println("Received:", <-ch)
    fmt.Println("Received:", <-ch)
    
    // এখন আবার send করা যাবে
    ch <- 4
    fmt.Println("Sent: 4")
    
    fmt.Println("Received:", <-ch)
    fmt.Println("Received:", <-ch)
}

// Output:
// Sent: 1
// Sent: 2
// Sent: 3
// Received: 1
// Received: 2
// Sent: 4
// Received: 3
// Received: 4
```

### তুলনামূলক সারণি (Comparison Table)

| বৈশিষ্ট্য | Unbuffered Channel | Buffered Channel |
|---------|-------------------|------------------|
| **Capacity** | 0 (কোনো buffer নেই) | নির্দিষ্ট সংখ্যা (যেমন: 5, 10) |
| **Declaration** | `make(chan int)` | `make(chan int, 5)` |
| **Send Operation** | সবসময় block করে যতক্ষণ না receive হয় | Buffer full না হলে block করে না |
| **Receive Operation** | সবসময় block করে যতক্ষণ না send হয় | Buffer empty না হলে block করে না |
| **Synchronization** | Perfect sync (Handshake) | Loose coupling |
| **Performance** | Slower (blocking) | Faster (non-blocking until full) |
| **Use Case** | Request-Response, Lock-step execution | Job Queue, Rate Limiting, Burst handling |
| **Deadlock Risk** | বেশি (যদি receiver না থাকে) | কম (buffer-এ জমা রাখতে পারে) |
| **Memory Usage** | কম | বেশি (buffer size অনুযায়ী) |

### বাস্তব ব্যবহার (Real-world Examples)

**Unbuffered Channel ব্যবহার:**
- Database transaction-এর পর confirmation
- API request-response pattern
- Critical data processing যেখানে acknowledgment জরুরি

**Buffered Channel ব্যবহার:**
- Log processing system (burst of logs)
- Worker pool pattern
- Rate limiting APIs
- Event broadcasting

---

## ২. Channel ডিক্লারেশন ও সিনট্যাক্স

```go
// 1. Unbuffered Channel
ch := make(chan int)

// 2. Buffered Channel (Capacity 5)
bufCh := make(chan string, 5)

// 3. Nil Channel (Zero Value)
var nilCh chan int // এটি ব্যবহার করলে সবসময় block করে (Select-এ কাজে লাগে)

```

---
## ৩. Unidirectional Channels (একমুখী চ্যানেল)

প্রোডাকশন কোডে ফাংশনের আর্গুমেন্ট হিসেবে চ্যানেল পাঠানোর সময় আমরা **Type Safety**-র জন্য দিক নির্দিষ্ট করে দিই। এতে ভুল করে Sender থেকে রিড বা Receiver-এ রাইট করা যায় না।

### সিনট্যাক্স:

* `chan<- Type` : **Send Only** (শুধু ডেটা পাঠানো যাবে)
* `<-chan Type` : **Receive Only** (শুধু ডেটা রিসিভ করা যাবে)

### তুলনামূলক সারণি (Unidirectional Channels)

| ধরণ | সিনট্যাক্স | Operation | Compile Error |
|-----|----------|-----------|---------------|
| **Bidirectional** | `chan int` | Send & Receive উভয়ই | কোনো restriction নেই |
| **Send Only** | `chan<- int` | শুধু Send (`ch <- value`) | Receive করলে error |
| **Receive Only** | `<-chan int` | শুধু Receive (`value := <-ch`) | Send করলে error |

### উদাহরণ ১: Basic Producer-Consumer

```go
package main
import "fmt"

// এই ফাংশন শুধু চ্যানেলে ডেটা পাঠাতে পারবে (Write Only)
func producer(out chan<- int) {
    for i := 0; i < 5; i++ {
        out <- i
    }
    close(out) // Sender সবসময় চ্যানেল ক্লোজ করে
}

// এই ফাংশন শুধু চ্যানেল থেকে ডেটা পড়তে পারবে (Read Only)
func consumer(in <-chan int) {
    for v := range in {
        fmt.Println("Received:", v)
    }
}

func main() {
    ch := make(chan int)
    go producer(ch) // bidirectional channel কাস্ট হয়ে unidirectional হয়ে যায়
    consumer(ch)
}

// Output:
// Received: 0
// Received: 1
// Received: 2
// Received: 3
// Received: 4
```

### উদাহরণ ২: Compile-Time Type Safety

```go
package main
import "fmt"

func sendOnly(ch chan<- string) {
    ch <- "Hello"
    // val := <-ch // ❌ Compile Error: cannot receive from send-only channel
}

func receiveOnly(ch <-chan string) {
    msg := <-ch
    fmt.Println(msg)
    // ch <- "World" // ❌ Compile Error: cannot send to receive-only channel
}

func main() {
    ch := make(chan string, 1)
    sendOnly(ch)
    receiveOnly(ch)
}

// Output:
// Hello
```

### উদাহরণ ৩: Real-world Pipeline Pattern

```go
package main
import "fmt"

// Stage 1: Generate numbers
func generate(out chan<- int) {
    for i := 1; i <= 5; i++ {
        out <- i
    }
    close(out)
}

// Stage 2: Square the numbers
func square(in <-chan int, out chan<- int) {
    for num := range in {
        out <- num * num
    }
    close(out)
}

// Stage 3: Print results
func print(in <-chan int) {
    for result := range in {
        fmt.Println("Result:", result)
    }
}

func main() {
    // Pipeline: generate → square → print
    ch1 := make(chan int)
    ch2 := make(chan int)
    
    go generate(ch1)
    go square(ch1, ch2)
    print(ch2)
}

// Output:
// Result: 1
// Result: 4
// Result: 9
// Result: 16
// Result: 25
```

### কেন Unidirectional Channel ব্যবহার করবেন?

| সুবিধা | বর্ণনা |
|-------|--------|
| **Type Safety** | Compile-time error পাবেন যদি ভুল operation করেন |
| **Clear Intent** | Code পড়লেই বোঝা যায় কে send করবে, কে receive করবে |
| **Prevent Bugs** | ভুল করে close করা বা duplicate send/receive এড়ানো যায় |
| **Better Design** | Single Responsibility Principle follow করে |

### Best Practices:

1. **সবসময় Producer function-এ `chan<-` ব্যবহার করুন** (send-only)
2. **সবসময় Consumer function-এ `<-chan` ব্যবহার করুন** (receive-only)
3. **শুধুমাত্র Sender-ই channel close করবে** 🔥, receiver কখনো নয়
4. **Main/Orchestrator function-এ bidirectional channel রাখুন**, তারপর pass করার সময় cast হয়ে যাবে

---

## ৪. Channel বন্ধ করা (Closing) এবং Safety

### বন্ধ করা কেন দরকার?

♦️ বোঝাতে যে **আর ডেটা আসবে না**।

### গোল্ডেন রুলস (Golden Rules of Closing):

1. **শুধুমাত্র Sender চ্যানেল ক্লোজ করবে।** Receiver কখনো চ্যানেল ক্লোজ করবে না।
2. ক্লোজড চ্যানেলে **Send** করলে `panic` হবে।
3. 🔥ক্লোজড চ্যানেল থেকে **Receive** করলে সেটি আর ব্লক হবে না, বরং সেই টাইপের `Zero Value` রিটার্ন করবে।🔥

```go
close(ch)
```

Close করা মানে:

* আর **send** করা যাবে না (send করলে panic)
* কিন্তু receive করা যাবে (zero-value + ok flag)

### নিরাপদে রিড করার পদ্ধতি (`val, ok` idiom):

```go
v, ok := <-ch
if !ok {
    fmt.Println("Channel is closed and empty!")
    return
}
fmt.Println("Value:", v)

```

### Channel-এর ওপর loop করা (for-range):

```go
for v := range ch {
    fmt.Println(v)
}
```

`range` channel close হওয়া পর্যন্ত চলবে।

### Channel-এর আকার দেখা

```go
len(ch) // buffer এ কয়টা item আছে
cap(ch) // buffer capacity
```

উপকারী debugging এ।

#### 10 সংখ্যা পাঠাও এবং প্রিন্ট করো

```go
package main
import "fmt"

func main() {
    ch := make(chan int)

    go func() {
        for i := 1; i <= 10; i++ {
            ch <- i
        }
        close(ch)
    }()

    for v := range ch {
        fmt.Println(v)
    }
}
```

---

## ৫. Nil Channel-এর ব্যবহার

`nil` চ্যানেল রিড বা রাইট করলে গোরুটিন **স্থায়ীভাবে ব্লক** হয়ে যায়। এটা শুনতে খারাপ লাগলেও `select` স্টেটমেন্টে কোনো নির্দিষ্ট `case` কে সাময়িকভাবে নিষ্ক্রিয় (disable) করতে এটি খুব কাজের।

```go
// ধরুন ch1 ক্লোজ হয়ে গেছে, আমরা চাই না ch1 থেকে আর রিড হোক
select {
case v, ok := <-ch1:
    if !ok {
        ch1 = nil // ch1 এখন nil, এই case আর কখনো এক্সিকিউট হবে না
    } else {
        fmt.Println(v)
    }
case v := <-ch2:
    fmt.Println(v)
}

```

---

## ৬. Production Patterns (প্রোডাকশন প্যাটার্নস)

### প্যাটার্ন ১: Worker Pool (কনকারেন্সি কন্ট্রোল)

একসাথে হাজার হাজার গোরুটিন না চালিয়ে নির্দিষ্ট সংখ্যক (যেমন ৫টি) গোরুটিন দিয়ে কাজ করানো।

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Println("Worker", id, "started job", j)
        time.Sleep(time.Second) // ভারী কাজ সিমুলেশন
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)

    // ৩টি Worker চালু করলাম
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }

    // ৫টি কাজ পাঠালাম
    for j := 1; j <= 5; j++ {
        jobs <- j
    }
    close(jobs) // কাজ পাঠানো শেষ

    // রেজাল্ট সংগ্রহ
    for a := 1; a <= 5; a++ {
        <-results
    }
}

```

### প্যাটার্ন ২: Graceful Shutdown (Done Channel)

কোনো প্রসেসকে মাঝপথে থামানোর জন্য।

```go
func doWork(done <-chan bool) {
    for {
        select {
        case <-done:
            fmt.Println("Stopping work...")
            return
        default:
            fmt.Println("Working...")
            time.Sleep(500 * time.Millisecond)
        }
    }
}

func main() {
    done := make(chan bool)
    go doWork(done)

    time.Sleep(2 * time.Second)
    close(done) // সিগন্যাল পাঠানো হলো থামার জন্য
    time.Sleep(1 * time.Second)
}

```

---

## ৮. Common Pitfalls (সাধারণ ভুল ও সমাধান)

| পরিস্থিতি | ফলাফল | সমাধান |
| --- | --- | --- |
| **Send on Closed Channel** | **Panic** | নিশ্চিত হোন চ্যানেল ক্লোজ করার পর কেউ যেন আর রাইট না করে। `sync.Once` ব্যবহার করতে পারেন ক্লোজিংয়ের জন্য। |
| **Close on Closed Channel** | **Panic** | চ্যানেল মাত্র একবারই ক্লোজ করতে হয়। |
| **Receive from Nil Channel** | **Block Forever** | `nil` চ্যানেল সাবধানে ব্যবহার করুন। |
| **Send to Nil Channel** | **Block Forever** | চ্যানেল ইনিশিয়ালাইজ (`make`) করা হয়েছে কি না চেক করুন। |
| **Unbuffered Channel with no receiver** | **Deadlock** | নিশ্চিত করুন অন্য গোরুটিন রেডি আছে অথবা Buffered Channel ব্যবহার করুন। |

---

| ভুল                            | ফলাফল         | কেন                           |
| ------------------------------ | ------------- | ----------------------------- |
| Receive আছে কিন্তু Send নেই    | Deadlock      | কেউ data পাঠাচ্ছে না          |
| Send আছে কিন্তু Receive নেই    | Deadlock      | channel overflow (unbuffered) |
| Buffered full, but no receiver | Deadlock      | buffer পূর্ণ হয়ে গেছে         |
| Close করার পর send             | Panic         | বন্ধ channel-এ লেখা যায় না    |
| Close না করে range করলে        | Infinite wait | কখনো close ধরবে না            |

## 📝 একনজরে মনে রাখার মতো (Cheat Sheet)

1. **ইনিশিয়ালাইজেশন:** `make(chan type)` ছাড়া চ্যানেল ব্যবহার করলে সেটি `nil` থাকে এবং কাজ করে না।
2. **মালিকানা (Ownership):** যে গোরুটিন চ্যানেলে ডেটা পাঠায় (Send), সেই গোরুটিন-ই চ্যানেলটি `close` করবে।
3. **লুপ:** `for range` লুপ চ্যানেল ক্লোজ না হওয়া পর্যন্ত চলতেই থাকে। তাই Sender-কে অবশ্যই কাজ শেষে `close()` কল করতে হবে, নতুবা Receiver `deadlock` খাবে।
4. **বাফার:** বাফারড চ্যানেল পূর্ণ না হওয়া পর্যন্ত ব্লক হয় না। পারফরম্যান্স বাড়াতে সঠিক সাইজের বাফার ব্যবহার করুন।
5. **Select:** মাল্টিপল চ্যানেল হ্যান্ডলিং এবং টাইমআউট লজিকের জন্য `select` হলো সেরা উপায়।