Here are some of the most common and useful **Oracle SQL queries** that are essential for database management, data retrieval, and manipulation:

### 1. **SELECT Query (Basic Retrieval)**

* **Purpose:** Retrieve data from a table.

```sql
SELECT * FROM employees;
```

* **Explanation:** This query selects all columns (`*`) from the `employees` table. You can replace `*` with specific column names to retrieve only certain columns.

### 2. **SELECT with WHERE Clause (Filtering Data)**

* **Purpose:** Filter data based on specified conditions.

```sql
SELECT * FROM employees WHERE department_id = 10;
```

* **Explanation:** This retrieves all employees in department 10. The `WHERE` clause filters records based on the condition provided.

### 3. **SELECT with ORDER BY (Sorting Data)**

* **Purpose:** Sort query results by one or more columns.

```sql
SELECT * FROM employees ORDER BY salary DESC;
```

* **Explanation:** This query retrieves all employee records, sorted by the `salary` column in descending order.

### 4. **COUNT Function (Counting Rows)**

* **Purpose:** Count the number of rows in a table or query result.

```sql
SELECT COUNT(*) FROM employees;
```

* **Explanation:** This returns the total number of records in the `employees` table.

### 5. **DISTINCT (Removing Duplicate Values)**

* **Purpose:** Retrieve unique values from a column.

```sql
SELECT DISTINCT department_id FROM employees;
```

* **Explanation:** This returns a list of unique department IDs from the `employees` table.

### 6. **GROUP BY Clause (Grouping Data)**

* **Purpose:** Group rows that have the same values into summary rows.

```sql
SELECT department_id, COUNT(*) FROM employees GROUP BY department_id;
```

* **Explanation:** This groups employees by `department_id` and counts the number of employees in each department.

### 7. **HAVING Clause (Filtering Grouped Data)**

* **Purpose:** Filter groups after using `GROUP BY`.

```sql
SELECT department_id, AVG(salary) FROM employees GROUP BY department_id HAVING AVG(salary) > 50000;
```

* **Explanation:** This groups employees by `department_id`, calculates the average salary per department, and only includes departments with an average salary greater than 50,000.

### 8. **JOIN Queries (Combining Data from Multiple Tables)**

* **Purpose:** Combine rows from two or more tables based on a related column.

```sql
SELECT e.first_name, e.last_name, d.department_name
FROM employees e
JOIN departments d ON e.department_id = d.department_id;
```

* **Explanation:** This retrieves the first and last names of employees along with their department names by joining the `employees` and `departments` tables on `department_id`.

### 9. **INNER JOIN (Retrieving Common Data from Multiple Tables)**

* **Purpose:** Retrieve records that have matching values in both tables.

```sql
SELECT e.first_name, e.last_name, d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id;
```

* **Explanation:** This retrieves records where the `department_id` matches in both the `employees` and `departments` tables.

### 10. **LEFT JOIN (Including All Records from Left Table)**

* **Purpose:** Retrieve all records from the left table and matched records from the right table.

```sql
SELECT e.first_name, e.last_name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id;
```

* **Explanation:** This returns all employees, including those who are not assigned to a department (NULL values will appear for `department_name` where no match exists).

### 11. **UPDATE Statement (Modifying Data)**

* **Purpose:** Update existing records in a table.

```sql
UPDATE employees SET salary = salary * 1.1 WHERE department_id = 10;
```

* **Explanation:** This increases the salary by 10% for employees in department 10.

### 12. **DELETE Statement (Removing Data)**

* **Purpose:** Delete records from a table.

```sql
DELETE FROM employees WHERE employee_id = 101;
```

* **Explanation:** This deletes the record for the employee with `employee_id` 101.

### 13. **INSERT Statement (Adding Data)**

* **Purpose:** Add new records to a table.

```sql
INSERT INTO employees (employee_id, first_name, last_name, department_id, salary)
VALUES (102, 'John', 'Doe', 10, 60000);
```

* **Explanation:** This adds a new employee with specific values for `employee_id`, `first_name`, `last_name`, `department_id`, and `salary`.

### 14. **ALTER TABLE (Modifying Table Structure)**

* **Purpose:** Modify the structure of an existing table.

```sql
ALTER TABLE employees ADD (email VARCHAR2(100));
```

* **Explanation:** This adds a new column `email` to the `employees` table.

### 15. **CREATE TABLE (Creating a New Table)**

* **Purpose:** Create a new table in the database.

```sql
CREATE TABLE employees (
  employee_id INT PRIMARY KEY,
  first_name VARCHAR2(50),
  last_name VARCHAR2(50),
  department_id INT,
  salary NUMBER
);
```

* **Explanation:** This creates a new `employees` table with columns for `employee_id`, `first_name`, `last_name`, `department_id`, and `salary`.

### 16. **DROP TABLE (Deleting a Table)**

* **Purpose:** Remove an existing table from the database.

```sql
DROP TABLE employees;
```

* **Explanation:** This deletes the `employees` table from the database permanently.

### 17. **Subquery (Query Inside Another Query)**

* **Purpose:** Use a query within another query.

```sql
SELECT first_name, last_name
FROM employees
WHERE department_id = (SELECT department_id FROM departments WHERE department_name = 'Sales');
```

* **Explanation:** This retrieves the names of employees who work in the 'Sales' department by using a subquery to find the `department_id` for 'Sales'.

### 18. **IN Operator (Multiple Value Matching)**

* **Purpose:** Check if a value matches any value in a list.

```sql
SELECT * FROM employees WHERE department_id IN (10, 20, 30);
```

* **Explanation:** This retrieves employees who belong to any of the departments with `department_id` 10, 20, or 30.

### 19. **BETWEEN Operator (Range Matching)**

* **Purpose:** Select values within a given range.

```sql
SELECT * FROM employees WHERE salary BETWEEN 50000 AND 70000;
```

* **Explanation:** This retrieves employees whose salary is between 50,000 and 70,000.

### 20. **LIKE Operator (Pattern Matching)**

* **Purpose:** Search for a pattern in a column.

```sql
SELECT * FROM employees WHERE first_name LIKE 'J%';
```

* **Explanation:** This retrieves employees whose `first_name` starts with 'J'.

---

These queries are fundamental for interacting with Oracle databases. They cover basic data retrieval, manipulation, and table management.
