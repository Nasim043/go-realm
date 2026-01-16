# Ent Relationships & Foreign Keys Guide
## For Laravel Developers

> **Target:** Laravel developers learning Ent for production Go apps

---

## 🎯 Core Concept: Laravel vs Ent

| Laravel Concept | Ent Equivalent | Key Difference |
|----------------|----------------|----------------|
| `hasOne()` | `edge.To().Unique()` | Must define FK field explicitly |
| `hasMany()` | `edge.To()` | Must define FK field on child |
| `belongsTo()` | `edge.From().Field()` | FK field + edge definition required |
| `belongsToMany()` | `edge.To()` on both | Auto pivot table or custom |
| Foreign key | `field.Int()` + `edge` | Always define field first |
| Model method | Edge in schema | Defined in schema, not methods |

> **⚡ Critical:** In Ent, you ALWAYS define the foreign key field explicitly. No magic.

---

## 🔑 Foreign Keys: The Foundation

### Laravel Way (Magic)
```php
// Laravel creates foreign key automatically
$table->foreignId('user_id')->constrained();
```

### Ent Way (Explicit)
```go
// Step 1: Define the field
field.Int("user_id")

// Step 2: Link it to an edge
edge.From("user", User.Type).
  Ref("posts").
  Field("user_id").  // ← This links field to edge
  Required()
```

### 📊 Foreign Key Options Table

| Method | Laravel Equivalent | Production Use |
|--------|-------------------|----------------|
| `.Required()` | `->nullable(false)` | Mandatory relationships |
| `.Optional()` | `->nullable()` | Optional relationships |
| `.Unique()` | `->unique()` | One-to-one relationships |
| `.Immutable()` | N/A | Prevent FK updates |
| `.OnDelete(ent.Cascade)` | `->onDelete('cascade')` | Delete children with parent |
| `.OnDelete(ent.Restrict)` | `->onDelete('restrict')` | Prevent parent deletion |
| `.OnDelete(ent.SetNull)` | `->onDelete('set null')` | Nullify on parent delete |

---

## 1️⃣ One-to-One Relationships

### Production Example: User ↔ Profile

#### Laravel
```php
// User model
public function profile() {
    return $this->hasOne(Profile::class);
}

// Profile model  
public function user() {
    return $this->belongsTo(User::class);
}
```

#### Ent Schema

**Profile Schema (owns the FK)**
```go
func (Profile) Fields() []ent.Field {
    return []ent.Field{
        field.Int("user_id").Unique(),  // ← FK field with unique constraint
        field.String("bio"),
        field.String("avatar_url").Optional(),
    }
}

func (Profile) Edges() []ent.Edge {
    return []ent.Edge{
        edge.From("user", User.Type).
            Ref("profile").
            Field("user_id").    // ← Links to FK field above
            Required().          // ← NOT NULL
            Unique(),           // ← Makes it one-to-one
    }
}
```

**User Schema**
```go
func (User) Edges() []ent.Edge {
    return []ent.Edge{
        edge.To("profile", Profile.Type).
            Unique(),  // ← Ensures only one profile per user
    }
}
```

### 📝 Summary: One-to-One Setup

| Step | Action | Location |
|------|--------|----------|
| 1 | Define FK field with `.Unique()` | Child schema (Profile) |
| 2 | Create `edge.From()` with `Field()` | Child schema (Profile) |
| 3 | Create `edge.To()` with `.Unique()` | Parent schema (User) |

> **💡 Tip:** Always put the foreign key on the child (Profile), not the parent (User).

---

## 2️⃣ One-to-Many Relationships

### Production Example: User → Posts

#### Laravel
```php
// User model
public function posts() {
    return $this->hasMany(Post::class);
}

// Post model
public function user() {
    return $this->belongsTo(User::class);
}
```

#### Ent Schema

**Post Schema (owns the FK)**
```go
func (Post) Fields() []ent.Field {
    return []ent.Field{
        field.Int("user_id"),        // ← FK field (no .Unique())
        field.String("title"),
        field.Text("content"),
        field.Time("created_at").Default(time.Now),
    }
}

func (Post) Edges() []ent.Edge {
    return []ent.Edge{
        edge.From("user", User.Type).
            Ref("posts").
            Field("user_id").          // ← Links to FK field
            Required().                // ← Posts must have a user
            OnDelete(ent.Cascade),     // ← Delete posts when user deleted
    }
}
```

