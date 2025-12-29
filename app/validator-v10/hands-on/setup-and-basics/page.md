# Part 1: Setup & Basics

> **How to Use This Section**: Follow each step in order. Copy the code, paste it, run it, see the output. Each step builds on the previous one **incrementally**.

---

## Step 1: Project Setup {#step1-setup}

### 1.1 Create Project

```bash
mkdir go-dto-validator
cd go-dto-validator
go mod init github.com/TonmoyTalukder/go-dto-validator
```

### 1.2 Install Validator

```bash
go get github.com/go-playground/validator/v10
```

**🔍 What is validator/v10?**

**What is it?**
- A powerful Go validation library for validating structs and fields
- Used to validate DTOs before they reach your business logic or database

**What Does It Do?**
- **Validates structs**: Checks if struct fields meet defined criteria
- **Tag-based**: Uses struct tags like `validate:"required,email"`
- **Built-in rules**: 100+ built-in validation rules
- **Custom rules**: Allows you to define custom validation logic
- **Error messages**: Returns detailed validation errors

**Where Does It Fit?**
```
HTTP Request → Parse JSON → DTO → VALIDATE (validator) → Business Logic → Database (ENT)
```

### 1.3 Verify Installation

```bash
go list -m github.com/go-playground/validator/v10
```

**✅ Expected Output**: `github.com/go-playground/validator/v10 v10.x.x`

---

## Step 2: First Validation (Hello World) {#step2-first-validation}

### 2.1 Create `main.go`

```go
package main

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

type UserDTO struct {
	Name  string `validate:"required"`
	Email string `validate:"required,email"`
	Age   int    `validate:"gte=18"`
}

func main() {
	validate := validator.New()

	fmt.Println("=== Validator Hello World ===")
	fmt.Println()

	// Test case 1: Invalid data
	fmt.Println("Test 1: Invalid data")
	user1 := UserDTO{
		Name:  "",
		Email: "invalid-email",
		Age:   15,
	}

	err := validate.Struct(user1)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - Field: %s, Tag: %s\n", err.Field(), err.Tag())
		}
	} else {
		fmt.Println("✅ Validation passed")
	}

	fmt.Println()

	// Test case 2: Valid data
	fmt.Println("Test 2: Valid data")
	user2 := UserDTO{
		Name:  "John Doe",
		Email: "john@example.com",
		Age:   25,
	}

	err = validate.Struct(user2)
	if err != nil {
		fmt.Println("❌ Validation failed")
	} else {
		fmt.Println("✅ Validation passed")
		fmt.Printf("   Name: %s, Email: %s, Age: %d\n", user2.Name, user2.Email, user2.Age)
	}
}
```

### 2.2 Run It

```bash
go run .
```

**✅ Expected Output:**
```
=== Validator Hello World ===

Test 1: Invalid data
❌ Validation failed:
   - Field: Name, Tag: required
   - Field: Email, Tag: email
   - Field: Age, Tag: gte

Test 2: Valid data
✅ Validation passed
   Name: John Doe, Email: john@example.com, Age: 25
```

🎉 **Congratulations!** You've validated your first DTO.

---

## Step 3: Understanding Validation Tags {#step3-tags}

### 3.1 Tag Syntax

Validator uses struct tags with the `validate` key:

```go
FieldName Type `validate:"rule1,rule2=param,rule3"`
```

### 3.2 Common Tag Patterns

| Pattern | Example | Meaning |
|---------|---------|----------|
| Single rule | `validate:"required"` | Field must not be empty |
| Multiple rules | `validate:"required,email"` | Multiple validations (AND) |
| Rule with param | `validate:"min=5"` | Minimum length 5 |
| Multiple params | `validate:"min=5,max=20"` | Between 5 and 20 |
| Optional validation | `validate:"omitempty,email"` | Validate only if not empty |
| Enum | `validate:"oneof=red blue green"` | Must be one of the values |

### 3.3 Most Used Tags (Memorize These)

| Tag | Type | Meaning | Example |
|-----|------|---------|----------|
| `required` | All | Must have a value | `validate:"required"` |
| `omitempty` | All | Skip validation if empty | `validate:"omitempty,email"` |
| `email` | String | Valid email format | `validate:"email"` |
| `url` | String | Valid URL format | `validate:"url"` |
| `min` | String | Minimum length | `validate:"min=5"` |
| `max` | String | Maximum length | `validate:"max=20"` |
| `len` | String | Exact length | `validate:"len=10"` |
| `gte` | Number | Greater than or equal | `validate:"gte=18"` |
| `lte` | Number | Less than or equal | `validate:"lte=100"` |
| `gt` | Number | Greater than | `validate:"gt=0"` |
| `lt` | Number | Less than | `validate:"lt=100"` |
| `oneof` | All | Must be one of | `validate:"oneof=red blue"` |
| `eq` | All | Must equal | `validate:"eq=admin"` |
| `ne` | All | Must not equal | `validate:"ne=banned"` |

