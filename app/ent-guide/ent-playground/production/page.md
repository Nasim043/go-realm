# Part 3: Production Checklist

## 16. Essential ENT Concepts for Production {#production-checklist}

### ✅ Must-Know Concepts

#### 1. **Schema Design**
- [ ] Understand field types and constraints
- [ ] Know when to use `.Optional()`, `.Unique()`, `.Default()`
- [ ] Use appropriate data types (e.g., `Text` for long content)
- [ ] Define proper relations (One-to-Many, Many-to-Many)

#### 2. **Migrations**
- [ ] Always use versioned migrations (Atlas)
- [ ] Never edit old migration files
- [ ] Review generated SQL before applying
- [ ] Test migrations on staging before production
- [ ] Keep migration files in version control

#### 3. **Indexes & Performance**
- [ ] Add indexes on frequently queried columns
- [ ] Use composite indexes for multi-column queries
- [ ] Index foreign key columns
- [ ] Monitor slow queries and add indexes accordingly

#### 4. **Relations & Edges**
- [ ] Use eager loading (`WithPosts()`) to avoid N+1 queries
- [ ] Understand the difference between `edge.To()` and `edge.From()`
- [ ] Use `.Unique()` for one-to-one relationships
- [ ] Use `.Required()` when a relation is mandatory

#### 5. **Query Optimization**
- [ ] Use `Select()` to fetch specific fields only
- [ ] Implement pagination for large datasets
- [ ] Use cursor-based pagination for better performance
- [ ] Cache frequently accessed data
- [ ] Use `Count()` instead of `All()` when you only need count

#### 6. **Transactions**
- [ ] Use transactions for operations that must succeed/fail together
- [ ] Always handle rollback on error
- [ ] Keep transactions short
- [ ] Use transaction helper patterns for cleaner code

#### 7. **Error Handling**
- [ ] Check for `ent.IsNotFound(err)` for specific handling
- [ ] Handle constraint violations gracefully
- [ ] Log errors with context
- [ ] Return meaningful error messages to users

#### 8. **Security**
- [ ] Never trust user input - validate everything
- [ ] Use parameterized queries (ENT does this automatically)
- [ ] Implement authentication and authorization
- [ ] Hash passwords before storing
- [ ] Use environment variables for sensitive data

#### 9. **Connection Pool**
```go
db, err := sql.Open("postgres", dsn)
db.SetMaxOpenConns(25)        // Max connections
db.SetMaxIdleConns(5)         // Idle connections
db.SetConnMaxLifetime(5*time.Minute)

client := ent.NewClient(ent.Driver(sql.OpenDB("postgres", db)))
```

#### 10. **Logging & Monitoring**
```go
// Enable debug mode in development
client := ent.NewClient(
    ent.Driver(drv),
    ent.Debug(),  // Logs all queries
)

// Custom logger
client := ent.NewClient(
    ent.Driver(drv),
    ent.Log(func(args ...interface{}) {
        log.Println(args...)
    }),
)
```

### 🔥 Production Best Practices

#### Database Connection
```go
// Good: Use connection pooling
db, _ := sql.Open("postgres", dsn)
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(5)
client := ent.NewClient(ent.Driver(sql.OpenDB("postgres", db)))

// Bad: Create new client for each request
```

#### Query Patterns
```go
// Good: Eager loading
users, _ := client.User.Query().
    WithPosts().
    All(ctx)

for _, u := range users {
    posts := u.Edges.Posts  // No extra query
}

// Bad: N+1 queries
users, _ := client.User.Query().All(ctx)
for _, u := range users {
    posts, _ := u.QueryPosts().All(ctx)  // N extra queries!
}
```

#### Error Handling
```go
// Good: Specific error handling
user, err := client.User.Get(ctx, id)
if err != nil {
    if ent.IsNotFound(err) {
        return nil, ErrUserNotFound
    }
    return nil, fmt.Errorf("unexpected error: %w", err)
}

// Bad: Generic error handling
user, err := client.User.Get(ctx, id)
if err != nil {
    return nil, err
}
```

### 📊 Performance Tips

1. **Use Select for specific fields**
```go
// Only fetch needed fields
users, _ := client.User.Query().
    Select(user.FieldName, user.FieldEmail).
    All(ctx)
```

2. **Batch operations**
```go
// Good: Bulk create
bulk := make([]*ent.UserCreate, len(data))
for i, d := range data {
    bulk[i] = client.User.Create().SetName(d.Name)
}
client.User.CreateBulk(bulk...).Save(ctx)

// Bad: Multiple individual creates
for _, d := range data {
    client.User.Create().SetName(d.Name).Save(ctx)
}
```

