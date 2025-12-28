
# Part 1: Copy, Paste, Run

> **How to Use This Section**: Follow each step in order. Copy the code, paste it, run it, see the output. Each step builds on the previous one **without removing code**.

---

## Step 1: Project Setup {#step1-setup}

### 1.1 Create Project

```bash
mkdir ent-playground
cd ent-playground
go mod init ent-playground
```

### 1.2 Install Dependencies

```bash
# Install ENT
go get entgo.io/ent/cmd/ent

# Install Atlas (migration tool)
go install ariga.io/atlas/cmd/atlas@latest

# Verify Atlas installation
atlas version # You should now see something like: atlas version v0.xx.x Not atlas version - development 

# Install PostgreSQL driver
go get github.com/lib/pq
```

**🔍 What is Atlas and Why Do We Use It?**

**What is Atlas?**
- Atlas is a database schema migration tool that generates SQL migration files by comparing your desired schema (from ENT) with your current database state.

**What Does Atlas Do?**
- **Compares schemas**: Takes your ENT schema and compares it with your actual database
- **Generates SQL**: Creates versioned SQL migration files with the exact changes needed
- **Applies migrations**: Safely applies migrations to your database with rollback support
- **Tracks history**: Maintains a migration history to know which migrations have been applied

**Is Migration Possible Without Atlas?**
- ✅ **Yes**, you can write SQL migrations manually
- ✅ Use other tools like `golang-migrate`, `goose`, or `Flyway`
- ❌ **But** you lose ENT's schema-driven workflow and have to manually write CREATE TABLE, ALTER TABLE statements

**Why We Use Atlas Here?**
1. **ENT Integration**: Atlas understands ENT schemas directly (`ent://ent/schema`)
2. **Auto-generates SQL**: No manual SQL writing - Atlas diffs your schema vs database
3. **Type-safe**: Ensures your migrations match your Go code
4. **Organized**: Creates versioned, timestamped migration files
5. **Production-ready**: Supports rollbacks, dry-runs, and migration linting

> **Alternative**: ENT has auto-migration (`client.Schema.Create(ctx)`), but it's **not recommended for production** as it can't rollback and doesn't preserve migration history.

### 1.3 Setup Databases

```bash
# Create main database (for your actual data)
psql -U postgres -c "CREATE DATABASE entdb;"

# Create dev database (Atlas uses this as scratch space for migrations)
psql -U postgres -c "CREATE DATABASE entdb_dev;"
```

**✅ Expected Output**: `CREATE DATABASE` (twice)

**💡 Why two databases?**
- `entdb`: Your actual application database with real data
- `entdb_dev`: Atlas scratch space for computing schema diffs (always kept clean)

**🔄 If databases already exist and need fresh start:**
```bash
# Drop and recreate main database
psql -U postgres -c "DROP DATABASE IF EXISTS entdb;"
psql -U postgres -c "CREATE DATABASE entdb;"

# Drop and recreate dev database
psql -U postgres -c "DROP DATABASE IF EXISTS entdb_dev;"
psql -U postgres -c "CREATE DATABASE entdb_dev;"
```

---

## Step 2: User Schema & Basic CRUD {#step2-user-crud}

### 2.1 Create User Schema

```bash
# Create ent/schema folder and User schema
go run -mod=mod entgo.io/ent/cmd/ent new User
```

**📁 This creates:**
```
ent/
 ├── schema/
 │   └── user.go
 └── generate.go
```

### 2.2 Define User Fields

**📝 Edit `ent/schema/user.go`:**

```go
package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

type User struct {
	ent.Schema
}

func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("email").
			Unique(),
		field.Int("age").
			Optional(),
	}
}

func (User) Edges() []ent.Edge {
	return nil
}
```

### 2.3 Generate Code

```bash
go generate ./ent
```

**✅ Expected**: Generates ~20 files in `ent/` directory

**💡 How it works**: The `ent/generate.go` file contains:
```go
package ent

//go:generate go run -mod=mod entgo.io/ent/cmd/ent generate ./schema
```

Running `go generate ./ent` executes this directive and generates all ENT code.

### 2.4 Create Migration

```bash
# Create migrations directory
mkdir migrations

atlas migrate diff initial \
  --dir "file://migrations" \
  --to "ent://ent/schema" \
  --dev-url "postgres://postgres:password@localhost:5432/entdb_dev?sslmode=disable"
```

**Note**: Replace `password` with your PostgreSQL password

**✅ Expected**: Creates migration file in `migrations/`

**📁 Migration file created:**
```
migrations/
├── 20250101120000_initial.sql    ← The actual SQL commands
└── atlas.sum                      ← Checksum for integrity
```

### 2.5 Apply Migration

```bash
atlas migrate apply \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"
```

**✅ Expected Output**: 
```
Migrating to version 20250101120000 (1 migrations in total):
  -- migrating version 20250101120000
    -> CREATE TABLE...
  -- ok (10ms)
```

### 2.6 Create Main File with CRUD

**📝 Create `main.go`:**

```go
package main

import (
	"context"
	"fmt"
	"log"

	_ "github.com/lib/pq"
	"ent-playground/ent"
	"ent-playground/ent/user"
)

func main() {
	// Initialize database connection
	client, err := ent.Open("postgres", 
		"host=localhost port=5432 user=postgres password=password dbname=entdb sslmode=disable")
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	ctx := context.Background()

	fmt.Println("=== ENT Basic CRUD Demo ===\n")

	// CREATE
	fmt.Println("1. Creating users...")
	user1, err := client.User.
		Create().
		SetName("Tonmoy Talukder").
		SetEmail("tonmoy@example.com").
		SetAge(25).
		Save(ctx)
	if err != nil {
		log.Fatalf("failed creating user: %v", err)
	}
	fmt.Printf("✅ Created: ID=%d, Name=%s, Email=%s, Age=%d\n\n", 
		user1.ID, user1.Name, user1.Email, user1.Age)

	user2, err := client.User.
		Create().
		SetName("John Doe").
		SetEmail("john@example.com").
		SetAge(30).
		Save(ctx)
	if err != nil {
		log.Fatalf("failed creating user: %v", err)
	}
	fmt.Printf("✅ Created: ID=%d, Name=%s, Email=%s, Age=%d\n\n", 
		user2.ID, user2.Name, user2.Email, user2.Age)

	// READ ONE
	fmt.Println("2. Reading user by email...")
	foundUser, err := client.User.
		Query().
		Where(user.EmailEQ("tonmoy@example.com")).
		Only(ctx)
	if err != nil {
		log.Fatalf("failed querying user: %v", err)
	}
	fmt.Printf("✅ Found: ID=%d, Name=%s, Email=%s\n\n", 
		foundUser.ID, foundUser.Name, foundUser.Email)

	// READ ALL
	fmt.Println("3. Reading all users...")
	users, err := client.User.Query().All(ctx)
	if err != nil {
		log.Fatalf("failed querying users: %v", err)
	}
	fmt.Printf("✅ Total users: %d\n", len(users))
	for _, u := range users {
		fmt.Printf("   - ID=%d, Name=%s, Age=%d\n", u.ID, u.Name, u.Age)
	}
	fmt.Println()

	// UPDATE
	fmt.Println("4. Updating user...")
	err = client.User.
		UpdateOneID(user1.ID).
		SetAge(26).
		Exec(ctx)
	if err != nil {
		log.Fatalf("failed updating user: %v", err)
	}
	fmt.Printf("✅ Updated user ID=%d age to 26\n\n", user1.ID)

	// Verify update
	updated, _ := client.User.Get(ctx, user1.ID)
	fmt.Printf("   Verified: Name=%s, Age=%d\n\n", updated.Name, updated.Age)

	// COUNT
	fmt.Println("5. Counting users...")
	count, err := client.User.Query().Count(ctx)
	if err != nil {
		log.Fatalf("failed counting users: %v", err)
	}
	fmt.Printf("✅ Total count: %d\n\n", count)

	// DELETE
	fmt.Println("6. Deleting user...")
	err = client.User.DeleteOneID(user2.ID).Exec(ctx)
	if err != nil {
		log.Fatalf("failed deleting user: %v", err)
	}
	fmt.Printf("✅ Deleted user ID=%d\n\n", user2.ID)

	// Final count
	finalCount, _ := client.User.Query().Count(ctx)
	fmt.Printf("Final user count: %d\n", finalCount)
}
```

