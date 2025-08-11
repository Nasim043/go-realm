---
title: Chi Middleware in Go
description: Learn how to create and use middleware with the Chi router in Go
---

# Chi Middleware in Go

[Chi](https://github.com/go-chi/chi) is a lightweight, composable router for Go HTTP services. It provides a powerful middleware system that's both flexible and easy to use. This guide covers how to work with middleware in Chi.

## Getting Started with Chi Middleware

First, install Chi if you haven't already:

```bash
go get -u github.com/go-chi/chi/v5
```

## Basic Middleware in Chi

Chi's middleware follows the standard `func(http.Handler) http.Handler` signature, making it compatible with most Go web frameworks.

### Creating a Basic Middleware

```go
package main

import (
    "fmt"
    "net/http"
    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

func exampleMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Before request
        fmt.Println("Before handler")
        
        // Call the next handler
        next.ServeHTTP(w, r)
        
        // After request
        fmt.Println("After handler")
    })
}
```

### Using Middleware in Chi

```go
func main() {
    r := chi.NewRouter()
    
    // Apply middleware globally
    r.Use(exampleMiddleware)
    
    r.Get("/", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Hello, Chi!"))
    })
    
    http.ListenAndServe(":3000", r)
}
```

## Built-in Middleware

Chi comes with several useful middleware:

```go
func main() {
    r := chi.NewRouter()
    
    // A good base middleware stack
    r.Use(middleware.RequestID)
    r.Use(middleware.RealIP)
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    
    // Set a timeout on the request context (default 60s)
    r.Use(middleware.Timeout(60 * time.Second))
    
    // Basic CORS
    r.Use(cors.Handler(cors.Options{
        AllowedOrigins:   []string{"https://*", "http://*"},
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
        AllowCredentials: false,
        MaxAge:           300, // Maximum value not ignored by any of major browsers
    }))
    
    // Your routes here...
}
```

## Middleware Groups

Chi allows you to group routes and apply middleware to specific groups:

```go
func main() {
    r := chi.NewRouter()
    
    // Public routes
    r.Group(func(r chi.Router) {
        r.Get("/", handleIndex)
        r.Get("/about", handleAbout)
    })
    
    // Protected routes
    r.Group(func(r chi.Router) {
        // Apply authentication middleware to this group
        r.Use(authMiddleware)
        
        r.Get("/dashboard", handleDashboard)
        r.Get("/settings", handleSettings)
    })
    
    // Admin routes with admin middleware
    r.Group(func(r chi.Router) {
        r.Use(adminOnlyMiddleware)
        
        r.Get("/admin", handleAdminDashboard)
        r.Get("/admin/users", handleAdminUsers)
    })
}
```

## Route-Specific Middleware

You can also apply middleware to specific routes:

```go
func main() {
    r := chi.NewRouter()
    
    // Apply middleware to a specific route
    r.With(loggingMiddleware).Get("/debug", handleDebug)
    
    // Multiple middleware
    r.With(rateLimit, authMiddleware).Post("/api/upload", handleUpload)
}
```

## Creating Parameterized Middleware

You can create middleware that accepts parameters:

```go
func requirePermission(permission string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            user := r.Context().Value("user").(*User)
            if !user.HasPermission(permission) {
                http.Error(w, "Forbidden", http.StatusForbidden)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
}

// Usage:
// r.With(requirePermission("admin")).Get("/admin", handleAdmin)
```

## Middleware Chaining

Chi makes it easy to chain middleware together:

```go
func main() {
    r := chi.NewRouter()
    
    // Chain multiple middleware
    r.With(
        middleware.Logger,
        middleware.Recoverer,
        myCustomMiddleware,
    ).Get("/api/secure", handleSecureEndpoint)
}
```

## Context and Middleware

Chi's middleware system works well with Go's context package for request-scoped values:

```go
func userMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Get user from authentication
        user, err := getUserFromRequest(r)
        if err != nil {
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }
        
        // Add user to context
        ctx := context.WithValue(r.Context(), "user", user)
        
        // Call the next handler with the new context
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// In your handler:
func handleUserProfile(w http.ResponseWriter, r *http.Request) {
    user := r.Context().Value("user").(*User)
    // Use the user...
}
```

## Error Handling Middleware

Create middleware to handle errors consistently:

```go
type errorResponse struct {
    Error   string `json:"error"`
    Message string `json:"message"`
}

func errorHandlingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Create a response writer that captures the status code
        rw := &responseWriter{ResponseWriter: w, status: http.StatusOK}
        
        // Handle panics
        defer func() {
            if r := recover(); r != nil {
                log.Printf("Recovered from panic: %v", r)
                w.WriteHeader(http.StatusInternalServerError)
                json.NewEncoder(w).Encode(errorResponse{
                    Error:   "internal_server_error",
                    Message: "An internal server error occurred",
                })
            }
            
            // Log errors (4xx and 5xx status codes)
            if rw.status >= 400 {
                log.Printf("Error: %d %s %s", rw.status, r.Method, r.URL.Path)
            }
        }()
        
        next.ServeHTTP(rw, r)
    })
}

type responseWriter struct {
    http.ResponseWriter
    status int
}

func (rw *responseWriter) WriteHeader(code int) {
    rw.status = code
    rw.ResponseWriter.WriteHeader(code)
}

// Usage:
// r.Use(errorHandlingMiddleware)
```

## Testing Middleware

Testing middleware is straightforward with Go's testing package:

```go
func TestAuthMiddleware(t *testing.T) {
    // Create a test request
    req := httptest.NewRequest("GET", "/protected", nil)
    
    // Create a response recorder
    rr := httptest.NewRecorder()
    
    // Create a test handler that will be wrapped by our middleware
    testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
    })
    
    // Create the middleware and call ServeHTTP
    handler := authMiddleware(testHandler)
    handler.ServeHTTP(rr, req)
    
    // Check the status code
    if status := rr.Code; status != http.StatusOK {
        t.Errorf("handler returned wrong status code: got %v want %v", 
            status, http.StatusOK)
    }
    
    // Test unauthorized case
    req = httptest.NewRequest("GET", "/protected", nil)
    rr = httptest.NewRecorder()
    
    handler.ServeHTTP(rr, req)
    
    if status := rr.Code; status != http.StatusUnauthorized {
        t.Errorf("expected unauthorized status code, got %v", status)
    }
}
```

## Best Practices for Chi Middleware

1. **Keep middleware focused**: Each middleware should have a single responsibility.
2. **Use context for request-scoped values**: Pass data between middleware using `context.Context`.
3. **Handle errors gracefully**: Always handle errors and don't let them panic.
4. **Be mindful of performance**: Middleware runs on every request, so keep it efficient.
5. **Document your middleware**: Add clear documentation for any custom middleware you create.
6. **Test your middleware**: Write tests to ensure your middleware works as expected.
7. **Order matters**: Middleware is executed in the order it's applied.
8. **Use built-in middleware when possible**: Chi provides many useful middleware out of the box.

## Common Pitfalls

1. **Modifying the response after it's been written**: Once the response is sent to the client, you can't modify it.
2. **Forgetting to call next.ServeHTTP()**: This will prevent the next handler in the chain from being called.
3. **Not handling panics**: Always recover from panics in your middleware.
4. **Memory leaks**: Be careful with goroutines in middleware to avoid leaks.
5. **Context value collisions**: Use custom types for context keys to avoid collisions.

## Next Steps

Now that you understand Chi middleware, you might want to explore:

- [Middleware Chaining] _coming soon_
<!-- (./middleware-chaining) -->
- [Advanced Middleware Patterns] _coming soon_
<!-- (./advanced-middleware) -->
- [Building RESTful APIs with Chi] _coming soon_
<!-- (./rest-apis) -->

## Additional Resources

- [Chi GitHub Repository](https://github.com/go-chi/chi)
- [Chi Middleware Package](https://pkg.go.dev/github.com/go-chi/chi/v5/middleware)
- [Go Blog: Context and Cancellation](https://blog.golang.org/context)
- [Go by Example: Middleware](https://gobyexample.com/middleware)
