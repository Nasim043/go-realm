# Database Seeding: Laravel to Go Production Guide

## 🎯 For Laravel Developers

This guide covers **essential patterns and best practices** for building production-grade database seeding in Go. Focus on **what's different**, **what's critical**, and **what you must know**.

---

## 📊 Laravel vs Go: Key Differences

| Aspect | Laravel | Go | Why It Matters |
|--------|---------|----|----|
| **Error Handling** | Exceptions | Explicit `error` returns | Handle errors at every DB call |
| **Transactions** | `DB::transaction()` | `client.Tx(ctx)` + manual rollback | You control commit/rollback |
| **Dependencies** | Auto-injected | Constructor injection | Pass dependencies explicitly |
| **Context** | Not needed | Required everywhere | Enables cancellation & timeouts |
| **Execution** | `php artisan db:seed` | Build your own CLI | No framework magic |
| **Validation** | Manual | Build into interface | Verify seeding succeeded |

### Critical Mindset Shifts

❌ **Stop Thinking:**
- "Laravel will handle it"
- "Just throw an exception"
- "The container will inject this"
- "DB calls just work"

✅ **Start Thinking:**
- "Did this return an error?"
- "Should I use context with timeout?"
- "What if the transaction fails?"
- "Is this idempotent?"

---

## 🏗️ Essential Architecture

### 1. The Seeder Interface (Must-Know Pattern)

**Laravel Way:**
```php
class UserSeeder extends Seeder {
    public function run() {
        User::create(['email' => 'admin@app.com']);
    }
}
```

**Go Way:**
```go
// Define the contract first
type Seeder interface {
    Name() string
    Seed(ctx context.Context, client *ent.Client) error
    Validate(ctx context.Context, client *ent.Client) error
}

// Implement it
type UserSeeder struct {
    log logger.Logger
}

func (s *UserSeeder) Name() string {
    return "UserSeeder"
}

func (s *UserSeeder) Seed(ctx context.Context, client *ent.Client) error {
    // Must handle every error
    exists, err := client.User.Query().
        Where(user.EmailEQ("admin@app.com")).
        Exist(ctx)
    
    if err != nil {
        return fmt.Errorf("check failed: %w", err)
    }
    
    if exists {
        return nil // Already seeded
    }
    
    _, err = client.User.Create().
        SetEmail("admin@app.com").
        Save(ctx)
    
    return err // Return error or nil
}

func (s *UserSeeder) Validate(ctx context.Context, client *ent.Client) error {
    count, err := client.User.Query().Count(ctx)
    if err != nil {
        return err
    }
    
    if count == 0 {
        return fmt.Errorf("no users found")
    }
    
    return nil
}
```

**Key Differences:**
- ✅ Explicit error handling at every step
- ✅ Context passed to all DB operations
- ✅ Idempotency built-in (check before create)
- ✅ Validation as separate method
- ✅ Dependency injection via constructor

---

## 🔑 Production Best Practices

### 1. Idempotency is Non-Negotiable

**Bad (Will fail on second run):**
```go
func (s *Seeder) Seed(ctx context.Context, client *ent.Client) error {
    _, err := client.User.Create().SetEmail("admin@app.com").Save(ctx)
    return err // ❌ Fails if user exists
}
```

**Good (Check first):**
```go
func (s *Seeder) Seed(ctx context.Context, client *ent.Client) error {
    exists, err := client.User.Query().
        Where(user.EmailEQ("admin@app.com")).
        Exist(ctx)
    
    if err != nil {
        return fmt.Errorf("existence check: %w", err)
    }
    
    if exists {
        return nil
    }
    
    _, err = client.User.Create().SetEmail("admin@app.com").Save(ctx)
    return err
}
```

**Better (Upsert pattern):**
```go
func (s *Seeder) Seed(ctx context.Context, client *ent.Client) error {
    return client.User.Create().
        SetEmail("admin@app.com").
        SetName("Admin").
        OnConflict(
            sql.ConflictColumns("email"),
        ).
        UpdateNewValues().
        Exec(ctx)
}
```