**Note**: Update the database connection string with your PostgreSQL password

### 2.7 Run It!

```bash
go run .
```

**✅ Expected Output:**
```
=== ENT Basic CRUD Demo ===

1. Creating users...
✅ Created: ID=1, Name=Tonmoy Talukder, Email=tonmoy@example.com, Age=25

✅ Created: ID=2, Name=John Doe, Email=john@example.com, Age=30

2. Reading user by email...
✅ Found: ID=1, Name=Tonmoy Talukder, Email=tonmoy@example.com

3. Reading all users...
✅ Total users: 2
   - ID=1, Name=Tonmoy Talukder, Age=25
   - ID=2, Name=John Doe, Age=30

4. Updating user...
✅ Updated user ID=1 age to 26

   Verified: Name=Tonmoy Talukder, Age=26

5. Counting users...
✅ Total count: 2

6. Deleting user...
✅ Deleted user ID=2

Final user count: 1
```

🎉 **Congratulations!** You've successfully created your first ENT application with full CRUD operations.

---

## Step 2.8: Migration Management - Essential Commands {#migration-management}

> **Important**: Before proceeding to Step 3, understand these migration commands. They're crucial for managing database changes safely.

### What Are Migrations?

Migrations are version-controlled SQL scripts that change your database schema. Think of them like Git commits, but for your database structure.

### Migration Commands Reference

#### 1️⃣ **Create a New Migration (Diff)**

When you modify your schema, create a migration:

```bash
atlas migrate diff migration_name \
  --dir "file://migrations" \
  --to "ent://ent/schema" \
  --dev-url "postgres://postgres:password@localhost:5432/entdb_dev?sslmode=disable"
```

**What it does**: Compares your ENT schema with the current migrations and creates a new migration file with the differences.

#### 2️⃣ **Apply Migrations (Forward Migration)**

Apply pending migrations to your database:

```bash
atlas migrate apply \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"
```

**What it does**: Runs all pending migration files against your database. It's smart - only runs migrations that haven't been applied yet.

**⚠️ IMPORTANT - Data Safety**: Forward migrations using `atlas migrate diff` **automatically preserve existing data**. When you add new columns, ENT generates `ALTER TABLE ADD COLUMN` statements, not `DROP` and recreate. Your existing data remains intact!

#### 3️⃣ **Check Migration Status**

See which migrations are applied and which are pending:

```bash
atlas migrate status \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"
```

**Example Output**:
```
Migration Status: OK
  Current Version: 20250128120000 (1 migration applied)
  Latest Version:  20250128120000
  Pending:         0 migrations
```

#### 4️⃣ **Rollback to Specific Version**

Rollback to a previous migration version:

```bash
atlas migrate down \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable" \
  --to-version 20250128120000
```

**What it does**: Reverts the database to the specified migration version.

**⚠️ Warning**: Not all migrations are reversible. Atlas needs down migration SQL which isn't automatically generated.

#### 5️⃣ **Fresh Migration (Clean Slate)**

Start completely fresh - drop all tables and reapply all migrations:

```bash
# Step 1: Drop all tables manually or recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS entdb;"
psql -U postgres -c "CREATE DATABASE entdb;"

# Step 2: Apply all migrations from scratch
atlas migrate apply \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"
```

**When to use**: Development only! Never in production. Useful when you want to test migrations from a clean state.

#### 6️⃣ **Lint Migrations**

Check migrations for issues before applying:

```bash
atlas migrate lint \
  --dir "file://migrations" \
  --dev-url "postgres://postgres:password@localhost:5432/entdb_dev?sslmode=disable" \
  --latest 1
```

**What it does**: Analyzes your migrations for destructive changes, syntax errors, and best practice violations.

### 📚 Complete Migration Workflow Examples

#### Example 1: Adding a New Column (Forward Migration - No Data Loss)

**Scenario**: Add a `phone` field to User without losing existing data.

**Step 1**: Update your schema
```go
// ent/schema/user.go
func (User) Fields() []ent.Field {
    return []ent.Field{
        field.String("name"),
        field.String("email").Unique(),
        field.Int("age").Optional(),
        field.String("phone").Optional(),  // ← New field
    }
}
```

**Step 2**: Generate code
```bash
go generate ./ent
```

**Step 3**: Create migration
```bash
atlas migrate diff add_phone_to_users \
  --dir "file://migrations" \
  --to "ent://ent/schema" \
  --dev-url "postgres://postgres:password@localhost:5432/entdb_dev?sslmode=disable"
```

**Step 4**: Review the generated SQL
```bash
cat migrations/*_add_phone_to_users.sql
```

**Expected SQL**:
```sql
-- modify "users" table
ALTER TABLE "users" ADD COLUMN "phone" character varying NULL;
```

**✅ Safe**: This only adds a column, existing data is preserved!

**Step 5**: Apply migration
```bash
atlas migrate apply \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"
```

**Step 6**: Verify
```bash
# Check that existing users still have all their data
go run .
```

**✅ Result**: New `phone` column added, all existing user data intact!

**🛡️ Data Safety Guarantee**: The migration generates `ALTER TABLE "users" ADD COLUMN "phone"` - this NEVER deletes existing data. All your existing user records remain unchanged, they just get a NULL value in the new phone column.

---

#### Example 2: Renaming a Column (Potential Data Loss)

**Scenario**: Rename `name` to `full_name`.

**⚠️ Warning**: Direct rename in schema creates DROP + ADD, losing data!

**❌ Wrong Way** (Data Loss):
```go
// DON'T DO THIS - Will lose data!
field.String("full_name"),  // Changed from "name"
```

**✅ Right Way** (Safe Migration):

**Option A: Manual Migration with Data Copy**

