# Part 2: Complete Validation Reference

This section provides comprehensive reference tables for all available validation rules in validator/v10.

---

## String Validation Rules {#ref-strings}

### Format Validations

| Rule | Description | Example | Valid Values |
|------|-------------|---------|--------------|
| `email` | Valid email address | `validate:"email"` | `user@example.com` |
| `url` | Valid URL (must have scheme) | `validate:"url"` | `https://example.com` |
| `uri` | Valid URI (can be relative) | `validate:"uri"` | `/api/users` |
| `alpha` | Letters only (A-Z, a-z) | `validate:"alpha"` | `JohnDoe` |
| `alphanum` | Letters and numbers | `validate:"alphanum"` | `user123` |
| `alphaunicode` | Letters with unicode | `validate:"alphaunicode"` | `José` |
| `ascii` | ASCII characters only | `validate:"ascii"` | `Hello123` |
| `lowercase` | All lowercase | `validate:"lowercase"` | `hello` |
| `uppercase` | All uppercase | `validate:"uppercase"` | `HELLO` |
| `hexcolor` | Hex color code | `validate:"hexcolor"` | `#FF5733`, `#F00` |
| `uuid` | UUID (any version) | `validate:"uuid"` | `550e8400-e29b-41d4-a716-446655440000` |
| `uuid3` | UUID version 3 | `validate:"uuid3"` | UUID v3 format |
| `uuid4` | UUID version 4 | `validate:"uuid4"` | UUID v4 format |
| `uuid5` | UUID version 5 | `validate:"uuid5"` | UUID v5 format |
| `ulid` | ULID format | `validate:"ulid"` | `01ARZ3NDEKTSV4RRFFQ69G5FAV` |
| `ip` | IP address (v4 or v6) | `validate:"ip"` | `192.168.1.1`, `2001:db8::8a2e:370:7334` |
| `ipv4` | IPv4 address | `validate:"ipv4"` | `192.168.1.1` |
| `ipv6` | IPv6 address | `validate:"ipv6"` | `2001:db8::8a2e:370:7334` |
| `mac` | MAC address | `validate:"mac"` | `01:23:45:67:89:ab` |
| `json` | Valid JSON string | `validate:"json"` | `{"key":"value"}` |
| `base64` | Base64 encoded | `validate:"base64"` | `SGVsbG8=` |
| `jwt` | JWT token | `validate:"jwt"` | `eyJhbGc...` |
| `e164` | E.164 phone format | `validate:"e164"` | `+12345678901` |
| `isbn` | ISBN-10 or ISBN-13 | `validate:"isbn"` | `978-3-16-148410-0` |
| `isbn10` | ISBN-10 | `validate:"isbn10"` | `0-306-40615-2` |
| `isbn13` | ISBN-13 | `validate:"isbn13"` | `978-0-306-40615-7` |

### Length Validations

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `min` | Minimum length | `validate:"min=5"` | Min 5 characters |
| `max` | Maximum length | `validate:"max=20"` | Max 20 characters |
| `len` | Exact length | `validate:"len=10"` | Exactly 10 characters |
| `eq` | Equal to value | `validate:"eq=admin"` | Must be "admin" |
| `ne` | Not equal to value | `validate:"ne=banned"` | Cannot be "banned" |

### Pattern Matching

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `contains` | Contains substring | `validate:"contains=Go"` | Must contain "Go" |
| `excludes` | Doesn't contain substring | `validate:"excludes=<script>"` | Cannot contain "<script>" |
| `startswith` | Starts with string | `validate:"startswith=blog-"` | Must start with "blog-" |
| `endswith` | Ends with string | `validate:"endswith=.jpg"` | Must end with ".jpg" |
| `regex` | Matches regex pattern | `validate:"regex=^[a-z]+$"` | Custom regex pattern |

---

## Number Validation Rules {#ref-numbers}

### Comparison Validations

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `eq` | Equal to | `validate:"eq=5"` | Must equal 5 |
| `ne` | Not equal to | `validate:"ne=0"` | Cannot be 0 |
| `gt` | Greater than | `validate:"gt=0"` | Must be > 0 |
| `gte` | Greater than or equal | `validate:"gte=18"` | Must be >= 18 |
| `lt` | Less than | `validate:"lt=100"` | Must be < 100 |
| `lte` | Less than or equal | `validate:"lte=120"` | Must be <= 120 |
| `min` | Minimum value | `validate:"min=1"` | Min value 1 |
| `max` | Maximum value | `validate:"max=100"` | Max value 100 |

