# Part 2: Deep Dive Reference

> **Purpose**: This section explains the "how" and "why" behind ENT concepts. Refer back here when you need deeper understanding.

---

## 11. Schema Generation Explained {#schema-generation}

### What Happens When You Run `go generate`?

```bash
go generate ./ent
```

ENT reads your schemas and generates **hundreds of files**. Here's what each does:

### Generated Files & Their Purpose

```
ent/
├── client.go              ← Main entry point (client.User, client.Post, etc.)
├── user.go                ← User struct definition
├── user_create.go         ← Has SetName(), SetEmail() methods
├── user_update.go         ← Has update methods
├── user_query.go          ← Has Where(), Order(), Limit() methods
├── user_delete.go         ← Has delete methods
├── predicate/
│   └── predicate.go       ← For building WHERE conditions
└── ...more generated files
```

### How Methods Are Generated

**Your Schema:**
```go
field.String("name")
field.String("email")
field.Int("age").Optional()
```

**ENT Generates (in `ent/user_create.go`):**
```go
func (uc *UserCreate) SetName(s string) *UserCreate { ... }
func (uc *UserCreate) SetEmail(s string) *UserCreate { ... }
func (uc *UserCreate) SetAge(i int) *UserCreate { ... }
```

**Rule:** For each field `fieldName`, ENT generates `SetFieldName()` method.

### Migration Files

When you run `atlas migrate diff`:

**📁 Creates:**
```
ent/migrate/migrations/
├── 20250101120000_add_user_table.sql    ← Actual SQL commands
└── atlas.sum                             ← Checksum for integrity
```

**Example SQL generated:**
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  age INT
);
```

---

## 12. Understanding Generated Methods {#generated-methods}

### Where Do `SetName()`, `SetEmail()` Come From?

**Answer:** ENT's code generator reads your schema and creates type-safe setter methods.

### Create Operations (ent/user_create.go)

```go
user, err := client.User.
    Create().                    // Returns *UserCreate
    SetName("Tonmoy").          // Generated from field.String("name")
    SetEmail("tonmoy@test.com"). // Generated from field.String("email")
    SetAge(25).                  // Generated from field.Int("age")
    Save(ctx)                    // Executes INSERT query
```

**Method Mapping:**
| Your Field Definition | Generated Method | What It Does |
|----------------------|------------------|-------------|
| `field.String("name")` | `SetName(string)` | Sets the name value |
| `field.String("email")` | `SetEmail(string)` | Sets the email value |
| `field.Int("age")` | `SetAge(int)` | Sets the age value |
| `field.Time("created_at")` | `SetCreatedAt(time.Time)` | Sets timestamp |
| `field.Bool("is_active")` | `SetIsActive(bool)` | Sets boolean |

### Query Operations (ent/user_query.go)

```go
users, err := client.User.
    Query().                          // Returns *UserQuery
    Where(user.NameEQ("Tonmoy")).    // WHERE name = 'Tonmoy'
    Where(user.AgeGT(18)).           // WHERE age > 18
    Order(ent.Asc(user.FieldName)).  // ORDER BY name ASC
    Limit(10).                        // LIMIT 10
    Offset(5).                        // OFFSET 5
    All(ctx)                          // Returns []*User
```

**Predicate Methods Generated:**
| Field Type | Generated Predicates | SQL |
|-----------|---------------------|-----|
| `String` | `NameEQ()`, `NameNEQ()`, `NameContains()`, `NameHasPrefix()` | `=`, `!=`, `LIKE`, `LIKE 'prefix%'` |
| `Int` | `AgeEQ()`, `AgeGT()`, `AgeLT()`, `AgeGTE()`, `AgeLTE()` | `=`, `>`, `<`, `>=`, `<=` |
| `Time` | `CreatedAtGT()`, `CreatedAtLT()`, `CreatedAtBetween()` | `>`, `<`, `BETWEEN` |

---

## 13. Unique Constraints & Indexing {#constraints-indexing}

### Unique Constraints 🔥

**Single Field Unique:**
```go
// In ent/schema/user.go
func (User) Fields() []ent.Field {
    return []ent.Field{
        field.String("email").
            Unique(),  // ← Creates UNIQUE constraint in DB
        
        field.String("username").
            Unique(),
    }
}
```

**Composite Unique (Multiple columns):**
```go
import "entgo.io/ent/schema/index"