```bash
# 1. Create empty migration
atlas migrate diff rename_name_to_full_name \
  --dir "file://migrations" \
  --to "ent://ent/schema" \
  --dev-url "postgres://postgres:password@localhost:5432/entdb_dev?sslmode=disable"

# 2. Edit the migration file manually
```

**Edit the generated SQL file**:
```sql
-- Add new column
ALTER TABLE "users" ADD COLUMN "full_name" character varying NULL;

-- Copy data
UPDATE "users" SET "full_name" = "name";

-- Make it NOT NULL if needed
ALTER TABLE "users" ALTER COLUMN "full_name" SET NOT NULL;

-- Drop old column
ALTER TABLE "users" DROP COLUMN "name";
```

**Option B: Two-Step Migration (Safer)**

**Migration 1**: Add new column
```go
// Add both fields temporarily
field.String("name"),
field.String("full_name").Optional(),
```

**Migration 2**: Copy data in application code, then remove old field

---

#### Example 3: Fresh Start (Development Only)

**When**: You've been experimenting and want to reset everything.

```bash
# 1. Save your schema files (they're in ent/schema/)
# They're safe - we only reset the database

# 2. Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS entdb;"
psql -U postgres -c "CREATE DATABASE entdb;"

# 3. Remove old migrations (optional - only if starting completely fresh)
# rm -rf migrations/*

# 4. Generate new initial migration
go generate ./ent
atlas migrate diff initial \
  --dir "file://migrations" \
  --to "ent://ent/schema" \
  --dev-url "postgres://postgres:password@localhost:5432/entdb_dev?sslmode=disable"

# 5. Apply migrations
atlas migrate apply \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"

# 6. Run your app
go run .
```

**✅ Result**: Clean database, all migrations reapplied from scratch.

---

#### Example 4: Checking Migration Status Before Deployment

**Best Practice**: Always check before deploying.

```bash
# 1. Check what migrations are pending
atlas migrate status \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"

# 2. Lint migrations for issues
atlas migrate lint \
  --dir "file://migrations" \
  --dev-url "postgres://postgres:password@localhost:5432/entdb_dev?sslmode=disable" \
  --latest 1

# 3. If all good, apply
atlas migrate apply \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"
```

---

### 🚨 Common Migration Pitfalls

#### ❌ Pitfall 1: "Database is not clean" Error

**Error Message**:
```
Error: sql/migrate: connected database is not clean: found table "users" in schema "public"
```

**Cause**: You're trying to create a migration diff, but the database already has tables from a previous migration.

**Solution**:
```bash
# Clean the dev database (Atlas scratch space)
psql -U postgres -d entdb_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then retry your migration diff command
atlas migrate diff your_migration_name \
  --dir "file://migrations" \
  --to "ent://ent/schema" \
  --dev-url "postgres://postgres:password@localhost:5432/entdb_dev?sslmode=disable"
```

**💡 Why this works**: `entdb_dev` is your Atlas scratch database for computing diffs. It needs to be clean to compare schemas properly. Your actual data in `entdb` remains safe!

#### ❌ Pitfall 2: Editing Old Migration Files

**Don't**: Edit migration files that have already been applied.

**Why**: Atlas tracks applied migrations. Editing them causes checksum mismatches.

**Do**: Create a new migration instead.

#### ❌ Pitfall 3: Not Reviewing Generated SQL

**Always** review the SQL before applying:

```bash
# After creating migration, review it
cat migrations/*_your_migration.sql
```

Check for:
- Data-destructive operations (DROP, ALTER with data loss)
- Missing indexes
- Incorrect types

---

### 🎯 Migration Best Practices Checklist