### 3.4 Interactive Example

**📝 Add this function to `main.go`:**

```go
func demoTagPatterns() {
	validate := validator.New()

	fmt.Println("\n=== Understanding Tag Patterns ===")
	fmt.Println()

	type Demo struct {
		// Required field
		Username string `validate:"required"`
		
		// Optional email (only validates if provided)
		Email string `validate:"omitempty,email"`
		
		// String length constraints
		Password string `validate:"required,min=8,max=32"`
		
		// Number range
		Age int `validate:"gte=18,lte=120"`
		
		// Enum
		Role string `validate:"oneof=admin user guest"`
	}

	// Valid example
	valid := Demo{
		Username: "john_doe",
		Email:    "john@example.com",
		Password: "securepass123",
		Age:      25,
		Role:     "user",
	}

	err := validate.Struct(valid)
	if err == nil {
		fmt.Println("✅ Valid data passed all validations")
	}

	// Invalid example
	invalid := Demo{
		Username: "",               // Missing required
		Email:    "not-an-email",   // Invalid email
		Password: "short",          // Too short
		Age:      15,               // Under 18
		Role:     "superadmin",     // Not in enum
	}

	err = validate.Struct(invalid)
	if err != nil {
		fmt.Println("\n❌ Invalid data failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s failed '%s' validation\n", err.Field(), err.Tag())
		}
	}
}
```

**Update main function:**
```go
func main() {
	demoTagPatterns()
}
```

**Run:**
```bash
go run .
```

**✅ Expected Output:**
```
=== Understanding Tag Patterns ===

✅ Valid data passed all validations

❌ Invalid data failed:
   - Username failed 'required' validation
   - Email failed 'email' validation
   - Password failed 'min' validation
   - Age failed 'gte' validation
   - Role failed 'oneof' validation
```

---

## Step 4: Production Structure {#step4-structure}

### 4.1 Why Project Structure Matters

In production, you need:
- **Single validator instance** (performance)
- **Centralized custom rules**
- **Reusable error handling**
- **Clean separation of concerns**

### 4.2 Recommended Structure

```
go-dto-validator/
├── go.mod
├── main.go
└── internal/
    └── validator/
        ├── validator.go      # Global instance
        ├── rules.go          # Custom validation rules
        └── errors.go         # Error formatting
```

### 4.3 Create `internal/validator/validator.go`

```bash
mkdir -p internal/validator
```

**📝 Create `internal/validator/validator.go`:**

```go
package validator

import (
	"reflect"
	"strings"
	"sync"

	v10 "github.com/go-playground/validator/v10"
)

var (
	once sync.Once
	v    *v10.Validate
)

// V returns a singleton validator instance
func V() *v10.Validate {
	once.Do(func() {
		v = v10.New()

		// Use JSON field names in error messages
		v.RegisterTagNameFunc(func(f reflect.StructField) string {
			name := f.Tag.Get("json")
			if name == "" {
				return f.Name
			}
			// Extract field name before comma
			name = strings.Split(name, ",")[0]
			if name == "-" {
				return ""
			}
			return name
		})

		// Register custom validation rules
		registerCustomRules(v)
	})

	return v
}
```

**💡 Why singleton pattern?**
- **Performance**: Creating a validator is expensive (reflection, rule registration)
- **Thread-safe**: `sync.Once` ensures one-time initialization
- **Memory efficient**: Single instance across your application
- **Production standard**: Same pattern used by gin, echo, etc.

### 4.4 Create `internal/validator/rules.go`

**📝 Create `internal/validator/rules.go`:**

```go
package validator

import (
	"regexp"

	v10 "github.com/go-playground/validator/v10"
)

// Custom validation regex patterns
var (
	usernameRegex = regexp.MustCompile(`^[a-z][a-z0-9_]{2,19}$`)
	phoneRegex    = regexp.MustCompile(`^\+?[1-9]\d{1,14}$`)
)

func registerCustomRules(v *v10.Validate) {
	// Username: starts with letter, 3-20 chars, alphanumeric + underscore
	v.RegisterValidation("username", validateUsername)
	
	// Phone: E.164 format
	v.RegisterValidation("phone", validatePhone)
}

func validateUsername(fl v10.FieldLevel) bool {
	return usernameRegex.MatchString(fl.Field().String())
}

func validatePhone(fl v10.FieldLevel) bool {
	return phoneRegex.MatchString(fl.Field().String())
}
```

