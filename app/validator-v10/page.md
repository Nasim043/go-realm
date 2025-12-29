# Go Validator v10 — Complete Production Guide

> **What is validator/v10?** A Go struct and field validation library that validates DTOs before they reach your database layer.

---

## Prerequisites

Before starting with this guide, you should have:

### Required Knowledge
- ✅ **Go Basics**: Variables, functions, structs, interfaces, pointers
- ✅ **Go Modules**: Understanding `go mod init`, `go get`
- ✅ **Struct Tags**: Basic understanding of Go struct tags
- ✅ **HTTP APIs**: Understanding of DTOs (Data Transfer Objects)
- ✅ **Command Line**: Comfortable running terminal commands

### Required Software
- ✅ **Go 1.21+**: [Download from golang.org](https://golang.org/dl/)
- ✅ **Code Editor**: VS Code, GoLand, or any editor with Go support

### Check Your Setup
```bash
# Verify Go installation
go version  # Should show 1.21 or higher
```

---

## 📚 Guide Structure

### Part 1: Hands-On Learning
Start here! Follow step-by-step examples from setup to production integration.

- **Setup & Basics**: Project setup, first validation, tags, and production structure
- **Core Validations**: Nullable fields, strings, numbers, booleans, and arrays
- **Advanced Validations**: Dates, files, custom rules, enums, conditional, and cross-field
- **Integration**: Error handling, HTTP API, and ENT integration

### Part 2: Complete Reference
Quick lookup for all validation rules with examples.

- **Validation Reference**: Comprehensive tables of all available validation rules

### Part 3: Production Guide
Production checklist and best practices.

- **Production Checklist**: Architecture, best practices, security, and performance

---

## 🚀 Getting Started

**New to validator/v10?** Start with [Setup & Basics](/validator-v10/hands-on/setup-and-basics) and follow the hands-on examples in order.

**Need a specific validation?** Jump to the [Validation Reference](/validator-v10/validation-reference) for quick lookups.

**Ready for production?** Review the [Production Checklist](/validator-v10/production/production-checklist) for best practices.

---

## What You'll Learn

✅ **Complete documentation** covering all validation categories  
✅ **18 incremental steps** with hands-on examples  
✅ **Production structure** with singleton pattern  
✅ **Custom validation rules** for business logic  
✅ **User-friendly error handling**  
✅ **Integration patterns** for HTTP and ENT  
✅ **Complete reference** guide with all rules  

---

## Where Does Validator Fit?

```
HTTP Request → Parse JSON → DTO → VALIDATE (validator) → Business Logic → Database (ENT)
```

Validator sits between your HTTP layer and business logic, ensuring data is valid before it reaches your database.

---

## Additional Resources

- **Official validator/v10 docs**: https://github.com/go-playground/validator
- **Go Playground**: Try examples at https://go.dev/play/
