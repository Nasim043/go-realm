# ENT Query Comparison Guide

> **Complete mapping of SQL queries to ENT equivalents**

---

## 📑 Table of Contents

1. [Basic Queries](#1-basic-queries) - 10 queries
2. [Filtering & Predicates](#2-filtering--predicates) - 13 queries
3. [String Operations](#3-string-operations) - 7 queries
4. [Sorting & Pagination](#4-sorting--pagination) - 8 queries
5. [Aggregation & Counting](#5-aggregation--counting) - 9 queries
6. [Logical Operators](#6-logical-operators) - 7 queries
7. [Relationships & Joins](#7-relationships--joins) - 14 queries
8. [Grouping & Having](#8-grouping--having) - 6 queries
9. [CRUD Operations](#9-crud-operations) - 17 queries
10. [Transactions](#10-transactions) - 4 queries
11. [Advanced Queries](#11-advanced-queries) - 11 queries

12. [Edge Operations](#12-edge-operations) - 6 queries
13. [Special Queries](#13-special-queries) - 8 queries

**Total: 120 SQL ↔ ENT Comparisons**

---

## 1. Basic Queries

### 1.1 Select all users

**SQL:**
```sql
SELECT * FROM users;
```

**ENT:**
```go
client.User.Query().All(ctx)
```

### 1.2 Select specific columns

**SQL:**
```sql
SELECT name, email FROM users;
```

**ENT:**
```go
client.User.Query().
  Select(
    user.FieldName,
    user.FieldEmail
  ).All(ctx)
```

### 1.3 Get by primary key

**SQL:**
```sql
SELECT * FROM users WHERE id=10;
```

**ENT:**
```go
client.User.Get(ctx, 10)
```

### 1.4 Get single row (error if 0 or 2+)

**SQL:**
```sql
SELECT * FROM users
WHERE email='a@b.com'
LIMIT 2;
```

**ENT:**
```go
client.User.Query().
  Where(user.EmailEQ("a@b.com")).
  Only(ctx)
```

### 1.5 Get first row

**SQL:**
```sql
SELECT * FROM users
ORDER BY id ASC
LIMIT 1;
```

**ENT:**
```go
client.User.Query().
  Order(ent.Asc(user.FieldID)).
  First(ctx)
```

### 1.6 Check existence

**SQL:**
```sql
SELECT EXISTS(
  SELECT 1 FROM users WHERE age>50
);
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeGT(50)).
  Exist(ctx)
```

### 1.7 Count all records

**SQL:**
```sql
SELECT COUNT(*) FROM users;
```

**ENT:**
```go
client.User.Query().Count(ctx)
```

### 1.8 Count with condition

**SQL:**
```sql
SELECT COUNT(*) FROM users
WHERE age>25;
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeGT(25)).
  Count(ctx)
```

### 1.9 Get only IDs

**SQL:**
```sql
SELECT id FROM users WHERE age>30;
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeGT(30)).
  IDs(ctx)
```

### 1.10 Get single field values

**SQL:**
```sql
SELECT email FROM users;
```

**ENT:**
```go
client.User.Query().
  Select(user.FieldEmail).
  Strings(ctx)
```

---

## 2. Filtering & Predicates

### 2.1 Where equals

**SQL:**
```sql
SELECT * FROM users
WHERE email='a@b.com';
```

**ENT:**
```go
client.User.Query().
  Where(user.EmailEQ("a@b.com")).
  All(ctx)
```

### 2.2 Where not equals

**SQL:**
```sql
SELECT * FROM users
WHERE email!='spam@test.com';
```

**ENT:**
```go
client.User.Query().
  Where(user.EmailNEQ("spam@test.com")).
  All(ctx)
```

### 2.3 Where IN

**SQL:**
```sql
SELECT * FROM users
WHERE id IN (1,2,3);
```

**ENT:**
```go
client.User.Query().
  Where(user.IDIn(1,2,3)).
  All(ctx)
```

### 2.4 Where NOT IN

**SQL:**
```sql
SELECT * FROM users
WHERE id NOT IN (1,2,3);
```

**ENT:**
```go
client.User.Query().
  Where(user.IDNotIn(1,2,3)).
  All(ctx)
```

### 2.5 Where IS NULL

**SQL:**
```sql
SELECT * FROM users
WHERE age IS NULL;
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeIsNil()).
  All(ctx)
```

### 2.6 Where IS NOT NULL

**SQL:**
```sql
SELECT * FROM users
WHERE age IS NOT NULL;
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeNotNil()).
  All(ctx)
```

### 2.7 Greater than

**SQL:**
```sql
SELECT * FROM users
WHERE age>25;
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeGT(25)).
  All(ctx)
```

### 2.8 Greater than or equal

**SQL:**
```sql
SELECT * FROM users
WHERE age>=18;
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeGTE(18)).
  All(ctx)
```

### 2.9 Less than

**SQL:**
```sql
SELECT * FROM users
WHERE age<30;
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeLT(30)).
  All(ctx)
```

### 2.10 Less than or equal

**SQL:**
```sql
SELECT * FROM users
WHERE age<=65;
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeLTE(65)).
  All(ctx)
```

### 2.11 Range (BETWEEN)

**SQL:**
```sql
SELECT * FROM users
WHERE age BETWEEN 18 AND 25;
```

**ENT:**
```go
client.User.Query().
  Where(
    user.AgeGTE(18),
    user.AgeLTE(25)
  ).All(ctx)
```

### 2.12 Multiple conditions (implicit AND)

**SQL:**
```sql
SELECT * FROM users
WHERE age>18 AND name='John';
```

**ENT:**
```go
client.User.Query().
  Where(
    user.AgeGT(18),
    user.NameEQ("John")
  ).All(ctx)
```

### 2.13 Combined IN with other filters

**SQL:**
```sql
SELECT * FROM users
WHERE id IN (1,2,3) AND age>25;
```

**ENT:**
```go
client.User.Query().
  Where(
    user.IDIn(1,2,3),
    user.AgeGT(25)
  ).All(ctx)
```

---

## 3. String Operations

### 3.1 LIKE / Contains

**SQL:**
```sql
SELECT * FROM users
WHERE name ILIKE '%ton%';
```

**ENT:**
```go
client.User.Query().
  Where(user.NameContains("ton")).
  All(ctx)
```

### 3.2 Case-insensitive contains

**SQL:**
```sql
SELECT * FROM users
WHERE LOWER(name) LIKE '%ton%';
```

**ENT:**
```go
client.User.Query().
  Where(user.NameContainsFold("TON")).
  All(ctx)
```

### 3.3 Has prefix (starts with)

**SQL:**
```sql
SELECT * FROM users
WHERE name ILIKE 'To%';
```

**ENT:**
```go
client.User.Query().
  Where(user.NameHasPrefix("To")).
  All(ctx)
```

### 3.4 Has suffix (ends with)

**SQL:**
```sql
SELECT * FROM users
WHERE email ILIKE '%@gmail.com';
```

**ENT:**
```go
client.User.Query().
  Where(user.EmailHasSuffix("@gmail.com")).
  All(ctx)
```

### 3.5 Equals ignore case

**SQL:**
```sql
SELECT * FROM users
WHERE LOWER(email)='test@example.com';
```

**ENT:**
```go
client.User.Query().
  Where(
    user.EmailEqualFold("TEST@example.com")
  ).All(ctx)
```

### 3.6 Case-sensitive prefix

**SQL:**
```sql
SELECT * FROM users
WHERE name LIKE 'John%';
```

**ENT:**
```go
client.User.Query().
  Where(user.NameHasPrefix("John")).
  All(ctx)
```

### 3.7 NOT LIKE / Does not contain

**SQL:**
```sql
SELECT * FROM users
WHERE name NOT ILIKE '%test%';
```

**ENT:**
```go
client.User.Query().
  Where(
    user.Not(user.NameContains("test"))
  ).All(ctx)
```

---

## 4. Sorting & Pagination

### 4.1 Order by ascending

**SQL:**
```sql
SELECT * FROM users
ORDER BY age ASC;
```

**ENT:**
```go
client.User.Query().
  Order(ent.Asc(user.FieldAge)).
  All(ctx)
```

### 4.2 Order by descending

**SQL:**
```sql
SELECT * FROM users
ORDER BY id DESC;
```

**ENT:**
```go
client.User.Query().
  Order(ent.Desc(user.FieldID)).
  All(ctx)
```

### 4.3 Multiple order by

**SQL:**
```sql
SELECT * FROM users
ORDER BY age DESC, name ASC;
```

**ENT:**
```go
client.User.Query().
  Order(
    ent.Desc(user.FieldAge),
    ent.Asc(user.FieldName)
  ).All(ctx)
```

### 4.4 Limit

**SQL:**
```sql
SELECT * FROM users LIMIT 10;
```

**ENT:**
```go
client.User.Query().Limit(10).All(ctx)
```

### 4.5 Offset

**SQL:**
```sql
SELECT * FROM users OFFSET 20;
```

**ENT:**
```go
client.User.Query().Offset(20).All(ctx)
```

### 4.6 Limit + Offset (pagination)

**SQL:**
```sql
SELECT * FROM users
ORDER BY id ASC
LIMIT 10 OFFSET 20;
```

**ENT:**
```go
client.User.Query().
  Order(ent.Asc(user.FieldID)).
  Limit(10).Offset(20).
  All(ctx)
```

### 4.7 Cursor-based pagination (next page)

**SQL:**
```sql
SELECT * FROM users
WHERE id<10
ORDER BY id DESC
LIMIT 5;
```

**ENT:**
```go
client.User.Query().
  Where(user.IDLT(10)).
  Order(ent.Desc(user.FieldID)).
  Limit(5).All(ctx)
```

### 4.8 Get last N records

**SQL:**
```sql
SELECT * FROM users
ORDER BY id DESC
LIMIT 5;
```

**ENT:**
```go
client.User.Query().
  Order(ent.Desc(user.FieldID)).
  Limit(5).All(ctx)
```

---

## 5. Aggregation & Counting

### 5.1 Count all

**SQL:**
```sql
SELECT COUNT(*) FROM users;
```

**ENT:**
```go
client.User.Query().Count(ctx)
```

### 5.2 Count with condition

**SQL:**
```sql
SELECT COUNT(*) FROM users
WHERE age>25;
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeGT(25)).
  Count(ctx)
```

### 5.3 Sum

**SQL:**
```sql
SELECT SUM(age) FROM users;
```

**ENT:**
```go
client.User.Query().
  Aggregate(ent.Sum(user.FieldAge)).
  Int(ctx)
```

### 5.4 Average

**SQL:**
```sql
SELECT AVG(age) FROM users
WHERE age IS NOT NULL;
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeNotNil()).
  Aggregate(ent.Avg(user.FieldAge)).
  Float64(ctx)
```

### 5.5 Min

**SQL:**
```sql
SELECT MIN(age) FROM users
WHERE age IS NOT NULL;
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeNotNil()).
  Aggregate(ent.Min(user.FieldAge)).
  Int(ctx)
```

### 5.6 Max

**SQL:**
```sql
SELECT MAX(age) FROM users
WHERE age IS NOT NULL;
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeNotNil()).
  Aggregate(ent.Max(user.FieldAge)).
  Int(ctx)
```

### 5.7 Multiple aggregates

**SQL:**
```sql
SELECT MIN(age), MAX(age)
FROM users
WHERE age IS NOT NULL;
```

**ENT:**
```go
client.User.Query().
  Where(user.AgeNotNil()).
  Aggregate(
    ent.Min(user.FieldAge),
    ent.Max(user.FieldAge)
  ).Scan(ctx, &out)
```

### 5.8 Distinct values

**SQL:**
```sql
SELECT DISTINCT email FROM users;
```

**ENT:**
```go
client.User.Query().
  Select(user.FieldEmail).
  Unique(true).
  Strings(ctx)
```

### 5.9 Count distinct

**SQL:**
```sql
SELECT COUNT(DISTINCT email)
FROM users;
```

**ENT:**
```go
len(
  client.User.Query().
    Select(user.FieldEmail).
    Unique(true).
    StringsX(ctx)
)
```

---

## 6. Logical Operators

### 6.1 NOT

**SQL:**
```sql
SELECT * FROM users
WHERE NOT (age<18);
```

**ENT:**
```go
client.User.Query().
  Where(user.Not(user.AgeLT(18))).
  All(ctx)
```

### 6.2 AND (implicit)

**SQL:**
```sql
SELECT * FROM users
WHERE age>18 AND age<30;
```

**ENT:**
```go
client.User.Query().
  Where(
    user.AgeGT(18),
    user.AgeLT(30)
  ).All(ctx)
```

### 6.3 AND (explicit)

**SQL:**
```sql
SELECT * FROM users
WHERE (age>20 AND age<30);
```

**ENT:**
```go
client.User.Query().
  Where(
    user.And(
      user.AgeGT(20),
      user.AgeLT(30)
    )
  ).All(ctx)
```

### 6.4 OR

**SQL:**
```sql
SELECT * FROM users
WHERE name ILIKE '%a%' OR age>30;
```

**ENT:**
```go
client.User.Query().
  Where(
    user.Or(
      user.NameContains("a"),
      user.AgeGT(30)
    )
  ).All(ctx)
```

### 6.5 (A AND B) OR (C AND D)

**SQL:**
```sql
WHERE (age>25 AND email ILIKE '%@gmail%')
  OR (name ILIKE '%ton%' AND age IS NULL)
```

**ENT:**
```go
client.User.Query().
  Where(
    user.Or(
      user.And(
        user.AgeGT(25),
        user.EmailContains("gmail")
      ),
      user.And(
        user.NameContains("ton"),
        user.AgeIsNil()
      )
    )
  ).All(ctx)
```

### 6.6 A AND (B OR C)

**SQL:**
```sql
WHERE age>18 AND
  (name ILIKE '%a%' OR email ILIKE '%@yahoo%')
```

**ENT:**
```go
client.User.Query().
  Where(
    user.And(
      user.AgeGT(18),
      user.Or(
        user.NameContains("a"),
        user.EmailContains("yahoo")
      )
    )
  ).All(ctx)
```

### 6.7 NOT (A OR B)

**SQL:**
```sql
WHERE NOT
  (email ILIKE '%spam%' OR name ILIKE '%bot%')
```

**ENT:**
```go
client.User.Query().
  Where(
    user.Not(
      user.Or(
        user.EmailContains("spam"),
        user.NameContains("bot")
      )
    )
  ).All(ctx)
```

---

## 7. Relationships & Joins

### 7.1 Load posts with author (eager load)

**SQL:**
```sql
SELECT p.*, u.* FROM posts p
JOIN users u ON u.id=p.author_id;
```

**ENT:**
```go
client.Post.Query().WithAuthor().All(ctx)
```

### 7.2 Load user with posts (eager load)

**SQL:**
```sql
SELECT u.*, p.* FROM users u
LEFT JOIN posts p ON p.author_id=u.id;
```

**ENT:**
```go
client.User.Query().WithPosts().All(ctx)
```

### 7.3 Load multiple edges

**SQL:**
```sql
SELECT u.*, p.*, c.* FROM users u
LEFT JOIN posts p ...
LEFT JOIN comments c ...
```

**ENT:**
```go
client.User.Query().
  WithPosts().
  WithComments().
  All(ctx)
```

### 7.4 Posts by author email

**SQL:**
```sql
SELECT p.* FROM posts p
JOIN users u ON u.id=p.author_id
WHERE u.email='a@b.com';
```

**ENT:**
```go
client.Post.Query().
  Where(
    post.HasAuthorWith(
      user.EmailEQ("a@b.com")
    )
  ).All(ctx)
```

### 7.5 Posts: published + author age>30

**SQL:**
```sql
SELECT p.* FROM posts p
JOIN users u ON ...
WHERE u.age>30 AND p.published=true;
```

**ENT:**
```go
client.Post.Query().
  Where(
    post.PublishedEQ(true),
    post.HasAuthorWith(
      user.AgeGT(30)
    )
  ).All(ctx)
```

### 7.6 Users who have posts

**SQL:**
```sql
SELECT u.* FROM users u
WHERE EXISTS (
  SELECT 1 FROM posts p
  WHERE p.author_id=u.id
)
```

**ENT:**
```go
client.User.Query().
  Where(user.HasPosts()).
  All(ctx)
```

### 7.7 Users who have NO posts

**SQL:**
```sql
SELECT u.* FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM posts p
  WHERE p.author_id=u.id
)
```

**ENT:**
```go
client.User.Query().
  Where(user.Not(user.HasPosts())).
  All(ctx)
```

### 7.8 Users with published posts

**SQL:**
```sql
WHERE EXISTS(
  SELECT 1 FROM posts p
  WHERE p.author_id=u.id
    AND p.published=true
)
```

**ENT:**
```go
client.User.Query().
  Where(
    user.HasPostsWith(
      post.PublishedEQ(true)
    )
  ).All(ctx)
```

### 7.9 Users with (published OR titled) posts

**SQL:**
```sql
WHERE EXISTS(
  SELECT 1 FROM posts p
  WHERE p.author_id=u.id AND
    (p.published=true OR
     p.title ILIKE '%Go%')
)
```

**ENT:**
```go
client.User.Query().
  Where(
    user.HasPostsWith(
      post.Or(
        post.PublishedEQ(true),
        post.TitleContains("Go")
      )
    )
  ).All(ctx)
```

### 7.10 Posts where author email not like

**SQL:**
```sql
SELECT p.* FROM posts p
JOIN users u ON ...
WHERE u.email NOT ILIKE '%test%';
```

**ENT:**
```go
client.Post.Query().
  Where(
    post.HasAuthorWith(
      user.Not(
        user.EmailContains("test")
      )
    )
  ).All(ctx)
```

### 7.11 Multi-level edge filter

**SQL:**
```sql
SELECT p.* FROM posts p
WHERE EXISTS (
  SELECT 1 FROM users u
  WHERE u.id=p.author_id AND
    EXISTS (
      SELECT 1 FROM posts p2
      WHERE p2.author_id=u.id
        AND p2.published=true
    )
)
```

**ENT:**
```go
client.Post.Query().
  Where(
    post.HasAuthorWith(
      user.HasPostsWith(
        post.PublishedEQ(true)
      )
    )
  ).All(ctx)
```

### 7.12 Query user's posts from entity

**SQL:**
```sql
SELECT p.* FROM posts p
WHERE p.author_id=?;
```

**ENT:**
```go
userEntity.QueryPosts().All(ctx)
```

### 7.13 Query post's author from entity

**SQL:**
```sql
SELECT u.* FROM users u
WHERE u.id=?;
```

**ENT:**
```go
postEntity.QueryAuthor().Only(ctx)
```

### 7.14 User's published posts only

**SQL:**
```sql
SELECT p.* FROM posts p
WHERE p.author_id=?
  AND p.published=true;
```

**ENT:**
```go
userEntity.QueryPosts().
  Where(post.PublishedEQ(true)).
  All(ctx)
```

---

## 8. Grouping & Having

### 8.1 Group by single field

**SQL:**
```sql
SELECT author_id, COUNT(*)
FROM posts
GROUP BY author_id;
```

**ENT:**
```go
client.Post.Query().
  GroupBy(post.FieldAuthorID).
  Aggregate(ent.Count()).
  Scan(ctx, &out)
```

### 8.2 Group by with HAVING

**SQL:**
```sql
SELECT author_id, COUNT(*)
FROM posts
GROUP BY author_id
HAVING COUNT(*)>=2;
```

**ENT:**
```go
client.Post.Query().
  GroupBy(post.FieldAuthorID).
  Aggregate(ent.Count()).
  Having(ent.CountGTE(2)).
  Scan(ctx, &out)
```

### 8.3 Group with HAVING + ORDER

**SQL:**
```sql
SELECT author_id, COUNT(*)
FROM posts
GROUP BY author_id
HAVING COUNT(*)>=2
ORDER BY COUNT(*) DESC;
```

**ENT:**
```go
client.Post.Query().
  GroupBy(post.FieldAuthorID).
  Aggregate(ent.Count()).
  Having(ent.CountGTE(2)).
  Order(ent.Desc("count")).
  Scan(ctx, &out)
```

### 8.4 Users with >=2 published posts

**SQL:**
```sql
SELECT author_id FROM posts
WHERE published=true
GROUP BY author_id
HAVING COUNT(*)>=2
```

**ENT:**
```go
client.Post.Query().
  Where(post.PublishedEQ(true)).
  GroupBy(post.FieldAuthorID).
  Aggregate(ent.Count()).
  Having(ent.CountGTE(2)).
  Scan(ctx, &out)
```

### 8.5 Group by multiple fields

**SQL:**
```sql
SELECT author_id, published, COUNT(*)
FROM posts
GROUP BY author_id, published;
```

**ENT:**
```go
client.Post.Query().
  GroupBy(
    post.FieldAuthorID,
    post.FieldPublished
  ).
  Aggregate(ent.Count()).
  Scan(ctx, &out)
```

### 8.6 Group with multiple aggregates

**SQL:**
```sql
SELECT author_id, COUNT(*), AVG(views)
FROM posts
GROUP BY author_id;
```

**ENT:**
```go
client.Post.Query().
  GroupBy(post.FieldAuthorID).
  Aggregate(
    ent.Count(),
    ent.Avg(post.FieldViews)
  ).Scan(ctx, &out)
```

---

## 9. CRUD Operations

### 9.1 Insert single record

**SQL:**
```sql
INSERT INTO users(name, email, age)
VALUES ('John', 'j@e.com', 25);
```

**ENT:**
```go
client.User.Create().
  SetName("John").
  SetEmail("j@e.com").
  SetAge(25).
  Save(ctx)
```

### 9.2 Insert with relation by ID

**SQL:**
```sql
INSERT INTO posts(title, content, author_id)
VALUES ('Title', 'Content', 1);
```

**ENT:**
```go
client.Post.Create().
  SetTitle("Title").
  SetContent("Content").
  SetAuthorID(1).
  Save(ctx)
```

### 9.3 Insert with entity relation

**SQL:**
```sql
INSERT INTO posts(title, content, author_id)
VALUES ('Title', 'Content', ?);
```

**ENT:**
```go
client.Post.Create().
  SetTitle("Title").
  SetAuthor(userEntity).
  Save(ctx)
```

### 9.4 Bulk insert

**SQL:**
```sql
INSERT INTO users(name, email)
VALUES ('A', 'a@e.com'), ('B', 'b@e.com');
```

**ENT:**
```go
client.User.CreateBulk(
  client.User.Create().
    SetName("A").
    SetEmail("a@e.com"),
  client.User.Create().
    SetName("B").
    SetEmail("b@e.com")
).Save(ctx)
```

### 9.5 Insert with default values

**SQL:**
```sql
INSERT INTO posts(title, content)
VALUES ('Title', 'Content');
```

**ENT:**
```go
client.Post.Create().
  SetTitle("Title").
  SetContent("Content").
  Save(ctx)
```

### 9.6 Upsert (ON CONFLICT DO UPDATE)

**SQL:**
```sql
INSERT INTO users(email, name)
VALUES ('a@b.com', 'John')
ON CONFLICT (email)
DO UPDATE SET name='John';
```

**ENT:**
```go
client.User.Create().
  SetEmail("a@b.com").
  SetName("John").
  OnConflict().
  UpdateNewValues().
  ID(ctx)
```

### 9.7 Update by ID

**SQL:**
```sql
UPDATE users SET age=26 WHERE id=1;
```

**ENT:**
```go
client.User.UpdateOneID(1).
  SetAge(26).Save(ctx)
```

### 9.8 Update with conditions

**SQL:**
```sql
UPDATE users SET name='X'
WHERE email='a@b.com';
```

**ENT:**
```go
client.User.Update().
  Where(user.EmailEQ("a@b.com")).
  SetName("X").
  Exec(ctx)
```

### 9.9 Bulk update

**SQL:**
```sql
UPDATE posts SET published=true
WHERE author_id=1;
```

**ENT:**
```go
client.Post.Update().
  Where(post.AuthorIDEQ(1)).
  SetPublished(true).
  Exec(ctx)
```

### 9.10 Update with increment

**SQL:**
```sql
UPDATE users SET age=age+1
WHERE id=1;
```

**ENT:**
```go
client.User.UpdateOneID(1).
  AddAge(1).Save(ctx)
```

### 9.11 Update with decrement

**SQL:**
```sql
UPDATE users SET age=age-1
WHERE id=1;
```

**ENT:**
```go
client.User.UpdateOneID(1).
  AddAge(-1).Save(ctx)
```

### 9.12 Clear optional field (set NULL)

**SQL:**
```sql
UPDATE users SET age=NULL WHERE id=1;
```

**ENT:**
```go
client.User.UpdateOneID(1).
  ClearAge().Save(ctx)
```

### 9.13 Update and return updated record

**SQL:**
```sql
UPDATE users SET age=26
WHERE id=1 RETURNING *;
```

**ENT:**
```go
client.User.UpdateOneID(1).
  SetAge(26).Save(ctx)
```

### 9.14 Delete by ID

**SQL:**
```sql
DELETE FROM users WHERE id=1;
```

**ENT:**
```go
client.User.DeleteOneID(1).Exec(ctx)
```

### 9.15 Delete with conditions

**SQL:**
```sql
DELETE FROM posts
WHERE published=false;
```

**ENT:**
```go
client.Post.Delete().
  Where(post.PublishedEQ(false)).
  Exec(ctx)
```

### 9.16 Delete all

**SQL:**
```sql
DELETE FROM posts;
```

**ENT:**
```go
client.Post.Delete().Exec(ctx)
```

### 9.17 Conditional delete with relations

**SQL:**
```sql
DELETE FROM posts
WHERE author_id IN (
  SELECT id FROM users WHERE age<18
);
```

**ENT:**
```go
client.Post.Delete().
  Where(
    post.HasAuthorWith(
      user.AgeLT(18)
    )
  ).Exec(ctx)
```

---

## 10. Transactions

### 10.1 Basic transaction

**SQL:**
```sql
BEGIN;
INSERT INTO users...;
INSERT INTO posts...;
COMMIT;
```

**ENT:**
```go
tx, _ := client.Tx(ctx)
tx.User.Create()...Save(ctx)
tx.Post.Create()...Save(ctx)
tx.Commit()
```

### 10.2 Transaction with rollback

**SQL:**
```sql
BEGIN;
INSERT INTO users...;
ROLLBACK;
```

**ENT:**
```go
tx, _ := client.Tx(ctx)
defer tx.Rollback()
tx.User.Create()...Save(ctx)
return tx.Commit()
```

### 10.3 WithTx helper pattern

**SQL:**
```sql
BEGIN; ... ; COMMIT;
```

**ENT:**
```go
client.WithTx(ctx, func(tx *ent.Tx) error {
    return tx.User.Create()...Save(ctx)
})
```

### 10.4 Transaction with multiple operations

**SQL:**
```sql
BEGIN;
UPDATE users...;
DELETE FROM posts...;
INSERT INTO logs...;
COMMIT;
```

**ENT:**
```go
tx, _ := client.Tx(ctx)
tx.User.Update()...Exec(ctx)
tx.Post.Delete()...Exec(ctx)
tx.Log.Create()...Save(ctx)
tx.Commit()
```

---

## 11. Advanced Queries

### 11.1 Users with age above average (2-step)

**SQL:**
```sql
SELECT * FROM users
WHERE age > (
  SELECT AVG(age) FROM users
  WHERE age IS NOT NULL
)
```

**ENT:**
```go
avg := client.User.Query().
  Where(user.AgeNotNil()).
  Aggregate(ent.Avg(user.FieldAge)).
  Float64X(ctx)
client.User.Query().
  Where(user.AgeGT(int(avg))).
  All(ctx)
```

### 11.2 Users in grouped result (2-step)

**SQL:**
```sql
SELECT * FROM users
WHERE id IN (
  SELECT author_id FROM posts
  GROUP BY author_id
  HAVING COUNT(*)>=2
)
```

**ENT:**
```go
var result []struct{ AuthorID int }
client.Post.Query().
  GroupBy(post.FieldAuthorID).
  Aggregate(ent.Count()).
  Having(ent.CountGTE(2)).
  Scan(ctx, &result)
ids := []int{}
for _, r := range result {
  ids = append(ids, r.AuthorID)
}
client.User.Query().
  Where(user.IDIn(ids...)).
  All(ctx)
```

### 11.3 Search across multiple fields

**SQL:**
```sql
WHERE (name ILIKE '%q%'
  OR email ILIKE '%q%')
ORDER BY created_at DESC
LIMIT 10
```

**ENT:**
```go
client.User.Query().
  Where(
    user.Or(
      user.NameContains(q),
      user.EmailContains(q)
    )
  ).
  Order(ent.Desc(user.FieldCreatedAt)).
  Limit(10).
  All(ctx)
```

### 11.4 Dynamic filter builder

**SQL:**
```sql
Multiple WHERE conditions
applied conditionally
```

**ENT:**
```go
q := client.User.Query()
if nameFilter != "" {
  q = q.Where(
    user.NameContains(nameFilter)
  )
}
if ageMin > 0 {
  q = q.Where(user.AgeGTE(ageMin))
}
users, err := q.All(ctx)
```

### 11.5 Column vs column comparison

**SQL:**
```sql
SELECT * FROM posts
WHERE updated_at > created_at;
```

**ENT:**
```go
client.Post.Query().Modify(
  func(s *entsql.Selector) {
    s.Where(
      entsql.GT(
        s.C(post.FieldUpdatedAt),
        s.C(post.FieldCreatedAt)
      )
    )
  }
).All(ctx)
```

### 11.6 Custom SQL function

**SQL:**
```sql
SELECT * FROM users
WHERE LENGTH(name) >= 5;
```

**ENT:**
```go
client.User.Query().Modify(
  func(s *entsql.Selector) {
    s.Where(
      entsql.GTE(
        entsql.Func(
          "length",
          s.C(user.FieldName)
        ),
        5
      )
    )
  }
).All(ctx)
```

### 11.7 Order by joined column

**SQL:**
```sql
SELECT p.* FROM posts p
JOIN users u ON ...
ORDER BY u.name ASC;
```

**ENT:**
```go
client.Post.Query().Modify(
  func(s *entsql.Selector) {
    t := sql.Table(user.Table)
    s.Join(t).On(
      s.C(post.FieldAuthorID),
      t.C(user.FieldID)
    )
    s.OrderBy(t.C(user.FieldName))
  }
).All(ctx)
```

### 11.8 Window functions (Postgres)

**SQL:**
```sql
SELECT *, ROW_NUMBER() OVER (
  PARTITION BY author_id
  ORDER BY created_at DESC
) AS rn ...
```

**ENT:**
```go
client.Post.Query().Modify(
  func(s *entsql.Selector) {
    s.AppendSelect(
      "ROW_NUMBER() OVER (" +
      "PARTITION BY author_id " +
      "ORDER BY created_at DESC) " +
      "AS rn"
    )
  }
).Scan(ctx, &out)
```

### 11.9 Raw SQL query with args

**SQL:**
```sql
SELECT * FROM users
WHERE custom_condition = $1;
```

**ENT:**
```go
var users []*ent.User
client.QueryContext(
  ctx,
  "SELECT * FROM users " +
  "WHERE custom_condition = $1",
  param
).Scan(&users)
```

### 11.10 Computed fields (COALESCE)

**SQL:**
```sql
SELECT COALESCE(age, 0) AS age
FROM users;
```

**ENT:**
```go
client.User.Query().Modify(
  func(s *entsql.Selector) {
    s.Select(
      "COALESCE(age, 0) AS age"
    )
  }
).Scan(ctx, &out)
```

### 11.11 Date/time comparisons

**SQL:**
```sql
SELECT * FROM posts
WHERE created_at >
  NOW() - INTERVAL '7 days';
```

**ENT:**
```go
client.Post.Query().
  Where(
    post.CreatedAtGT(
      time.Now().AddDate(0, 0, -7)
    )
  ).All(ctx)
```

---

## 12. Edge Operations

### 12.1 Add edge (connect existing entities)

**SQL:**
```sql
UPDATE posts SET author_id=1
WHERE id=5;
```

**ENT:**
```go
client.Post.UpdateOneID(5).
  SetAuthorID(1).Save(ctx)
```

### 12.2 Add edge using entity

**SQL:**
```sql
UPDATE posts SET author_id=?
WHERE id=5;
```

**ENT:**
```go
client.Post.UpdateOneID(5).
  SetAuthor(userEntity).Save(ctx)
```

### 12.3 Add multiple edges (many-to-many)

**SQL:**
```sql
INSERT INTO user_groups(user_id, group_id)
VALUES (1, 10), (1, 20);
```

**ENT:**
```go
client.User.UpdateOneID(1).
  AddGroupIDs(10, 20).Save(ctx)
```

### 12.4 Remove edge (disconnect)

**SQL:**
```sql
UPDATE posts SET author_id=NULL
WHERE id=5;
```

**ENT:**
```go
client.Post.UpdateOneID(5).
  ClearAuthor().Save(ctx)
```

### 12.5 Remove multiple edges (many-to-many)

**SQL:**
```sql
DELETE FROM user_groups
WHERE user_id=1
  AND group_id IN (10, 20);
```

**ENT:**
```go
client.User.UpdateOneID(1).
  RemoveGroupIDs(10, 20).Save(ctx)
```

### 12.6 Clear all edges

**SQL:**
```sql
DELETE FROM user_groups
WHERE user_id=1;
```

**ENT:**
```go
client.User.UpdateOneID(1).
  ClearGroups().Save(ctx)
```

---

## 13. Special Queries

### 13.1 Soft delete (set deleted_at)

**SQL:**
```sql
UPDATE users SET deleted_at=NOW()
WHERE id=1;
```

**ENT:**
```go
client.User.UpdateOneID(1).
  SetDeletedAt(time.Now()).
  Save(ctx)
```

### 13.2 Query only non-deleted records

**SQL:**
```sql
SELECT * FROM users
WHERE deleted_at IS NULL;
```

**ENT:**
```go
client.User.Query().
  Where(user.DeletedAtIsNil()).
  All(ctx)
```

### 13.3 Find or create (idempotent insert)

**SQL:**
```sql
INSERT INTO users(email, name)
VALUES ('a@b.com', 'John')
ON CONFLICT (email)
DO NOTHING RETURNING *;
```

**ENT:**
```go
u, err := client.User.Query().
  Where(user.EmailEQ("a@b.com")).
  Only(ctx)
if ent.IsNotFound(err) {
    u, err = client.User.Create().
      SetEmail("a@b.com").
      SetName("John").
      Save(ctx)
}
```

### 13.4 Batch get by IDs

**SQL:**
```sql
SELECT * FROM users
WHERE id IN (1, 2, 3, 4, 5);
```

**ENT:**
```go
client.User.Query().
  Where(user.IDIn(1, 2, 3, 4, 5)).
  All(ctx)
```

### 13.5 Random record selection

**SQL:**
```sql
SELECT * FROM users
ORDER BY RANDOM()
LIMIT 1;
```

**ENT:**
```go
client.User.Query().Modify(
  func(s *entsql.Selector) {
    s.OrderBy("RANDOM()")
  }
).First(ctx)
```

### 13.6 Case statement / conditional selection

**SQL:**
```sql
SELECT *, CASE WHEN age<18
  THEN 'minor'
  ELSE 'adult'
END AS category
FROM users;
```

**ENT:**
```go
client.User.Query().Modify(
  func(s *entsql.Selector) {
    s.AppendSelect(
      "CASE WHEN age<18 " +
      "THEN 'minor' " +
      "ELSE 'adult' " +
      "END AS category"
    )
  }
).Scan(ctx, &out)
```

### 13.7 JSON field query (Postgres)

**SQL:**
```sql
SELECT * FROM users
WHERE metadata->>'role' = 'admin';
```

**ENT:**
```go
client.User.Query().Where(
  func(s *entsql.Selector) {
    s.Where(
      entsql.EQ(
        entsql.Raw(
          "metadata->>'role'"
        ),
        "admin"
      )
    )
  }
).All(ctx)
```

### 13.8 Full-text search (Postgres)

**SQL:**
```sql
SELECT * FROM posts
WHERE to_tsvector('english', content)
  @@ to_tsquery('golang');
```

**ENT:**
```go
client.Post.Query().Modify(
  func(s *entsql.Selector) {
    s.Where(
      entsql.Raw(
        "to_tsvector('english', " +
        "content) @@ " +
        "to_tsquery(?)",
        "golang"
      )
    )
  }
).All(ctx)
```

---

## 📚 Additional Resources

### Common Patterns

```go
// 1. Reusable query predicates
func publishedPosts() predicate.Post {
    return post.PublishedEQ(true)
}
client.Post.Query().Where(publishedPosts()).All(ctx)

// 2. Query chaining for dynamic filters
q := client.User.Query()
if nameFilter != "" {
    q = q.Where(user.NameContains(nameFilter))
}
if ageMin > 0 {
    q = q.Where(user.AgeGTE(ageMin))
}
users, err := q.All(ctx)

// 3. Pagination helper
func paginate(page, pageSize int) *ent.UserQuery {
    offset := (page - 1) * pageSize
    return client.User.Query().Limit(pageSize).Offset(offset)
}
```

### Import Requirements

```go
// Basic ENT imports
import (
    "ent-playground/ent"
    "ent-playground/ent/user"
    "ent-playground/ent/post"
    "ent-playground/ent/predicate"
)

// For advanced SQL selector usage
import (
    entsql "entgo.io/ent/dialect/sql"
)
```

### Query Return Types

| Method | Returns | Use Case |
|--------|---------|----------|
| `.All(ctx)` | `[]*ent.User, error` | Get all matching records |
| `.Only(ctx)` | `*ent.User, error` | Get exactly one (error if 0 or 2+) |
| `.First(ctx)` | `*ent.User, error` | Get first record (error if none) |
| `.Count(ctx)` | `int, error` | Count matching records |
| `.Exist(ctx)` | `bool, error` | Check if any exists |
| `.IDs(ctx)` | `[]int, error` | Get only IDs |
| `.Scan(ctx, &v)` | `error` | Scan into custom struct |
| `.Strings(ctx)` | `[]string, error` | Get string field values |
| `.Ints(ctx)` | `[]int, error` | Get int field values |

---

## Summary

This guide provides **120 SQL-to-ENT query comparisons** covering:

- ✅ **Basic queries** - Selection, filtering, counting
- ✅ **String operations** - LIKE, contains, prefix/suffix matching  
- ✅ **Sorting & pagination** - ORDER BY, LIMIT, OFFSET, cursor-based
- ✅ **Aggregations** - COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING
- ✅ **Logical operators** - AND, OR, NOT, complex conditions
- ✅ **Relationships** - Eager loading, joins, edge filtering
- ✅ **CRUD operations** - INSERT, UPDATE, DELETE, upsert
- ✅ **Transactions** - BEGIN/COMMIT/ROLLBACK patterns
- ✅ **Advanced queries** - Subqueries, raw SQL, window functions
- ✅ **Edge operations** - Add, remove, clear relationships
- ✅ **Special queries** - Soft deletes, find-or-create, full-text search

**Quick reference for ENT developers migrating from SQL!** 🚀