### 4.5 Create `internal/validator/errors.go`

**📝 Create `internal/validator/errors.go`:**

```go
package validator

import (
	"fmt"

	v10 "github.com/go-playground/validator/v10"
)

type FieldErrors map[string]string

// ToFieldErrors converts validator errors to user-friendly messages
func ToFieldErrors(err error) FieldErrors {
	out := FieldErrors{}

	// Type assertion to validator.ValidationErrors
	validationErrors, ok := err.(v10.ValidationErrors)
	if !ok {
		out["_error"] = "invalid input format"
		return out
	}

	for _, fieldErr := range validationErrors {
		field := fieldErr.Field()
		tag := fieldErr.Tag()
		param := fieldErr.Param()

		out[field] = formatError(tag, param, field)
	}

	return out
}

func formatError(tag, param, field string) string {
	switch tag {
	case "required":
		return "is required"
	case "email":
		return "must be a valid email address"
	case "url":
		return "must be a valid URL"
	case "min":
		return fmt.Sprintf("must be at least %s characters", param)
	case "max":
		return fmt.Sprintf("must be at most %s characters", param)
	case "len":
		return fmt.Sprintf("must be exactly %s characters", param)
	case "gte":
		return fmt.Sprintf("must be greater than or equal to %s", param)
	case "lte":
		return fmt.Sprintf("must be less than or equal to %s", param)
	case "gt":
		return fmt.Sprintf("must be greater than %s", param)
	case "lt":
		return fmt.Sprintf("must be less than %s", param)
	case "oneof":
		return fmt.Sprintf("must be one of: %s", param)
	case "username":
		return "must be a valid username (3-20 chars, start with letter, alphanumeric + underscore)"
	case "phone":
		return "must be a valid phone number"
	case "unique":
		return "must contain unique values"
	case "dive":
		return "array element validation failed"
	default:
		return fmt.Sprintf("failed validation: %s", tag)
	}
}
```

### 4.6 Update `main.go` to Use Production Structure

**📝 Replace `main.go` with:**

```go
package main

import (
	"fmt"

	"github.com/TonmoyTalukder/go-dto-validator/internal/validator"
)

type CreateUserDTO struct {
	Name     string `json:"name" validate:"required,min=2,max=50"`
	Username string `json:"username" validate:"required,username"`
	Email    string `json:"email" validate:"required,email"`
	Phone    string `json:"phone" validate:"omitempty,phone"`
	Age      int    `json:"age" validate:"omitempty,gte=0,lte=120"`
	Role     string `json:"role" validate:"required,oneof=admin user guest"`
}

func main() {
	fmt.Println("=== Production Validator Setup ===\n")

	// Test case 1: Valid data
	fmt.Println("Test 1: Valid data")
	validUser := CreateUserDTO{
		Name:     "John Doe",
		Username: "johndoe",
		Email:    "john@example.com",
		Phone:    "+1234567890",
		Age:      25,
		Role:     "user",
	}

	err := validator.V().Struct(validUser)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for field, msg := range validator.ToFieldErrors(err) {
			fmt.Printf("   - %s: %s\n", field, msg)
		}
	} else {
		fmt.Println("✅ Validation passed")
		fmt.Printf("   User: %s (%s)\n", validUser.Name, validUser.Email)
	}

	fmt.Println()

	// Test case 2: Invalid data
	fmt.Println("Test 2: Invalid data")
	invalidUser := CreateUserDTO{
		Name:     "J",                 // Too short
		Username: "123invalid",        // Doesn't start with letter
		Email:    "not-an-email",      // Invalid email
		Phone:    "invalid-phone",     // Invalid phone
		Age:      150,                 // Out of range
		Role:     "superadmin",        // Not in enum
	}

	err = validator.V().Struct(invalidUser)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for field, msg := range validator.ToFieldErrors(err) {
			fmt.Printf("   - %s: %s\n", field, msg)
		}
	}
}
```

### 4.7 Run Production Setup

```bash
go run .
```

**✅ Expected Output:**
```
=== Production Validator Setup ===

Test 1: Valid data
✅ Validation passed
   User: John Doe (john@example.com)

Test 2: Invalid data
❌ Validation failed:
   - name: must be at least 2 characters
   - username: must be a valid username (3-20 chars, start with letter, alphanumeric + underscore)
   - email: must be a valid email address
   - phone: must be a valid phone number
   - age: must be less than or equal to 120
   - role: must be one of: admin user guest
```

🎉 **You now have a production-ready validator setup!**
