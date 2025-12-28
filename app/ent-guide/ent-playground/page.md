# ENT Framework - Complete Beginner's Guide

> **What is ENT?** A Go code-first ORM that generates type-safe database code from schemas you define.

---

## Prerequisites

Before starting with this guide, you should have:

### Required Knowledge
- ✅ **Go Basics**: Variables, functions, structs, interfaces, pointers
- ✅ **Go Modules**: Understanding `go mod init`, `go get`
- ✅ **Context Package**: Basic understanding of `context.Context`
- ✅ **SQL Fundamentals**: Basic knowledge of databases, tables, relationships
- ✅ **Command Line**: Comfortable running terminal commands

### Required Software
- ✅ **Go 1.21+**: [Download from golang.org](https://golang.org/dl/)
- ✅ **PostgreSQL**: Running instance with credentials
- ✅ **Code Editor**: VS Code, GoLand, or any editor with Go support

### Check Your Setup
```bash
# Verify Go installation
go version  # Should show 1.21 or higher

# Verify PostgreSQL is running
psql -U postgres -c "SELECT version();"
```

---

## Guide Structure

This guide is organized into three parts:

### 📚 [Part 1: Copy, Paste, Run (Hands-On Learning)](/ent-guide/ent-playground/hands-on)

> **⚠️ Important Note**: Steps 1-9 are designed to run **sequentially in a single execution** on a fresh database. Each demo builds on previous data. To re-run the demos:
> - Clean the database: `DROP DATABASE entdb; CREATE DATABASE entdb;`
> - Reapply migrations: `atlas migrate apply --dir "file://migrations" --url "postgres://postgres:password@localhost:5432/entdb?sslmode=disable"`
> - Or use Step 10's HTTP API for interactive testing

Follow each step in order. Copy the code, paste it, run it, see the output. Each step builds on the previous one without removing code.

**Steps covered:**
1. Project Setup
2. User Schema & Basic CRUD
3. Add Post Schema & Relations
4. Query Relations
5. Advanced Queries
6. Query Chaining
7. Transactions
8. Pagination
9. Hooks & Soft Delete
10. ENT + HTTP API

### 📖 [Part 2: Deep Dive Reference](/ent-guide/ent-playground/deep-dive)

Explains the "how" and "why" behind ENT concepts. Refer back here when you need deeper understanding.

**Topics covered:**
11. Schema Generation Explained
12. Understanding Generated Methods
13. Unique Constraints & Indexing
14. Query Methods Explained
15. Clean Architecture with ENT

### ✅ [Part 3: Production Checklist](/ent-guide/ent-playground/production)

Essential concepts, best practices, and common pitfalls for production deployments.

**Topics covered:**
16. Essential ENT Concepts for Production
- Must-Know Concepts
- Production Best Practices
- Performance Tips
- Common Pitfalls
- Quick Reference

---

## How to Use This Guide

1. **Start with Part 1** if you're new to ENT - follow the hands-on examples
2. **Refer to Part 2** when you need deeper understanding of concepts
3. **Review Part 3** before deploying to production

Each part is self-contained and can be referenced independently.

---

**Happy coding with ENT! 🚀**