func (User) Indexes() []ent.Index {
    return []ent.Index{
        // UNIQUE(email, tenant_id) - email unique per tenant
        index.Fields("email", "tenant_id").
            Unique(),
    }
}
```

**What this generates:**
```sql
CREATE UNIQUE INDEX idx_user_email_tenant_id ON users(email, tenant_id);
```

### Database Indexing 🔥

**Single Column Index:**
```go
func (User) Indexes() []ent.Index {
    return []ent.Index{
        index.Fields("email"),  // CREATE INDEX ON users(email)
    }
}
```

**Composite Index:**
```go
func (User) Indexes() []ent.Index {
    return []ent.Index{
        // Fast lookups on (last_name, first_name)
        index.Fields("last_name", "first_name"),
    }
}
```

**Named Index:**
```go
import "entgo.io/ent/dialect/entsql"

index.Fields("email", "tenant_id").
    Unique().
    Annotations(
        entsql.IndexName("idx_user_email_tenant"),
    )
```

### When to Use Indexes

✅ **Use indexes for:**
- Frequently queried columns
- Foreign key columns
- Columns used in WHERE, JOIN, ORDER BY
- Unique constraints

❌ **Avoid indexes on:**
- Small tables (< 1000 rows)
- Columns with low cardinality (e.g., boolean)
- Columns rarely used in queries

---

## 14. Query Methods Explained {#query-methods}

### Core Query Methods

#### `Query()` - Start a query
```go
query := client.User.Query()  // Returns *UserQuery (not executed yet)
```

#### `Where()` - Add conditions
```go
client.User.Query().
    Where(user.NameEQ("Tonmoy")).        // name = 'Tonmoy'
    Where(user.AgeGT(18))                // AND age > 18
```

#### Terminator Methods 🔥 (Execute Query) 🔥

| Method | Returns | Use Case | SQL |
|--------|---------|----------|-----|
| `All(ctx)` | `[]*User, error` | Get multiple users | `SELECT * FROM users` |
| `Only(ctx)` | `*User, error` | Get exactly one (error if 0 or 2+) | `SELECT * ... LIMIT 2` |
| `First(ctx)` | `*User, error` | Get first result | `SELECT * ... LIMIT 1` |
| `Count(ctx)` | `int, error` | Count matching rows | `SELECT COUNT(*) FROM users` |
| `Exist(ctx)` | `bool, error` | Check if any exist | `SELECT EXISTS(SELECT 1 ...)` |
| `IDs(ctx)` | `[]int, error` | Get only IDs | `SELECT id FROM users` |

### `Save(ctx)` vs `Exec(ctx)` 🔥

#### `Save(ctx)` - Returns the entity
```go
user, err := client.User.Create().
    SetName("Tonmoy").
    Save(ctx)  // Returns *User

fmt.Println(user.ID)  // You get the created user back
```

**Use when:** You need the created/updated entity

#### `Exec(ctx)` - Just executes (no return)
```go
err := client.User.UpdateOneID(5).
    SetName("New Name").
    Exec(ctx)  // Returns only error

// Use Exec when you don't need the entity back
```

**Use when:** You only care about success/failure

### Update Methods

#### `UpdateOne()` - Update specific entity
```go
err := client.User.UpdateOneID(userID).
    SetName("Updated Name").
    Exec(ctx)
```

#### `Update()` - Bulk update
```go
affected, err := client.User.Update().
    Where(user.AgeGT(18)).
    SetIsActive(true).
    Save(ctx)  // Returns count of affected rows

fmt.Printf("Updated %d users\n", affected)
```

### Delete Methods

```go
// Delete one by ID
err := client.User.DeleteOneID(5).Exec(ctx)