**User Schema**
```go
func (User) Edges() []ent.Edge {
    return []ent.Edge{
        edge.To("posts", Post.Type),  // ← No .Unique() = one-to-many
    }
}
```

### 📝 Summary: One-to-Many Setup

| Step | Action | Location |
|------|--------|----------|
| 1 | Define FK field (no `.Unique()`) | Child schema (Post) |
| 2 | Create `edge.From()` with `Field()` | Child schema (Post) |
| 3 | Add `.OnDelete()` behavior | Child schema (Post) |
| 4 | Create `edge.To()` (no `.Unique()`) | Parent schema (User) |

> **⚠️ Note:** The difference from one-to-one? Remove `.Unique()` from the FK field and parent edge.

---

## 3️⃣ Many-to-Many Relationships

### Production Example: Users ↔ Roles

#### Laravel
```php
// User model
public function roles() {
    return $this->belongsToMany(Role::class);
}

// Role model
public function users() {
    return $this->belongsToMany(User::class);
}
```

#### Ent Schema (Auto Pivot)

**User Schema**
```go
func (User) Edges() []ent.Edge {
    return []ent.Edge{
        edge.To("roles", Role.Type),  // ← Ent creates pivot table automatically
    }
}
```

**Role Schema**
```go
func (Role) Edges() []ent.Edge {
    return []ent.Edge{
        edge.To("users", User.Type),  // ← Bidirectional link
    }
}
```

> **💡 Ent automatically creates a `user_roles` join table.**

---

### With Custom Pivot Table (Production Ready)

When you need extra fields on the pivot (timestamps, metadata).

#### Create Pivot Schema
```go
// UserRole schema (pivot table)
type UserRole struct {
    ent.Schema
}

func (UserRole) Fields() []ent.Field {
    return []ent.Field{
        field.Int("user_id"),
        field.Int("role_id"),
        field.Time("assigned_at").Default(time.Now),
        field.String("assigned_by").Optional(),
    }
}

func (UserRole) Edges() []ent.Edge {
    return []ent.Edge{
        edge.From("user", User.Type).
            Ref("user_roles").
            Field("user_id").
            Required().
            Unique(),
        edge.From("role", Role.Type).
            Ref("user_roles").
            Field("role_id").
            Required().
            Unique(),
    }
}
```

#### Update User & Role Schemas
```go
// User schema
edge.To("roles", Role.Type).
    Through("user_roles", UserRole.Type)

// Role schema  
edge.To("users", User.Type).
    Through("user_roles", UserRole.Type)
```

### 📊 Auto vs Custom Pivot Comparison

| Feature | Auto Pivot | Custom Pivot |
|---------|-----------|--------------|
| Extra fields | ❌ No | ✅ Yes (timestamps, metadata) |
| Setup complexity | Simple | More code |
| Production use | Basic relationships | Complex relationships |
| Access pivot data | ❌ No | ✅ Yes via queries |

> **🎯 Production Tip:** Use custom pivot when you need `created_at`, `updated_at`, or audit fields.

---

## 4️⃣ Self-Referencing Relationships

### Production Example: User → Followers

#### Laravel
```php
public function followers() {
    return $this->belongsToMany(User::class, 'followers', 'user_id', 'follower_id');
}
```

#### Ent Schema
```go
func (User) Edges() []ent.Edge {
    return []ent.Edge{
        edge.To("following", User.Type).
            From("followers"),  // ← Bidirectional self-reference
    }
}
```

**Query Examples:**
```go
// Get followers
user.QueryFollowers().All(ctx)

// Get following
user.QueryFollowing().All(ctx)
```

---

## 5️⃣ Polymorphic Relationships

### Laravel Way (Magic)
```php
public function commentable() {
    return $this->morphTo();
}
```

### Ent Way (Manual & Explicit)

**⚠️ Ent has NO polymorphic magic. You implement it manually.**

```go
// Comment schema
func (Comment) Fields() []ent.Field {
    return []ent.Field{
        field.Int("commentable_id"),
        field.Enum("commentable_type").
            Values("post", "video", "photo"),
        field.Text("content"),
    }
}
```

