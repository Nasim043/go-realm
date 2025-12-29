# Part 3: Production Checklist

## Essential Validator Concepts for Production {#production-checklist}

### ✅ Architecture Checklist

- [x] **Singleton validator instance** using `sync.Once` ✅
- [x] **Centralized custom rules** in `internal/validator/rules.go` ✅
- [x] **User-friendly error messages** via `ToFieldErrors()` ✅
- [x] **JSON field names in errors** using `RegisterTagNameFunc()` ✅
- [x] **Separate DTOs from entities** (DTO → Validate → ENT → DB) ✅

### ✅ Validation Best Practices

#### 1. Always Use DTOs
```go
// ❌ Bad: Validate ENT entity directly
func CreateUser(user *ent.User) error {
    return validator.V().Struct(user) // Don't do this
}

// ✅ Good: Validate DTO first
type CreateUserDTO struct {
    Name  string `json:"name" validate:"required"`
    Email string `json:"email" validate:"required,email"`
}
```

#### 2. Use `omitempty` for Optional Fields
```go
// ✅ Correct - validates only if present
Bio string `json:"bio" validate:"omitempty,min=10,max=500"`
```

#### 3. Use Pointers for Nullable Fields
```go
// ✅ For truly nullable fields (JSON null)
Age *int `json:"age" validate:"omitempty,gte=18"`
```

#### 4. Validate Before Database Operations
```go
// ✅ Correct order
func CreateUser(dto CreateUserDTO) error {
    // 1. Validate first
    if err := validator.V().Struct(dto); err != nil {
        return err
    }
    
    // 2. Then database operation
    return client.User.Create().SetName(dto.Name).Save(ctx)
}
```

#### 5. Handle Validation Errors Properly
```go
// ✅ Return user-friendly errors
if err := validator.V().Struct(dto); err != nil {
    return validator.ToFieldErrors(err)
}
```

### ✅ Security Considerations

1. **Never trust client input** - Always validate
2. **Validate array lengths** - Prevent DoS with `max` tag
3. **Limit string lengths** - Use `max` tag on all strings
4. **Validate file paths** - Use `filepath` or `dirpath` validators
5. **Sanitize after validation** - Validator doesn't sanitize, only validates

### ✅ Performance Considerations

1. **Reuse validator instance** - Singleton pattern (already implemented)
2. **Pre-compile regexes** - In `rules.go` at package level
3. **Use `dive` efficiently** - For array element validation
4. **Register custom validators once** - At startup only

### ✅ Common DTO Patterns

#### Pattern 1: Create DTO
```go
type CreateUserDTO struct {
    Name     string `json:"name" validate:"required,min=2,max=50"`
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required,strong_password"`
}
```

#### Pattern 2: Update DTO (Partial Updates)
```go
type UpdateUserDTO struct {
    Name  *string `json:"name" validate:"omitempty,min=2,max=50"`
    Email *string `json:"email" validate:"omitempty,email"`
    Age   *int    `json:"age" validate:"omitempty,gte=18"`
}
```

#### Pattern 3: Query/Filter DTO
```go
type UserFilterDTO struct {
    Role   string `json:"role" validate:"omitempty,oneof=admin user guest"`
    MinAge int    `json:"min_age" validate:"omitempty,gte=0"`
    MaxAge int    `json:"max_age" validate:"omitempty,gte=0,gtefield=MinAge"`
}
```

---

## 🎯 Production Integration Checklist

### HTTP API Integration

- [ ] Parse JSON with proper error handling
- [ ] Validate DTO before business logic
- [ ] Return 422 for validation errors
- [ ] Return 400 for JSON parse errors
- [ ] Return 409 for constraint violations
- [ ] Use meaningful error messages

### ENT Integration

- [ ] Create separate DTOs for Create/Update operations
- [ ] Validate DTOs before ENT operations
- [ ] Handle ENT constraint errors separately
- [ ] Distinguish validation errors from database errors
- [ ] Use transactions for complex operations
- [ ] Log errors appropriately

### Error Response Format

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

## 🔒 Security Best Practices

### Input Validation

```go
type SecureUserDTO struct {
    // Limit string lengths to prevent DoS
    Name     string `validate:"required,min=2,max=50"`
    Bio      string `validate:"omitempty,max=500"`
    
    // Validate email format
    Email    string `validate:"required,email,max=255"`
    
    // Validate array sizes
    Tags     []string `validate:"required,min=1,max=10,dive,min=2,max=30"`
    
    // Use enums for constrained values
    Role     string `validate:"required,oneof=admin user guest"`
    
    // Validate URLs to prevent injection
    Website  string `validate:"omitempty,url,max=255"`
}
```

### Password Security

```go
type PasswordDTO struct {
    // Strong password requirements
    Password string `validate:"required,min=8,max=72,strong_password"`
    
    // Confirm password match
    ConfirmPassword string `validate:"required,eqfield=Password"`
}

