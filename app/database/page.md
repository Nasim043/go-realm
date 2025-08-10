# 🗃️ Database Topics

## 1. 🔑 Various Types of Keys

- _What is a **primary key**?_
```text
A primary key is a field (or a set of fields) that uniquely identifies each record in a table.
It cannot contain NULL values, and each table can have only one primary key.
```

- _What is a **unique key**?_  
```text
A unique key ensures that all values in a column are different from one another.
Unlike a primary key, it can allow NULL values (usually one or more, depending on the database).
```

- _What is a **candidate key**?_  
```text
A candidate key is any column (or combination of columns) that can uniquely identify a row.
A table can have multiple candidate keys, but only one is selected as the primary key.
```

- _What is a **foreign key**?_  
```text
A foreign key is a field in one table that points to the primary key in another table.
It is used to create relationships between tables and maintain referential integrity.
```

- _What is a **composite key**?_  
```text
A composite key is a primary or candidate key made up of two or more columns.
The values in these columns together must be unique, even if the individual values are not.
```

- _What are the differences between these keys?_

| Key Type          | Uniqueness                  | NULL Allowed      | Main Purpose                              | Can Be Composite |
| ----------------- | --------------------------- | ----------------- | ----------------------------------------- | ---------------- |
| **Primary Key**   | Yes                         | No                | Uniquely identifies each record           | Yes              |
| **Unique Key**    | Yes                         | Yes (usually one) | Enforces uniqueness on a column           | Yes              |
| **Candidate Key** | Yes                         | Sometimes         | A possible choice for primary key         | Yes              |
| **Foreign Key**   | No (references another key) | Yes               | Links to primary key in another table     | Yes              |
| **Composite Key** | Yes                         | Sometimes         | Ensures uniqueness using multiple columns | Always           |


---

## 2. 🔗 Join Types (With Examples)

- _What is an **INNER JOIN**?_
```text
An INNER JOIN returns only the rows that have matching values in both tables. If there is no match, the row is excluded from the result.
```
- _What is a **LEFT JOIN**?_
```text
A LEFT JOIN returns all rows from the left table, and the matched rows from the right table. If there is no match, NULLs are returned for columns from the right table.
```
- _What is a **RIGHT JOIN**?_
```text
A RIGHT JOIN returns all rows from the right table, and the matched rows from the left table. If there is no match, NULLs are returned for columns from the left table.
```
- _What is a **FULL OUTER JOIN**?_
```text
A FULL OUTER JOIN returns all rows when there is a match in either the left or right table. Rows with no match in one of the tables will have NULLs for the missing side.
```
- _When should each type of join be used?_

```text
- Use **INNER JOIN** when you only want records with matches in both tables.
- Use **LEFT JOIN** when you need all records from the left table, even if there's no match.
- Use **RIGHT JOIN** when you need all records from the right table, even if there's no match.
- Use **FULL OUTER JOIN** when you want all records from both tables, matched where possible.
```

- _Provide examples for each join type:_

Assume two tables:
**Employees**

| id  | name    | dept\_id |
| --- | ------- | -------- |
| 1   | Alice   | 10       |
| 2   | Bob     | 20       |
| 3   | Charlie | NULL     |

**Departments**

| id  | dept\_name  |
| --- | ----------- |
| 10  | HR          |
| 20  | Engineering |
| 30  | Marketing   |

**✅ INNER JOIN Example:**

```sql
SELECT Employees.name, Departments.dept_name
FROM Employees
INNER JOIN Departments ON Employees.dept_id = Departments.id;
```

*Result:*

| name  | dept\_name  |
| ----- | ----------- |
| Alice | HR          |
| Bob   | Engineering |

---

**✅ LEFT JOIN Example:**

```sql
SELECT Employees.name, Departments.dept_name
FROM Employees
LEFT JOIN Departments ON Employees.dept_id = Departments.id;
```

*Result:*

| name    | dept\_name  |
| ------- | ----------- |
| Alice   | HR          |
| Bob     | Engineering |
| Charlie | NULL        |

---

**✅ RIGHT JOIN Example:**

```sql
SELECT Employees.name, Departments.dept_name
FROM Employees
RIGHT JOIN Departments ON Employees.dept_id = Departments.id;
```

*Result:*

| name  | dept\_name  |
| ----- | ----------- |
| Alice | HR          |
| Bob   | Engineering |
| NULL  | Marketing   |

---

**✅ FULL OUTER JOIN Example:**