- [ ] **Use separate databases**: `entdb` for actual data (`--url`), `entdb_dev` for Atlas scratch space (`--dev-url`)
- [ ] **Review generated SQL** before applying - ensure no DROP statements
- [ ] **Test migrations** in development first
- [ ] **Never edit applied migrations** - create new ones instead
- [ ] **Keep migrations in version control** (Git)
- [ ] **Use descriptive names** for migrations (e.g., `add_user_phone_field`)
- [ ] **Backup production** before running migrations
- [ ] **Verify data preservation** - forward migrations should use ALTER TABLE ADD, not DROP
- [ ] **Plan for rollbacks** (though Atlas doesn't auto-generate down migrations)
- [ ] **Use transactions** when possible (Atlas does this automatically for PostgreSQL)

---

### 📝 Quick Command Reference Card

```bash
# 1. CREATE MIGRATION (after schema change)
atlas migrate diff migration_name \
  --dir "file://migrations" \
  --to "ent://ent/schema" \
  --dev-url "postgres://postgres:password@localhost:5432/entdb_dev?sslmode=disable"

# 2. APPLY MIGRATIONS (to main database)
atlas migrate apply \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"

# 3. CHECK STATUS
atlas migrate status \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"

# 4. LINT MIGRATIONS
atlas migrate lint \
  --dir "file://migrations" \
  --dev-url "postgres://postgres:password@localhost:5432/entdb_dev?sslmode=disable"

# 5. FRESH START (Development only!)
psql -U postgres -c "DROP DATABASE entdb; CREATE DATABASE entdb;"
atlas migrate apply \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"
```

---

## Step 3: Add Post Schema & Relations {#step3-post-relations}

### 3.1 Create Post Schema

```bash
go run -mod=mod entgo.io/ent/cmd/ent new Post
```

### 3.2 Define Post Fields

**📝 Edit `ent/schema/post.go`:**

```go
package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Post struct {
	ent.Schema
}

func (Post) Fields() []ent.Field {
	return []ent.Field{
		field.String("title"),
		field.Text("content"),
		field.Time("created_at").
			Default(time.Now),
		field.Bool("published").
			Default(false),
	}
}

func (Post) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("author", User.Type).
			Ref("posts").
			Unique().
			Required(),
	}
}
```

### 3.3 Update User Schema with Posts Edge

**📝 Edit `ent/schema/user.go` - Update the Edges method:**

```go
package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type User struct {
	ent.Schema
}

func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("email").
			Unique(),
		field.Int("age").
			Optional(),
	}
}

func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("posts", Post.Type),  // Add this line
	}
}
```

### 3.4 Generate Code

```bash
go generate ./ent
```

### 3.5 Create Migration

**🧹 Clean dev database first (Atlas needs a clean scratch space):**
```bash
psql -U postgres -d entdb_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

```bash
atlas migrate diff post_add_posts \
  --dir "file://migrations" \
  --to "ent://ent/schema" \
  --dev-url "postgres://postgres:password@localhost:5432/entdb_dev?sslmode=disable"
```

**💡 Data Safety**: This migration will create the `posts` table and add a foreign key to `users` table. Your existing user data remains completely intact!

**📁 Versioned Migration Files**: You should now have **two** migration files:
```
migrations/
├── 20250101120000_user_initial.sql     ← First migration (users table)
├── 20250101120100_post_add_posts.sql  ← Second migration (posts table)
└── atlas.sum
```

**⚠️ CRITICAL**: **NEVER delete old migration files!** Each file represents a point in your database history. Deleting migrations breaks version control and makes rollback impossible.

### 3.6 Apply Migration

```bash
atlas migrate apply \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"
```

### 3.7 Update Main - Add Post Creation

**📝 Replace entire `main.go` with:**

```go
package main

import (
	"context"
	"fmt"
	"log"

	"ent-playground/ent"
	"ent-playground/ent/user"

	_ "github.com/lib/pq"
)

func main() {
	client, err := ent.Open("postgres",
		"host=localhost port=5432 user=postgres password=password dbname=entdb sslmode=disable")
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	ctx := context.Background()
	createPostsDemo(ctx, client)
}

func createPostsDemo(ctx context.Context, client *ent.Client) {
	fmt.Println("\n=== Creating Posts with Relations ===\n")

	// Get existing user or create new one
	user, err := client.User.
		Query().
		Where(user.EmailEQ("tonmoy@example.com")).
		Only(ctx)
	
	if err != nil {
		// Create user if doesn't exist
		user, err = client.User.
			Create().
			SetName("Tonmoy Talukder").
			SetEmail("tonmoy@example.com").
			SetAge(25).
			Save(ctx)
		if err != nil {
			log.Fatalf("failed creating user: %v", err)
		}
	}

	fmt.Printf("User: %s (ID=%d)\n\n", user.Name, user.ID)

	// Create posts for user
	post1, err := client.Post.
		Create().
		SetTitle("My First Blog Post").
		SetContent("This is the content of my first blog post using ENT!").
		SetPublished(true).
		SetAuthor(user).
		Save(ctx)
	if err != nil {
		log.Fatalf("failed creating post: %v", err)
	}
	fmt.Printf("✅ Created Post: ID=%d, Title=%s\n", post1.ID, post1.Title)

	post2, err := client.Post.
		Create().
		SetTitle("Understanding ENT Relations").
		SetContent("ENT makes it easy to work with database relations.").
		SetPublished(true).
		SetAuthor(user).
		Save(ctx)
	if err != nil {
		log.Fatalf("failed creating post: %v", err)
	}
	fmt.Printf("✅ Created Post: ID=%d, Title=%s\n", post2.ID, post2.Title)

	post3, err := client.Post.
		Create().
		SetTitle("Draft Post").
		SetContent("This is a draft post, not published yet.").
		SetAuthor(user).
		Save(ctx)
	if err != nil {
		log.Fatalf("failed creating post: %v", err)
	}
	fmt.Printf("✅ Created Post: ID=%d, Title=%s (Draft)\n\n", post3.ID, post3.Title)

	// Query user with posts
	userWithPosts, err := client.User.
		Query().
		Where(user.EmailEQ("tonmoy@example.com")).
		WithPosts().
		Only(ctx)
	if err != nil {
		log.Fatalf("failed querying user with posts: %v", err)
	}

	fmt.Printf("User '%s' has %d posts:\n", userWithPosts.Name, len(userWithPosts.Edges.Posts))
	for _, p := range userWithPosts.Edges.Posts {
		status := "Published"
		if !p.Published {
			status = "Draft"
		}
		fmt.Printf("  - %s (%s)\n", p.Title, status)
	}
}
```

### 3.8 Run with Relations

```bash
# Ensure dependencies are up to date
go mod tidy

# Run the application
go run .
```

**✅ Expected Output:**

```
=== Creating Posts with Relations ===

User: Tonmoy Talukder (ID=1)

✅ Created Post: ID=1, Title=My First Blog Post
✅ Created Post: ID=2, Title=Understanding ENT Relations
✅ Created Post: ID=3, Title=Draft Post (Draft)

User 'Tonmoy Talukder' has 3 posts:
  - My First Blog Post (Published)
  - Understanding ENT Relations (Published)
  - Draft Post (Draft)
```

**🎉 Success!** You now have:
- ✅ Two versioned migration files tracking database evolution
- ✅ User and Post schemas with relations
- ✅ Working CRUD operations with foreign keys
- ✅ Data preserved across migrations

---

## Step 4: Query Relations {#step4-query-relations}

### 4.1 Add Relation Query Functions

**📝 Add these functions to `main.go`:**

```go
func queryRelationsDemo(ctx context.Context, client *ent.Client) {
	fmt.Println("\n=== Querying Relations ===\n")

	// Query user with posts (Eager Loading)
	fmt.Println("1. Query user with all posts (Eager Loading):")
	user, err := client.User.
		Query().
		Where(user.EmailEQ("tonmoy@example.com")).
		WithPosts().
		Only(ctx)
	if err != nil {
		log.Fatalf("failed querying user: %v", err)
	}

	fmt.Printf("User: %s\n", user.Name)
	fmt.Printf("Total Posts: %d\n", len(user.Edges.Posts))
	for _, p := range user.Edges.Posts {
		status := "Draft"
		if p.Published {
			status = "Published"
		}
		fmt.Printf("  - %s [%s]\n", p.Title, status)
	}
	fmt.Println()

	// Query posts with author
	fmt.Println("2. Query all posts with authors:")
	posts, err := client.Post.
		Query().
		WithAuthor().
		All(ctx)
	if err != nil {
		log.Fatalf("failed querying posts: %v", err)
	}

	for _, p := range posts {
		fmt.Printf("Post: %s by %s\n", p.Title, p.Edges.Author.Name)
	}
	fmt.Println()

	// Query only published posts
	fmt.Println("3. Query only published posts:")
	publishedPosts, err := client.Post.
		Query().
		Where(post.PublishedEQ(true)).
		All(ctx)
	if err != nil {
		log.Fatalf("failed querying posts: %v", err)
	}

	fmt.Printf("Published posts: %d\n", len(publishedPosts))
	for _, p := range publishedPosts {
		fmt.Printf("  - %s\n", p.Title)
	}
	fmt.Println()

	// Query user's published posts only
	fmt.Println("4. Query user's published posts:")
	userWithPublished, err := client.User.
		Query().
		Where(user.EmailEQ("tonmoy@example.com")).
		Only(ctx)
	if err != nil {
		log.Fatalf("failed querying user: %v", err)
	}

	publishedByUser, err := userWithPublished.
		QueryPosts().
		Where(post.PublishedEQ(true)).
		All(ctx)
	if err != nil {
		log.Fatalf("failed querying posts: %v", err)
	}

	fmt.Printf("%s's published posts: %d\n", userWithPublished.Name, len(publishedByUser))
	for _, p := range publishedByUser {
		fmt.Printf("  - %s\n", p.Title)
	}
	fmt.Println()
}
```

**📝 Update `main()` - Add the new demo:**

```go
func main() {
	client, err := ent.Open("postgres", 
		"host=localhost port=5432 user=postgres password=password dbname=entdb sslmode=disable")
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	ctx := context.Background()

	createPostsDemo(ctx, client)
	queryRelationsDemo(ctx, client)
}
```

**📝 Add import for post package at the top:**

```go
import (
	"context"
	"fmt"
	"log"

	_ "github.com/lib/pq"
	"ent-playground/ent"
	"ent-playground/ent/post"
	"ent-playground/ent/user"
)
```

### 4.2 Run It!

```bash
go run .
```

**✅ Expected Output:**
```
=== Creating Posts with Relations ===

User: Tonmoy Talukder (ID=1)

✅ Created Post: ID=1, Title=My First Blog Post
✅ Created Post: ID=2, Title=Understanding ENT Relations
✅ Created Post: ID=3, Title=Draft Post (Draft)

=== Querying Relations ===

1. Query user with all posts (Eager Loading):
User: Tonmoy Talukder
Total Posts: 3
  - My First Blog Post [Published]
  - Understanding ENT Relations [Published]
  - Draft Post [Draft]

2. Query all posts with authors:
Post: My First Blog Post by Tonmoy Talukder
Post: Understanding ENT Relations by Tonmoy Talukder
Post: Draft Post by Tonmoy Talukder

3. Query only published posts:
Published posts: 2
  - My First Blog Post
  - Understanding ENT Relations

4. Query user's published posts:
Tonmoy Talukder's published posts: 2
  - My First Blog Post
  - Understanding ENT Relations
```

---

## Step 5: Advanced Queries {#step5-advanced-queries}

### 5.1 Add Advanced Query Functions

**📝 Add to `main.go`:**

```go
func advancedQueriesDemo(ctx context.Context, client *ent.Client) {
	fmt.Println("\n=== Advanced Queries ===\n")

	// Create more users for demo
	client.User.Create().
		SetName("Alice Johnson").
		SetEmail("alice@example.com").
		SetAge(28).
		SaveX(ctx)

	client.User.Create().
		SetName("Bob Smith").
		SetEmail("bob@example.com").
		SetAge(35).
		SaveX(ctx)

	client.User.Create().
		SetName("Charlie Brown").
		SetEmail("charlie@example.com").
		SetAge(22).
		SaveX(ctx)

	// 1. OR Queries
	fmt.Println("1. Users named Alice OR age > 30:")
	users, err := client.User.Query().
		Where(
			user.Or(
				user.NameContains("Alice"),
				user.AgeGT(30),
			),
		).
		All(ctx)
	if err != nil {
		log.Fatalf("failed querying: %v", err)
	}
	for _, u := range users {
		fmt.Printf("  - %s (Age: %d)\n", u.Name, u.Age)
	}
	fmt.Println()

	// 2. AND Queries
	fmt.Println("2. Users age > 20 AND age < 30:")
	youngAdults, err := client.User.Query().
		Where(
			user.And(
				user.AgeGT(20),
				user.AgeLT(30),
			),
		).
		All(ctx)
	if err != nil {
		log.Fatalf("failed querying: %v", err)
	}
	for _, u := range youngAdults {
		fmt.Printf("  - %s (Age: %d)\n", u.Name, u.Age)
	}
	fmt.Println()

	// 3. NOT Queries
	fmt.Println("3. Users NOT named Tonmoy:")
	notTonmoy, err := client.User.Query().
		Where(user.Not(user.NameContains("Tonmoy"))).
		All(ctx)
	if err != nil {
		log.Fatalf("failed querying: %v", err)
	}
	for _, u := range notTonmoy {
		fmt.Printf("  - %s\n", u.Name)
	}
	fmt.Println()

	// 4. Ordering
	fmt.Println("4. Users ordered by age (desc):")
	orderedUsers, err := client.User.Query().
		Order(ent.Desc(user.FieldAge)).
		All(ctx)
	if err != nil {
		log.Fatalf("failed querying: %v", err)
	}
	for _, u := range orderedUsers {
		fmt.Printf("  - %s (Age: %d)\n", u.Name, u.Age)
	}
	fmt.Println()

	// 5. Limit & Offset
	fmt.Println("5. First 2 users (Limit 2):")
	limitedUsers, err := client.User.Query().
		Limit(2).
		All(ctx)
	if err != nil {
		log.Fatalf("failed querying: %v", err)
	}
	for _, u := range limitedUsers {
		fmt.Printf("  - %s\n", u.Name)
	}
	fmt.Println()

	// 6. Count with condition
	fmt.Println("6. Count users older than 25:")
	count, err := client.User.Query().
		Where(user.AgeGT(25)).
		Count(ctx)
	if err != nil {
		log.Fatalf("failed counting: %v", err)
	}
	fmt.Printf("  Count: %d\n\n", count)

	// 7. Exist check
	fmt.Println("7. Check if any user exists with age > 50:")
	exists, err := client.User.Query().
		Where(user.AgeGT(50)).
		Exist(ctx)
	if err != nil {
		log.Fatalf("failed checking: %v", err)
	}
	fmt.Printf("  Exists: %v\n\n", exists)
}
```

**📝 Update `main()`:**

```go
func main() {
	client, err := ent.Open("postgres", 
		"host=localhost port=5432 user=postgres password=password dbname=entdb sslmode=disable")
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	ctx := context.Background()

	createPostsDemo(ctx, client)
	queryRelationsDemo(ctx, client)
	advancedQueriesDemo(ctx, client)
}
```

### 5.2 Run It!

```bash
go run .
```

**✅ Expected Output:**
```
...previous output...

=== Advanced Queries ===

1. Users named Alice OR age > 30:
  - Alice Johnson (Age: 28)
  - Bob Smith (Age: 35)

2. Users age > 20 AND age < 30:
  - Tonmoy Talukder (Age: 25)
  - Alice Johnson (Age: 28)
  - Charlie Brown (Age: 22)

3. Users NOT named Tonmoy:
  - Alice Johnson
  - Bob Smith
  - Charlie Brown

4. Users ordered by age (desc):
  - Bob Smith (Age: 35)
  - Alice Johnson (Age: 28)
  - Tonmoy Talukder (Age: 25)
  - Charlie Brown (Age: 22)

5. First 2 users (Limit 2):
  - Tonmoy Talukder
  - Alice Johnson

6. Count users older than 25:
  Count: 3

7. Check if any user exists with age > 50:
  Exists: false
```

---

## Step 6: Query Chaining {#step6-query-chaining}

### 6.1 Add Query Chaining Demo

**📝 Add to `main.go`:**

```go
func queryChainingDemo(ctx context.Context, client *ent.Client) {
	fmt.Println("\n=== Query Chaining (Dynamic Filters) ===\n")

	// Simulate dynamic filters from API
	type UserFilter struct {
		NameContains *string
		MinAge       *int
		MaxAge       *int
		OrderBy      string
	}

	runQuery := func(filter UserFilter) {
		// Start with base query
		q := client.User.Query()

		// Conditionally add filters
		if filter.NameContains != nil {
			q = q.Where(user.NameContains(*filter.NameContains))
			fmt.Printf("Filter: Name contains '%s'\n", *filter.NameContains)
		}

		if filter.MinAge != nil {
			q = q.Where(user.AgeGTE(*filter.MinAge))
			fmt.Printf("Filter: Age >= %d\n", *filter.MinAge)
		}

		if filter.MaxAge != nil {
			q = q.Where(user.AgeLTE(*filter.MaxAge))
			fmt.Printf("Filter: Age <= %d\n", *filter.MaxAge)
		}

		// Add ordering
		if filter.OrderBy == "age_desc" {
			q = q.Order(ent.Desc(user.FieldAge))
		} else if filter.OrderBy == "name" {
			q = q.Order(ent.Asc(user.FieldName))
		}

		// Execute query
		users, err := q.All(ctx)
		if err != nil {
			log.Fatalf("failed querying: %v", err)
		}

		fmt.Println("Results:")
		for _, u := range users {
			fmt.Printf("  - %s (Age: %d)\n", u.Name, u.Age)
		}
		fmt.Println()
	}

	// Example 1: Filter by name
	fmt.Println("Example 1: Name contains 'John'")
	nameFilter := "John"
	runQuery(UserFilter{
		NameContains: &nameFilter,
	})

	// Example 2: Filter by age range
	fmt.Println("Example 2: Age between 25 and 30")
	minAge := 25
	maxAge := 30
	runQuery(UserFilter{
		MinAge: &minAge,
		MaxAge: &maxAge,
	})

	// Example 3: Combined filters with ordering
	fmt.Println("Example 3: Name contains 'o' AND age > 25, ordered by age desc")
	nameFilter2 := "o"
	minAge2 := 25
	runQuery(UserFilter{
		NameContains: &nameFilter2,
		MinAge:       &minAge2,
		OrderBy:      "age_desc",
	})
}
```

**📝 Update `main()`:**

```go
func main() {
	client, err := ent.Open("postgres", 
		"host=localhost port=5432 user=postgres password=password dbname=entdb sslmode=disable")
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	ctx := context.Background()

	createPostsDemo(ctx, client)
	queryRelationsDemo(ctx, client)
	advancedQueriesDemo(ctx, client)
	queryChainingDemo(ctx, client)
}
```

### 6.2 Run It!

```bash
go run .
```

**✅ Expected Output:**
```
...previous output...

=== Query Chaining (Dynamic Filters) ===

Example 1: Name contains 'John'
Filter: Name contains 'John'
Results:
  - Alice Johnson (Age: 28)

Example 2: Age between 25 and 30
Filter: Age >= 25
Filter: Age <= 30
Results:
  - Tonmoy Talukder (Age: 25)
  - Alice Johnson (Age: 28)

Example 3: Name contains 'o' AND age > 25, ordered by age desc
Filter: Name contains 'o'
Filter: Age >= 25
Results:
  - Alice Johnson (Age: 28)
  - Tonmoy Talukder (Age: 25)
```

---

## Step 7: Transactions {#step7-transactions}

### 7.1 Add Transaction Demo

**📝 Add to `main.go`:**

```go
func transactionsDemo(ctx context.Context, client *ent.Client) {
	fmt.Println("\n=== Transactions ===\n")

	// Example 1: Successful transaction
	fmt.Println("1. Creating user with posts in transaction:")
	tx, err := client.Tx(ctx)
	if err != nil {
		log.Fatalf("failed starting transaction: %v", err)
	}

	// Create user
	newUser, err := tx.User.
		Create().
		SetName("Transaction User").
		SetEmail("tx@example.com").
		SetAge(27).
		Save(ctx)
	if err != nil {
		tx.Rollback()
		log.Fatalf("failed creating user: %v", err)
	}
	fmt.Printf("  Created user: %s (ID=%d)\n", newUser.Name, newUser.ID)

	// Create posts for that user
	post1, err := tx.Post.
		Create().
		SetTitle("Transaction Post 1").
		SetContent("This post is created in a transaction").
		SetAuthor(newUser).
		Save(ctx)
	if err != nil {
		tx.Rollback()
		log.Fatalf("failed creating post: %v", err)
	}
	fmt.Printf("  Created post: %s (ID=%d)\n", post1.Title, post1.ID)

	post2, err := tx.Post.
		Create().
		SetTitle("Transaction Post 2").
		SetContent("Another post in the same transaction").
		SetAuthor(newUser).
		Save(ctx)
	if err != nil {
		tx.Rollback()
		log.Fatalf("failed creating post: %v", err)
	}
	fmt.Printf("  Created post: %s (ID=%d)\n", post2.Title, post2.ID)

	// Commit transaction
	if err := tx.Commit(); err != nil {
		log.Fatalf("failed committing transaction: %v", err)
	}
	fmt.Println("  ✅ Transaction committed successfully\n")

	// Verify data was saved
	savedUser, _ := client.User.Get(ctx, newUser.ID)
	postCount, _ := savedUser.QueryPosts().Count(ctx)
	fmt.Printf("  Verified: User %s has %d posts\n\n", savedUser.Name, postCount)

	// Example 2: Rolled back transaction
	fmt.Println("2. Demonstrating transaction rollback:")
	tx2, _ := client.Tx(ctx)

	tempUser, err := tx2.User.
		Create().
		SetName("Temp User").
		SetEmail("temp@example.com").
		SetAge(20).
		Save(ctx)
	if err != nil {
		tx2.Rollback()
		log.Fatalf("failed: %v", err)
	}
	fmt.Printf("  Created user: %s (ID=%d) - NOT COMMITTED YET\n", tempUser.Name, tempUser.ID)

	// Intentionally rollback
	tx2.Rollback()
	fmt.Println("  ⏪ Transaction rolled back\n")

	// Try to find the user (should not exist)
	_, err = client.User.Get(ctx, tempUser.ID)
	if err != nil {
		fmt.Println("  ✅ Verified: User was NOT saved (rollback worked)\n")
	}

	// Example 3: Using helper function
	fmt.Println("3. Using transaction helper function:")
	err = withTx(ctx, client, func(tx *ent.Tx) error {
		user, err := tx.User.
			Create().
			SetName("Helper User").
			SetEmail("helper@example.com").
			SetAge(29).
			Save(ctx)
		if err != nil {
			return err
		}
		fmt.Printf("  Created user: %s\n", user.Name)

		_, err = tx.Post.
			Create().
			SetTitle("Helper Post").
			SetContent("Created using transaction helper").
			SetAuthor(user).
			Save(ctx)
		if err != nil {
			return err
		}
		fmt.Printf("  Created post for user\n")

		return nil
	})
	if err != nil {
		log.Fatalf("transaction failed: %v", err)
	}
	fmt.Println("  ✅ Transaction helper succeeded\n")
}

// Transaction helper function
func withTx(ctx context.Context, client *ent.Client, fn func(*ent.Tx) error) error {
	tx, err := client.Tx(ctx)
	if err != nil {
		return err
	}
	defer func() {
		if v := recover(); v != nil {
			tx.Rollback()
			panic(v)
		}
	}()
	if err := fn(tx); err != nil {
		if rerr := tx.Rollback(); rerr != nil {
			err = fmt.Errorf("%w: rolling back transaction: %v", err, rerr)
		}
		return err
	}
	return tx.Commit()
}
```

**📝 Update `main()`:**

```go
func main() {
	client, err := ent.Open("postgres", 
		"host=localhost port=5432 user=postgres password=password dbname=entdb sslmode=disable")
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	ctx := context.Background()

	createPostsDemo(ctx, client)
	queryRelationsDemo(ctx, client)
	advancedQueriesDemo(ctx, client)
	queryChainingDemo(ctx, client)
	transactionsDemo(ctx, client)
}
```

### 7.2 Run It!

```bash
go run .
```

**✅ Expected Output:**
```
...previous output...

=== Transactions ===

1. Creating user with posts in transaction:
  Created user: Transaction User (ID=5)
  Created post: Transaction Post 1 (ID=4)
  Created post: Transaction Post 2 (ID=5)
  ✅ Transaction committed successfully

  Verified: User Transaction User has 2 posts

2. Demonstrating transaction rollback:
  Created user: Temp User (ID=6) - NOT COMMITTED YET
  ⏪ Transaction rolled back

  ✅ Verified: User was NOT saved (rollback worked)

3. Using transaction helper function:
  Created user: Helper User
  Created post for user
  ✅ Transaction helper succeeded
```

---

## Step 8: Pagination {#step8-pagination}

### 8.1 Add Pagination Demo

**📝 Add to `main.go`:**

```go
func paginationDemo(ctx context.Context, client *ent.Client) {
	fmt.Println("\n=== Pagination ===\n")

	// Create more posts for pagination demo
	user, _ := client.User.Query().First(ctx)
	
	for i := 1; i <= 10; i++ {
		client.Post.Create().
			SetTitle(fmt.Sprintf("Pagination Post %d", i)).
			SetContent(fmt.Sprintf("Content for post number %d", i)).
			SetAuthor(user).
			SaveX(ctx)
	}

	totalPosts, _ := client.Post.Query().Count(ctx)
	fmt.Printf("Total posts in database: %d\n\n", totalPosts)

	// Example 1: Offset-based pagination
	fmt.Println("1. Offset-Based Pagination:")
	pageSize := 5
	
	for page := 1; page <= 3; page++ {
		offset := (page - 1) * pageSize
		
		posts, err := client.Post.Query().
			Order(ent.Asc(post.FieldID)).
			Limit(pageSize).
			Offset(offset).
			All(ctx)
		if err != nil {
			log.Fatalf("failed querying: %v", err)
		}

		fmt.Printf("\n  Page %d (Limit=%d, Offset=%d):\n", page, pageSize, offset)
		for _, p := range posts {
			fmt.Printf("    - ID=%d: %s\n", p.ID, p.Title)
		}
	}

	// Calculate total pages
	totalPages := (totalPosts + pageSize - 1) / pageSize
	fmt.Printf("\n  Total pages: %d\n\n", totalPages)

	// Example 2: Cursor-based pagination (better for large datasets)
	fmt.Println("2. Cursor-Based Pagination:")
	
	// First page
	firstPage, err := client.Post.Query().
		Order(ent.Desc(post.FieldID)).
		Limit(5).
		All(ctx)
	if err != nil {
		log.Fatalf("failed querying: %v", err)
	}

	fmt.Println("\n  First Page:")
	for _, p := range firstPage {
		fmt.Printf("    - ID=%d: %s\n", p.ID, p.Title)
	}

	// Get cursor (last ID from previous page)
	if len(firstPage) > 0 {
		lastID := firstPage[len(firstPage)-1].ID
		
		// Next page
		secondPage, err := client.Post.Query().
			Where(post.IDLT(lastID)).
			Order(ent.Desc(post.FieldID)).
			Limit(5).
			All(ctx)
		if err != nil {
			log.Fatalf("failed querying: %v", err)
		}

		fmt.Printf("\n  Second Page (after cursor ID=%d):\n", lastID)
		for _, p := range secondPage {
			fmt.Printf("    - ID=%d: %s\n", p.ID, p.Title)
		}
	}
	fmt.Println()
}
```

**📝 Update `main()`:**

```go
func main() {
	client, err := ent.Open("postgres", 
		"host=localhost port=5432 user=postgres password=password dbname=entdb sslmode=disable")
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	ctx := context.Background()

	createPostsDemo(ctx, client)
	queryRelationsDemo(ctx, client)
	advancedQueriesDemo(ctx, client)
	queryChainingDemo(ctx, client)
	transactionsDemo(ctx, client)
	paginationDemo(ctx, client)
}
```

### 8.2 Run It!

```bash
go run .
```

**✅ Expected Output:**
```
...previous output...

=== Pagination ===

Total posts in database: 18

1. Offset-Based Pagination:

  Page 1 (Limit=5, Offset=0):
    - ID=1: My First Blog Post
    - ID=2: Understanding ENT Relations
    - ID=3: Draft Post
    - ID=4: Transaction Post 1
    - ID=5: Transaction Post 2

  Page 2 (Limit=5, Offset=5):
    - ID=6: Helper Post
    - ID=7: Pagination Post 1
    - ID=8: Pagination Post 2
    - ID=9: Pagination Post 3
    - ID=10: Pagination Post 4

  Page 3 (Limit=5, Offset=10):
    - ID=11: Pagination Post 5
    - ID=12: Pagination Post 6
    - ID=13: Pagination Post 7
    - ID=14: Pagination Post 8
    - ID=15: Pagination Post 9

  Total pages: 4

2. Cursor-Based Pagination:

  First Page:
    - ID=18: Pagination Post 10
    - ID=17: Pagination Post 9
    - ID=16: Pagination Post 8
    - ID=15: Pagination Post 7
    - ID=14: Pagination Post 6

  Second Page (after cursor ID=14):
    - ID=13: Pagination Post 5
    - ID=12: Pagination Post 4
    - ID=11: Pagination Post 3
    - ID=10: Pagination Post 2
    - ID=9: Pagination Post 1
```

---

## Step 9: Hooks & Soft Delete {#step9-hooks-soft-delete}

We'll implement automatic timestamps using a mixin (simplified version of hooks).

### 9.1 Add Timestamp Mixin

**📝 Create directory and file: `ent/schema/mixin/time_mixin.go`:**

```go
package mixin

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
)

