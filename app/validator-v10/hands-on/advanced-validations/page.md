# Part 1: Advanced Validations

Learn advanced validation techniques including dates, custom rules, enums, conditional, and cross-field validations.

---

## Step 10: Date & Time Validations {#step10-dates}

**📝 Create `examples/date_validations.go`:**

```go
package main

import (
	"fmt"
	"time"
	"github.com/go-playground/validator/v10"
)

func main() {
	validate := validator.New()
	
	fmt.Println("=== Date & Time Validations ===\n")

	type DateDTO struct {
		// Required date
		BirthDate time.Time `validate:"required"`
		
		// Event date must be after birth date
		EventDate time.Time `validate:"required,gtefield=BirthDate"`
		
		// Date string in specific format
		DateString string `validate:"required,datetime=2006-01-02"`
		
		// RFC3339 datetime
		CreatedAt time.Time `validate:"required"`
		
		// Optional updated time
		UpdatedAt *time.Time `validate:"omitempty"`
		
		// Time must be before now
		ExpiryDate time.Time `validate:"required"`
	}

	// Valid example
	fmt.Println("Test 1: Valid dates")
	now := time.Now()
	valid := DateDTO{
		BirthDate:  time.Date(1990, 1, 1, 0, 0, 0, 0, time.UTC),
		EventDate:  time.Date(2024, 6, 15, 0, 0, 0, 0, time.UTC),
		DateString: "2024-01-15",
		CreatedAt:  now,
		UpdatedAt:  &now,
		ExpiryDate: time.Date(2025, 12, 31, 23, 59, 59, 0, time.UTC),
	}

	err := validate.Struct(valid)
	if err == nil {
		fmt.Println("✅ All date validations passed")
		fmt.Printf("   Birth: %s\n", valid.BirthDate.Format("2006-01-02"))
		fmt.Printf("   Event: %s\n", valid.EventDate.Format("2006-01-02"))
		fmt.Printf("   Created: %s\n", valid.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	fmt.Println()

	// Invalid example
	fmt.Println("Test 2: Invalid dates")
	invalid := DateDTO{
		BirthDate:  time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
		EventDate:  time.Date(1990, 1, 1, 0, 0, 0, 0, time.UTC),  // Before birth
		DateString: "2024/01/15",  // Wrong format
		CreatedAt:  time.Time{},   // Zero time
		UpdatedAt:  nil,
		ExpiryDate: time.Time{},
	}

	err = validate.Struct(invalid)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s failed '%s'\n", err.Field(), err.Tag())
		}
	}

	fmt.Println()

	// Date comparison validations
	fmt.Println("=== Date Comparison Validations ===\n")

	type DateRangeDTO struct {
		StartDate time.Time `validate:"required"`
		EndDate   time.Time `validate:"required,gtefield=StartDate"`
		
		// Date must be in the past
		HistoricalDate time.Time `validate:"required,ltefield=CurrentTime"`
		CurrentTime    time.Time `validate:"required"`
		
		// Date must be in the future
		FutureEvent time.Time `validate:"required,gtefield=CurrentTime"`
	}

	fmt.Println("Test 3: Valid date ranges")
	currentTime := time.Now()
	validRange := DateRangeDTO{
		StartDate:      time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
		EndDate:        time.Date(2024, 12, 31, 0, 0, 0, 0, time.UTC),
		HistoricalDate: time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC),
		CurrentTime:    currentTime,
		FutureEvent:    currentTime.Add(24 * time.Hour),
	}

	err = validate.Struct(validRange)
	if err == nil {
		fmt.Println("✅ Date range validations passed")
	}

	fmt.Println()

	fmt.Println("Test 4: Invalid date ranges")
	invalidRange := DateRangeDTO{
		StartDate:      time.Date(2024, 12, 31, 0, 0, 0, 0, time.UTC),
		EndDate:        time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),  // Before start
		HistoricalDate: currentTime.Add(24 * time.Hour),              // In future
		CurrentTime:    currentTime,
		FutureEvent:    time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC),  // In past
	}

	err = validate.Struct(invalidRange)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s failed '%s'\n", err.Field(), err.Tag())
		}
	}
}
```

**Key Date Validations:**

| Validation | Tag | Example |
|------------|-----|---------|
| Date format | `datetime=2006-01-02` | "2024-01-15" |
| After another date | `gtefield=StartDate` | EndDate > StartDate |
| Before another date | `ltefield=EndDate` | StartDate < EndDate |
| Required date | `required` | Must have value |

---

## Step 11: File Validations {#step11-files}

