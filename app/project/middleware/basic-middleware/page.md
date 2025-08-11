---
title: Basic Middleware in Go
description: Learn how to create and use basic middleware in Go's net/http package
---

# Basic Middleware in Go

Middleware in Go is a powerful pattern that allows you to separate cross-cutting concerns from your application's core logic. This guide covers the fundamentals of creating and using middleware with Go's standard `net/http` package.

## What is Middleware?

Middleware is a function that takes an `http.Handler` and returns a new `http.Handler`. It sits between the web server and your application handlers, allowing you to process requests before they reach your handlers and responses before they're sent back to the client.

## Basic Middleware Structure

Here's the most basic form of middleware in Go:

```go
func exampleMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Code to execute before calling the next handler
        
        next.ServeHTTP(w, r) // Call the next handler
        
        // Code to execute after the next handler returns
    })
}
```

## Creating a Simple Middleware

Let's create a simple logging middleware that logs each request:

```go
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        // Wrap the response writer to capture the status code
        lrw := &loggingResponseWriter{w, http.StatusOK}
        
        next.ServeHTTP(lrw, r)
        
        // Log the request details
        log.Printf(
            "%s %s %d %s",
            r.Method,
            r.URL.Path,
            lrw.statusCode,
            time.Since(start),
        )
    })
}

type loggingResponseWriter struct {
    http.ResponseWriter
    statusCode int
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
    lrw.statusCode = code
    lrw.ResponseWriter.WriteHeader(code)
}
```

## Using Middleware

To use middleware, wrap your handler with it:

```go
func main() {
    mux := http.NewServeMux()
    
    // Your handler
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Hello, World!"))
    })
    
    // Apply middleware to all routes
    http.ListenAndServe(":8080", loggingMiddleware(mux))
}
```

## Common Middleware Patterns

### 1. Authentication Middleware

```go
func authMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := r.Header.Get("Authorization")
        if token != "valid-token" {
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }
        next.ServeHTTP(w, r)
    })
}
```

### 2. CORS Middleware

```go
func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        // Handle preflight
        if r.Method == "OPTIONS" {
            return
        }
        
        next.ServeHTTP(w, r)
    })
}
```

### 3. Rate Limiting Middleware

```go
func rateLimitMiddleware(next http.Handler) http.Handler {
    var (
        limit = 100
        window = time.Minute
        mu    sync.Mutex
        requests = make(map[string]int)
    )
    
    // Clean up old entries
    go func() {
        for {
            time.Sleep(window)
            mu.Lock()
            requests = make(map[string]int)
            mu.Unlock()
        }
    }()
    
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ip := r.RemoteAddr
        
        mu.Lock()
        defer mu.Unlock()
        
        requests[ip]++
        
        if requests[ip] > limit {
            http.Error(w, "Too many requests", http.StatusTooManyRequests)
            return
        }
        
        next.ServeHTTP(w, r)
    })
}
```

## Middleware with State

You can create middleware that accepts configuration:

```go
func newTimeoutMiddleware(timeout time.Duration) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            ctx, cancel := context.WithTimeout(r.Context(), timeout)
            defer cancel()
            
            // Create a response writer that supports http.Pusher
            r = r.WithContext(ctx)
            
            done := make(chan struct{})
            
            go func() {
                next.ServeHTTP(w, r)
                close(done)
            }()
            
            select {
            case <-done:
                return
            case <-ctx.Done():
                w.WriteHeader(http.StatusRequestTimeout)
            }
        })
    }
}

// Usage:
// timeout := newTimeoutMiddleware(30 * time.Second)
// http.Handle("/", timeout(yourHandler))
```

## Best Practices

1. **Keep middleware focused**: Each middleware should do one thing well.
2. **Order matters**: Middleware is executed in the order it's applied.
3. **Use context for request-scoped values**: Pass data between middleware using `context.Context`.
4. **Handle errors properly**: Always handle errors and don't let them panic.
5. **Be mindful of performance**: Middleware runs on every request, so keep it efficient.

## Next Steps

Now that you understand basic middleware, you might want to explore:

- [Middleware with Chi Router](./chi-middleware)
- [Middleware Chaining] _coming soon_
<!-- (./middleware-chaining) -->
- [Advanced Middleware Patterns] _coming soon_
<!-- (./advanced-middleware) -->