### Numeric Type Validations

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `numeric` | Numeric value (as string) | `validate:"numeric"` | "123", "123.45" |
| `number` | Is a number | `validate:"number"` | Integer or float |
| `integer` | Integer value | `validate:"integer"` | Whole numbers only |
| `decimal` | Decimal number | `validate:"decimal"` | Has decimal point |

### Special Number Validations

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `multipleOf` | Multiple of value | `validate:"multipleOf=5"` | 5, 10, 15, 20... |
| `oneof` | One of specific values | `validate:"oneof=1 2 3 4 5"` | Enum for numbers |

---

## Array/Slice Validation Rules {#ref-arrays}

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `min` | Minimum array length | `validate:"min=1"` | At least 1 element |
| `max` | Maximum array length | `validate:"max=5"` | At most 5 elements |
| `len` | Exact array length | `validate:"len=3"` | Exactly 3 elements |
| `unique` | All elements unique | `validate:"unique"` | No duplicates |
| `dive` | Validate each element | `validate:"dive,email"` | Each element must be valid email |
| `dive,keys,dive` | Validate map keys | `validate:"dive,keys,dive,email"` | For map validations |

---

## Date/Time Validation Rules {#ref-dates}

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `datetime` | Date in specific format | `validate:"datetime=2006-01-02"` | Go time format |
| `timezone` | Valid timezone | Custom rule | America/New_York |

### Date Comparison (Cross-Field)

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `gtefield` | Greater than or equal to field | `validate:"gtefield=StartDate"` | EndDate >= StartDate |
| `gtfield` | Greater than field | `validate:"gtfield=StartDate"` | EndDate > StartDate |
| `ltefield` | Less than or equal to field | `validate:"ltefield=EndDate"` | StartDate <= EndDate |
| `ltfield` | Less than field | `validate:"ltfield=EndDate"` | StartDate < EndDate |

---

## Boolean Validation Rules {#ref-booleans}

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `boolean` | Is a boolean | `validate:"boolean"` | true or false |
| `eq` | Must equal value | `validate:"eq=true"` | Must be true |
| `ne` | Must not equal value | `validate:"ne=true"` | Must be false |

---

## File Validation Rules {#ref-files}

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `file` | Valid file path | `validate:"file"` | File exists |
| `filepath` | Valid file path format | `validate:"filepath"` | Path format only |
| `dirpath` | Valid directory path | `validate:"dirpath"` | Directory format |
| `endswith` | File extension check | `validate:"endswith=.jpg"` | Check extension |

---

## Database Validation Rules {#ref-database}

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `iso3166_1_alpha2` | ISO 3166-1 alpha-2 country code | `validate:"iso3166_1_alpha2"` | US, CA, GB, etc. |
| `iso3166_1_alpha3` | ISO 3166-1 alpha-3 country code | `validate:"iso3166_1_alpha3"` | USA, CAN, GBR, etc. |
| `iso4217` | ISO 4217 currency code | `validate:"iso4217"` | USD, EUR, GBP, etc. |

---

## Utility Validation Rules {#ref-utilities}

### Required/Optional Rules

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `required` | Field must have value | `validate:"required"` | Cannot be empty/zero |
| `required_if` | Required if condition | `validate:"required_if=Field value"` | Conditional required |
| `required_unless` | Required unless condition | `validate:"required_unless=Field value"` | Inverse conditional |
| `required_with` | Required with another field | `validate:"required_with=Field"` | Both or neither |
| `required_with_all` | Required with all fields | `validate:"required_with_all=F1 F2"` | All or none |
| `required_without` | Required without another | `validate:"required_without=Field"` | One must exist |
| `required_without_all` | Required without all | `validate:"required_without_all=F1 F2"` | At least one required |
| `omitempty` | Skip validation if empty | `validate:"omitempty,email"` | Validate only if present |
| `omitnil` | Skip validation if nil | `validate:"omitnil"` | For pointers |

### Exclusion Rules

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `excluded_if` | Excluded if condition | `validate:"excluded_if=Type business"` | Must be empty when condition met |
| `excluded_unless` | Excluded unless condition | `validate:"excluded_unless=Active true"` | Must be empty unless condition |
| `excluded_with` | Excluded with another field | `validate:"excluded_with=Field"` | Cannot coexist |
| `excluded_without` | Excluded without another | `validate:"excluded_without=Field"` | Requires other field |