File validations are useful for handling file paths and extensions.

**Common File Validations:**

| Validation | Tag | Use Case |
|------------|-----|----------|
| File exists | `file` | Path to existing file |
| File path format | `filepath` | Valid file path format |
| Directory path | `dirpath` | Valid directory path |
| File extension | `endswith=.jpg` | Check file extension |

**Example:**
```go
type FileUploadDTO struct {
	ImagePath string `validate:"required,endswith=.jpg"`
	DataPath  string `validate:"required,filepath"`
}
```

---

## Step 12: Custom Validations {#step12-custom}

### 12.1 Validating WITHOUT Structs

**You don't always need structs!** Use `validate.Var()` to validate individual values:

**📝 Create `examples/custom_validation_demo.go`:**

```go
package main

import (
	"fmt"
	"regexp"
	"github.com/go-playground/validator/v10"
)

func main() {
	validate := validator.New()

	// 1. Validate single values directly
	email := "user@example.com"
	err := validate.Var(email, "required,email")
	if err == nil {
		fmt.Println("✅ Valid email")
	}

	// 2. Register custom validation
	validate.RegisterValidation("strong_password", func(fl validator.FieldLevel) bool {
		password := fl.Field().String()
		hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
		hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
		hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
		hasSpecial := regexp.MustCompile(`[!@#$%^&*]`).MatchString(password)
		return len(password) >= 8 && hasUpper && hasLower && hasNumber && hasSpecial
	})

	password := "MyP@ss123"
	err = validate.Var(password, "strong_password")
	if err == nil {
		fmt.Println("✅ Strong password")
	}

	// 3. Validate slices
	emails := []string{"user1@example.com", "user2@example.com"}
	err = validate.Var(emails, "required,dive,email")
	
	// 4. Validate maps
	userAges := map[string]int{"john": 25, "jane": 30}
	err = validate.Var(userAges, "dive,keys,alpha,endkeys,gte=18")

	// 5. Cross-value validation without struct
	password1 := "mypassword"
	password2 := "mypassword"
	err = validate.VarWithValue(password1, password2, "eqfield")
	if err == nil {
		fmt.Println("✅ Passwords match")
	}
}
```

**Run:**
```bash
go run examples/custom_validation_demo.go
```

**Key Methods:**
- `validate.Var(value, "rules")` - Validate single value
- `validate.VarWithValue(val1, val2, "rule")` - Compare two values
- `validate.RegisterValidation("name", func)` - Add custom rule

---

## Step 13: Enum Validations {#step13-enum}

### 13.1 Enum with `oneof` Tag

The `oneof` tag validates that a value is one of a predefined set.

**📝 Create `examples/enum_demo.go`:**

```go
package main

import (
	"fmt"
	"github.com/go-playground/validator/v10"
)

func main() {
	validate := validator.New()
	
	fmt.Println("=== Enum Validations ===\n")

	type UserDTO struct {
		// String enum
		Role string `validate:"required,oneof=admin user guest moderator"`
		
		// Number enum
		Priority int `validate:"required,oneof=1 2 3 4 5"`
		
		// Status enum
		Status string `validate:"required,oneof=active inactive pending suspended"`
		
		// Case-sensitive enum
		Environment string `validate:"required,oneof=development staging production"`
		
		// Multiple word enum (space-separated in tag)
		Department string `validate:"omitempty,oneof=engineering marketing sales hr"`
	}

	// Valid example
	fmt.Println("Test 1: Valid enum values")
	valid := UserDTO{
		Role:        "admin",
		Priority:    1,
		Status:      "active",
		Environment: "production",
		Department:  "engineering",
	}

	err := validate.Struct(valid)
	if err == nil {
		fmt.Println("✅ All enum validations passed")
		fmt.Printf("   Role: %s, Status: %s, Priority: %d\n", 
			valid.Role, valid.Status, valid.Priority)
	}

	fmt.Println()

	// Invalid example
	fmt.Println("Test 2: Invalid enum values")
	invalid := UserDTO{
		Role:        "superadmin",  // Not in enum
		Priority:    10,             // Not in 1-5
		Status:      "deleted",      // Not in enum
		Environment: "PRODUCTION",   // Case mismatch
		Department:  "finance",      // Not in enum
	}

	err = validate.Struct(invalid)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s: must be one of [%s], got '%v'\n", 
				err.Field(), err.Param(), err.Value())
		}
	}

	fmt.Println()

	// Enum with type aliases (recommended pattern)
	fmt.Println("=== Type-Safe Enums (Best Practice) ===\n")

	type UserRole string
	const (
		RoleAdmin     UserRole = "admin"
		RoleUser      UserRole = "user"
		RoleGuest     UserRole = "guest"
		RoleModerator UserRole = "moderator"
	)

	type TypeSafeUserDTO struct {
		Role   UserRole `validate:"required,oneof=admin user guest moderator"`
		Status string   `validate:"required,oneof=active inactive"`
	}

	fmt.Println("Test 3: Type-safe enum")
	typeSafeValid := TypeSafeUserDTO{
		Role:   RoleAdmin,
		Status: "active",
	}

	err = validate.Struct(typeSafeValid)
	if err == nil {
		fmt.Println("✅ Type-safe enum validation passed")
		fmt.Printf("   Role: %s (type: UserRole)\n", typeSafeValid.Role)
	}
}
```

**Run:**
```bash
go run examples/enum_demo.go
```

---

## Step 14: Conditional Validations {#step14-conditional}

### 14.1 Required If, Unless, With, Without

Conditional validations change rules based on other field values.

**📝 Create `examples/conditional_demo.go`:**

```go
package main

