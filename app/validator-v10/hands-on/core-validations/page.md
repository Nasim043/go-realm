# Part 1: Core Validations

Learn essential validation patterns for nullable fields, strings, numbers, booleans, and arrays.

---

## Step 5: Nullable Fields & Optional Validation {#step5-nullable}

### 5.1 Understanding Nullable vs Required

In Go and databases, there's a distinction between:
- **Required**: Field must have a value
- **Optional**: Field can be omitted
- **Nullable**: Field can be explicitly `null`

### 5.2 Using Pointers for Nullable Fields

> **📝 Note about Example Files**: All example files in `examples/` have `package main` and `func main()`. Your IDE will show lint errors about "main redeclared" - **this is normal and harmless**. Each file is designed to run individually:
> ```bash
> go run examples/nullable_demo.go
> go run examples/string_validations.go
> # etc...
> ```

**📝 Create new file `examples/nullable_demo.go`:**

```go
package main

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

func demoNullableFields() {
	validate := validator.New()
	
	fmt.Println("\n=== Nullable Fields Demo ===\n")

	type UserDTO struct {
		// Required field - must have value
		Name string `json:"name" validate:"required"`
		
		// Optional field - can be empty string
		// Only validates if not empty
		Bio string `json:"bio" validate:"omitempty,min=10,max=500"`
		
		// Nullable field - can be nil or have value
		// If present, must be valid email
		Email *string `json:"email" validate:"omitempty,email"`
		
		// Nullable number - if present, must be >= 18
		Age *int `json:"age" validate:"omitempty,gte=18"`
	}

	// Test 1: All fields provided
	fmt.Println("Test 1: All fields provided")
	email1 := "john@example.com"
	age1 := 25
	user1 := UserDTO{
		Name:  "John Doe",
		Bio:   "Software developer with 5 years experience",
		Email: &email1,
		Age:   &age1,
	}

	err := validate.Struct(user1)
	if err == nil {
		fmt.Println("✅ Validation passed")
		fmt.Printf("   Name: %s, Email: %s, Age: %d\n", 
			user1.Name, *user1.Email, *user1.Age)
	}

	fmt.Println()

	// Test 2: Optional fields omitted (nil)
	fmt.Println("Test 2: Optional fields omitted")
	user2 := UserDTO{
		Name:  "Jane Smith",
		Bio:   "",      // Empty string - validation skipped
		Email: nil,     // Nil pointer - validation skipped
		Age:   nil,     // Nil pointer - validation skipped
	}

	err = validate.Struct(user2)
	if err == nil {
		fmt.Println("✅ Validation passed (optional fields nil)")
		fmt.Printf("   Name: %s\n", user2.Name)
	}

	fmt.Println()

	// Test 3: Invalid optional values
	fmt.Println("Test 3: Invalid optional values")
	invalidEmail := "not-an-email"
	invalidAge := 15
	user3 := UserDTO{
		Name:  "Bob Johnson",
		Bio:   "Short",  // Too short
		Email: &invalidEmail,  // Present but invalid
		Age:   &invalidAge,    // Present but too young
	}

	err = validate.Struct(user3)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s: %s\n", err.Field(), err.Tag())
		}
	}
}

func main() {
	demoNullableFields()
}
```

**Run:**
```bash
go run examples/nullable_demo.go
```

**✅ Expected Output:**
```
=== Nullable Fields Demo ===

Test 1: All fields provided
✅ Validation passed
   Name: John Doe, Email: john@example.com, Age: 25

Test 2: Optional fields omitted
✅ Validation passed (optional fields nil)
   Name: Jane Smith

Test 3: Invalid optional values
❌ Validation failed:
   - Bio: min
   - Email: email
   - Age: gte
```

### 5.3 Nullable Field Patterns

| Pattern | Go Type | JSON | Validation | Use Case |
|---------|---------|------|------------|----------|
| Required | `string` | `"value"` | Always validates | Must always have value |
| Optional string | `string` | `""` or `"value"` | `omitempty` skips empty | Optional but validates if present |
| Nullable | `*string` | `null` or `"value"` | `omitempty` skips nil | Can be explicitly null |
| Pointer required | `*string` | `"value"` | `required` | Pointer must not be nil |

**Key Rules:**
- Use `omitempty` for optional validation
- Use pointers for truly nullable fields (JSON `null`)
- Use `required` to enforce non-nil/non-zero values
- Combine `omitempty` with other rules for "if present, must be valid"

---

## Step 6: String Validations {#step6-strings}

### 6.1 Format Validations

String validation covers email, URLs, alpha characters, and more.

**📝 Create `examples/string_validations.go`:**