### 2. Transaction Management

**Laravel:**
```php
DB::transaction(function () {
    User::create(['email' => 'admin@app.com']);
    Role::create(['name' => 'admin']);
});
```

**Go:**
```go
func (s *Seeder) Seed(ctx context.Context, client *ent.Client) error {
    // Start transaction
    tx, err := client.Tx(ctx)
    if err != nil {
        return err
    }
    
    // Defer rollback for panic recovery
    defer func() {
        if v := recover(); v != nil {
            tx.Rollback()
            panic(v)
        }
    }()
    
    // Create user
    user, err := tx.User.Create().
        SetEmail("admin@app.com").
        Save(ctx)
    
    if err != nil {
        tx.Rollback()
        return fmt.Errorf("user creation: %w", err)
    }
    
    // Create role
    _, err = tx.Role.Create().
        SetName("admin").
        SetUserID(user.ID).
        Save(ctx)
    
    if err != nil {
        tx.Rollback()
        return fmt.Errorf("role creation: %w", err)
    }
    
    // Commit transaction
    return tx.Commit()
}
```

**Critical Points:**
- ✅ You must manually rollback on error
- ✅ Defer with panic recovery is best practice
- ✅ Return errors with context using `fmt.Errorf`
- ✅ Commit explicitly at the end

### 3. Context Management (Must Understand)

```go
func (s *Seeder) Seed(ctx context.Context, client *ent.Client) error {
    // Check if context is cancelled
    select {
    case <-ctx.Done():
        return ctx.Err()
    default:
    }
    
    // Add timeout for long operations
    ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
    defer cancel()
    
    // Context is passed to every DB call
    users, err := client.User.Query().All(ctx)
    if err != nil {
        return err
    }
    
    return nil
}
```

**Why Context Matters:**
- Cancellation propagation
- Timeout enforcement
- Tracing and observability
- Graceful shutdown

### 4. Error Handling Patterns

**Wrap errors with context:**
```go
user, err := client.User.Create().SetEmail(email).Save(ctx)
if err != nil {
    return fmt.Errorf("creating user %s: %w", email, err)
}
```

**Check specific error types:**
```go
user, err := client.User.Create().SetEmail(email).Save(ctx)
if err != nil {
    if ent.IsConstraintError(err) {
        return fmt.Errorf("duplicate email: %w", err)
    }
    if ent.IsNotFound(err) {
        return fmt.Errorf("related entity missing: %w", err)
    }
    return fmt.Errorf("unexpected error: %w", err)
}
```

**Never ignore errors:**
```go
// ❌ BAD
client.User.Create().SetEmail(email).Save(ctx)

// ✅ GOOD
_, err := client.User.Create().SetEmail(email).Save(ctx)
if err != nil {
    return err
}
```

### 5. Security Best Practices

**Environment Variables for Secrets:**
```go
// ❌ NEVER
const adminPassword = "secret123"

// ✅ ALWAYS
type Config struct {
    AdminPassword string `env:"ADMIN_PASSWORD,required"`
}

func NewSeeder(cfg *Config) *Seeder {
    return &Seeder{
        adminPassword: cfg.AdminPassword,
    }
}
```

**Password Hashing:**
```go
import "golang.org/x/crypto/bcrypt"

func (s *Seeder) hashPassword(password string) (string, error) {
    hashed, err := bcrypt.GenerateFromPassword(
        []byte(password),
        bcrypt.DefaultCost, // Cost 10
    )
    if err != nil {
        return "", err
    }
    return string(hashed), nil
}
```

**Input Validation:**
```go
func (s *Seeder) validateEmail(email string) error {
    if email == "" {
        return fmt.Errorf("email required")
    }
    
    if !strings.Contains(email, "@") {
        return fmt.Errorf("invalid email format")
    }
    
    return nil
}
```

---

## 🚀 Building the CLI Tool

### Minimal Production CLI