import (
	"fmt"
	"github.com/go-playground/validator/v10"
)

func main() {
	validate := validator.New()
	
	fmt.Println("=== Conditional Validations ===\n")

	type ShippingDTO struct {
		// Required if ShipToDifferentAddress is true
		ShipToDifferentAddress bool   `validate:"boolean"`
		ShippingName           string `validate:"required_if=ShipToDifferentAddress true"`
		ShippingAddress        string `validate:"required_if=ShipToDifferentAddress true"`
		
		// Required unless PaymentMethod is 'cash'
		PaymentMethod string `validate:"required,oneof=card cash paypal"`
		CardNumber    string `validate:"required_unless=PaymentMethod cash"`
		
		// Required with another field
		Country     string `validate:"omitempty"`
		PostalCode  string `validate:"required_with=Country"`
		
		// Required without another field
		Phone string `validate:"omitempty"`
		Email string `validate:"required_without=Phone,email"`
	}

	// Test 1: Ship to different address (valid)
	fmt.Println("Test 1: Ship to different address")
	valid1 := ShippingDTO{
		ShipToDifferentAddress: true,
		ShippingName:           "John Doe",
		ShippingAddress:        "123 Main St",
		PaymentMethod:          "card",
		CardNumber:             "4111111111111111",
		Country:                "US",
		PostalCode:             "12345",
		Phone:                  "+1234567890",
		Email:                  "john@example.com",
	}

	err := validate.Struct(valid1)
	if err == nil {
		fmt.Println("✅ Validation passed (shipping to different address)")
	}

	fmt.Println()

	// Test 2: Same address, cash payment (valid)
	fmt.Println("Test 2: Same address, cash payment")
	valid2 := ShippingDTO{
		ShipToDifferentAddress: false,
		ShippingName:           "",  // Not required
		ShippingAddress:        "",  // Not required
		PaymentMethod:          "cash",
		CardNumber:             "",  // Not required for cash
		Country:                "",
		PostalCode:             "",
		Phone:                  "+1234567890",
		Email:                  "",  // Not required when phone provided
	}

	err = validate.Struct(valid2)
	if err == nil {
		fmt.Println("✅ Validation passed (same address, cash payment)")
	}

	fmt.Println()

	// Test 3: Missing required conditional fields
	fmt.Println("Test 3: Missing required conditional fields")
	invalid := ShippingDTO{
		ShipToDifferentAddress: true,
		ShippingName:           "",      // Required but missing
		ShippingAddress:        "",      // Required but missing
		PaymentMethod:          "card",
		CardNumber:             "",      // Required but missing
		Country:                "US",
		PostalCode:             "",      // Required with Country
		Phone:                  "",
		Email:                  "",      // Required without Phone
	}

	err = validate.Struct(invalid)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s failed '%s'\n", err.Field(), err.Tag())
		}
	}
}
```

---

## Step 15: Cross-Field Validations {#step15-cross-field}

### 15.1 Field Comparisons

Compare one field's value against another field.

**📝 Create `examples/cross_field_demo.go`:**

```go
package main

import (
	"fmt"
	"time"
	"github.com/go-playground/validator/v10"
)