```go
package main

import (
	"fmt"
	"github.com/go-playground/validator/v10"
)

func main() {
	validate := validator.New()
	
	fmt.Println("=== String Format Validations ===\n")

	type StringFormatDTO struct {
		// Email validation
		Email string `validate:"required,email"`
		
		// URL validation (must have scheme)
		Website string `validate:"omitempty,url"`
		
		// URI validation (can be relative path)
		APIPath string `validate:"omitempty,uri"`
		
		// Alpha only (letters A-Z, a-z)
		FirstName string `validate:"required,alpha"`
		
		// Alphanumeric only (letters + numbers)
		Username string `validate:"required,alphanum"`
		
		// Alpha with unicode support
		InternationalName string `validate:"omitempty,alphaunicode"`
		
		// ASCII only characters
		AsciiField string `validate:"omitempty,ascii"`
		
		// Lowercase only
		LowerTag string `validate:"omitempty,lowercase"`
		
		// Uppercase only
		UpperTag string `validate:"omitempty,uppercase"`
		
		// Hex color (#RGB or #RRGGBB)
		Color string `validate:"omitempty,hexcolor"`
		
		// UUID validation (v3, v4, v5)
		ID string `validate:"omitempty,uuid4"`
		
		// IP address (v4 or v6)
		IPAddr string `validate:"omitempty,ip"`
		
		// IPv4 specific
		IPv4Addr string `validate:"omitempty,ipv4"`
		
		// IPv6 specific
		IPv6Addr string `validate:"omitempty,ipv6"`
		
		// MAC address
		MACAddr string `validate:"omitempty,mac"`
		
		// JSON string
		JSONData string `validate:"omitempty,json"`
		
		// Base64 encoded
		Base64Data string `validate:"omitempty,base64"`
		
		// JWT token
		JWTToken string `validate:"omitempty,jwt"`
	}

	// Valid example
	fmt.Println("Test 1: Valid string formats")
	valid := StringFormatDTO{
		Email:             "user@example.com",
		Website:           "https://example.com",
		APIPath:           "/api/v1/users",
		FirstName:         "John",
		Username:          "john123",
		InternationalName: "José",
		AsciiField:        "Hello123",
		LowerTag:          "lowercase",
		UpperTag:          "UPPERCASE",
		Color:             "#FF5733",
		ID:                "550e8400-e29b-41d4-a716-446655440000",
		IPAddr:            "192.168.1.1",
		IPv4Addr:          "10.0.0.1",
		IPv6Addr:          "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
		MACAddr:           "01:23:45:67:89:ab",
		JSONData:          `{"key": "value"}`,
		Base64Data:        "SGVsbG8gV29ybGQ=",
		JWTToken:          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
	}

	err := validate.Struct(valid)
	if err == nil {
		fmt.Println("✅ All string format validations passed")
		fmt.Printf("   Email: %s\n", valid.Email)
		fmt.Printf("   Website: %s\n", valid.Website)
		fmt.Printf("   IP: %s\n", valid.IPAddr)
	}

	fmt.Println()

	// Invalid example
	fmt.Println("Test 2: Invalid string formats")
	invalid := StringFormatDTO{
		Email:             "not-an-email",
		Website:           "not a url",
		APIPath:           "",
		FirstName:         "John123",          // Contains numbers
		Username:          "user name",        // Contains space
		InternationalName: "Name!@#",          // Special characters
		LowerTag:          "NotLower",
		UpperTag:          "notUpper",
		Color:             "red",              // Not hex format
		ID:                "not-a-uuid",
		IPAddr:            "999.999.999.999",
		IPv4Addr:          "not-ipv4",
		IPv6Addr:          "not-ipv6",
		MACAddr:           "invalid-mac",
		JSONData:          "not json",
		Base64Data:        "not base64!!!",
		JWTToken:          "not.a.jwt",
	}

	err = validate.Struct(invalid)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		count := 0
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s failed '%s'\n", err.Field(), err.Tag())
			count++
			if count >= 8 {
				fmt.Println("   - ... and more errors")
				break
			}
		}
	}

	fmt.Println()

	// String length validations
	fmt.Println("=== String Length Validations ===\n")

	type LengthDTO struct {
		// Minimum length
		Password string `validate:"required,min=8"`
		
		// Maximum length
		Username string `validate:"required,max=20"`
		
		// Exact length
		PIN string `validate:"required,len=4"`
		
		// Length range
		Bio string `validate:"required,min=10,max=500"`
		
		// Contains specific substring
		Description string `validate:"required,contains=Go"`
		
		// Excludes specific substring
		SafeInput string `validate:"required,excludes=<script>"`
		
		// Starts with
		BlogSlug string `validate:"required,startswith=blog-"`
		
		// Ends with
		ImageFile string `validate:"required,endswith=.jpg"`
		
		// Doesn't start with
		Username2 string `validate:"required,excludes=admin"`
		
		// Doesn't end with
		Filename string `validate:"required,excludes=.exe"`
	}

	fmt.Println("Test 3: Valid string lengths and patterns")
	validLength := LengthDTO{
		Password:    "securepass123",
		Username:    "johndoe",
		PIN:         "1234",
		Bio:         "This is a bio that is long enough to pass validation rules",
		Description: "Learning Go programming",
		SafeInput:   "This is safe input",
		BlogSlug:    "blog-my-first-post",
		ImageFile:   "profile.jpg",
		Username2:   "johndoe",
		Filename:    "document.pdf",
	}

	err = validate.Struct(validLength)
	if err == nil {
		fmt.Println("✅ All length validations passed")
	}

	fmt.Println()

	fmt.Println("Test 4: Invalid string lengths and patterns")
	invalidLength := LengthDTO{
		Password:    "short",                    // Too short
		Username:    "verylongusernamethatexceedslimit", // Too long
		PIN:         "12345",                    // Not exact length
		Bio:         "Short",                    // Too short
		Description: "Learning Python",          // Doesn't contain Go
		SafeInput:   "alert<script>",           // Contains <script>
		BlogSlug:    "article-post",            // Doesn't start with blog-
		ImageFile:   "document.pdf",            // Doesn't end with .jpg
		Username2:   "administrator",           // Contains admin
		Filename:    "virus.exe",               // Ends with .exe
	}

	err = validate.Struct(invalidLength)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s failed '%s'\n", err.Field(), err.Tag())
		}
	}
}
```

