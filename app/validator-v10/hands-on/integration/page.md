# Part 1: Integration

Learn how to integrate validator with HTTP APIs and ENT ORM for production-ready applications.

---

## Step 16: User-Friendly Errors {#step16-errors}

You already have this implemented in `internal/validator/errors.go`. The error handling converts validation errors into user-friendly messages.

**Key Pattern:**
```go
err := validator.V().Struct(dto)
if err != nil {
    fieldErrors := validator.ToFieldErrors(err)
    // Returns map[string]string with friendly messages
}
```

**Example Error Response:**
```json
{
  "errors": {
    "email": "must be a valid email address",
    "age": "must be greater than or equal to 18",
    "role": "must be one of: admin user guest"
  }
}
```

---

## Step 17: Validator + HTTP API {#step17-http-api}

### 17.1 HTTP Integration Pattern

**Complete flow:** HTTP Request → Parse JSON → DTO → Validate → Process → Response

The production structure you've built supports clean HTTP integration. When validation fails, return 422 status with field errors.

**Example HTTP Handler:**

```go
func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
    var dto CreateUserDTO
    
    // 1. Parse JSON
    if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
        writeJSON(w, 400, map[string]string{
            "error": "Invalid JSON format",
        })
        return
    }
    
    // 2. Validate DTO
    if err := validator.V().Struct(dto); err != nil {
        writeJSON(w, 422, map[string]interface{}{
            "errors": validator.ToFieldErrors(err),
        })
        return
    }
    
    // 3. Process (business logic + database)
    user, err := createUser(dto)
    if err != nil {
        writeJSON(w, 500, map[string]string{
            "error": "Failed to create user",
        })
        return
    }
    
    // 4. Success response
    writeJSON(w, 201, user)
}
```

### 17.2 HTTP Status Codes

| Status | Code | When to Use |
|--------|------|-------------|
| Bad Request | 400 | Invalid JSON format |
| Unprocessable Entity | 422 | Validation failed |
| Conflict | 409 | Unique constraint violation |
| Not Found | 404 | Resource not found |
| Internal Server Error | 500 | Unexpected errors |

---

## Step 18: Validator + ENT Integration {#step18-ent-integration}

### 18.1 Complete Integration Flow

```
HTTP Request → Parse JSON → DTO → VALIDATE → ENT Create/Update → DB → Response
```

**Key principles:**
1. **Validate DTOs before ENT** - Catch format errors early
2. **Validator handles format** - email, length, type checking
3. **ENT handles constraints** - unique, foreign keys, DB rules
4. **Clear error separation** - Validation (422) vs Constraint (409) vs Server (500)

### 18.2 Integration Example

```go
package main

import (
    "context"
    "encoding/json"
    "net/http"
    
    "github.com/TonmoyTalukder/go-dto-validator/internal/validator"
    "github.com/TonmoyTalukder/go-dto-validator/ent"
)

type CreateUserDTO struct {
    Name     string `json:"name" validate:"required,min=2,max=50"`
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required,min=8"`
    Age      int    `json:"age" validate:"required,gte=18,lte=120"`
}

type UpdateUserDTO struct {
    Name *string `json:"name" validate:"omitempty,min=2,max=50"`
    Age  *int    `json:"age" validate:"omitempty,gte=18,lte=120"`
}

func CreateUserHandler(client *ent.Client) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        ctx := context.Background()
        var dto CreateUserDTO
        
        // Step 1: Parse JSON
        if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
            writeError(w, 400, "Invalid JSON format")
            return
        }
        
        // Step 2: Validate DTO
        if err := validator.V().Struct(dto); err != nil {
            writeValidationErrors(w, err)
            return
        }
        
        // Step 3: Check business rules (if any)
        // e.g., check if email domain is allowed
        
        // Step 4: Create ENT entity
        user, err := client.User.Create().
            SetName(dto.Name).
            SetEmail(dto.Email).
            SetPassword(hashPassword(dto.Password)).
            SetAge(dto.Age).
            Save(ctx)
        
        // Step 5: Handle ENT errors
        if err != nil {
            if ent.IsConstraintError(err) {
                // Unique constraint violation (e.g., email already exists)
                writeError(w, 409, "Email already exists")
                return
            }
            // Other database errors
            writeError(w, 500, "Failed to create user")
            return
        }
        
        // Step 6: Success response
        writeJSON(w, 201, user)
    }
}