// Bulk delete
affected, err := client.User.Delete().
    Where(user.AgeGT(100)).
    Exec(ctx)
```

### Complex Predicates

```go
// OR condition
client.User.Query().
    Where(
        user.Or(
            user.NameEQ("Tonmoy"),
            user.EmailEQ("tonmoy@test.com"),
        ),
    ).All(ctx)

// AND + OR
client.User.Query().
    Where(
        user.And(
            user.AgeGT(18),
            user.Or(
                user.NameContains("John"),
                user.NameContains("Jane"),
            ),
        ),
    ).All(ctx)

// NOT
client.User.Query().
    Where(user.Not(user.NameEQ("Banned"))).
    All(ctx)
```

---

## 15. Clean Architecture with ENT {#clean-architecture}

### Project Structure

```
project/
├── cmd/
│   └── api/
│       └── main.go           ← Entry point
├── internal/
│   ├── domain/               ← Business logic (entities, interfaces)
│   │   ├── user.go
│   │   └── repository.go
│   ├── repository/           ← Data access (ENT implementation)
│   │   └── user_repo.go
│   ├── usecase/              ← Application logic
│   │   └── user_usecase.go
│   └── delivery/             ← HTTP handlers
│       └── http/
│           └── user_handler.go
└── ent/                      ← Generated ENT code
```

### Domain Layer (Business Logic)

```go
// internal/domain/user.go
package domain

import "context"

type User struct {
    ID    int
    Name  string
    Email string
}

// Repository interface (depend on abstraction, not implementation)
type UserRepository interface {
    Create(ctx context.Context, user *User) (*User, error)
    GetByID(ctx context.Context, id int) (*User, error)
    GetByEmail(ctx context.Context, email string) (*User, error)
    List(ctx context.Context, limit, offset int) ([]*User, error)
}
```

### Repository Layer (ENT Implementation)

```go
// internal/repository/user_repo.go
package repository

import (
    "context"
    "ent-playground/ent"
    "ent-playground/ent/user"
    "ent-playground/internal/domain"
)

type userRepository struct {
    client *ent.Client
}

func NewUserRepository(client *ent.Client) domain.UserRepository {
    return &userRepository{client: client}
}

func (r *userRepository) Create(ctx context.Context, u *domain.User) (*domain.User, error) {
    entUser, err := r.client.User.Create().
        SetName(u.Name).
        SetEmail(u.Email).
        Save(ctx)
    
    if err != nil {
        return nil, err
    }
    
    // Convert ENT model to domain model
    return &domain.User{
        ID:    entUser.ID,
        Name:  entUser.Name,
        Email: entUser.Email,
    }, nil
}

func (r *userRepository) GetByID(ctx context.Context, id int) (*domain.User, error) {
    entUser, err := r.client.User.Get(ctx, id)
    if err != nil {
        return nil, err
    }
    
    return &domain.User{
        ID:    entUser.ID,
        Name:  entUser.Name,
        Email: entUser.Email,
    }, nil
}
```

### Use Case Layer (Application Logic)

```go
// internal/usecase/user_usecase.go
package usecase

import (
    "context"
    "errors"
    "ent-playground/internal/domain"
)

type UserUseCase struct {
    repo domain.UserRepository
}

func NewUserUseCase(repo domain.UserRepository) *UserUseCase {
    return &UserUseCase{repo: repo}
}

func (uc *UserUseCase) CreateUser(ctx context.Context, name, email string) (*domain.User, error) {
    // Business logic: Check if email exists
    existing, _ := uc.repo.GetByEmail(ctx, email)
    if existing != nil {
        return nil, errors.New("email already exists")
    }
    
    // Create user
    user := &domain.User{
        Name:  name,
        Email: email,
    }
    
    return uc.repo.Create(ctx, user)
}
```

### Benefits of This Architecture

1. **Testability**: Mock repository interface in tests
2. **Flexibility**: Swap ENT for another ORM without touching business logic
3. **Separation of Concerns**: Each layer has a single responsibility
4. **Maintainability**: Changes in one layer don't affect others

---