**Run:**
```bash
go run examples/string_validations.go
```

**Key String Validations:**

| Validation | Tag | Example |
|------------|-----|---------|
| Email | `email` | `user@example.com` |
| URL | `url` | `https://example.com` |
| Alpha | `alpha` | `JohnDoe` |
| Alphanumeric | `alphanum` | `user123` |
| UUID | `uuid`, `uuid4` | `550e8400-e29b-41d4-a716-446655440000` |
| IP Address | `ip`, `ipv4`, `ipv6` | `192.168.1.1` |
| JSON | `json` | `{"key": "value"}` |
| Base64 | `base64` | `SGVsbG8=` |
| JWT | `jwt` | Valid JWT token |
| Contains | `contains=text` | Must contain "text" |
| Starts with | `startswith=prefix` | Must start with "prefix" |
| Ends with | `endswith=.jpg` | Must end with ".jpg" |

---

## Step 7: Number Validations {#step7-numbers}

### 7.1 Number Range and Comparison Validations

**📝 Create `examples/number_validations.go`:**

```go
package main

import (
	"fmt"
	"github.com/go-playground/validator/v10"
)

func main() {
	validate := validator.New()
	
	fmt.Println("=== Number Validations ===\n")

	type NumberDTO struct {
		// Greater than or equal (>=)
		Age int `validate:"required,gte=18"`
		
		// Less than or equal (<=)
		Score int `validate:"required,lte=100"`
		
		// Greater than (>)
		Price float64 `validate:"required,gt=0"`
		
		// Less than (<)
		Discount float64 `validate:"required,lt=100"`
		
		// Range validation (between)
		Rating int `validate:"required,gte=1,lte=5"`
		
		// Equal to (==)
		ConfirmAge int `validate:"required,eqfield=Age"`
		
		// Not equal to (!=)
		NonZero int `validate:"required,ne=0"`
		
		// Quantity validation
		Quantity int `validate:"required,gte=1"`
		
		// Numeric string validation
		NumericString string `validate:"required,numeric"`
		
		// Integer validation
		Integer int `validate:"required,number"`
		
		// Positive number
		PositiveAmount float64 `validate:"required,gt=0"`
		
		// Negative number allowed
		Temperature int `validate:"required"`
		
		// Min and max for numbers
		Count int `validate:"required,min=1,max=100"`
	}

	// Valid example
	fmt.Println("Test 1: Valid numbers")
	valid := NumberDTO{
		Age:            25,
		Score:          85,
		Price:          19.99,
		Discount:       10.5,
		Rating:         4,
		ConfirmAge:     25,
		NonZero:        5,
		Quantity:       15,
		NumericString:  "12345",
		Integer:        42,
		PositiveAmount: 99.99,
		Temperature:    -5,
		Count:          50,
	}

	err := validate.Struct(valid)
	if err == nil {
		fmt.Println("✅ All number validations passed")
		fmt.Printf("   Age: %d, Score: %d, Rating: %d\n", 
			valid.Age, valid.Score, valid.Rating)
	}

	fmt.Println()

	// Invalid example
	fmt.Println("Test 2: Invalid numbers")
	invalid := NumberDTO{
		Age:            15,      // Under 18
		Score:          105,     // Over 100
		Price:          0,       // Not greater than 0
		Discount:       100,     // Not less than 100
		Rating:         6,       // Out of range
		ConfirmAge:     20,      // Doesn't equal Age
		NonZero:        0,       // Equal to 0
		Quantity:       13,
		NumericString:  "abc",   // Not numeric
		Integer:        0,
		PositiveAmount: -5.00,   // Not positive
		Temperature:    0,
		Count:          150,     // Over max
	}

	err = validate.Struct(invalid)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s failed '%s' (value: %v, param: %s)\n", 
				err.Field(), err.Tag(), err.Value(), err.Param())
		}
	}

	fmt.Println()

	// Decimal-specific validations
	fmt.Println("=== Decimal Validations ===\n")

	type DecimalDTO struct {
		// Any decimal number
		Price float64 `validate:"required,numeric"`
		
		// Positive decimal
		Amount float64 `validate:"required,gt=0"`
		
		// Percentage (0-100)
		Percentage float64 `validate:"required,gte=0,lte=100"`
		
		// Money format (2 decimal places) - validated as string
		MoneyString string `validate:"required,numeric"`
		
		// Between specific decimal range
		Tax float64 `validate:"required,gte=0.00,lte=0.30"`
	}

	fmt.Println("Test 3: Valid decimals")
	validDecimal := DecimalDTO{
		Price:       19.99,
		Amount:      100.50,
		Percentage:  75.5,
		MoneyString: "1234.56",
		Tax:         0.15,
	}

	err = validate.Struct(validDecimal)
	if err == nil {
		fmt.Println("✅ All decimal validations passed")
		fmt.Printf("   Price: $%.2f, Percentage: %.1f%%, Tax: %.2f\n", 
			validDecimal.Price, validDecimal.Percentage, validDecimal.Tax)
	}

	fmt.Println()

	fmt.Println("Test 4: Invalid decimals")
	invalidDecimal := DecimalDTO{
		Price:       -5.00,
		Amount:      0,
		Percentage:  150.5,
		MoneyString: "not a number",
		Tax:         0.50,
	}

	err = validate.Struct(invalidDecimal)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s failed '%s'\n", err.Field(), err.Tag())
		}
	}
}
```