// Custom strong password rule
func validateStrongPassword(fl validator.FieldLevel) bool {
    password := fl.Field().String()
    hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
    hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
    hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
    hasSpecial := regexp.MustCompile(`[!@#$%^&*]`).MatchString(password)
    return len(password) >= 8 && hasUpper && hasLower && hasNumber && hasSpecial
}
```

---

## 📊 Performance Optimization

### 1. Singleton Pattern (Already Implemented)

```go
var (
    once sync.Once
    v    *v10.Validate
)

func V() *v10.Validate {
    once.Do(func() {
        v = v10.New()
        // Configure once
    })
    return v
}
```

### 2. Pre-compile Regexes

```go
// At package level
var (
    usernameRegex = regexp.MustCompile(`^[a-z][a-z0-9_]{2,19}$`)
    phoneRegex    = regexp.MustCompile(`^\+?[1-9]\d{1,14}$`)
)

// Use in validator
func validateUsername(fl validator.FieldLevel) bool {
    return usernameRegex.MatchString(fl.Field().String())
}
```

### 3. Efficient Array Validation

```go
// ✅ Efficient - validates array size and elements
Tags []string `validate:"required,min=1,max=10,dive,min=2,max=30"`

// ❌ Inefficient - validates each element separately in code
for _, tag := range tags {
    if err := validator.V().Var(tag, "min=2,max=30"); err != nil {
        // ...
    }
}
```

---

## 🚀 Deployment Checklist

### Before Production

- [ ] All validation rules tested
- [ ] Custom validators registered at startup
- [ ] Error messages are user-friendly
- [ ] Logging is configured for validation failures
- [ ] Rate limiting implemented to prevent abuse
- [ ] Input size limits enforced (max array length, max string length)
- [ ] Security review completed
- [ ] Performance testing done with realistic data

### Monitoring

- [ ] Track validation error rates
- [ ] Monitor which fields fail most often
- [ ] Alert on unusual validation patterns
- [ ] Log validation errors for analysis

---

## 📝 Code Review Checklist

When reviewing code with validator:

- [ ] DTOs have appropriate validation tags
- [ ] Optional fields use `omitempty`
- [ ] Nullable fields use pointers
- [ ] Array validations use `dive`
- [ ] Cross-field validations are correct
- [ ] Custom validators are efficient
- [ ] Error handling returns proper HTTP status codes
- [ ] Security considerations addressed
- [ ] No hardcoded values in validation rules

---

## 🎓 Next Steps & Resources

You now have a **complete, production-ready validator setup**!

### What You've Built:

✅ **Complete documentation** covering all validation categories  
✅ **18 incremental steps** with hands-on examples  
✅ **Production structure** with singleton pattern  
✅ **Custom validation rules** for business logic  
✅ **User-friendly error handling**  
✅ **Integration patterns** for HTTP and ENT  
✅ **Complete reference** guide with all rules  

### Recommended Learning Path:

1. **Steps 1-5** → Basic setup and core concepts
2. **Steps 6-11** → Master different validation types
3. **Steps 12-15** → Custom and conditional validations
4. **Steps 16-18** → Production API integration
5. **Part 2 Reference** → Lookup specific validation rules
6. **Part 3 Checklist** → Production deployment guide

### Additional Resources:

- **Official validator/v10 docs**: https://github.com/go-playground/validator
- **Go Playground**: Try examples at https://go.dev/play/

---

You're now equipped to build robust, validated Go APIs! 🎉