// TimeMixin adds created_at and updated_at timestamps
type TimeMixin struct {
	mixin.Schema
}

func (TimeMixin) Fields() []ent.Field {
	return []ent.Field{
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}
```

### 9.2 Update User Schema with Mixin

**📝 Update `ent/schema/user.go`:**

```go
package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
	timemixin "ent-playground/ent/schema/mixin"
)

type User struct {
	ent.Schema
}

func (User) Mixin() []ent.Mixin {
	return []ent.Mixin{
		timemixin.TimeMixin{},
	}
}

func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("email").
			Unique(),
		field.Int("age").
			Optional(),
	}
}

func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("posts", Post.Type),
	}
}
```

### 9.3 Generate and Migrate

```bash
go generate ./ent

# Clean dev database first
psql -U postgres -d entdb_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Timestamps are for the User table, so use descriptive prefix
atlas migrate diff user_add_timestamps \
  --dir "file://migrations" \
  --to "ent://ent/schema" \
  --dev-url "postgres://postgres:password@localhost:5432/entdb_dev?sslmode=disable"

atlas migrate apply \
  --dir "file://migrations" \
  --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"
```

### 9.4 Add Timestamp Demo

**📝 Add to `main.go`:**

```go
func timestampsDemo(ctx context.Context, client *ent.Client) {
	fmt.Println("\n=== Timestamps (Mixin/Hooks) ===\n")

	// Create user
	fmt.Println("Creating user with automatic timestamps:")
	newUser, err := client.User.
		Create().
		SetName("Timestamp User").
		SetEmail("timestamps@example.com").
		SetAge(30).
		Save(ctx)
	if err != nil {
		log.Fatalf("failed: %v", err)
	}

	fmt.Printf("✅ Created at: %s\n", newUser.CreatedAt.Format("2006-01-02 15:04:05"))
	fmt.Printf("✅ Updated at: %s\n\n", newUser.UpdatedAt.Format("2006-01-02 15:04:05"))

	// Wait a moment
	time.Sleep(2 * time.Second)

	// Update user
	fmt.Println("Updating user (updated_at will change):")
	err = client.User.
		UpdateOneID(newUser.ID).
		SetAge(31).
		Exec(ctx)
	if err != nil {
		log.Fatalf("failed: %v", err)
	}

	// Fetch again
	updated, _ := client.User.Get(ctx, newUser.ID)
	fmt.Printf("✅ Created at: %s (unchanged)\n", updated.CreatedAt.Format("2006-01-02 15:04:05"))
	fmt.Printf("✅ Updated at: %s (changed!)\n\n", updated.UpdatedAt.Format("2006-01-02 15:04:05"))
}
```

**📝 Add time import and update `main()`:**

```go
import (
	"context"
	"fmt"
	"log"
	"time"  // Add this

	_ "github.com/lib/pq"
	"ent-playground/ent"
	"ent-playground/ent/post"
	"ent-playground/ent/user"
)