func UpdateUserHandler(client *ent.Client) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        ctx := context.Background()
        userID := getUserIDFromPath(r)
        var dto UpdateUserDTO
        
        // Step 1: Parse JSON
        if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
            writeError(w, 400, "Invalid JSON format")
            return
        }
        
        // Step 2: Validate DTO
        if err := validator.V().Struct(dto); err != nil {
            writeValidationErrors(w, err)
            return
        }
        
        // Step 3: Check if user exists
        exists, err := client.User.Query().
            Where(user.ID(userID)).
            Exist(ctx)
        if err != nil {
            writeError(w, 500, "Database error")
            return
        }
        if !exists {
            writeError(w, 404, "User not found")
            return
        }
        
        // Step 4: Update ENT entity (only non-nil fields)
        update := client.User.UpdateOneID(userID)
        
        if dto.Name != nil {
            update.SetName(*dto.Name)
        }
        if dto.Age != nil {
            update.SetAge(*dto.Age)
        }
        
        updatedUser, err := update.Save(ctx)
        if err != nil {
            writeError(w, 500, "Failed to update user")
            return
        }
        
        // Step 5: Success response
        writeJSON(w, 200, updatedUser)
    }
}

// Helper functions
func writeJSON(w http.ResponseWriter, status int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
    writeJSON(w, status, map[string]string{
        "error": message,
    })
}

func writeValidationErrors(w http.ResponseWriter, err error) {
    writeJSON(w, 422, map[string]interface{}{
        "errors": validator.ToFieldErrors(err),
    })
}

func hashPassword(password string) string {
    // Implement password hashing (e.g., bcrypt)
    return password // Placeholder
}

func getUserIDFromPath(r *http.Request) int {
    // Extract user ID from URL path
    return 1 // Placeholder
}
```

### 18.3 Error Handling Strategy

| Error Type | Layer | Example | HTTP Status |
|------------|-------|---------|-------------|
| JSON parse error | Handler | Invalid JSON | 400 Bad Request |
| Validation error | Validator | Email format invalid | 422 Unprocessable Entity |
| Unique constraint | ENT | Email already exists | 409 Conflict |
| Not found | ENT | User not found | 404 Not Found |
| Internal error | Service/ENT | Database down | 500 Internal Server Error |

### 18.4 Complete Example Flow

```go
// 1. Define DTO
type CreateProductDTO struct {
    Name        string   `json:"name" validate:"required,min=3,max=100"`
    Description string   `json:"description" validate:"required,min=10,max=1000"`
    Price       float64  `json:"price" validate:"required,gt=0"`
    CategoryID  int      `json:"category_id" validate:"required,gt=0"`
    Tags        []string `json:"tags" validate:"required,min=1,max=10,dive,min=2,max=30"`
}

// 2. Validate in handler
func CreateProductHandler(w http.ResponseWriter, r *http.Request) {
    var dto CreateProductDTO
    
    // Parse
    if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
        writeError(w, 400, "Invalid JSON")
        return
    }
    
    // Validate
    if err := validator.V().Struct(dto); err != nil {
        writeValidationErrors(w, err)
        return
    }
    
    // Business logic + ENT
    product, err := createProduct(dto)
    if err != nil {
        handleError(w, err)
        return
    }
    
    writeJSON(w, 201, product)
}
```

### 18.5 Best Practices

1. **Always validate DTOs first** - Before any database operations
2. **Use separate DTOs** for Create and Update operations
3. **Return clear error messages** - Help API consumers understand what went wrong
4. **Use appropriate HTTP status codes** - 400 vs 422 vs 409 vs 500
5. **Handle ENT constraint errors** - Distinguish between validation and constraint violations
6. **Log internal errors** - But don't expose sensitive details to clients
7. **Use pointers for partial updates** - `*string`, `*int` for optional fields in UpdateDTO

### 18.6 Validation vs Database Constraints

**Validator Handles:**
- ✅ Format validation (email, URL, etc.)
- ✅ Length constraints (min, max)
- ✅ Type validation (numeric, alpha, etc.)
- ✅ Range validation (gte, lte)
- ✅ Cross-field validation (password confirmation)

**ENT Handles:**
- ✅ Unique constraints (email uniqueness)
- ✅ Foreign key constraints (valid references)
- ✅ Database-level rules (CHECK constraints)
- ✅ Concurrent updates (optimistic locking)

**Both layers are important!** Validator catches format issues early, ENT ensures database integrity.

---

## Summary

You now have a complete understanding of:

✅ **Setup & Basics**: Project structure, tags, production patterns  
✅ **Core Validations**: Strings, numbers, booleans, arrays  
✅ **Advanced Validations**: Dates, custom rules, enums, conditional  
✅ **Integration**: Error handling, HTTP APIs, ENT ORM  

**Next Steps:**
- Check the [Validation Reference](/validator-v10/validation-reference) for quick lookups
- Review the [Production Checklist](/validator-v10/production/production-checklist) before deploying
