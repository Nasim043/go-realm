# Database Seeding Guide for Golang Projects

A comprehensive guide for implementing professional database seeders in Go using Ent ORM with PostgreSQL, covering multiple approaches, upsert patterns, and Docker integration.

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Seeding Approaches](#seeding-approaches)
  - [Approach 1: Simple Seeder with Check-Before-Insert](#approach-1-simple-seeder-with-check-before-insert)
  - [Approach 2: Upsert Using OnConflict](#approach-2-upsert-using-onconflict)
  - [Approach 3: Modular Seeders (Recommended)](#approach-3-modular-seeders-recommended)
  - [Approach 4: SQL-Based Seeding](#approach-4-sql-based-seeding)
- [Running Seeders](#running-seeders)
  - [Manual Execution](#manual-execution)
  - [Docker Container Startup](#docker-container-startup)
  - [Conditional Seeding](#conditional-seeding)
- [Production Best Practices](#production-best-practices)

---

## Overview

Database seeders populate initial or test data in your database. They should be:
- **Idempotent**: Running multiple times produces the same result
- **Safe**: Won't corrupt existing data
- **Fast**: Optimized for bulk operations
- **Maintainable**: Well-organized and easy to update

---

## Project Structure

```
go-initial/
├── cmd/
│   ├── api/
│   │   └── main.go
│   ├── migrate/
│   │   └── main.go
│   └── seed/
│       └── main.go              # Main seeder entry point
├── internal/
│   ├── db/
│   │   └── seeders/
│   │       ├── seeder.go        # Base seeder interface
│   │       ├── ticket_status.go # Individual seeders
│   │       ├── ticket_subject.go
│   │       └── all.go           # Run all seeders
│   └── config/
│       └── config.go
└── scripts/
    └── seed.sh                   # Helper script
```

---

## Seeding Approaches

### Approach 1: Simple Seeder with Check-Before-Insert

**File:** `cmd/seed/main.go` (Basic Pattern - Current Implementation)

```go
package main

import (
	"context"
	"log"

	_ "github.com/lib/pq"
	"github.com/w-tech/go-initial/internal/app/auth"
	"github.com/w-tech/go-initial/internal/config"
	dbent "github.com/w-tech/go-initial/internal/db/ent"
	"github.com/w-tech/go-initial/internal/db/ent/user"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	client, err := dbent.Open("postgres", cfg.PostgresDSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer client.Close()

	ctx := context.Background()

	// Check if admin user already exists
	adminUser, err := client.User.
		Query().
		Where(user.EmailEQ(cfg.AdminEmail)).
		Only(ctx)

	if err == nil {
		log.Printf("✓ Admin user already exists: %s (ID: %d)", adminUser.Username, adminUser.ID)
		return
	}

	if !dbent.IsNotFound(err) {
		log.Fatalf("Failed to check admin user: %v", err)
	}

	// Create password manager and hash password
	passwordManager := auth.NewPasswordManager()
	hashedPassword, err := passwordManager.HashPassword(cfg.AdminPassword)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Create admin user
	user, err := client.User.
		Create().
		SetName(cfg.AdminName).
		SetUsername(cfg.AdminUsername).
		SetEmail(cfg.AdminEmail).
		SetPasswordHash(hashedPassword).
		SetStatus(true).
		Save(ctx)

	if err != nil {
		log.Fatalf("Failed to create admin user: %v", err)
	}

	log.Printf("✓ Admin user created successfully: %s (ID: %d)", user.Username, user.ID)
}
```

**Pros:** Simple, easy to understand
**Cons:** Not true upsert, requires query before insert

---

### Approach 2: Upsert Using OnConflict

**File:** `internal/db/seeders/ticket_status.go`

```go
package seeders

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/w-tech/go-initial/internal/db/ent"
	"github.com/w-tech/go-initial/internal/db/ent/ticketstatus"
)

type TicketStatusSeeder struct {
	client *ent.Client
}

func NewTicketStatusSeeder(client *ent.Client) *TicketStatusSeeder {
	return &TicketStatusSeeder{client: client}
}

type TicketStatusData struct {
	UUID       uuid.UUID
	Code       string
	Name       string
	SortOrder  int
	IsActive   bool
	IsTerminal bool
}

func (s *TicketStatusSeeder) Seed(ctx context.Context) error {
	statuses := []TicketStatusData{
		{UUID: uuid.New(), Code: "open", Name: "Submitted", SortOrder: 10, IsActive: true, IsTerminal: false},
		{UUID: uuid.New(), Code: "open", Name: "Assigned", SortOrder: 20, IsActive: true, IsTerminal: false},
		{UUID: uuid.New(), Code: "open", Name: "Processing", SortOrder: 30, IsActive: true, IsTerminal: false},
		{UUID: uuid.New(), Code: "closed", Name: "Solved", SortOrder: 40, IsActive: true, IsTerminal: true},
		{UUID: uuid.New(), Code: "closed", Name: "Rejected", SortOrder: 50, IsActive: true, IsTerminal: true},
		{UUID: uuid.New(), Code: "open", Name: "Re-open", SortOrder: 60, IsActive: true, IsTerminal: false},
	}

	now := time.Now()
	
	for _, status := range statuses {
		// Method 1: Using UpdateOneID with OnConflict (if your Ent schema has unique constraint on 'code' + 'name')
		err := s.client.TicketStatus.
			Create().
			SetUUID(status.UUID).
			SetCode(status.Code).
			SetName(status.Name).
			SetSortOrder(status.SortOrder).
			SetIsActive(status.IsActive).
			SetIsTerminal(status.IsTerminal).
			SetCreatedAt(now).
			SetUpdatedAt(now).
			OnConflict(
				// Specify conflict columns (requires unique index on these columns)
				// If record exists with same code+name, do nothing
			).
			Ignore().
			Exec(ctx)

		if err != nil {
			log.Printf("✗ Failed to seed ticket status '%s': %v", status.Name, err)
			return err
		}
		log.Printf("✓ Seeded ticket status: %s", status.Name)
	}

	log.Printf("✓ Ticket status seeding completed")
	return nil
}

// Alternative: Using raw SQL for true UPSERT with ON CONFLICT
func (s *TicketStatusSeeder) SeedWithRawSQL(ctx context.Context) error {
	query := `
		INSERT INTO ticket_statuses
			(uuid, code, name, sort_order, is_active, is_terminal, created_by, updated_by, created_at, updated_at)
		VALUES
			($1, 'open',   'Submitted',  10, TRUE,  FALSE, NULL, NULL, now(), now()),
			($2, 'open',   'Assigned',   20, TRUE,  FALSE, NULL, NULL, now(), now()),
			($3, 'open',   'Processing', 30, TRUE,  FALSE, NULL, NULL, now(), now()),
			($4, 'closed', 'Solved',     40, TRUE,  TRUE,  NULL, NULL, now(), now()),
			($5, 'closed', 'Rejected',   50, TRUE,  TRUE,  NULL, NULL, now(), now()),
			($6, 'open',   'Re-open',    60, TRUE,  FALSE, NULL, NULL, now(), now())
		ON CONFLICT (code, name) DO NOTHING;
	`

	// Generate UUIDs
	uuids := make([]uuid.UUID, 6)
	for i := range uuids {
		uuids[i] = uuid.New()
	}

	_, err := s.client.ExecContext(ctx, query,
		uuids[0], uuids[1], uuids[2], uuids[3], uuids[4], uuids[5],
	)

	if err != nil {
		log.Printf("✗ Failed to seed ticket statuses: %v", err)
		return err
	}

	log.Printf("✓ Ticket status seeding completed (raw SQL)")
	return nil
}
```

**File:** `internal/db/seeders/ticket_subject.go`

```go
package seeders

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/w-tech/go-initial/internal/db/ent"
)

type TicketSubjectSeeder struct {
	client *ent.Client
}

func NewTicketSubjectSeeder(client *ent.Client) *TicketSubjectSeeder {
	return &TicketSubjectSeeder{client: client}
}

type TicketSubjectData struct {
	UUID     uuid.UUID
	Name     string
	IsActive bool
}

func (s *TicketSubjectSeeder) Seed(ctx context.Context) error {
	subjects := []TicketSubjectData{
		{UUID: uuid.New(), Name: "Authentication related issue", IsActive: true},
		{UUID: uuid.New(), Name: "Permission related issue", IsActive: true},
		{UUID: uuid.New(), Name: "Other issue", IsActive: true},
	}

	now := time.Now()

	for _, subject := range subjects {
		err := s.client.TicketSubject.
			Create().
			SetUUID(subject.UUID).
			SetName(subject.Name).
			SetIsActive(subject.IsActive).
			SetCreatedAt(now).
			SetUpdatedAt(now).
			OnConflict().
			Ignore().
			Exec(ctx)

		if err != nil {
			log.Printf("✗ Failed to seed ticket subject '%s': %v", subject.Name, err)
			return err
		}
		log.Printf("✓ Seeded ticket subject: %s", subject.Name)
	}

	log.Printf("✓ Ticket subject seeding completed")
	return nil
}

// Using raw SQL with ON CONFLICT
func (s *TicketSubjectSeeder) SeedWithRawSQL(ctx context.Context) error {
	query := `
		INSERT INTO ticket_subjects
			(uuid, name, is_active, created_by, updated_by, created_at, updated_at)
		VALUES
			($1, 'Authentication related issue', TRUE, NULL, NULL, now(), now()),
			($2, 'Permission related issue',     TRUE, NULL, NULL, now(), now()),
			($3, 'Other issue',                  TRUE, NULL, NULL, now(), now())
		ON CONFLICT (name) DO NOTHING;
	`

	_, err := s.client.ExecContext(ctx, query,
		uuid.New(), uuid.New(), uuid.New(),
	)

	if err != nil {
		log.Printf("✗ Failed to seed ticket subjects: %v", err)
		return err
	}

	log.Printf("✓ Ticket subject seeding completed (raw SQL)")
	return nil
}
```

---

### Approach 3: Modular Seeders (Recommended)

**File:** `internal/db/seeders/seeder.go`

```go
package seeders

import "context"

// Seeder interface for all seeders
type Seeder interface {
	Seed(ctx context.Context) error
}

// SeederOption for configuring seeder behavior
type SeederOption struct {
	SkipIfExists bool
	Force        bool
	Verbose      bool
}
```

**File:** `internal/db/seeders/all.go`

```go
package seeders

import (
	"context"
	"fmt"
	"log"

	"github.com/w-tech/go-initial/internal/db/ent"
)

// RunAll executes all seeders in order
func RunAll(ctx context.Context, client *ent.Client) error {
	seeders := []struct {
		name   string
		seeder Seeder
	}{
		{"Ticket Statuses", NewTicketStatusSeeder(client)},
		{"Ticket Subjects", NewTicketSubjectSeeder(client)},
		// Add more seeders here
	}

	log.Println("======================================")
	log.Println("Starting Database Seeding Process")
	log.Println("======================================")

	for i, s := range seeders {
		log.Printf("[%d/%d] Seeding %s...", i+1, len(seeders), s.name)
		
		if err := s.seeder.Seed(ctx); err != nil {
			return fmt.Errorf("failed to seed %s: %w", s.name, err)
		}
	}

	log.Println("======================================")
	log.Println("✓ All seeders completed successfully")
	log.Println("======================================")
	return nil
}

// RunSpecific executes specific seeders
func RunSpecific(ctx context.Context, client *ent.Client, seederNames []string) error {
	availableSeeders := map[string]Seeder{
		"ticket_status":  NewTicketStatusSeeder(client),
		"ticket_subject": NewTicketSubjectSeeder(client),
	}

	for _, name := range seederNames {
		seeder, exists := availableSeeders[name]
		if !exists {
			return fmt.Errorf("seeder '%s' not found", name)
		}

		log.Printf("Running seeder: %s", name)
		if err := seeder.Seed(ctx); err != nil {
			return fmt.Errorf("failed to run %s: %w", name, err)
		}
	}

	return nil
}
```

**File:** `cmd/seed/main.go` (Enhanced Version)

```go
package main

import (
	"context"
	"flag"
	"log"
	"os"
	"strings"

	_ "github.com/lib/pq"
	"github.com/w-tech/go-initial/internal/config"
	dbent "github.com/w-tech/go-initial/internal/db/ent"
	"github.com/w-tech/go-initial/internal/db/seeders"
)

func main() {
	// Command line flags
	seedAll := flag.Bool("all", false, "Run all seeders")
	seedList := flag.String("seeders", "", "Comma-separated list of specific seeders to run (e.g., ticket_status,ticket_subject)")
	flag.Parse()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Connect to database
	client, err := dbent.Open("postgres", cfg.PostgresDSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer client.Close()

	ctx := context.Background()

	// Determine which seeders to run
	if *seedAll {
		// Run all seeders
		if err := seeders.RunAll(ctx, client); err != nil {
			log.Fatalf("Seeding failed: %v", err)
			os.Exit(1)
		}
	} else if *seedList != "" {
		// Run specific seeders
		names := strings.Split(*seedList, ",")
		if err := seeders.RunSpecific(ctx, client, names); err != nil {
			log.Fatalf("Seeding failed: %v", err)
			os.Exit(1)
		}
	} else {
		// Default: run all seeders
		log.Println("No flags provided, running all seeders...")
		if err := seeders.RunAll(ctx, client); err != nil {
			log.Fatalf("Seeding failed: %v", err)
			os.Exit(1)
		}
	}

	log.Println("Seeding completed successfully!")
}
```

---

### Approach 4: SQL-Based Seeding

**File:** `scripts/seeds/ticket_data.sql`

```sql
-- Ticket Statuses
INSERT INTO ticket_statuses
  (uuid, code, name, sort_order, is_active, is_terminal, created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'open',   'Submitted',  10, TRUE,  FALSE, NULL, NULL, now(), now()),
  (gen_random_uuid(), 'open',   'Assigned',   20, TRUE,  FALSE, NULL, NULL, now(), now()),
  (gen_random_uuid(), 'open',   'Processing', 30, TRUE,  FALSE, NULL, NULL, now(), now()),
  (gen_random_uuid(), 'closed', 'Solved',     40, TRUE,  TRUE,  NULL, NULL, now(), now()),
  (gen_random_uuid(), 'closed', 'Rejected',   50, TRUE,  TRUE,  NULL, NULL, now(), now()),
  (gen_random_uuid(), 'open',   'Re-open',    60, TRUE,  FALSE, NULL, NULL, now(), now())
ON CONFLICT (code, name) DO NOTHING;

-- Ticket Subjects
INSERT INTO ticket_subjects
  (uuid, name, is_active, created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Authentication related issue', TRUE, NULL, NULL, now(), now()),
  (gen_random_uuid(), 'Permission related issue',     TRUE, NULL, NULL, now(), now()),
  (gen_random_uuid(), 'Other issue',                  TRUE, NULL, NULL, now(), now())
ON CONFLICT (name) DO NOTHING;
```

**File:** `scripts/run-seeds.sh`

```bash
#!/bin/bash
set -e

# Load environment variables
source .env

# Run SQL seed files
psql "$DATABASE_URL" -f scripts/seeds/ticket_data.sql

echo "✓ SQL seeds completed"
```

---

## Running Seeders

### Manual Execution

#### Option 1: Using Go Command

```bash
# Run all seeders
go run cmd/seed/main.go -all

# Run specific seeders
go run cmd/seed/main.go -seeders=ticket_status,ticket_subject
```

#### Option 2: Build and Run Binary

```bash
# Build seeder binary
go build -o bin/seed cmd/seed/main.go

# Run
./bin/seed -all
```

#### Option 3: Using Makefile

**File:** `Makefile`

```makefile
.PHONY: seed seed-all seed-specific

# Run all seeds
seed-all:
	@echo "Running all seeders..."
	@go run cmd/seed/main.go -all

# Run specific seeders
seed-specific:
	@echo "Running specific seeders..."
	@go run cmd/seed/main.go -seeders=$(SEEDERS)

# Alias for seed-all
seed: seed-all

# Example usage: make seed-specific SEEDERS=ticket_status,ticket_subject
```

Usage:
```bash
make seed-all
make seed-specific SEEDERS=ticket_status
```

---

### Docker Container Startup

#### Option 1: Run Seeds After Migrations in Entrypoint

**File:** `docker-entrypoint.sh` (Modified)

```bash
#!/usr/bin/env sh
set -e

echo "🔄 Starting database migration..."

# ... existing migration code ...

echo "✅ Migrations applied successfully"

# ---------------------------
# Run Seeds (Optional)
# ---------------------------
if [ "${RUN_SEEDS:-false}" = "true" ]; then
  echo "🌱 Running database seeds..."
  ./seed -all
  echo "✅ Seeds applied successfully"
else
  echo "⏭️  Skipping seeds (RUN_SEEDS not set to true)"
fi

# ---------------------------
# Start the app
# ---------------------------
echo "▶️  Starting API..."
if [ "$#" -eq 0 ]; then
  set -- ./api
fi
exec "$@"
```

**File:** `Dockerfile` (Modified)

```dockerfile
# ============================================
# Stage 1: Build the Go Binary
# ============================================
FROM golang:1.24-alpine AS builder

RUN apk add --no-cache git build-base

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download
RUN go mod verify

COPY . .

# Generate Ent code
RUN go generate ./internal/db/ent

# Build binaries
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o migrate ./cmd/migrate
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o seed ./cmd/seed

# ============================================
# Stage 2: Runtime Image
# ============================================
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata curl netcat-openbsd postgresql-client

# Install Atlas CLI
RUN curl -sSf https://atlasgo.sh | sh

WORKDIR /app

# Copy binaries
COPY --from=builder /app/api .
COPY --from=builder /app/migrate .
COPY --from=builder /app/seed .

# Copy migration files
COPY --from=builder /app/ent/migrate/migrations ./ent/migrate/migrations

# Generate atlas.sum
RUN atlas migrate hash --dir "file://ent/migrate/migrations"

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 8082

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["./api"]
```

**File:** `docker-compose.yml` (Add Environment Variable)

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "8082:8082"
    environment:
      - RUN_SEEDS=true  # Enable seeding on startup
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
    volumes:
      - .:/app
      - /app/tmp

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Option 2: Run Seeds as Separate Container

**File:** `docker-compose.yml` (Multi-Container Approach)

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8082:8082"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      seed:
        condition: service_completed_successfully

  seed:
    build:
      context: .
      dockerfile: Dockerfile.seed
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**File:** `Dockerfile.seed`

```dockerfile
FROM golang:1.24-alpine AS builder

RUN apk add --no-cache git build-base

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go generate ./internal/db/ent
RUN CGO_ENABLED=0 GOOS=linux go build -o seed ./cmd/seed

FROM alpine:latest

RUN apk --no-cache add ca-certificates postgresql-client

WORKDIR /app

COPY --from=builder /app/seed .

CMD ["./seed", "-all"]
```

---

### Conditional Seeding

#### Development vs Production

**File:** `docker-entrypoint.sh` (Environment-Based)

```bash
#!/usr/bin/env sh
set -e

# ... migration code ...

# Run seeds based on environment
if [ "${APP_ENV:-production}" = "development" ] || [ "${RUN_SEEDS:-false}" = "true" ]; then
  echo "🌱 Running database seeds..."
  ./seed -all
  echo "✅ Seeds applied successfully"
else
  echo "⏭️  Skipping seeds (production mode)"
fi

# Start app
exec "$@"
```

#### Time-Based Seeding

**File:** `scripts/cron-seed.sh`

```bash
#!/bin/bash

# Run seeds daily at 2 AM
# Add to crontab: 0 2 * * * /app/scripts/cron-seed.sh

cd /app
./seed -seeders=daily_stats,aggregations
```

#### One-Time Seeding with Flag File

**File:** `docker-entrypoint.sh` (Flag-Based)

```bash
#!/usr/bin/env sh
set -e

# ... migration code ...

SEED_FLAG_FILE="/app/.seeded"

if [ ! -f "$SEED_FLAG_FILE" ]; then
  echo "🌱 First run detected, running seeds..."
  ./seed -all
  touch "$SEED_FLAG_FILE"
  echo "✅ Seeds applied and flag created"
else
  echo "⏭️  Seeds already run (flag file exists)"
fi

# Start app
exec "$@"
```

---

## Production Best Practices

### 1. Idempotent Seeds

Always use `ON CONFLICT DO NOTHING` or check before insert:

```go
// Good: Upsert pattern
err := client.TicketStatus.
    Create().
    SetCode("open").
    SetName("Submitted").
    OnConflict().
    Ignore().
    Exec(ctx)

// Also Good: Check then insert
exists, err := client.TicketStatus.
    Query().
    Where(ticketstatus.CodeEQ("open"), ticketstatus.NameEQ("Submitted")).
    Exist(ctx)

if !exists {
    // Insert
}
```

### 2. Transaction Support

**File:** `internal/db/seeders/transaction_seeder.go`

```go
package seeders

import (
	"context"
	"fmt"

	"github.com/w-tech/go-initial/internal/db/ent"
)

func RunAllWithTransaction(ctx context.Context, client *ent.Client) error {
	tx, err := client.Tx(ctx)
	if err != nil {
		return fmt.Errorf("starting transaction: %w", err)
	}

	defer func() {
		if v := recover(); v != nil {
			tx.Rollback()
			panic(v)
		}
	}()

	// Run seeders within transaction
	if err := NewTicketStatusSeeder(tx.Client()).Seed(ctx); err != nil {
		tx.Rollback()
		return err
	}

	if err := NewTicketSubjectSeeder(tx.Client()).Seed(ctx); err != nil {
		tx.Rollback()
		return err
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("committing transaction: %w", err)
	}

	return nil
}
```

### 3. Logging and Monitoring

```go
package seeders

import (
	"context"
	"log"
	"time"
)

type LoggingSeeder struct {
	seeder Seeder
	name   string
}

func WithLogging(name string, seeder Seeder) Seeder {
	return &LoggingSeeder{
		seeder: seeder,
		name:   name,
	}
}

func (l *LoggingSeeder) Seed(ctx context.Context) error {
	start := time.Now()
	log.Printf("Starting seeder: %s", l.name)

	err := l.seeder.Seed(ctx)

	duration := time.Since(start)
	if err != nil {
		log.Printf("✗ Seeder %s failed after %v: %v", l.name, duration, err)
		return err
	}

	log.Printf("✓ Seeder %s completed in %v", l.name, duration)
	return nil
}
```

### 4. Environment-Specific Data

```go
package seeders

import (
	"context"
	"os"
)

func (s *TicketStatusSeeder) Seed(ctx context.Context) error {
	env := os.Getenv("APP_ENV")
	
	if env == "production" {
		// Seed only essential data
		return s.seedProduction(ctx)
	}
	
	// Seed test data for dev/staging
	return s.seedDevelopment(ctx)
}
```

### 5. Bulk Insert for Performance

```go
package seeders

import (
	"context"

	"github.com/w-tech/go-initial/internal/db/ent"
)

func (s *TicketStatusSeeder) SeedBulk(ctx context.Context) error {
	statuses := []struct {
		code       string
		name       string
		sortOrder  int
		isActive   bool
		isTerminal bool
	}{
		{"open", "Submitted", 10, true, false},
		{"open", "Assigned", 20, true, false},
		// ... more statuses
	}

	bulk := make([]*ent.TicketStatusCreate, len(statuses))
	for i, status := range statuses {
		bulk[i] = s.client.TicketStatus.
			Create().
			SetCode(status.code).
			SetName(status.name).
			SetSortOrder(status.sortOrder).
			SetIsActive(status.isActive).
			SetIsTerminal(status.isTerminal)
	}

	// Bulk create (more efficient for large datasets)
	_, err := s.client.TicketStatus.CreateBulk(bulk...).Save(ctx)
	return err
}
```

---

## Quick Reference Commands

```bash
# Local development
go run cmd/seed/main.go -all
go run cmd/seed/main.go -seeders=ticket_status

# Build seed binary
go build -o bin/seed cmd/seed/main.go

# Docker
docker-compose up --build
docker-compose run app ./seed -all

# Enable seeds on container startup
RUN_SEEDS=true docker-compose up

# Run seeds in existing container
docker-compose exec app ./seed -all

# SQL-based seeding
psql $DATABASE_URL -f scripts/seeds/ticket_data.sql
```

---

## Summary

Choose the approach based on your needs:

- **Approach 1**: Simple projects, quick setup
- **Approach 2**: Recommended for most cases, true upsert support
- **Approach 3**: Large projects with many seeders, best maintainability
- **Approach 4**: SQL-native approach, when you prefer SQL over ORM

Always ensure:
✓ Seeds are idempotent
✓ Use transactions for data integrity
✓ Handle errors gracefully
✓ Log seeding operations
✓ Test in development before production