**Querying:**
```go
// Query comments for a post
client.Comment.Query().
    Where(
        comment.CommentableID(postID),
        comment.CommentableType("post"),
    ).
    All(ctx)
```

### 📝 Summary: Polymorphic Approach

| Aspect | Implementation |
|--------|----------------|
| Storage | Two fields: `_id` and `_type` |
| Type safety | Use `Enum()` for type field |
| Querying | Manual `Where()` clauses |
| Production | Works but verbose |

> **💡 Tip:** Consider separate tables instead of polymorphic if you can. More explicit.

---

## 🔥 Production Patterns

### Pattern 1: Cascade Deletes
```go
edge.From("user", User.Type).
    Ref("posts").
    Field("user_id").
    Required().
    OnDelete(ent.Cascade)  // ← Delete posts when user deleted
```

### Pattern 2: Prevent Deletion
```go
edge.From("category", Category.Type).
    Ref("products").
    Field("category_id").
    Required().
    OnDelete(ent.Restrict)  // ← Can't delete category with products
```

### Pattern 3: Optional Relationships
```go
field.Int("company_id").Optional()  // ← Nullable FK

edge.From("company", Company.Type).
    Ref("users").
    Field("company_id")
    // No .Required() = optional
```

### Pattern 4: Immutable Foreign Keys
```go
field.Int("user_id").Immutable()  // ← Can't change post owner

edge.From("user", User.Type).
    Ref("posts").
    Field("user_id").
    Required().
    Immutable()
```

---

## 📊 Complete Comparison Table

| Feature | Laravel | Ent |
|---------|---------|-----|
| Define FK | Automatic | Manual: `field.Int("user_id")` |
| One-to-one | `hasOne()` + `belongsTo()` | `edge.To().Unique()` + FK |
| One-to-many | `hasMany()` + `belongsTo()` | `edge.To()` + FK |
| Many-to-many | `belongsToMany()` | `edge.To()` on both sides |
| Pivot fields | In migration | Separate schema |
| Cascade delete | `->onDelete('cascade')` | `.OnDelete(ent.Cascade)` |
| Nullable FK | `->nullable()` | `.Optional()` |
| Polymorphic | `morphTo()` | Manual `_id` + `_type` fields |

---

## ✅ Production Checklist

Before deploying, ensure:

- [ ] All foreign key fields explicitly defined
- [ ] All edges have `.Field()` linking to FK
- [ ] `.Required()` vs `.Optional()` based on business rules
- [ ] `.OnDelete()` behavior set for critical relationships
- [ ] `.Unique()` added for one-to-one relationships
- [ ] Consider `.Immutable()` for FKs that shouldn't change
- [ ] Custom pivot tables for many-to-many with extra data
- [ ] No business logic in schema files

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Missing Field Link
```go
// WRONG - Field not linked to edge
field.Int("user_id")
edge.From("user", User.Type).Ref("posts")  // Missing .Field()
```
```go
// CORRECT
field.Int("user_id")
edge.From("user", User.Type).Ref("posts").Field("user_id")  // ✅
```

### ❌ Mistake 2: Forgetting FK Field
```go
// WRONG - No FK field defined
edge.From("user", User.Type).Ref("posts").Field("user_id")  // Error!
```
```go
// CORRECT - Define field first
field.Int("user_id")  // ✅ Then create edge
edge.From("user", User.Type).Ref("posts").Field("user_id")
```

### ❌ Mistake 3: Wrong Unique Usage
```go
// WRONG - One-to-many with Unique
field.Int("user_id").Unique()  // ❌ User can only have 1 post!
```
```go
// CORRECT - One-to-many without Unique
field.Int("user_id")  // ✅ User can have many posts
```

### ❌ Mistake 4: No OnDelete Strategy
```go
// RISKY - No deletion behavior defined
edge.From("user", User.Type).Ref("posts").Field("user_id")
```
```go
// BETTER - Explicit deletion behavior
edge.From("user", User.Type).
    Ref("posts").
    Field("user_id").
    OnDelete(ent.Cascade)  // ✅ Clear behavior
```

---

## 🎓 Quick Reference: Edge Direction