3. **Use context with timeout**
```go
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

users, err := client.User.Query().All(ctx)
```

### 🧪 Testing with ENT

```go
func TestUserRepository(t *testing.T) {
    // Use in-memory SQLite for tests
    client, _ := ent.Open("sqlite3", "file:ent?mode=memory&cache=shared&_fk=1")
    defer client.Close()
    
    // Run migrations
    client.Schema.Create(context.Background())
    
    // Test
    user, err := client.User.Create().
        SetName("Test").
        SetEmail("test@test.com").
        Save(context.Background())
    
    assert.NoError(t, err)
    assert.Equal(t, "Test", user.Name)
}
```

### 📝 Common Pitfalls to Avoid

❌ **Don't:**
- Forget to handle `ent.IsNotFound(err)`
- Use auto-migrate in production
- Forget to close the client
- Create new client for each request
- Skip pagination on large datasets
- Ignore N+1 query problems
- Store sensitive data unencrypted

✅ **Do:**
- Use versioned migrations
- Implement connection pooling
- Add indexes on frequently queried columns
- Use eager loading for relations
- Handle errors specifically
- Log queries in development
- Test on staging before production

---

## Quick Reference: Common Operations

```go
// CREATE
user, err := client.User.Create().
    SetName("Tonmoy").
    SetEmail("test@test.com").
    Save(ctx)

// READ ONE
user, err := client.User.Query().
    Where(user.EmailEQ("test@test.com")).
    Only(ctx)

// READ MANY
users, err := client.User.Query().
    Where(user.AgeGT(18)).
    Order(ent.Desc(user.FieldName)).
    Limit(10).
    All(ctx)

// UPDATE
err := client.User.UpdateOneID(id).
    SetName("New Name").
    Exec(ctx)

// DELETE
err := client.User.DeleteOneID(id).Exec(ctx)

// WITH RELATIONS
user, err := client.User.Query().
    Where(user.IDEQ(id)).
    WithPosts().        // Eager load posts
    WithProfile().      // Eager load profile
    Only(ctx)

// TRANSACTION
tx, _ := client.Tx(ctx)
tx.User.Create().SetName("Test").Save(ctx)
tx.Post.Create().SetTitle("Test").Save(ctx)
tx.Commit()
```

---

## Migration Workflow Reference

```bash
# 1. Define/modify schema
# Edit ent/schema/*.go

# 2. Generate code
go generate ./ent

# 3. Clean dev database (for subsequent migrations after initial)
psql -U postgres -d entdb_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 4. Create migration
atlas migrate diff my_change \
  --dir "file://migrations" \
  --to "ent://ent/schema" \
  --dev-url "postgres://postgres:password@localhost:5432/entdb_dev?sslmode=disable"

# 5. Review SQL (IMPORTANT - verify no data loss!)
cat migrations/*_my_change.sql

# 6. Apply migration to main database
atlas migrate apply \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"

# 7. Verify
go run .
```

**🔑 Key Points:**
- `entdb_dev` = Atlas scratch space (always clean it before new migrations)
- `entdb` = Your actual application database with real data
- Migrations go in `./migrations/` directory at project root
- Each migration creates a new versioned `.sql` file
- **NEVER delete old migration files** - they track your database history

---

## Final Summary

🎉 **You've completed the ENT Framework guide!**

### What You've Learned:

**Part 1: Hands-On**
- ✅ Project setup and database configuration
- ✅ Schema definition and code generation
- ✅ CRUD operations
- ✅ Relations and edges
- ✅ Advanced queries and filtering
- ✅ Query chaining for dynamic filters
- ✅ Transactions
- ✅ Pagination (offset and cursor-based)
- ✅ Timestamps with mixins
- ✅ Building HTTP APIs with ENT

**Part 2: Deep Dive**
- ✅ Understanding code generation
- ✅ Generated method mappings
- ✅ Indexes and constraints
- ✅ Query method internals
- ✅ Clean architecture patterns

**Part 3: Production**
- ✅ Essential concepts checklist
- ✅ Performance optimization tips
- ✅ Security best practices
- ✅ Common pitfalls and how to avoid them

### Next Steps:

1. **Build a real project** using these concepts
2. **Read ENT documentation** at [entgo.io](https://entgo.io)
3. **Join ENT community** on GitHub and Discord
4. **Explore advanced features**: Hooks, Privacy rules, Custom validators
5. **Practice, practice, practice!**

---

**Happy coding with ENT! 🚀**

