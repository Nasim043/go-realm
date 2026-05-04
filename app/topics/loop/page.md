# Loops in Go

Go has **one loop keyword** — `for`. It covers every loop pattern: traditional, while-style, infinite, and range-based.

---

## 1. All Loop Forms

| Form | Syntax | Equivalent to |
|:---|:---|:---|
| Traditional | `for init; condition; post {}` | C-style `for` |
| While-style | `for condition {}` | `while` |
| Infinite | `for {}` | `while(true)` |
| Range | `for k, v := range x {}` | `foreach` |

```go
// Traditional
for i := 0; i < 5; i++ { fmt.Println(i) }

// While-style
i := 0
for i < 5 { fmt.Println(i); i++ }

// Infinite — must break manually
for {
    fmt.Println("running")
    break
}
```

---

## 2. `range` — Iteration Cheat Sheet

| Target | First value | Second value | Skip with |
|:---|:---|:---|:---|
| `[]T` slice / array | index `int` | element `T` | `_` |
| `map[K]V` | key `K` | value `V` | `_` |
| `string` | byte index `int` | rune `rune` | `_` |
| `chan T` | value `T` | — | n/a |
| `int` *(Go 1.22+)* | `0..n-1` | — | n/a |

```go
// Slice
for i, v := range []string{"a", "b", "c"} {
    fmt.Println(i, v)
}

// Map — order is NOT guaranteed
for k, v := range map[string]int{"x": 1, "y": 2} {
    fmt.Println(k, v)
}

// String — yields runes, not bytes
for i, r := range "Go语!" {
    fmt.Printf("[%d] %c\n", i, r) // index jumps for multi-byte chars
}

// Channel — blocks until value or close
for val := range ch { fmt.Println(val) }

// Integer range (Go 1.22+)
for i := range 5 { fmt.Println(i) } // 0 1 2 3 4
```

---

## 3. Loop Control

```go
// break — exit loop immediately
for i := 0; i < 10; i++ {
    if i == 5 { break }
    fmt.Println(i)
}

// continue — skip rest of current iteration
for i := 0; i < 5; i++ {
    if i%2 == 0 { continue }
    fmt.Println(i) // 1 3
}

// Labeled break — break out of outer loop
outer:
for i := 0; i < 3; i++ {
    for j := 0; j < 3; j++ {
        if j == 1 { break outer }
        fmt.Println(i, j)
    }
}
```

---

## 4. Useful Patterns

### Reverse iteration
```go
s := []int{1, 2, 3, 4, 5}
for i := len(s) - 1; i >= 0; i-- {
    fmt.Println(s[i])
}
```

### Two-pointer loop
```go
for l, r := 0, len(s)-1; l < r; l, r = l+1, r-1 {
    s[l], s[r] = s[r], s[l]
}
```

### Nested loop (2D matrix)
```go
matrix := [][]int{{1, 2}, {3, 4}}
for i, row := range matrix {
    for j, val := range row {
        fmt.Printf("[%d][%d]=%d\n", i, j, val)
    }
}
```

---

## 5. Loop Variable Scoping — Go 1.22 Fix ⭐

### Pre-1.22 Problem
```go
vals := []int{10, 20, 30}
for _, v := range vals {
    go func() {
        fmt.Println(v) // ❌ prints 30, 30, 30 — all share same v
    }()
}

// Pre-1.22 fix: capture explicitly
for _, v := range vals {
    v := v // shadow with new variable
    go func() { fmt.Println(v) }()
}
```

### Go 1.22+ — fixed automatically
```go
for _, v := range vals {
    go func() {
        fmt.Println(v) // ✅ prints 10, 20, 30 — each iteration gets own v
    }()
}
```

> Requires `go 1.22` or higher in `go.mod`.

---

## 6. `defer` Inside a Loop — The Trap ⚠️

```go
// ❌ defer runs AFTER the loop ends (LIFO), not per iteration
for i := 0; i < 3; i++ {
    defer fmt.Println(i) // prints 2, 1, 0 — after main returns!
}

// ✅ Wrap in a function to defer per iteration
for i := 0; i < 3; i++ {
    func(n int) {
        defer fmt.Println(n)
    }(i)
}
```

> **Interview question:** *"What does this print?"* — `defer` in a loop is LIFO and deferred until the surrounding function returns, not the loop iteration.

---

## 7. Common Mistakes ⚠️

| Mistake | Problem | Fix |
|:---|:---|:---|
| Modifying slice while ranging | index/value drift | range over a copy or use index-based loop |
| `defer` inside loop | defers pile up, run at func return | wrap in anonymous func |
| Goroutine capturing loop var (pre-1.22) | all goroutines see same final value | use `go 1.22+` or shadow the variable |
| Map iteration order dependency | random — not guaranteed | sort keys explicitly |
| Forgetting `close(ch)` on channel range | range blocks forever | always close the sending side |

---

## 8. Interview Cheat Sheet

**Q: Does Go have `while` or `do-while`?**
> No. `for condition {}` replaces `while`. There is no `do-while` — simulate with `for { ...; if !cond { break } }`.

**Q: What does `range` return for a string?**
> The byte index and a `rune` (Unicode code point). Index may skip values for multi-byte characters — `'é'` is 2 bytes, so the next index jumps by 2.

**Q: What was the Go 1.22 loop variable change?**
> Before 1.22, all iterations of a `for` loop shared the same loop variable — closures and goroutines would capture the final value. From 1.22, each iteration has its own variable.

**Q: What is the output of `defer` inside a `for` loop?**
> Defers accumulate and all run in LIFO order when the surrounding **function** returns — not per iteration. `for i:=0;i<3;i++ { defer fmt.Println(i) }` prints `2 1 0` after `main` returns.

**Q: How do you range over an integer in Go 1.22+?**
> `for i := range n {}` — iterates `0` through `n-1`. Removes the need for `for i := 0; i < n; i++` in many cases.
