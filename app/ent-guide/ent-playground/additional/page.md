## Laravel Eloquent থেকে Ent Framework এ Migration

## 📋 সূচিপত্র

1. [Laravel vs Ent - দ্রুত তুলনা](#laravel-vs-ent-comparison)
2. [Mixins - কোড পুনর্ব্যবহার](#mixins)
3. [Hooks - Event Handling](#hooks)
4. [Interceptors - Query Modification](#interceptors)
5. [Privacy Policy - Global Scopes](#privacy-policy)
6. [Step-by-Step Professional Implementation](#professional-implementation)

---

## 🔄 Laravel vs Ent - দ্রুত তুলনা {#laravel-vs-ent-comparison}

Laravel Eloquent এবং Ent Framework এর মধ্যে মূল পার্থক্য এবং সাদৃশ্য:

| Laravel Eloquent | Ent Framework | ব্যাখ্যা |
|-----------------|---------------|----------|
| **Traits** | **Mixins** | কোড পুনর্ব্যবহার করার জন্য |
| **Observers/Events** | **Hooks** | Model lifecycle events handle করার জন্য |
| **Query Scopes** | **Interceptors** | Query modify করার জন্য |
| **Global Scopes** | **Privacy Policy** | সব query তে automatic filter apply করার জন্য |
| `creating`, `created` | `OnCreate` hook | নতুন entry তৈরির সময় |
| `updating`, `updated` | `OnUpdate` hook | entry update করার সময় |
| `deleting`, `deleted` | `OnDelete` hook | entry delete করার সময় |
| `SoftDeletes` trait | Mixin with `deleted_at` | Soft delete functionality |

---

## 🧩 Mixins - কোড পুনর্ব্যবহার {#mixins}

### Laravel Trait vs Ent Mixin

**Laravel এ আপনি যেভাবে করতেন:**
```php
// Laravel Trait
trait Timestamps {
    public $timestamps = true;
}

class User extends Model {
    use Timestamps;
}
```

**Ent এ একই কাজ:**
```go
// Mixin হলো reusable schema components
```

### ✅ Mixin কী এবং কেন ব্যবহার করবেন?

**Mixin** হলো একটি reusable schema component যা একাধিক schema তে একই fields, edges, hooks, বা indexes যুক্ত করতে পারে।

```
┌─────────────────────────────────────┐
│         TimeMixin                   │
│  (created_at, updated_at fields)    │
└────────────┬────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼────┐
│  User  │      │  Post   │
└────────┘      └─────────┘
```

### 📝 Step-by-Step: TimeMixin তৈরি করা

#### Step 1: Mixin File তৈরি করুন

```bash
# ent/schema/mixin directory তৈরি করুন
mkdir -p ent/schema/mixin
```

#### Step 2: Time Mixin লিখুন

**File:** `ent/schema/mixin/time_mixin.go`

```go
package mixin

import (
    "time"
    
    "entgo.io/ent"
    "entgo.io/ent/schema/field"
    "entgo.io/ent/schema/mixin"
)

// TimeMixin implements the ent.Mixin for sharing
// time fields with package schemas.
type TimeMixin struct {
    mixin.Schema
}

// Fields of the TimeMixin.
func (TimeMixin) Fields() []ent.Field {
    return []ent.Field{
        field.Time("created_at").
            Immutable(). // একবার set হলে change করা যাবে না
            Default(time.Now), // automatic current time set হবে
            
        field.Time("updated_at").
            Default(time.Now).
            UpdateDefault(time.Now), // প্রতিবার update এ নতুন time set হবে
    }
}
```

**Laravel এর সাথে তুলনা:**
```php
// Laravel এ এটি automatic ছিল
class User extends Model {
    public $timestamps = true; // created_at, updated_at automatic
}
```

#### Step 3: Schema তে Mixin ব্যবহার করুন

**File:** `ent/schema/user.go`

```go
package schema

import (
    "entgo.io/ent"
    "entgo.io/ent/schema/field"
    "your-project/ent/schema/mixin"
)

// User holds the schema definition for the User entity.
type User struct {
    ent.Schema
}

// Mixin of the User.
func (User) Mixin() []ent.Mixin {
    return []ent.Mixin{
        mixin.TimeMixin{}, // TimeMixin যুক্ত করা হলো
    }
}

// Fields of the User.
func (User) Fields() []ent.Field {
    return []ent.Field{
        field.String("name"),
        field.String("email").Unique(),
        // created_at এবং updated_at automatically যুক্ত হয়ে গেছে
    }
}
```

### 🔥 Advanced Mixin: SoftDeleteMixin

Laravel এর `SoftDeletes` trait এর মতো:

**File:** `ent/schema/mixin/soft_delete_mixin.go`

```go
package mixin

import (
    "context"
    "time"
    
    "entgo.io/ent"
    "entgo.io/ent/dialect/sql"
    "entgo.io/ent/schema/field"
    "entgo.io/ent/schema/mixin"
)

// SoftDeleteMixin implements soft delete functionality
type SoftDeleteMixin struct {
    mixin.Schema
}

// Fields of the SoftDeleteMixin
func (SoftDeleteMixin) Fields() []ent.Field {
    return []ent.Field{
        field.Time("deleted_at").
            Optional(). // nullable field
            Nillable(), // pointer type (*time.Time)
    }
}

// Interceptors for soft delete
func (SoftDeleteMixin) Interceptors() []ent.Interceptor {
    return []ent.Interceptor{
        // Delete operation কে update এ convert করে
        ent.InterceptFunc(func(next ent.Querier) ent.Querier {
            return ent.QuerierFunc(func(ctx context.Context, q ent.Query) (ent.Value, error) {
                // শুধুমাত্র deleted_at NULL এমন records query করবে
                if q, ok := q.(*sql.Selector); ok {
                    q.Where(sql.IsNull("deleted_at"))
                }
                return next.Query(ctx, q)
            })
        }),
    }
}
```

**Laravel এর সাথে তুলনা:**
```php
// Laravel
class Post extends Model {
    use SoftDeletes; // deleted_at field যুক্ত হয়
}

// Query করলে deleted records automatically বাদ যায়
$posts = Post::all(); // শুধু non-deleted posts

// Deleted posts দেখতে চাইলে
$posts = Post::withTrashed()->get();
```

---

## 🎣 Hooks - Event Handling {#hooks}

### Laravel Events vs Ent Hooks

**Hooks** হলো schema lifecycle events যা create, update, delete operations এর সময় execute হয়।

```
┌─────────────────────────────────────────┐
│         Lifecycle Flow                  │
└─────────────────────────────────────────┘

Create Flow:
  Input → [OnCreate Hook] → Validation → Database → [OnCreate Return]

Update Flow:
  Input → [OnUpdate Hook] → Validation → Database → [OnUpdate Return]

Delete Flow:
  Query → [OnDelete Hook] → Database → Return
```

### 📊 Hook Types তুলনা

| Laravel Event | Ent Hook | কখন Execute হয় |
|--------------|----------|-----------------|
| `creating` | N/A (use default) | Before save, ভ্যালিডেশনের আগে |
| `created` | `OnCreate` return | After save successful |
| `updating` | N/A (use mutation) | Before update |
| `updated` | `OnUpdate` return | After update successful |
| `deleting` | N/A | Before delete |
| `deleted` | `OnDelete` return | After delete successful |
| `saving` | Mutation builder | Before any save |
| `saved` | Hook return | After any save |

### ✅ Hook Types in Ent

Ent এ ২ ধরনের hooks আছে:

1. **Schema Hooks** - নির্দিষ্ট schema র জন্য
2. **Global Hooks** - সব schemas এর জন্য

### 📝 Step-by-Step: Schema Hooks Implementation

#### Example 1: Email Normalization Hook (Creating Event এর মতো)

**File:** `ent/schema/user.go`

```go
package schema

import (
    "context"
    "strings"
    
    "entgo.io/ent"
    "entgo.io/ent/schema/field"
    "entgo.io/ent/schema/mixin"
    "your-project/ent/hook"
)

type User struct {
    ent.Schema
}

func (User) Mixin() []ent.Mixin {
    return []ent.Mixin{
        mixin.TimeMixin{},
    }
}

func (User) Fields() []ent.Field {
    return []ent.Field{
        field.String("name"),
        field.String("email").Unique(),
        field.String("password"),
    }
}

// Hooks of the User schema
func (User) Hooks() []ent.Hook {
    return []ent.Hook{
        // Hook #1: Email lowercase করা (creating event)
        hook.On(
            func(next ent.Mutator) ent.Mutator {
                return hook.UserFunc(func(ctx context.Context, m *gen.UserMutation) (ent.Value, error) {
                    // Email field পরিবর্তন করা হচ্ছে কিনা check করুন
                    if email, ok := m.Email(); ok {
                        // Email কে lowercase এ convert করুন
                        m.SetEmail(strings.ToLower(email))
                    }
                    // পরবর্তী mutator call করুন
                    return next.Mutate(ctx, m)
                })
            },
            // শুধুমাত্র Create এবং Update operation এ 🔥
            ent.OpCreate|ent.OpUpdateOne|ent.OpUpdate,
        ),
        
        // Hook #2: Password hashing (creating/updating event)
        hook.On(
            func(next ent.Mutator) ent.Mutator {
                return hook.UserFunc(func(ctx context.Context, m *gen.UserMutation) (ent.Value, error) {
                    // Password field পরিবর্তন করা হচ্ছে কিনা
                    if password, ok := m.Password(); ok {
                        // Password hash করুন (bcrypt ব্যবহার করুন)
                        hashedPassword, err := bcrypt.GenerateFromPassword(
                            []byte(password), 
                            bcrypt.DefaultCost,
                        )
                        if err != nil {
                            return nil, err
                        }
                        m.SetPassword(string(hashedPassword))
                    }
                    return next.Mutate(ctx, m)
                })
            },
            // শুধুমাত্র Create এবং Update operation এ 🔥
            ent.OpCreate|ent.OpUpdateOne,
        ),
    }
}
```

**Laravel এর সাথে তুলনা:**

```php
// Laravel Observer
class UserObserver {
    public function creating(User $user) {
        // Email lowercase করা
        $user->email = strtolower($user->email);
        
        // Password hash করা
        if ($user->password) {
            $user->password = bcrypt($user->password);
        }
    }
    
    public function updating(User $user) {
        $user->email = strtolower($user->email);
        
        if ($user->isDirty('password')) {
            $user->password = bcrypt($user->password);
        }
    }
}

// App\Providers\EventServiceProvider
User::observe(UserObserver::class);
```

#### Example 2: Audit Log Hook (Created Event)

**File:** `ent/schema/post.go`

```go
package schema

import (
    "context"
    "log"
    
    "entgo.io/ent"
    "entgo.io/ent/schema/field"
    "your-project/ent/hook"
)

type Post struct {
    ent.Schema
}

func (Post) Fields() []ent.Field {
    return []ent.Field{
        field.String("title"),
        field.Text("content"),
        field.Int("user_id"),
    }
}

func (Post) Hooks() []ent.Hook {
    return []ent.Hook{
        // Hook: Created event - audit log তৈরি করা
        hook.On(
            func(next ent.Mutator) ent.Mutator {
                return hook.PostFunc(func(ctx context.Context, m *gen.PostMutation) (ent.Value, error) {
                    // Database এ save করুন
                    v, err := next.Mutate(ctx, m)
                    if err != nil {
                        return nil, err
                    }
                    
                    // Save successful হওয়ার পর audit log তৈরি করুন
                    post := v.(*gen.Post)
                    log.Printf("New post created: ID=%d, Title=%s, UserID=%d", 
                        post.ID, post.Title, post.UserID)
                    
                    // Audit table এ entry করতে পারেন
                    // client.AuditLog.Create().
                    //     SetAction("POST_CREATED").
                    //     SetEntityID(post.ID).
                    //     SetUserID(post.UserID).
                    //     Save(ctx)
                    
                    return v, nil
                })
            },
            ent.OpCreate, // শুধুমাত্র Create operation এ
        ),
    }
}
```

**Laravel এর সাথে তুলনা:**

```php
class PostObserver {
    public function created(Post $post) {
        // Audit log তৈরি করা
        AuditLog::create([
            'action' => 'POST_CREATED',
            'entity_id' => $post->id,
            'user_id' => $post->user_id,
        ]);
        
        Log::info("New post created", [
            'id' => $post->id,
            'title' => $post->title,
        ]);
    }
}
```

### 🌍 Global Hooks

সব schemas এর জন্য একসাথে hooks apply করতে চাইলে:

**File:** `ent/client.go` বা `main.go`

```go
package main

import (
    "context"
    "log"
    
    "your-project/ent"
    "your-project/ent/hook"
)

func main() {
    client, err := ent.Open("sqlite3", "file:ent?mode=memory&cache=shared&_fk=1")
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()
    
    // Global hook যুক্ত করুন
    client.Use(func(next ent.Mutator) ent.Mutator {
        return ent.MutateFunc(func(ctx context.Context, m ent.Mutation) (ent.Value, error) {
            // প্রতিটি mutation এর আগে log করুন
            log.Printf("Mutation: %s on %s", m.Op(), m.Type())
            
            // Execute mutation
            v, err := next.Mutate(ctx, m)
            
            // Mutation এর পর
            if err == nil {
                log.Printf("Mutation successful: %s", m.Type())
            }
            
            return v, err
        })
    })
}
```

---

## 🔍 Interceptors - Query Modification {#interceptors}

### Laravel Query Scopes vs Ent Interceptors

**Interceptors** query execution এর আগে বা পরে query modify করতে পারে।

```
┌────────────────────────────────────────┐
│      Interceptor Flow                  │
└────────────────────────────────────────┘

Query Request
     │
     ▼
[Interceptor 1] ← Modify query
     │
     ▼
[Interceptor 2] ← Add filters
     │
     ▼
Database Query
     │
     ▼
[Interceptor 3] ← Transform results
     │
     ▼
Return Results
```

### 📊 Scope Types তুলনা

| Laravel | Ent | উদ্দেশ্য |
|---------|-----|----------|
| Local Scope | Query Helper | Reusable query conditions |
| Global Scope | Interceptor | Automatic query filtering |
| Dynamic Scope | Interceptor Chain | Runtime query modification |

### ✅ Interceptor Types

1. **Traverse Interceptors** - Query modify করার জন্য
2. **Query Interceptors** - Query execution intercept করার জন্য
3. **Mutation Interceptors** - Mutation intercept করার জন্য

### 📝 Step-by-Step: Interceptor Implementation

#### Example 1: Published Posts Scope

**Laravel Query Scope:**
```php
class Post extends Model {
    // Local scope
    public function scopePublished($query) {
        return $query->where('status', 'published');
    }
    
    // Usage
    // Post::published()->get();
}
```

**Ent Interceptor (Query Helper):**

**File:** `ent/post_query.go` (auto-generated তে add করুন)

```go
package ent

import (
    "context"
)

// Published filters published posts only
func (pq *PostQuery) Published() *PostQuery {
    return pq.Where(post.Status("published"))
}

// Usage:
// client.Post.Query().Published().All(ctx)
```

#### Example 2: Tenant Isolation Interceptor (Global Scope এর মতো)

এটি একটি powerful feature - Multi-tenant application এর জন্য।

**Laravel Global Scope:**
```php
class TenantScope implements Scope {
    public function apply(Builder $builder, Model $model) {
        $builder->where('tenant_id', auth()->user()->tenant_id);
    }
}

class Post extends Model {
    protected static function booted() {
        static::addGlobalScope(new TenantScope);
    }
}

// সব query তে automatic tenant_id filter apply হবে
$posts = Post::all(); // WHERE tenant_id = ?
```

**Ent Tenant Interceptor:**

**File:** `ent/interceptor/tenant.go`

```go
package interceptor

import (
    "context"
    "fmt"
    
    "entgo.io/ent"
    "entgo.io/ent/dialect/sql"
    "your-project/ent/post"
    "your-project/ent/user"
)

// TenantKey context key for tenant ID
type tenantKey struct{}

// WithTenant returns a new context with tenant ID
func WithTenant(ctx context.Context, tenantID int) context.Context {
    return context.WithValue(ctx, tenantKey{}, tenantID)
}

// GetTenant retrieves tenant ID from context
func GetTenant(ctx context.Context) (int, bool) {
    tenantID, ok := ctx.Value(tenantKey{}).(int)
    return tenantID, ok
}

// TenantInterceptor adds tenant_id filter to all queries
func TenantInterceptor() ent.Interceptor {
    return ent.InterceptFunc(func(next ent.Querier) ent.Querier {
        return ent.QuerierFunc(func(ctx context.Context, query ent.Query) (ent.Value, error) {
            // Context থেকে tenant ID নিন
            tenantID, ok := GetTenant(ctx)
            if !ok {
                return nil, fmt.Errorf("tenant ID not found in context")
            }
            
            // Query modify করুন
            switch q := query.(type) {
            case *PostQuery:
                // Post query তে tenant_id filter যুক্ত করুন
                q.Where(post.TenantID(tenantID))
                
            case *UserQuery:
                // User query তে tenant_id filter যুক্ত করুন
                q.Where(user.TenantID(tenantID))
                
            // অন্যান্য schema র জন্যও যুক্ত করুন
            }
            
            // Modified query execute করুন
            return next.Query(ctx, query)
        })
    })
}
```

**Client এ Interceptor যুক্ত করুন:**

```go
package main

import (
    "context"
    
    "your-project/ent"
    "your-project/ent/interceptor"
)

func main() {
    client, _ := ent.Open("postgres", "...")
    
    // Tenant interceptor যুক্ত করুন
    client.Intercept(interceptor.TenantInterceptor())
    
    // Usage with tenant context
    ctx := context.Background()
    ctx = interceptor.WithTenant(ctx, 123) // Tenant ID = 123
    
    // এই query automatic ভাবে WHERE tenant_id = 123 যুক্ত করবে
    posts, _ := client.Post.Query().All(ctx)
    
    // সব posts শুধুমাত্র tenant 123 এর হবে
    fmt.Println(posts)
}
```

#### Example 3: Soft Delete Interceptor

**File:** `ent/interceptor/soft_delete.go`

```go
package interceptor

import (
    "context"
    "time"
    
    "entgo.io/ent"
)

// SoftDeleteInterceptor automatically filters soft-deleted records
func SoftDeleteInterceptor() ent.Interceptor {
    return ent.TraverseFunc(func(ctx context.Context, q ent.Query) error {
        // সব query তে deleted_at IS NULL condition যুক্ত করুন
        if qr, ok := q.(interface {
            WhereP(...func(*sql.Selector))
        }); ok {
            qr.WhereP(
                sql.FieldIsNull("deleted_at"),
            )
        }
        return nil
    })
}

// WithTrashed returns context that includes soft-deleted records
func WithTrashed(ctx context.Context) context.Context {
    return context.WithValue(ctx, "include_trashed", true)
}
```

**Laravel এর সাথে তুলনা:**
```php
// Laravel
$posts = Post::all(); // Soft deleted বাদে
$posts = Post::withTrashed()->get(); // Soft deleted সহ
$posts = Post::onlyTrashed()->get(); // শুধু soft deleted
```

**Ent:**
```go
// Regular query - soft deleted বাদে
posts, _ := client.Post.Query().All(ctx)

// With trashed - soft deleted সহ
ctx = WithTrashed(ctx)
posts, _ := client.Post.Query().All(ctx)
```

---

## 🔐 Privacy Policy - Global Scopes {#privacy-policy}

### Laravel Global Scopes vs Ent Privacy

**Privacy Policy** হলো Ent এর সবচেয়ে powerful feature - automatic access control।

```
┌──────────────────────────────────────────┐
│         Privacy Layer                    │
└──────────────────────────────────────────┘

Query/Mutation Request
         │
         ▼
    [Privacy Rules]
         │
    ┌────┴────┐
    │         │
  Allow?    Deny?
    │         │
    ▼         ▼
Database    Error
```

### 📊 Privacy Rules Types

| Rule Type | উদ্দেশ্য | Laravel Equivalent |
|-----------|----------|-------------------|
| `AllowMutationRule` | Mutation allow করা | Gate/Policy authorization |
| `DenyMutationRule` | Mutation deny করা | Gate deny |
| `AllowReadRule` | Read access control | Query scope with auth check |
| `FilterRule` | Automatic filtering | Global scope |

### ✅ Privacy Policy কেন ব্যবহার করবেন?

1. **Centralized Authorization** - এক জায়গায় সব access control
2. **Type-Safe** - Compile-time checking
3. **Automatic** - Manual checking এর দরকার নেই
4. **Declarative** - Clear এবং readable

### 📝 Step-by-Step: Privacy Policy Implementation

#### Step 1: Privacy Feature Enable করুন

```bash
# Generate code with privacy feature
go run -mod=mod entgo.io/ent/cmd/ent generate --feature privacy ./ent/schema
```

#### Step 2: Basic Privacy Rules

**File:** `ent/schema/post.go`

```go
package schema

import (
    "entgo.io/ent"
    "entgo.io/ent/schema"
    "entgo.io/ent/schema/field"
    "your-project/ent/privacy"
    "your-project/rule"
)

type Post struct {
    ent.Schema
}

func (Post) Fields() []ent.Field {
    return []ent.Field{
        field.String("title"),
        field.Text("content"),
        field.Int("author_id"), // Post এর author
        field.Enum("status").Values("draft", "published"),
    }
}

// Policy of the Post schema
func (Post) Policy() ent.Policy {
    return privacy.Policy{
        Mutation: privacy.MutationPolicy{
            // Rule 1: Admin users সব কিছু করতে পারবে
            rule.AllowIfAdmin(),
            
            // Rule 2: Author শুধু নিজের post edit করতে পারবে
            rule.AllowIfAuthor(),
            
            // Rule 3: অন্য কেউ create করতে পারবে না
            privacy.DenyMutationOperationRule(ent.OpCreate),
        },
        
        Query: privacy.QueryPolicy{
            // Rule 1: Published posts সবাই দেখতে পারবে
            rule.AllowIfPublished(),
            
            // Rule 2: Draft posts শুধু author দেখতে পারবে
            rule.FilterAuthorRule(),
        },
    }
}
```

#### Step 3: Privacy Rules Implementation

**File:** `ent/rule/rule.go`

```go
package rule

import (
    "context"
    
    "entgo.io/ent"
    "entgo.io/ent/privacy"
    "your-project/ent/post"
    "your-project/ent/user"
    "your-project/ent/privacy"
)

// Viewer context key
type viewerKey struct{}

// Viewer holds user information
type Viewer struct {
    UserID  int
    IsAdmin bool
}

// NewContext returns context with viewer
func NewContext(ctx context.Context, v *Viewer) context.Context {
    return context.WithValue(ctx, viewerKey{}, v)
}

// FromContext returns viewer from context
func FromContext(ctx context.Context) (*Viewer, bool) {
    v, ok := ctx.Value(viewerKey{}).(*Viewer)
    return v, ok
}

// AllowIfAdmin allows mutation if user is admin
func AllowIfAdmin() privacy.MutationRule {
    return privacy.MutationRuleFunc(func(ctx context.Context, m ent.Mutation) error {
        viewer, ok := FromContext(ctx)
        if !ok {
            return privacy.Denyf("viewer not found in context")
        }
        
        if viewer.IsAdmin {
            return privacy.Allow // Admin access granted
        }
        
        return privacy.Skip // Try next rule
    })
}

// AllowIfAuthor allows mutation if user is the author
func AllowIfAuthor() privacy.MutationRule {
    return privacy.PostMutationRuleFunc(func(ctx context.Context, m *ent.PostMutation) error {
        viewer, ok := FromContext(ctx)
        if !ok {
            return privacy.Denyf("viewer not found in context")
        }
        
        // Check if updating/deleting
        if m.Op().Is(ent.OpUpdateOne | ent.OpDeleteOne) {
            // Get post author ID
            authorID, exists := m.AuthorID()
            if !exists {
                // If we're updating, get the current author
                id, _ := m.ID()
                post, err := m.Client().Post.Get(ctx, id)
                if err != nil {
                    return privacy.Denyf("post not found")
                }
                authorID = post.AuthorID
            }
            
            // Check if viewer is the author
            if authorID == viewer.UserID {
                return privacy.Allow
            }
        }
        
        return privacy.Skip
    })
}

// AllowIfPublished allows reading published posts
func AllowIfPublished() privacy.QueryRule {
    return privacy.PostQueryRuleFunc(func(ctx context.Context, q *ent.PostQuery) error {
        // Add filter: only published posts
        q.Where(post.Status("published"))
        return privacy.Skip
    })
}

// FilterAuthorRule filters posts by author for draft posts
func FilterAuthorRule() privacy.QueryRule {
    return privacy.PostQueryRuleFunc(func(ctx context.Context, q *ent.PostQuery) error {
        viewer, ok := FromContext(ctx)
        if !ok {
            // No viewer, only show published
            return privacy.Skip
        }
        
        // Show published posts OR author's own posts
        q.Where(
            post.Or(
                post.Status("published"),
                post.AuthorID(viewer.UserID),
            ),
        )
        
        return privacy.Skip
    })
}
```

**Laravel Policy এর সাথে তুলনা:**

```php
// Laravel Policy
class PostPolicy {
    public function update(User $user, Post $post) {
        // Admin can update any post
        if ($user->is_admin) {
            return true;
        }
        
        // Author can update their own post
        return $user->id === $post->author_id;
    }
    
    public function view(User $user, Post $post) {
        // Published posts can be viewed by anyone
        if ($post->status === 'published') {
            return true;
        }
        
        // Draft posts only by author
        return $user->id === $post->author_id;
    }
}

// Controller
public function update(Request $request, Post $post) {
    $this->authorize('update', $post); // Manual check
    
    $post->update($request->all());
}

// Query scope
class Post extends Model {
    protected static function booted() {
        static::addGlobalScope('published', function ($query) {
            if (!auth()->user()?->is_admin) {
                $query->where(function ($q) {
                    $q->where('status', 'published')
                      ->orWhere('author_id', auth()->id());
                });
            }
        });
    }
}
```

#### Step 4: Usage Example

```go
package main

import (
    "context"
    "fmt"
    
    "your-project/ent"
    "your-project/ent/rule"
)

func main() {
    client, _ := ent.Open("postgres", "...")
    defer client.Close()
    
    ctx := context.Background()
    
    // Scenario 1: Regular user trying to view posts
    regularUser := &rule.Viewer{UserID: 1, IsAdmin: false}
    ctx = rule.NewContext(ctx, regularUser)
    
    // এই query শুধু published posts এবং user 1 এর নিজের posts দেখাবে
    posts, err := client.Post.Query().All(ctx)
    if err != nil {
        fmt.Println("Error:", err)
    }
    fmt.Println("Regular user sees:", len(posts), "posts")
    
    // Scenario 2: Admin user trying to view posts
    adminUser := &rule.Viewer{UserID: 2, IsAdmin: true}
    ctx = rule.NewContext(ctx, adminUser)
    
    // Admin সব posts দেখতে পারবে
    posts, _ = client.Post.Query().All(ctx)
    fmt.Println("Admin sees:", len(posts), "posts")
    
    // Scenario 3: Update post
    regularUser = &rule.Viewer{UserID: 1, IsAdmin: false}
    ctx = rule.NewContext(ctx, regularUser)
    
    // User 1 শুধু নিজের post update করতে পারবে
    _, err = client.Post.UpdateOneID(1).
        SetTitle("Updated Title").
        Save(ctx)
    
    if err != nil {
        fmt.Println("Update failed:", err) // Permission denied
    }
    
    // Scenario 4: Admin update any post
    adminUser = &rule.Viewer{UserID: 2, IsAdmin: true}
    ctx = rule.NewContext(ctx, adminUser)
    
    // Admin যেকোনো post update করতে পারবে
    _, err = client.Post.UpdateOneID(1).
        SetTitle("Admin Updated").
        Save(ctx)
    
    if err == nil {
        fmt.Println("Admin update successful")
    }
}
```

---

## 🚀 Step-by-Step Professional Implementation {#professional-implementation}

এখন একটি সম্পূর্ণ professional blog application তৈরি করবো যাতে সব features ব্যবহার করা হবে।

### Project Structure

```
your-project/
├── ent/
│   ├── schema/
│   │   ├── mixin/
│   │   │   ├── time_mixin.go
│   │   │   └── soft_delete_mixin.go
│   │   ├── user.go
│   │   ├── post.go
│   │   └── comment.go
│   ├── rule/
│   │   └── rule.go
│   └── interceptor/
│       ├── tenant.go
│       └── audit.go
├── main.go
└── go.mod
```

### Step 1: Initialize Project

```bash
# Project তৈরি করুন
mkdir blog-app && cd blog-app
go mod init blog-app

# Ent install করুন
go get entgo.io/ent/cmd/ent

# Schema initialize করুন
go run entgo.io/ent/cmd/ent init User Post Comment
```

### Step 2: Create Mixins

**File:** `ent/schema/mixin/time_mixin.go`

```go
package mixin

import (
    "time"
    
    "entgo.io/ent"
    "entgo.io/ent/schema/field"
    "entgo.io/ent/schema/mixin"
)

type TimeMixin struct {
    mixin.Schema
}

func (TimeMixin) Fields() []ent.Field {
    return []ent.Field{
        field.Time("created_at").
            Immutable().
            Default(time.Now).
            Comment("Record creation timestamp"),
            
        field.Time("updated_at").
            Default(time.Now).
            UpdateDefault(time.Now).
            Comment("Record last update timestamp"),
    }
}
```

**File:** `ent/schema/mixin/soft_delete_mixin.go`

```go
package mixin

import (
    "time"
    
    "entgo.io/ent"
    "entgo.io/ent/schema/field"
    "entgo.io/ent/schema/mixin"
)

type SoftDeleteMixin struct {
    mixin.Schema
}

func (SoftDeleteMixin) Fields() []ent.Field {
    return []ent.Field{
        field.Time("deleted_at").
            Optional().
            Nillable().
            Comment("Soft delete timestamp"),
    }
}
```

### Step 3: Define Schemas with Relationships

**File:** `ent/schema/user.go`

```go
package schema

import (
    "context"
    "strings"
    
    "entgo.io/ent"
    "entgo.io/ent/schema/edge"
    "entgo.io/ent/schema/field"
    "entgo.io/ent/schema/mixin"
    "golang.org/x/crypto/bcrypt"
    
    "blog-app/ent/hook"
    genmixin "blog-app/ent/schema/mixin"
)

type User struct {
    ent.Schema
}

func (User) Mixin() []ent.Mixin {
    return []ent.Mixin{
        genmixin.TimeMixin{},
        genmixin.SoftDeleteMixin{},
    }
}

func (User) Fields() []ent.Field {
    return []ent.Field{
        field.String("name").
            NotEmpty().
            Comment("User full name"),
            
        field.String("email").
            Unique().
            NotEmpty().
            Comment("User email address"),
            
        field.String("password").
            Sensitive(). // Password hidden from logs
            NotEmpty().
            Comment("Hashed password"),
            
        field.Bool("is_admin").
            Default(false).
            Comment("Admin flag"),
            
        field.Int("tenant_id").
            Optional().
            Comment("Tenant ID for multi-tenancy"),
    }
}

func (User) Edges() []ent.Edge {
    return []ent.Edge{
        // User has many posts
        edge.To("posts", Post.Type).
            Comment("Posts authored by user"),
            
        // User has many comments
        edge.To("comments", Comment.Type).
            Comment("Comments made by user"),
    }
}

func (User) Hooks() []ent.Hook {
    return []ent.Hook{
        // Email lowercase এবং password hash
        hook.On(
            func(next ent.Mutator) ent.Mutator {
                return hook.UserFunc(func(ctx context.Context, m *gen.UserMutation) (ent.Value, error) {
                    // Email normalize
                    if email, ok := m.Email(); ok {
                        m.SetEmail(strings.ToLower(strings.TrimSpace(email)))
                    }
                    
                    // Password hash
                    if password, ok := m.Password(); ok {
                        hashed, err := bcrypt.GenerateFromPassword(
                            []byte(password),
                            bcrypt.DefaultCost,
                        )
                        if err != nil {
                            return nil, err
                        }
                        m.SetPassword(string(hashed))
                    }
                    
                    return next.Mutate(ctx, m)
                })
            },
            ent.OpCreate|ent.OpUpdateOne,
        ),
    }
}
```

**File:** `ent/schema/post.go`

```go
package schema

import (
    "entgo.io/ent"
    "entgo.io/ent/schema/edge"
    "entgo.io/ent/schema/field"
    "entgo.io/ent/schema/index"
    
    genmixin "blog-app/ent/schema/mixin"
)

type Post struct {
    ent.Schema
}

func (Post) Mixin() []ent.Mixin {
    return []ent.Mixin{
        genmixin.TimeMixin{},
        genmixin.SoftDeleteMixin{},
    }
}

func (Post) Fields() []ent.Field {
    return []ent.Field{
        field.String("title").
            NotEmpty().
            MaxLen(200).
            Comment("Post title"),
            
        field.String("slug").
            Unique().
            NotEmpty().
            Comment("URL-friendly slug"),
            
        field.Text("content").
            NotEmpty().
            Comment("Post content"),
            
        field.Enum("status").
            Values("draft", "published", "archived").
            Default("draft").
            Comment("Post status"),
            
        field.Int("author_id").
            Comment("Author user ID"),
            
        field.Int("tenant_id").
            Optional().
            Comment("Tenant ID"),
            
        field.Int("view_count").
            Default(0).
            NonNegative().
            Comment("Number of views"),
    }
}

func (Post) Edges() []ent.Edge {
    return []ent.Edge{
        // Post belongs to author (user)
        edge.From("author", User.Type).
            Ref("posts").
            Field("author_id").
            Unique().
            Required(),
            
        // Post has many comments
        edge.To("comments", Comment.Type),
    }
}

func (Post) Indexes() []ent.Index {
    return []ent.Index{
        // Index on status for faster filtering
        index.Fields("status"),
        
        // Composite index for tenant queries
        index.Fields("tenant_id", "status"),
        
        // Unique slug per tenant
        index.Fields("tenant_id", "slug").Unique(),
    }
}
```

**File:** `ent/schema/comment.go`

```go
package schema

import (
    "entgo.io/ent"
    "entgo.io/ent/schema/edge"
    "entgo.io/ent/schema/field"
    
    genmixin "blog-app/ent/schema/mixin"
)

type Comment struct {
    ent.Schema
}

func (Comment) Mixin() []ent.Mixin {
    return []ent.Mixin{
        genmixin.TimeMixin{},
        genmixin.SoftDeleteMixin{},
    }
}

func (Comment) Fields() []ent.Field {
    return []ent.Field{
        field.Text("content").
            NotEmpty().
            Comment("Comment content"),
            
        field.Int("post_id").
            Comment("Associated post ID"),
            
        field.Int("user_id").
            Comment("Comment author ID"),
            
        field.Bool("is_approved").
            Default(false).
            Comment("Moderation flag"),
    }
}

func (Comment) Edges() []ent.Edge {
    return []ent.Edge{
        // Comment belongs to post
        edge.From("post", Post.Type).
            Ref("comments").
            Field("post_id").
            Unique().
            Required(),
            
        // Comment belongs to user
        edge.From("user", User.Type).
            Ref("comments").
            Field("user_id").
            Unique().
            Required(),
    }
}
```

### Step 4: Generate Code

```bash
# Code generate করুন (without privacy first)
go generate ./ent

# Privacy সহ generate করতে চাইলে
go run -mod=mod entgo.io/ent/cmd/ent generate --feature privacy ./ent/schema
```

### Step 5: Create Complete Application

**File:** `main.go`

```go
package main

import (
    "context"
    "fmt"
    "log"
    
    "blog-app/ent"
    "blog-app/ent/post"
    "blog-app/ent/user"
    
    _ "github.com/mattn/go-sqlite3"
)

func main() {
    // Database connection
    client, err := ent.Open("sqlite3", "file:blog.db?cache=shared&_fk=1")
    if err != nil {
        log.Fatalf("failed opening connection: %v", err)
    }
    defer client.Close()
    
    // Run migration
    ctx := context.Background()
    if err := client.Schema.Create(ctx); err != nil {
        log.Fatalf("failed creating schema: %v", err)
    }
    
    // Create sample data
    if err := createSampleData(ctx, client); err != nil {
        log.Fatal(err)
    }
    
    // Query examples
    queryExamples(ctx, client)
}

func createSampleData(ctx context.Context, client *ent.Client) error {
    // Create users
    admin, err := client.User.Create().
        SetName("Admin User").
        SetEmail("admin@example.com").
        SetPassword("password123").
        SetIsAdmin(true).
        Save(ctx)
    if err != nil {
        return fmt.Errorf("creating admin: %w", err)
    }
    
    author, err := client.User.Create().
        SetName("John Doe").
        SetEmail("john@example.com").
        SetPassword("password123").
        Save(ctx)
    if err != nil {
        return fmt.Errorf("creating author: %w", err)
    }
    
    // Create posts
    post1, err := client.Post.Create().
        SetTitle("Getting Started with Ent").
        SetSlug("getting-started-ent").
        SetContent("This is a comprehensive guide...").
        SetStatus("published").
        SetAuthor(author).
        Save(ctx)
    if err != nil {
        return fmt.Errorf("creating post: %w", err)
    }
    
    post2, err := client.Post.Create().
        SetTitle("Advanced Ent Patterns").
        SetSlug("advanced-ent-patterns").
        SetContent("Learn advanced patterns...").
        SetStatus("draft").
        SetAuthor(author).
        Save(ctx)
    if err != nil {
        return fmt.Errorf("creating post: %w", err)
    }
    
    // Create comments
    _, err = client.Comment.Create().
        SetContent("Great article!").
        SetPost(post1).
        SetUser(admin).
        SetIsApproved(true).
        Save(ctx)
    if err != nil {
        return fmt.Errorf("creating comment: %w", err)
    }
    
    fmt.Println("✅ Sample data created successfully!")
    return nil
}

func queryExamples(ctx context.Context, client *ent.Client) {
    fmt.Println("\n📊 Query Examples:")
    fmt.Println("==================")
    
    // Example 1: Get all published posts with author
    fmt.Println("\n1. Published posts with authors:")
    posts, err := client.Post.Query().
        Where(post.Status("published")).
        WithAuthor(). // Eager load author
        All(ctx)
    if err != nil {
        log.Fatal(err)
    }
    
    for _, p := range posts {
        author := p.Edges.Author
        fmt.Printf("   - %s by %s (views: %d)\n", 
            p.Title, author.Name, p.ViewCount)
    }
    
    // Example 2: Get user with all their posts
    fmt.Println("\n2. Author with all posts:")
    authors, err := client.User.Query().
        Where(user.IsAdmin(false)).
        WithPosts(). // Eager load posts
        All(ctx)
    if err != nil {
        log.Fatal(err)
    }
    
    for _, author := range authors {
        fmt.Printf("   - %s has %d posts\n", 
            author.Name, len(author.Edges.Posts))
        for _, p := range author.Edges.Posts {
            fmt.Printf("     * %s (%s)\n", p.Title, p.Status)
        }
    }
    
    // Example 3: Complex query with joins
    fmt.Println("\n3. Posts with comment count:")
    type PostWithCommentCount struct {
        ID           int
        Title        string
        CommentCount int
    }
    
    var results []PostWithCommentCount
    err = client.Post.Query().
        Where(post.Status("published")).
        Modify(func(s *sql.Selector) {
            t := sql.Table("comments")
            s.LeftJoin(t).On(s.C("id"), t.C("post_id"))
            s.GroupBy(s.C("id"), s.C("title"))
            s.Select(
                s.C("id"),
                s.C("title"),
                sql.As(sql.Count("*"), "comment_count"),
            )
        }).
        Scan(ctx, &results)
    
    if err != nil {
        log.Fatal(err)
    }
    
    for _, r := range results {
        fmt.Printf("   - %s (%d comments)\n", r.Title, r.CommentCount)
    }
}
```

### Step 6: Run Application

```bash
# Dependencies install করুন
go mod tidy

# Application run করুন
go run main.go
```

---

## 📚 Laravel থেকে Ent Migration Cheat Sheet

### Common Patterns

| Task | Laravel Eloquent | Ent Framework |
|------|-----------------|---------------|
| **Model Definition** | `class User extends Model` | `type User struct { ent.Schema }` |
| **Timestamps** | `$timestamps = true` | `mixin.TimeMixin{}` |
| **Soft Deletes** | `use SoftDeletes` | `mixin.SoftDeleteMixin{}` |
| **Creating** | `User::create([...])` | `client.User.Create().Set...().Save(ctx)` |
| **Finding** | `User::find(1)` | `client.User.Get(ctx, 1)` |
| **Updating** | `$user->update([...])` | `user.Update().Set...().Save(ctx)` |
| **Deleting** | `$user->delete()` | `client.User.DeleteOne(user).Exec(ctx)` |
| **Query Builder** | `User::where('active', true)` | `client.User.Query().Where(user.Active(true))` |
| **Relationships** | `$user->posts` | `user.QueryPosts().All(ctx)` |
| **Eager Loading** | `User::with('posts')` | `client.User.Query().WithPosts()` |
| **Observers** | `UserObserver` | Schema `Hooks()` |
| **Scopes** | `scopeActive($query)` | Custom query method |
| **Global Scopes** | `addGlobalScope(...)` | Interceptor |
| **Policies** | `PostPolicy` | Privacy `Policy()` |
| **Events** | `Event::listen(...)` | Hooks |

---

## 🎯 Best Practices Checklist

### ✅ Mixins
- [ ] TimeMixin সব schemas এ ব্যবহার করুন
- [ ] SoftDeleteMixin প্রয়োজনীয় schemas এ যুক্ত করুন
- [ ] Custom mixins তৈরি করে কোড duplication এড়িয়ে চলুন
- [ ] Mixin এ hooks এবং indexes যুক্ত করতে পারেন

### ✅ Hooks
- [ ] Validation hooks সবার আগে রাখুন
- [ ] Side effects (email, logs) সবার শেষে রাখুন
- [ ] Hook এ database query করার সময় সাবধান থাকুন (infinite loop)
- [ ] Error handling সঠিকভাবে করুন

### ✅ Interceptors
- [ ] Tenant isolation interceptor ব্যবহার করুন (multi-tenant app)
- [ ] Audit logging interceptor যুক্ত করুন
- [ ] Performance monitoring interceptor consider করুন
- [ ] Interceptor chain এর order মনে রাখুন

### ✅ Privacy
- [ ] সব user-facing schemas এ privacy policy যুক্ত করুন
- [ ] Admin bypass rule সবার আগে রাখুন
- [ ] Least privilege principle follow করুন
- [ ] Test cases লিখুন privacy rules এর জন্য

### ✅ Performance
- [ ] Eager loading ব্যবহার করুন (N+1 query problem এড়ান)
- [ ] Appropriate indexes তৈরি করুন
- [ ] Query optimize করুন
- [ ] Connection pooling configure করুন

---

## 🔥 Advanced Tips

### 1. Custom Query Helpers 🔥

```go
// Helper methods যুক্ত করুন generated code এ
// ent/post_query.go

func (pq *PostQuery) Published() *PostQuery {
    return pq.Where(post.Status("published"))
}

func (pq *PostQuery) ByAuthor(authorID int) *PostQuery {
    return pq.Where(post.AuthorID(authorID))
}

func (pq *PostQuery) Recent(limit int) *PostQuery {
    return pq.Order(ent.Desc(post.FieldCreatedAt)).Limit(limit)
}

// Usage
posts, _ := client.Post.Query().
    Published().
    Recent(10).
    All(ctx)
```

### 2. Transaction Management

```go
// Laravel DB::transaction() এর মতো
func createPostWithTags(ctx context.Context, client *ent.Client) error {
    tx, err := client.Tx(ctx)
    if err != nil {
        return err
    }
    
    // Rollback function
    defer func() {
        if v := recover(); v != nil {
            tx.Rollback()
            panic(v)
        }
    }()
    
    // Create post
    post, err := tx.Post.Create().
        SetTitle("New Post").
        SetContent("Content").
        Save(ctx)
    if err != nil {
        return rollback(tx, err)
    }
    
    // Create tags
    for _, tagName := range []string{"golang", "ent"} {
        _, err := tx.Tag.Create().
            SetName(tagName).
            AddPosts(post).
            Save(ctx)
        if err != nil {
            return rollback(tx, err)
        }
    }
    
    // Commit transaction
    return tx.Commit()
}

func rollback(tx *ent.Tx, err error) error {
    if rerr := tx.Rollback(); rerr != nil {
        err = fmt.Errorf("%w: %v", err, rerr)
    }
    return err
}
```

### 3. Pagination

```go
// Laravel paginate() এর মতো
func getPaginatedPosts(ctx context.Context, client *ent.Client, page, perPage int) (*PaginatedResult, error) {
    offset := (page - 1) * perPage
    
    // Count total
    total, err := client.Post.Query().
        Where(post.Status("published")).
        Count(ctx)
    if err != nil {
        return nil, err
    }
    
    // Get paginated data
    posts, err := client.Post.Query().
        Where(post.Status("published")).
        Offset(offset).
        Limit(perPage).
        Order(ent.Desc(post.FieldCreatedAt)).
        All(ctx)
    if err != nil {
        return nil, err
    }
    
    return &PaginatedResult{
        Data:       posts,
        Total:      total,
        Page:       page,
        PerPage:    perPage,
        TotalPages: (total + perPage - 1) / perPage,
    }, nil
}

type PaginatedResult struct {
    Data       []*ent.Post
    Total      int
    Page       int
    PerPage    int
    TotalPages int
}
```

---

## 📖 সারসংক্ষেপ

এই guide এ আমরা শিখলাম:

1. **Mixins** - কোড reuse করার জন্য (Laravel Traits এর মতো)
2. **Hooks** - Lifecycle events handle করার জন্য (Laravel Observers এর মতো)
3. **Interceptors** - Query modify করার জন্য (Laravel Query Scopes/Global Scopes)
4. **Privacy Policy** - Access control এর জন্য (Laravel Policies)

Laravel Eloquent এর সাথে Ent Framework এর মূল পার্থক্য:

- **Type-safe**: Compile-time error checking
- **Explicit**: সব কিছু explicit ভাবে define করতে হয়
- **Code generation**: Schema থেকে code generate হয়
- **Performance**: Optimized queries এবং better performance

---

## 🤝 পরবর্তী পদক্ষেপ

1. Official documentation পড়ুন: https://entgo.io
2. Example projects দেখুন: https://github.com/ent/ent/tree/master/examples
3. আপনার existing Laravel project কে Ent এ migrate করার planning করুন
4. Testing এবং Mocking নিয়ে আরও জানুন

আশা করি এই guide আপনার Laravel থেকে Ent Framework এ transition সহজ করবে! 🚀
