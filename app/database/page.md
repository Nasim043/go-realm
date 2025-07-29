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
An INNER JOIN returns only the rows that have matching values in both tables.
If there is no match, the row is excluded from the result.
```
- _What is a **LEFT JOIN**?_
```text
A LEFT JOIN returns all rows from the left table, and the matched rows from the right table.
If there is no match, NULLs are returned for columns from the right table.
```
- _What is a **RIGHT JOIN**?_
```text
A RIGHT JOIN returns all rows from the right table, and the matched rows from the left table.
If there is no match, NULLs are returned for columns from the left table.
```
- _What is a **FULL OUTER JOIN**?_
```text
A FULL OUTER JOIN returns all rows when there is a match in either the left or right table.
Rows with no match in one of the tables will have NULLs for the missing side.
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

| id | name    | dept\_id |
| -- | ------- | -------- |
| 1  | Alice   | 10       |
| 2  | Bob     | 20       |
| 3  | Charlie | NULL     |

**Departments**

| id | dept\_name  |
| -- | ----------- |
| 10 | HR          |
| 20 | Engineering |
| 30 | Marketing   |

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
A one-to-one relationship means each row in Table A is linked to one and only one row in Table B, and vice versa.
This type is used when two tables share the same primary key but store different types of data.
```
- _What is a **one-to-many** relationship?_
```text
A one-to-many relationship means one row in Table A can be associated with many rows in Table B, 
but each row in Table B relates to only one row in Table A.
This is the most common relationship in relational databases.
```
- _What is a **many-to-many** relationship?_  
```text
A many-to-many relationship occurs when multiple records in Table A relate to multiple records in Table B.
To implement it, an intermediate (junction) table is used containing foreign keys referencing both tables.
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
- _Why are transactions important?_  
- _What are the properties of a transaction?_

---

## 6. 📇 Indexing (With Types & Examples)

- _What is **indexing** in databases?_  
- _What are the types of indexes (e.g., **single-column**, **composite**, **unique**, **full-text**)_
- _When and why should indexes be used?_  
- _Provide examples of indexing._

---

## 7. 🧱 ACID Properties

- _What does **ACID** stand for?_  
- _What is **Atomicity**?_  
- _What is **Consistency**?_  
- _What is **Isolation**?_  
- _What is **Durability**?_

---

## 8. ⚖️ Normalization

- _What is **normalization** in relational databases?_  
- _What are different **normal forms** (1NF, 2NF, 3NF, BCNF)?_  
- _Why is normalization important?_  
- _Provide examples of normalized vs non-normalized tables._