```sql
SELECT Employees.name, Departments.dept_name
FROM Employees
FULL OUTER JOIN Departments ON Employees.dept_id = Departments.id;
```

*Result:*

| name    | dept\_name  |
| ------- | ----------- |
| Alice   | HR          |
| Bob     | Engineering |
| Charlie | NULL        |
| NULL    | Marketing   |

---

## 3. 🔁 Relation Types (With Examples)

- _What is a **one-to-one** relationship?_
```text
A one-to-one relationship means each row in Table A is linked to one and only one row in Table B, and vice versa. This type is used when two tables share the same primary key but store different types of data.
```
- _What is a **one-to-many** relationship?_
```text
A one-to-many relationship means one row in Table A can be associated with many rows in Table B, but each row in Table B relates to only one row in Table A. This is the most common relationship in relational databases.
```
- _What is a **many-to-many** relationship?_  
```text
A many-to-many relationship occurs when multiple records in Table A relate to multiple records in Table B. To implement it, an intermediate (junction) table is used containing foreign keys referencing both tables.
```
- _Give real-world examples of each relationship type._

| Relationship Type | Real-World Example                    | Tables Involved                                                    |
| ----------------- | ------------------------------------- | ------------------------------------------------------------------ |
| **One-to-One**    | A person and their passport           | `Person(id)` ↔ `Passport(person_id)`                               |
| **One-to-Many**   | A customer placing multiple orders    | `Customer(id)` → `Order(customer_id)`                              |
| **Many-to-Many**  | Students enrolled in multiple courses | `Student(id)` ↔ `Enrollment(student_id, course_id)` ↔ `Course(id)` |


---

**📌 Example SQL Schema**

✅ One-to-One Example:

```sql
CREATE TABLE Person (
  id INT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE Passport (
  id INT PRIMARY KEY,
  person_id INT UNIQUE,
  passport_number VARCHAR(50),
  FOREIGN KEY (person_id) REFERENCES Person(id)
);
```

✅ One-to-Many Example:

```sql
CREATE TABLE Customer (
  id INT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE Orders (
  id INT PRIMARY KEY,
  order_date DATE,
  customer_id INT,
  FOREIGN KEY (customer_id) REFERENCES Customer(id)
);
```

✅ Many-to-Many Example:

```sql
CREATE TABLE Student (
  id INT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE Course (
  id INT PRIMARY KEY,
  course_name VARCHAR(100)
);

CREATE TABLE Enrollment (
  student_id INT,
  course_id INT,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES Student(id),
  FOREIGN KEY (course_id) REFERENCES Course(id)
);
```
---

## 4. ✏️ CRUD Queries

- _How to write a **CREATE** query?_ 

**Example: Creating a `Users` table**
```sql
CREATE TABLE Users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- _How to write a **READ** (SELECT) query?_ 

**Example: Fetching all users**
```sql
SELECT * FROM Users;
```

**Example: Fetching specific columns with conditions**
```sql
SELECT name, email FROM Users WHERE id = 1;
```
- _How to write an **UPDATE** query?_ 

**Example: Updating a user’s name**
```sql
UPDATE Users
SET name = 'John Doe'
WHERE id = 1;
``` 
- _How to write a **DELETE** query?_  

**Example: Deleting a user**
```sql
DELETE FROM Users
WHERE id = 1;
```

---

## 5. 🔐 Transactions

- _What is a **transaction** in a database?_  
```text
A transaction is a sequence of one or more SQL operations executed as a single unit of work.
Either all the operations are committed (saved) together, or none are applied (rolled back).
```
- _Why are transactions important?_  
```text
Transactions ensure data integrity, especially in multi-user environments.
They allow multiple related operations to be treated as one atomic action, avoiding partial updates.
```
- _What are the properties of a transaction?_
```text
ACID Properties:
- Atomicity: All operations succeed or none are applied.
- Consistency: Database state remains valid after transaction.
- Isolation: Transactions are isolated from each other.
- Durability: Changes are permanently saved.
```
**Example of Transaction:** 

```sql
BEGIN;

UPDATE Accounts SET balance = balance - 100 WHERE account_id = 1;
UPDATE Accounts SET balance = balance + 100 WHERE account_id = 2;

