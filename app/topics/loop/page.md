# Looping in Go

Go has **one loop keyword** — `for` — which serves as the foundation for all looping constructs. It is powerful enough to implement traditional counting loops, while-style loops, infinite loops, and range-based iteration over various data structures like **slices**, **maps**, **strings**, and **channels**.

---

## 1. Loop Forms in Go

| Loop Type       | Syntax                              | Description                                                  |
| --------------- | ----------------------------------- | ------------------------------------------------------------ |
| **Traditional** | `for init; condition; post { ... }` | Classic C-style loop with initializer, condition, and update |
| **While-style** | `for condition { ... }`             | Runs while condition is true                                 |
| **Infinite**    | `for { ... }`                       | Runs indefinitely until a `break`                            |
| **Range-based** | `for key, val := range collection`  | Iterate over slices, arrays, maps, strings, or channels      |

---

## 2. Standard Loop Examples

#### Traditional Loop

```go
for i := 0; i < 5; i++ {
    fmt.Println(i)
}
```

#### While-style Loop

```go
i := 0
for i < 5 {
    fmt.Println(i)
    i++
}
```

#### Infinite Loop

```go
for {
    fmt.Println("Looping forever")
    break
}
```

---

## 3. Range-based Loop Examples

#### Slice Iteration

```go
items := []string{"apple", "banana", "cherry"}
for i, item := range items {
    fmt.Printf("%d: %s\n", i, item)
}
```

#### Map Iteration

```go
grades := map[string]int{"Alice": 90, "Bob": 85, "Eve": 92}
for name, score := range grades {
    fmt.Printf("%s scored %d\n", name, score)
}
```

_Note: Map iteration order is **not guaranteed**._


#### String Iteration (by rune)

```go
text := "Go语!"
for i, r := range text {
    fmt.Printf("Index: %d, Rune: %c\n", i, r)
}
```

_Iterates over Unicode code points (runes), not bytes._

---

### Channel Iteration

```go
ch := make(chan int)

go func() {
    for i := 1; i <= 3; i++ {
        ch <- i
    }
    close(ch)
}()

for val := range ch {
    fmt.Println("Received:", val)
}
```

_Useful for reading from channels until they're closed._

---

## 4. Advanced Patterns & Loop Styles

### Loop with Multiple Variables

```go
for i, j := 0, 10; i < j; i, j = i+1, j-1 {
    fmt.Printf("i = %d, j = %d\n", i, j)
}
```

---

### Loop with Manual Condition

```go
sum := 0
i := 1
for {
    sum += i
    if sum > 20 {
        break
    }
    i++
}
fmt.Println("Stopped at sum:", sum)
```

---

### Filtering Inside Loop

```go
nums := []int{1, 2, 3, 4, 5}
for _, n := range nums {
    if n%2 == 0 {
        continue
    }
    fmt.Println("Odd number:", n)
}
```

---

### Loop with `goto` (rare use case)

```go
i := 0
Loop:
    if i >= 3 {
        return
    }
    fmt.Println("goto loop:", i)
    i++
    goto Loop
```

---

## ⚠️ 5. Loop Variable Scoping in Go 1.22+

### ❌ The Pre-1.22 Problem

Loop variables in closures used to be **shared**, often causing all goroutines to capture the same final value.

```go
vals := []int{10, 20, 30}
for _, v := range vals {
    go func() {
        fmt.Println(v) // Might print: 30, 30, 30
    }()
}
```

---

### ✅ Go 1.22 Fix

Each iteration now has its own scoped copy of the loop variable.

```go
for _, v := range vals {
    go func() {
        fmt.Println(v) // Prints: 10, 20, 30
    }()
}
```

> Applies only if the module specifies `go 1.22` or higher.

---

## 6. Safe Parallel Loop (Goroutines)

```go
func compute(n int) int {
    return n * n
}

func processItems(items []int) {
    results := make(chan int, len(items))
    for _, item := range items {
        go func(val int) {
            results <- compute(val)
        }(item)
    }

    for i := 0; i < len(items); i++ {
        fmt.Println(<-results)
    }
}
```

---

## 7. Additional Looping Techniques

### Loop with External Iterators

```go
i := 0
for i < len(items) {
    fmt.Println(items[i])
    i++
}
```

---

### Reverse Iteration

```go
for i := len(items) - 1; i >= 0; i-- {
    fmt.Println(items[i])
}
```

---

### Nested Loops

```go
matrix := [][]int{
    {1, 2},
    {3, 4},
}
for i, row := range matrix {
    for j, val := range row {
        fmt.Printf("matrix[%d][%d] = %d\n", i, j, val)
    }
}
```

---

🧩 8. Summary

| Feature                                    | Support in Go            |
| ------------------------------------------ | ------------------------ |
| Traditional, while, infinite               | ✅ Supported via `for`   |
| Range over collections                     | ✅ idiomatic             |
| Loop control (`break`, `continue`, `goto`) | ✅ available             |
| Loop variable scoping (Go 1.22)            | ✅ safer for concurrency |
| Nested/multi-var/custom iteration          | ✅ fully supported       |

---

## 🧠 Quick Quiz

1. What is the difference between iterating a string using `range` vs indexing?
2. Why was the loop variable fix in Go 1.22 important for concurrency?
3. What is the output of this loop?

```go
for i := 0; i < 3; i++ {
    defer fmt.Println(i)
}
```

> - (Answer: 2, 1, 0 due to LIFO order of defer)

## ✅ Final Thoughts

- Go’s `for` is simple but remarkably flexible.
- Use `range` wherever possible for idiomatic and concise code.
- Be aware of scoping rules, especially in concurrent loops.
- The Go 1.22 update simplifies concurrent goroutine patterns dramatically.