func main() {
	client, err := ent.Open("postgres", 
		"host=localhost port=5432 user=postgres password=password dbname=entdb sslmode=disable")
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	ctx := context.Background()

	createPostsDemo(ctx, client)
	queryRelationsDemo(ctx, client)
	advancedQueriesDemo(ctx, client)
	queryChainingDemo(ctx, client)
	transactionsDemo(ctx, client)
	paginationDemo(ctx, client)
	timestampsDemo(ctx, client)
}
```

### 9.5 Run It!

```bash
go run .
```

**✅ Expected Output:**
```
...previous output...

=== Timestamps (Mixin/Hooks) ===

Creating user with automatic timestamps:
✅ Created at: 2025-12-28 12:30:45
✅ Updated at: 2025-12-28 12:30:45

Updating user (updated_at will change):
✅ Created at: 2025-12-28 12:30:45 (unchanged)
✅ Updated at: 2025-12-28 12:30:47 (changed!)
```

---

## Step 10: ENT + HTTP API {#step10-http-api}

### 10.1 Install Chi Router

```bash
go get github.com/go-chi/chi/v5
```

### 10.2 Create HTTP Handlers

**📝 Create `handlers.go`:**

```go
package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"ent-playground/ent"
	"ent-playground/ent/user"
	"ent-playground/ent/post"
)