### Cross-Field Comparisons

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `eqfield` | Equal to another field | `validate:"eqfield=Password"` | Field matching |
| `nefield` | Not equal to another field | `validate:"nefield=OldEmail"` | Must be different |
| `gtfield` | Greater than another field | `validate:"gtfield=MinPrice"` | Range validation |
| `gtefield` | Greater than or equal field | `validate:"gtefield=MinAge"` | Range validation |
| `ltfield` | Less than another field | `validate:"ltfield=MaxPrice"` | Range validation |
| `ltefield` | Less than or equal field | `validate:"ltefield=MaxAge"` | Range validation |
| `eqcsfield` | Equal (cross-struct) | `validate:"eqcsfield=Struct.Field"` | Cross-struct comparison |
| `necsfield` | Not equal (cross-struct) | `validate:"necsfield=Struct.Field"` | Cross-struct comparison |

### Special Rules

| Rule | Description | Example | Notes |
|------|-------------|---------|-------|
| `oneof` | One of enumerated values | `validate:"oneof=red blue green"` | Enum validation |
| `-` | Skip field | `validate:"-"` | Ignore this field |

---

## Common Validation Patterns

### Password Validation
```go
Password string `validate:"required,min=8,max=72"`
// Or with custom strong password rule
Password string `validate:"required,strong_password"`
```

### Email & Username
```go
Email    string `validate:"required,email"`
Username string `validate:"required,min=3,max=20,alphanum"`
```

### URL & Slug
```go
Website string `validate:"omitempty,url"`
Slug    string `validate:"required,lowercase,alphanum"`
```

### Phone & Address
```go
Phone   string `validate:"required,e164"`
ZIPCode string `validate:"required,len=5,numeric"`
Country string `validate:"required,iso3166_1_alpha2"` // US, CA, UK
```

### Numbers & Ranges
```go
Age      int     `validate:"required,gte=18,lte=120"`
Price    float64 `validate:"required,gt=0"`
Quantity int     `validate:"required,min=1,multipleOf=5"`
```

### Arrays
```go
Tags   []string `validate:"required,min=1,max=5,dive,alpha"`
Emails []string `validate:"required,dive,email"`
IDs    []int    `validate:"required,unique,dive,gt=0"`
```

### Dates
```go
BirthDate time.Time `validate:"required"`
EventDate time.Time `validate:"required,gtefield=BirthDate"`
```

### Conditional
```go
ShipDifferent bool   `validate:"boolean"`
ShipAddress   string `validate:"required_if=ShipDifferent true"`
```

### Cross-Field
```go
Password        string `validate:"required,min=8"`
ConfirmPassword string `validate:"required,eqfield=Password"`
```

---

## Validation Tag Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `,` | AND (all must pass) | `validate:"required,email,max=100"` |
| `|` | OR (at least one must pass) | `validate:"email|url"` |

---

## Best Practices for Validation Rules

1. **Always use `omitempty` for optional fields**
   ```go
   Bio string `validate:"omitempty,min=10,max=500"`
   ```

2. **Use pointers for nullable fields**
   ```go
   Age *int `validate:"omitempty,gte=0"`
   ```

3. **Combine validations logically**
   ```go
   Email string `validate:"required,email,max=255"`
   ```

4. **Use custom validations for business rules**
   ```go
   Username string `validate:"required,username"` // Custom rule
   ```

5. **Always validate arrays with `dive`**
   ```go
   Emails []string `validate:"required,dive,email"`
   ```

6. **Use cross-field validation for related fields**
   ```go
   StartDate time.Time `validate:"required"`
   EndDate   time.Time `validate:"required,gtefield=StartDate"`
   ```

---

## Quick Reference Card

### Most Used Validation Tags

```go
// Required field
Field string `validate:"required"`

// Optional (validate only if present)
Field string `validate:"omitempty,email"`

// String constraints
Field string `validate:"min=5,max=20"`
Field string `validate:"email"`
Field string `validate:"url"`
Field string `validate:"alpha"`
Field string `validate:"alphanum"`

// Number constraints
Field int `validate:"gte=18,lte=120"`
Field int `validate:"gt=0"`
Field int `validate:"oneof=1 2 3 4 5"`

// Arrays
Field []string `validate:"required,min=1,max=5"`
Field []string `validate:"dive,email"` // Each element must be email

// Cross-field validation
Password        string `validate:"required"`
ConfirmPassword string `validate:"eqfield=Password"`

// Conditional validation
ShipDifferent bool   `validate:"boolean"`
ShipAddress   string `validate:"required_if=ShipDifferent true"`

// Enum validation
Role string `validate:"oneof=admin user guest"`
```