**Key Number Validations:**

| Validation | Tag | Example |
|------------|-----|---------|
| Greater than or equal | `gte=18` | Age >= 18 |
| Less than or equal | `lte=100` | Score <= 100 |
| Greater than | `gt=0` | Price > 0 |
| Less than | `lt=100` | Discount < 100 |
| Equal | `eq=5` | Must equal 5 |
| Not equal | `ne=0` | Cannot be 0 |
| Numeric string | `numeric` | "123", "123.45" |

---

## Step 8: Boolean Validations {#step8-booleans}

**📝 Create `examples/boolean_validations.go`:**

```go
package main

import (
	"fmt"
	"github.com/go-playground/validator/v10"
)

func main() {
	validate := validator.New()
	
	fmt.Println("=== Boolean Validations ===\n")

	type BooleanDTO struct {
		// Must be true (accepted)
		AcceptTerms bool `validate:"required,eq=true"`
		
		// Must be false (declined)
		IsBlocked bool `validate:"eq=false"`
		
		// Any boolean value
		IsActive bool `validate:"boolean"`
		
		// Optional boolean (can be omitted)
		EmailVerified *bool `validate:"omitempty"`
		
		// Boolean with string representation
		BoolString string `validate:"omitempty,oneof=true false"`
	}

	// Test 1: Valid - accepted terms
	fmt.Println("Test 1: Valid booleans (accepted)")
	verified := true
	valid := BooleanDTO{
		AcceptTerms:   true,
		IsBlocked:     false,
		IsActive:      true,
		EmailVerified: &verified,
		BoolString:    "true",
	}

	err := validate.Struct(valid)
	if err == nil {
		fmt.Println("✅ All boolean validations passed")
		fmt.Printf("   Terms accepted: %v, Active: %v\n", 
			valid.AcceptTerms, valid.IsActive)
	}

	fmt.Println()

	// Test 2: Invalid - must accept terms
	fmt.Println("Test 2: Invalid booleans (terms not accepted)")
	invalid := BooleanDTO{
		AcceptTerms:   false,  // Must be true
		IsBlocked:     true,   // Must be false
		IsActive:      false,
		EmailVerified: nil,
		BoolString:    "invalid",
	}

	err = validate.Struct(invalid)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s failed '%s' (current value: %v)\n", 
				err.Field(), err.Tag(), err.Value())
		}
	}

	fmt.Println()

	// Test 3: Conditional boolean validation
	fmt.Println("=== Conditional Boolean Validation ===\n")

	type ConditionalBoolDTO struct {
		// If newsletter is true, email must be provided
		Newsletter bool   `validate:"boolean"`
		Email      string `validate:"required_if=Newsletter true,omitempty,email"`
	}

	fmt.Println("Test 3: Newsletter with email")
	validConditional := ConditionalBoolDTO{
		Newsletter: true,
		Email:      "user@example.com",
	}

	err = validate.Struct(validConditional)
	if err == nil {
		fmt.Println("✅ Conditional validation passed")
	}

	fmt.Println()

	fmt.Println("Test 4: Newsletter without email (should fail)")
	invalidConditional := ConditionalBoolDTO{
		Newsletter: true,
		Email:      "",  // Required when Newsletter is true
	}

	err = validate.Struct(invalidConditional)
	if err != nil {
		fmt.Println("❌ Validation failed:")
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Printf("   - %s failed '%s'\n", err.Field(), err.Tag())
		}
	}
}
```