type API struct {
	client *ent.Client
}

func NewAPI(client *ent.Client) *API {
	return &API{client: client}
}

// GET /users
func (api *API) ListUsers(w http.ResponseWriter, r *http.Request) {
	users, err := api.client.User.Query().All(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(users)
}

// GET /users/:id
func (api *API) GetUser(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(chi.URLParam(r, "id"))
	
	u, err := api.client.User.Query().
		Where(user.IDEQ(id)).
		WithPosts().
		Only(r.Context())
	
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	
	json.NewEncoder(w).Encode(u)
}

// POST /users
func (api *API) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name  string `json:"name"`
		Email string `json:"email"`
		Age   int    `json:"age"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	u, err := api.client.User.Create().
		SetName(req.Name).
		SetEmail(req.Email).
		SetAge(req.Age).
		Save(r.Context())
	
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(u)
}

// GET /posts
func (api *API) ListPosts(w http.ResponseWriter, r *http.Request) {
	posts, err := api.client.Post.Query().
		WithAuthor().
		All(r.Context())
	
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	json.NewEncoder(w).Encode(posts)
}

// POST /users/:id/posts
func (api *API) CreatePost(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	
	var req struct {
		Title     string `json:"title"`
		Content   string `json:"content"`
		Published bool   `json:"published"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	user, err := api.client.User.Get(r.Context(), userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	
	p, err := api.client.Post.Create().
		SetTitle(req.Title).
		SetContent(req.Content).
		SetPublished(req.Published).
		SetAuthor(user).
		Save(r.Context())
	
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(p)
}
```

### 10.3 Create HTTP Server

**📝 Create `server.go`:**

```go
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"ent-playground/ent"
)