COMMIT;
```
---

## 6. 📇 Indexing (With Types & Examples)

- _What is **indexing** in databases?_  
```text
Indexing is a data structure technique used to quickly locate and access data in a database table.
It works like an index in a book — speeding up lookups without scanning the entire table.
```
- _What are the types of indexes (e.g., **single-column**, **composite**, **unique**, **full-text**)_

| Type              | Description                                          | Example Use Case                    |
| ----------------- | ---------------------------------------------------- | ----------------------------------- |
| **Single-column** | Index on one column.                                 | Search by username                  |
| **Composite**     | Index on multiple columns.                           | Search by (first\_name, last\_name) |
| **Unique**        | Ensures no duplicate values for indexed columns.     | Email addresses                     |
| **Full-text**     | Optimized for text searching with relevance ranking. | Article content                     |

- _When and why should indexes be used?_  
```text
Indexes should be used when:
- Frequent lookups are required.
- Data is frequently sorted or filtered.
- Performance is critical for large datasets.

Indexes improve SELECT query performance but slow down INSERT, UPDATE, and DELETE operations due to maintenance overhead. They should be used on columns frequently queried in WHERE, JOIN, or ORDER BY clauses.
```
- _Provide examples of indexing._
**Example:**

```sql
-- Single-column index
CREATE INDEX idx_username ON Users(username);

-- Composite index
CREATE INDEX idx_fullname ON Users(first_name, last_name);

-- Unique index
CREATE UNIQUE INDEX idx_email_unique ON Users(email);
```
---

## 7. 🧱 ACID Properties

- _What does **ACID** stand for?_  
```text
ACID is an acronym for Atomicity, Consistency, Isolation, and Durability — the four key properties of a reliable transaction.
```
- _What is **Atomicity**?_
```text
Atomicity ensures that a transaction is completed as a single unit of work. If any part fails, the entire transaction is rolled back.
```
- _What is **Consistency**?_  
```text
Consistency ensures that a transaction leaves the database in a valid state, maintaining data integrity.
```
- _What is **Isolation**?_  
```text
Isolation ensures that concurrent transactions do not interfere with each other, maintaining data consistency.
```
- _What is **Durability**?_
```text
Durability ensures that once a transaction is committed, its changes are permanently saved, even in the event of a system failure.
```
---

## 8. ⚖️ Normalization

- _What is **normalization** in relational databases?_  
```text
Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.
```
- _What are different **normal forms** (1NF, 2NF, 3NF, BCNF)?_  

| Normal Form | Rule                                                                                 | Example                                                                      |
| ----------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| **1NF**     | No repeating groups or arrays; each cell contains atomic (indivisible) values.       | A table with multiple phone numbers in one column should be split into rows. |
| **2NF**     | 1NF + no partial dependency on part of a composite key.                              | Order details table with product info split into separate product table.     |
| **3NF**     | 2NF + no transitive dependency (non-key columns depending on other non-key columns). | Customer city stored separately in `City` table instead of `Customer`.       |
| **BCNF**    | Stronger form of 3NF where every determinant is a candidate key.                     | Rare cases of overlapping candidate keys.                                    |

- _Why is normalization important?_  
```text
Normalization is important because it helps prevent data redundancy, reduces data duplication, and ensures data consistency. It also makes it easier to maintain and update the database.
```
- _Provide examples of normalized vs non-normalized tables._

**Example:**

```sql
-- Non-normalized table
CREATE TABLE Orders (
  id INT PRIMARY KEY,
  customer_id INT,
  order_date DATE,
  product_name VARCHAR(100),
  quantity INT,
  price DECIMAL(10, 2)
);

-- Normalized tables
CREATE TABLE Customers (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
);

CREATE TABLE Orders (
  id INT PRIMARY KEY,
  customer_id INT,
  order_date DATE,
  product_name VARCHAR(100),
  quantity INT,
  price DECIMAL(10, 2)
);
```

- _What is the difference between SQL and NoSQL databases?_
| Feature            | SQL (Relational)                  | NoSQL (Non-Relational)                          |
| ------------------ | --------------------------------- | ----------------------------------------------- |
| **Data Model**     | Tables with rows & columns        | Document, key-value, graph, column-family       |
| **Schema**         | Fixed, predefined                 | Flexible, dynamic                               |
| **Scaling**        | Vertical scaling (bigger servers) | Horizontal scaling (more servers)               |
| **Transactions**   | Strong ACID compliance            | Often eventual consistency (some support ACID)  |
| **Query Language** | SQL                               | API-specific or query languages (e.g., MongoDB) |
| **Best For**       | Complex queries, structured data  | Unstructured or semi-structured data            |
| **Examples**       | MySQL, PostgreSQL, Oracle         | MongoDB, Cassandra, Redis, Neo4j                |

---