| Relationship | Has FK | Edge Direction | Edge Type |
|--------------|--------|----------------|-----------|
| User → Profile (1:1) | Profile | `edge.From()` in Profile | `Field("user_id")` |
| User → Profile (1:1) | User | `edge.To()` in User | No Field |
| User → Posts (1:N) | Post | `edge.From()` in Post | `Field("user_id")` |
| User → Posts (1:N) | User | `edge.To()` in User | No Field |
| User ↔ Roles (M:N) | Pivot | `edge.To()` in both | Auto or Through |

> **🎯 Rule:** The schema with the FK field uses `edge.From()` with `.Field()`. The other uses `edge.To()`.

---

## 💡 Pro Tips

1. **Start with FK field** → Always define `field.Int("x_id")` before creating the edge
2. **Use .From() on the child** → The table with FK uses `edge.From()`
3. **Add .Unique() for 1:1** → Without it, you have 1:many
4. **Always set .OnDelete()** → Explicit is better in production
5. **Immutable for audit** → Use `.Immutable()` on FKs you shouldn't change
6. **Custom pivot for metadata** → Use when you need timestamps or extra fields
7. **Test FK constraints** → Try deleting/updating to verify behavior

---

## 📚 Real Production Example

Complete schema for a blog system:

```go
// User schema
func (User) Fields() []ent.Field {
    return []ent.Field{
        field.String("email").Unique(),
        field.String("name"),
    }
}

func (User) Edges() []ent.Edge {
    return []ent.Edge{
        edge.To("posts", Post.Type),           // Has many posts
        edge.To("profile", Profile.Type).      // Has one profile
            Unique(),
    }
}

// Profile schema
func (Profile) Fields() []ent.Field {
    return []ent.Field{
        field.Int("user_id").Unique(),
        field.String("bio").Optional(),
        field.String("avatar").Optional(),
    }
}

func (Profile) Edges() []ent.Edge {
    return []ent.Edge{
        edge.From("user", User.Type).
            Ref("profile").
            Field("user_id").
            Required().
            Unique().
            OnDelete(ent.Cascade),
    }
}

// Post schema
func (Post) Fields() []ent.Field {
    return []ent.Field{
        field.Int("user_id").Immutable(),       // Can't change author
        field.String("title"),
        field.Text("content"),
        field.Enum("status").
            Values("draft", "published"),
    }
}

func (Post) Edges() []ent.Edge {
    return []ent.Edge{
        edge.From("user", User.Type).
            Ref("posts").
            Field("user_id").
            Required().
            Immutable().
            OnDelete(ent.Cascade),
        edge.To("comments", Comment.Type),      // Has many comments
        edge.To("tags", Tag.Type),             // Many-to-many
    }
}

// Comment schema
func (Comment) Fields() []ent.Field {
    return []ent.Field{
        field.Int("post_id").Immutable(),
        field.Int("user_id").Immutable(),
        field.Text("content"),
    }
}

func (Comment) Edges() []ent.Edge {
    return []ent.Edge{
        edge.From("post", Post.Type).
            Ref("comments").
            Field("post_id").
            Required().
            Immutable().
            OnDelete(ent.Cascade),
        edge.From("user", User.Type).
            Ref("comments").
            Field("user_id").
            Required().
            Immutable().
            OnDelete(ent.Cascade),
    }
}

// Tag schema
func (Tag) Fields() []ent.Field {
    return []ent.Field{
        field.String("name").Unique(),
    }
}

func (Tag) Edges() []ent.Edge {
    return []ent.Edge{
        edge.To("posts", Post.Type),           // Many-to-many
    }
}
```

---

## 🎯 Final Thoughts

### Laravel → Ent Mental Shift

| Laravel Mindset | Ent Mindset |
|----------------|-------------|
| Models are magic | Schemas are blueprints |
| Relations are methods | Edges are data structure |
| Framework handles FK | You define FK explicitly |
| Convention over config | Explicit over magic |
| Fast to write | Safe to run |

> **Remember:** Ent makes you think like a database designer. More work upfront = fewer bugs in production.

---

### When You Get Stuck

1. **Did you define the FK field?** → `field.Int("x_id")`
2. **Did you link field to edge?** → `.Field("x_id")`
3. **Is direction correct?** → FK owner uses `edge.From()`
4. **Need one-to-one?** → Add `.Unique()` to field and edges
5. **Need cascade delete?** → Add `.OnDelete(ent.Cascade)`

---
