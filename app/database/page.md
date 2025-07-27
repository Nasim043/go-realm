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
- _What is a **LEFT JOIN**?_
- _What is a **RIGHT JOIN**?_
- _What is a **FULL OUTER JOIN**?_
- _When should each type of join be used?_  
- _Provide examples for each join type._

---

## 3. 🔁 Relation Types (With Examples)

- _What is a **one-to-one** relationship?_
- _What is a **one-to-many** relationship?_
- _What is a **many-to-many** relationship?_  
- _Give real-world examples of each relationship type._

---

## 4. ✏️ CRUD Queries

- _How to write a **CREATE** query?_  
- _How to write a **READ** (SELECT) query?_  
- _How to write an **UPDATE** query?_  
- _How to write a **DELETE** query?_  

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