```go
// cmd/seed/main.go
package main

import (
    "context"
    "flag"
    "fmt"
    "os"
    "time"
)

var (
    dryRun  = flag.Bool("dry-run", false, "Test without changes")
    timeout = flag.Duration("timeout", 5*time.Minute, "Timeout")
)

func main() {
    flag.Parse()
    
    // Load config
    cfg, err := loadConfig()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Config error: %v\n", err)
        os.Exit(1)
    }
    
    // Create context with timeout
    ctx, cancel := context.WithTimeout(context.Background(), *timeout)
    defer cancel()
    
    // Connect to database
    client, err := ent.Open("postgres", cfg.DatabaseURL)
    if err != nil {
        fmt.Fprintf(os.Stderr, "DB connection error: %v\n", err)
        os.Exit(1)
    }
    defer client.Close()
    
    // Run seeders
    if err := runSeeders(ctx, client, *dryRun); err != nil {
        fmt.Fprintf(os.Stderr, "Seeding failed: %v\n", err)
        os.Exit(1)
    }
    
    fmt.Println("✅ Seeding completed")
}

func runSeeders(ctx context.Context, client *ent.Client, dryRun bool) error {
    seeders := []Seeder{
        NewRoleSeeder(),
        NewUserSeeder(),
    }
    
    for _, s := range seeders {
        if dryRun {
            fmt.Printf("[DRY RUN] Would run: %s\n", s.Name())
            continue
        }
        
        fmt.Printf("Running: %s\n", s.Name())
        
        if err := s.Seed(ctx, client); err != nil {
            return fmt.Errorf("%s failed: %w", s.Name(), err)
        }
        
        if err := s.Validate(ctx, client); err != nil {
            return fmt.Errorf("%s validation failed: %w", s.Name(), err)
        }
    }
    
    return nil
}
```

**Run it:**
```bash
# Normal run
go run cmd/seed/main.go

# Dry run
go run cmd/seed/main.go --dry-run

# With timeout
go run cmd/seed/main.go --timeout=10m
```

---

## ⚡ Performance Patterns

### Bulk Inserts

**Bad (N queries):**
```go
for _, email := range emails {
    client.User.Create().SetEmail(email).Save(ctx)
}
```

**Good (1 query):**
```go
func (s *Seeder) bulkInsert(ctx context.Context, client *ent.Client, emails []string) error {
    builders := make([]*ent.UserCreate, len(emails))
    
    for i, email := range emails {
        builders[i] = client.User.Create().SetEmail(email)
    }
    
    return client.User.CreateBulk(builders...).Exec(ctx)
}
```

### Batching for Large Datasets

```go
func (s *Seeder) seedLarge(ctx context.Context, client *ent.Client) error {
    const batchSize = 1000
    items := generateItems(10000)
    
    for i := 0; i < len(items); i += batchSize {
        end := i + batchSize
        if end > len(items) {
            end = len(items)
        }
        
        batch := items[i:end]
        if err := s.insertBatch(ctx, client, batch); err != nil {
            return fmt.Errorf("batch %d failed: %w", i/batchSize, err)
        }
    }
    
    return nil
}
```

---

## 🧪 Testing Essentials

### Unit Test Pattern

```go
func TestUserSeeder(t *testing.T) {
    // Use in-memory SQLite for tests
    client := enttest.Open(t, "sqlite3", "file:ent?mode=memory&_fk=1")
    defer client.Close()
    
    ctx := context.Background()
    seeder := NewUserSeeder()
    
    // First run
    err := seeder.Seed(ctx, client)
    require.NoError(t, err)
    
    count, _ := client.User.Query().Count(ctx)
    assert.Equal(t, 1, count)
    
    // Idempotency test
    err = seeder.Seed(ctx, client)
    require.NoError(t, err)
    
    count, _ = client.User.Query().Count(ctx)
    assert.Equal(t, 1, count) // Still 1, not 2
}
```

---

## 🔄 Environment Strategy

### Development
```go
func (s *Seeder) Seed(ctx context.Context, client *ent.Client) error {
    if os.Getenv("APP_ENV") == "development" {
        // Seed test data
    }
    // Always seed critical data
    return nil
}
```