**Key Boolean Validations:**

| Validation | Tag | Use Case |
|------------|-----|----------|
| Must be true | `eq=true` | Terms acceptance |
| Must be false | `eq=false` | Not blocked |
| Any boolean | `boolean` | Simple flags |
| Nullable | `*bool` with `omitempty` | Optional flags |

---

## Step 9: Array Validations {#step9-arrays}

**📝 Create `examples/array_validations.go`:**

```go
package main

import (
	"fmt"
	"github.com/go-playground/validator/v10"
)

func main() {
	validate := validator.New()
	
	fmt.Println("=== Array/Slice Validations ===\n")

	type ArrayDTO struct {
		// Required array with size constraints
		Tags []string `validate:"required,min=1,max=5"`
		
		// Array where each element must be valid email
		Emails []string `validate:"required,dive,email"`
		
		// Unique elements (no duplicates)
		UniqueIDs []int `validate:"required,unique"`
		
		// Exact array size
		Ratings []int `validate:"required,len=3"`
		
		// Array with element range validation
		Scores []int `validate:"required,min=1,max=10,dive,gte=0,lte=100"`
		
		// Optional array
		OptionalTags []string `validate:"omitempty,dive,alpha"`
		
		// Array must contain specific value
		RequiredRoles []string `validate:"required,dive,oneof=admin user guest"`
	}

	// Valid example
	fmt.Println("Test 1: Valid arrays")
	valid := ArrayDTO{
		Tags:          []string{"go", "programming", "backend"},
		Emails:        []string{"user1@example.com", "user2@example.com"},
		UniqueIDs:     []int{1, 2, 3, 4, 5},
		Ratings:       []int{4, 5, 3},
		Scores:        []int{85, 90, 75, 88, 92},
		OptionalTags:  []string{"alpha", "beta"},
		RequiredRoles: []string{"admin", "user"},
	}

	err := validate.Struct(valid)
	if err == nil {
		fmt.Println("✅ All array validations passed")
		fmt.Printf("   Tags: %v\n", valid.Tags)
		fmt.Printf("   Scores: %v\n", valid.Scores)
		fmt.Printf("   Unique IDs: %v\n", valid.UniqueIDs)
	}

	fmt.Println()

	// Invalid example
	fmt.Println("Test 2: Invalid arrays")
	invalid := ArrayDTO{
		Tags:          []string{},  // Empty (min=1)
		Emails:        []string{"not-an-email", "another-invalid"},
		UniqueIDs:     []int{1, 2, 2, 3},  // Has duplicate
		Ratings:       []int{4, 5},         // Wrong length (need 3)
		Scores:        []int{85, 105, 75},  // 105 exceeds max
		OptionalTags:  []string{"tag1", "tag2!"},  // Has non-alpha
		RequiredRoles: []string{"superadmin"},      // Not in enum
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

**Key Array Validations:**

| Validation | Tag | Example |
|------------|-----|---------|
| Min length | `min=1` | At least 1 element |
| Max length | `max=5` | At most 5 elements |
| Exact length | `len=3` | Exactly 3 elements |
| Unique elements | `unique` | No duplicates |
| Validate each | `dive,email` | Each must be valid email |