func startHTTPServer(client *ent.Client) {
	api := NewAPI(client)
	
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			next.ServeHTTP(w, r)
		})
	})
	
	// Routes
	r.Get("/users", api.ListUsers)
	r.Get("/users/{id}", api.GetUser)
	r.Post("/users", api.CreateUser)
	r.Post("/users/{id}/posts", api.CreatePost)
	r.Get("/posts", api.ListPosts)
	
	fmt.Println("\n🚀 HTTP Server running on http://localhost:3000")
	fmt.Println("\nAvailable endpoints:")
	fmt.Println("  GET    /users")
	fmt.Println("  GET    /users/:id")
	fmt.Println("  POST   /users")
	fmt.Println("  POST   /users/:id/posts")
	fmt.Println("  GET    /posts")
	fmt.Println("\nPress Ctrl+C to stop\n")
	
	log.Fatal(http.ListenAndServe(":3000", r))
}
```

### 10.4 Update Main

**📝 Update `main.go` - Replace entire main function:**

```go
func main() {
	client, err := ent.Open("postgres", 
		"host=localhost port=5432 user=postgres password=password dbname=entdb sslmode=disable")
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	ctx := context.Background()

	// Comment out demos when running HTTP server
	// Uncomment to run demos again
	
	/*
	createPostsDemo(ctx, client)
	queryRelationsDemo(ctx, client)
	advancedQueriesDemo(ctx, client)
	queryChainingDemo(ctx, client)
	transactionsDemo(ctx, client)
	paginationDemo(ctx, client)
	timestampsDemo(ctx, client)
	*/

	// Start HTTP server
	_ = ctx // avoid unused variable error
	startHTTPServer(client)
}
```

### 10.5 Run HTTP Server

```bash
go run .
```

**✅ Expected Output:**
```
🚀 HTTP Server running on http://localhost:3000

Available endpoints:
  GET    /users
  GET    /users/:id
  POST   /users
  POST   /users/:id/posts
  GET    /posts

Press Ctrl+C to stop
```

### 10.6 Test API with curl

Open a new terminal and run these commands:

**Create a user:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"API User","email":"api@example.com","age":28}'
```

**Get all users:**
```bash
curl http://localhost:3000/users
```

**Get specific user with posts:**
```bash
curl http://localhost:3000/users/1
```

**Create a post for user:**
```bash
curl -X POST http://localhost:3000/users/1/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"API Post","content":"Created via API","published":true}'
```

**Get all posts:**
```bash
curl http://localhost:3000/posts
```

**✅ Expected**: JSON responses with user and post data

---

🎉 **Congratulations!** You've completed all hands-on examples! Continue to Part 2 for deep dive explanations.

---