### Production
```bash
# Backup first
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > backup.sql

# Dry run
go run cmd/seed/main.go --dry-run

# Real run
go run cmd/seed/main.go

# Validate
psql -h $DB_HOST -U $DB_USER $DB_NAME -c "SELECT COUNT(*) FROM users;"
```

---

## 📋 Quick Reference

### Laravel to Go Translation

| Laravel | Go Equivalent |
|---------|--------------|
| `User::create()` | `client.User.Create().Save(ctx)` |
| `User::firstOrCreate()` | Check + Create or Upsert |
| `DB::transaction()` | `client.Tx(ctx)` + manual rollback |
| `throw new Exception()` | `return fmt.Errorf()` |
| `try/catch` | `if err != nil { return err }` |
| `$this->call(UserSeeder::class)` | `seeder.Seed(ctx, client)` |
| `php artisan db:seed` | `go run cmd/seed/main.go` |

### Must-Know Packages

```go
import (
    "context"                           // Context management
    "fmt"                               // Error formatting
    "golang.org/x/crypto/bcrypt"        // Password hashing
    "github.com/stretchr/testify/assert" // Testing
)
```

### Command Patterns

```bash
# Development
go run cmd/seed/main.go

# Production (Docker)
docker-compose run --rm app go run cmd/seed/main.go

# With flags
go run cmd/seed/main.go --dry-run --timeout=10m
```

---

## ✅ Production Checklist

Before deploying seeders:

- [ ] All seeders are idempotent
- [ ] Errors are properly wrapped with context
- [ ] Transactions used for related data
- [ ] Context passed to all DB operations
- [ ] Passwords are hashed (bcrypt)
- [ ] Secrets from environment variables
- [ ] Validation methods implemented
- [ ] Unit tests written (80%+ coverage)
- [ ] Dry-run tested in staging
- [ ] Database backup created
- [ ] Rollback plan documented

---

## 🎓 Key Takeaways for Laravel Developers

### 1. **No Magic, No Facades**
In Laravel, `User::create()` "just works." In Go, you must:
- Handle the error
- Pass context
- Check for conflicts
- Validate the result

### 2. **Errors are Values, Not Exceptions**
```go
// Every DB call can fail
user, err := client.User.Create().Save(ctx)
if err != nil {
    // Handle it NOW, not in a catch block later
    return fmt.Errorf("failed: %w", err)
}
```

### 3. **You Build Everything**
- No `php artisan make:seeder`
- No `DatabaseSeeder` class
- Build your CLI tool
- Build your orchestration
- Build your validation

### 4. **Context is Your Friend**
```go
// Enables cancellation, timeouts, tracing
func (s *Seeder) Seed(ctx context.Context, client *ent.Client) error {
    // Use ctx in every DB call
    user, err := client.User.Query().Where(...).First(ctx)
}
```

### 5. **Interfaces > Classes**
Define what something **can do**, not what it **is**:
```go
type Seeder interface {
    Seed(ctx context.Context, client *ent.Client) error
}

// Many types can implement this
type UserSeeder struct { /* ... */ }
type RoleSeeder struct { /* ... */ }
```

---

## 📚 Essential Resources

### Documentation
- [Ent Guide](https://entgo.io/docs/getting-started) - ORM documentation
- [Go Context](https://pkg.go.dev/context) - Understanding context
- [Error Handling](https://go.dev/blog/error-handling-and-go) - Go error patterns

### Testing
- [testify](https://github.com/stretchr/testify) - Assertions and mocking
- [enttest](https://entgo.io/docs/testing) - Testing Ent schemas

### Tools
- [golang-migrate](https://github.com/golang-migrate/migrate) - Migrations
- [air](https://github.com/cosmtrek/air) - Hot reload for development

---

**🎉 You're Ready!** You now understand the essential patterns for building production-grade database seeders in Go. Focus on explicit error handling, idempotency, and understanding that in Go, you control everything—there's no framework magic, just solid code patterns.