func main() {
	validate := validator.New()
	
	fmt.Println("=== Cross-Field Validations ===\n")

	type PasswordDTO struct {
		Password        string `validate:"required,min=8"`
		ConfirmPassword string `validate:"required,eqfield=Password"`
	}

	// Test 1: Matching passwords
	fmt.Println("Test 1: Matching passwords")
	validPass := PasswordDTO{
		Password:        "securepass123",
		ConfirmPassword: "securepass123",
	}

	err := validate.Struct(validPass)
	if err == nil {
		fmt.Println("✅ Passwords match")
	}

	fmt.Println()

	// Test 2: Non-matching passwords
	fmt.Println("Test 2: Non-matching passwords")
	invalidPass := PasswordDTO{
		Password:        "securepass123",
		ConfirmPassword: "different",
	}

	err = validate.Struct(invalidPass)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s: must equal %s\n", err.Field(), err.Param())
		}
	}

	fmt.Println()

	// Advanced cross-field validations
	fmt.Println("=== Advanced Cross-Field Validations ===\n")

	type RangeDTO struct {
		MinPrice float64 `validate:"required,gte=0"`
		MaxPrice float64 `validate:"required,gtefield=MinPrice"`
		
		StartDate time.Time `validate:"required"`
		EndDate   time.Time `validate:"required,gtefield=StartDate"`
		
		MinAge int `validate:"required,gte=0"`
		MaxAge int `validate:"required,gtefield=MinAge,lte=120"`
		
		// Not equal to another field
		NewEmail    string `validate:"required,email"`
		OldEmail    string `validate:"required,email"`
		EmailChanged bool  `validate:"omitempty"`
	}

	fmt.Println("Test 3: Valid ranges")
	validRange := RangeDTO{
		MinPrice:  10.00,
		MaxPrice:  100.00,
		StartDate: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
		EndDate:   time.Date(2024, 12, 31, 0, 0, 0, 0, time.UTC),
		MinAge:    18,
		MaxAge:    65,
		NewEmail:  "new@example.com",
		OldEmail:  "old@example.com",
	}

	err = validate.Struct(validRange)
	if err == nil {
		fmt.Println("✅ All range validations passed")
		fmt.Printf("   Price range: $%.2f - $%.2f\n", validRange.MinPrice, validRange.MaxPrice)
		fmt.Printf("   Age range: %d - %d\n", validRange.MinAge, validRange.MaxAge)
	}

	fmt.Println()

	fmt.Println("Test 4: Invalid ranges")
	invalidRange := RangeDTO{
		MinPrice:  100.00,
		MaxPrice:  10.00,  // Less than min
		StartDate: time.Date(2024, 12, 31, 0, 0, 0, 0, time.UTC),
		EndDate:   time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),  // Before start
		MinAge:    65,
		MaxAge:    18,     // Less than min
		NewEmail:  "email@example.com",
		OldEmail:  "email@example.com",  // Should be different
	}

	err = validate.Struct(invalidRange)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s failed '%s'\n", err.Field(), err.Tag())
		}
	}

	fmt.Println()

	// Field comparison operators
	fmt.Println("=== Field Comparison Operators ===\n")

	type ComparisonDTO struct {
		Value1 int `validate:"required"`
		Value2 int `validate:"required,eqfield=Value1"`    // Equal
		Value3 int `validate:"required,nefield=Value1"`    // Not equal
		Value4 int `validate:"required,gtfield=Value1"`    // Greater than
		Value5 int `validate:"required,gtefield=Value1"`   // Greater than or equal
		Value6 int `validate:"required,ltfield=Value4"`    // Less than
		Value7 int `validate:"required,ltefield=Value4"`   // Less than or equal
	}

	fmt.Println("Test 5: Field comparisons")
	validComp := ComparisonDTO{
		Value1: 10,
		Value2: 10,  // Equal to Value1
		Value3: 20,  // Not equal to Value1
		Value4: 30,  // Greater than Value1
		Value5: 15,  // Greater than or equal to Value1
		Value6: 25,  // Less than Value4
		Value7: 30,  // Less than or equal to Value4
	}

	err = validate.Struct(validComp)
	if err == nil {
		fmt.Println("✅ All field comparison validations passed")
	} else {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s failed '%s=%s'\n", err.Field(), err.Tag(), err.Param())
		}
	}
}
```

**Key Cross-Field Validations:**

| Validation | Tag | Example |
|------------|-----|---------|
| Equal to field | `eqfield=Password` | Confirm password |
| Not equal to field | `nefield=OldEmail` | New email must differ |
| Greater than field | `gtfield=MinPrice` | Max > Min |
| Greater or equal field | `gtefield=StartDate` | End >= Start |
| Less than field | `ltfield=MaxPrice` | Min < Max |
| Less or equal field | `ltefield=EndDate` | Start <= End |
