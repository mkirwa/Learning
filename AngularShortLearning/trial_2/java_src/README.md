#### Application Relationships
- Controller: Accepts HTTP requests, maps the URL (/api/metrics/process), and calls the service.
- Service: Processes the input, constructs database queries, and prepares the response.
- Model (Metric): Represents the request body form values.
- Model (QueryResponse): Represents the response structure with a HashSet and HashMap.
#### Changing Database Tables and Columns

- Update the Table Name:

- In the service layer, modify the value of tableName in the MetricService class.
- Update the Column Names:

- Change the values of columnField1 and columnField2 in the MetricService class.

``` java
 
String tableName = "new_table_name"; // Update the table name here
String columnField1 = "new_column1"; // Update the first column name here
String columnField2 = "new_column2"; // Update the second column name here

```
#### Example cURL Command for Testing
You can test the API with the following cURL command:

```bash
 
curl -X POST http://localhost:8080/api/metrics/process \
-H "Content-Type: application/json" \
-d '{
  "field1": "TestValue1",
  "field2": "TestValue2"
}'
```
- Expected Response:

```json
 
{
  "variableA": ["Value1", "Value2"],
  "results": {
    "key1": "result1",
    "key2": "result2"
  }
}
```

#### Notes
- Use a real database connection instead of the mock logic in MetricService.
- Add proper exception handling for database operations.
- Update the dynamic query logic if database schema changes are extensive.
- This setup is flexible, and the modular design allows easy updates to database tables and columns.


- The primary difference between a HashMap and a HashSet lies in their purpose, how they store data, and how they allow access to their elements. Here's a breakdown:

#### HashMap
- Purpose: Used to store key-value pairs.
##### Structure:
- Each element is a mapping of a key to a value.
- Keys are unique; values can be duplicated.
##### Implementation:
- Internally uses a hash table to store mappings of keys to values.
##### Access:
- You can retrieve a value using its associated key.
- Example: map.get("key1") returns the value for the key "key1".
##### Use Case:
- When you need to associate a value with a unique key for fast lookups.
Example in Java:

```java
 
HashMap<String, Integer> map = new HashMap<>();
map.put("key1", 10); // Add key-value pair
map.put("key2", 20); // Add another key-value pair
System.out.println(map.get("key1")); // Output: 10
```
#### HashSet
- Purpose: Used to store a collection of unique elements (like a mathematical set).
##### Structure:
- Does not store key-value pairs.
- Only stores unique objects (no duplicates allowed).
##### Implementation:
- Internally uses a HashMap where the elements are stored as keys, and a constant dummy object is stored as the value.
##### Access:
- No direct access to elements; can only iterate or check existence (contains).
##### Use Case:
- When you need a collection of unique elements, and you don't care about key-value relationships.
- Example in Java:

```java
 
HashSet<String> set = new HashSet<>();
set.add("Value1"); // Add an element
set.add("Value2"); // Add another element
System.out.println(set.contains("Value1")); // Output: true
```
##### Key Differences in Use
- In the context of the example from the code:

- HashSet in QueryResponse:

- Used to store variableA, a collection of unique strings (e.g., Value1, Value2).
- Why?: variableA doesn't need key-value pairs, only unique values.
```java
 
private HashSet<String> variableA;
```
- HashMap in QueryResponse:

- Used to store results, which maps keys (e.g., key1, key2) to values (e.g., result1, result2).
- Why?: results represent a key-value mapping, making HashMap ideal.
```java
 
private HashMap<String, String> results;
```

#### Explanation of Query ####
```SQL
SELECT from intrinsic_candidate:
```

- Fetches all records from the old table using field_2 as the unique identifier.

```sql
Copy code
SELECT field_2 AS unique_field, * FROM intrinsic_candidate
SELECT from intrinsic_candidate_001:
```

- Fetches all records from the new table using field_17 as the unique identifier.

```sql
Copy code
SELECT field_17 AS unique_field, * FROM intrinsic_candidate_001
```

#### UNION: ####

- Combines the results from both tables.
- Automatically removes duplicate rows based on the selected columns (here, the unique fields and the rest of the table data).

#### DISTINCT: ####

- Ensures no duplicate rows are included after the union operation.
- Final Query: The final query combines both tables and ensures the uniqueness of records based on their unique columns:

```sql
Copy code
SELECT DISTINCT * 
FROM (
    SELECT field_2 AS unique_field, * FROM intrinsic_candidate
    UNION
    SELECT field_17 AS unique_field, * FROM intrinsic_candidate_001
) combined_data
```

- If field_3 is only available in the intrinsic_candidate table and not in intrinsic_candidate_001, you can handle this scenario by returning NULL or a placeholder value for field_3 when pulling data from intrinsic_candidate_001. 
- This ensures the UNION operation is consistent (all SELECT queries must return the same number of columns).

```SQL
SELECT DISTINCT field_3
FROM (
    SELECT field_2 AS unique_field, field_3 
    FROM intrinsic_candidate
    UNION
    SELECT field_17 AS unique_field, NULL AS field_3
    FROM intrinsic_candidate_001
) combined_data;
```

- Using stored procedures in Hibernate involves defining and calling procedures either through annotations (@NamedStoredProcedureQuery) or the EntityManager API. 
- This approach offers better maintainability and security compared to dynamically constructing SQL queries with StringBuilder. Here's how you can implement and use stored procedures in Hibernate:

- Step 1: Define the Stored Procedure in the Database
- First, create the stored procedure in the database. For example:

```sql
Copy code
CREATE PROCEDURE get_combined_data()
BEGIN
    SELECT DISTINCT field_3
    FROM (
        SELECT field_2 AS unique_field, field_3 FROM intrinsic_candidate
        UNION
        SELECT field_17 AS unique_field, NULL AS field_3 FROM intrinsic_candidate_001
    ) combined_data
    WHERE field_3 IS NOT NULL;
END;
```
- Step 2: Define the Stored Procedure in Hibernate

- You can define a stored procedure in Hibernate using the @NamedStoredProcedureQuery annotation.

- Entity Class with Stored Procedure Definition

- If you have an entity like IntrinsicCandidate, add the annotation to define the stored procedure:

```java
Copy code
import jakarta.persistence.*;

@Entity
@NamedStoredProcedureQuery(
    name = "IntrinsicCandidate.getCombinedData",
    procedureName = "get_combined_data",
    resultClasses = String.class // Assuming the procedure returns only field_3 as strings
)
public class IntrinsicCandidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "field_2")
    private String field2;

    @Column(name = "field_3")
    private String field3;

    // Getters and Setters
}
```
- Step 3: Call the Stored Procedure in the Service Layer
- Using the EntityManager API
- Use the EntityManager to call the stored procedure:

```java
Copy code
import jakarta.persistence.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IntrinsicCandidateService {

    @Autowired
    private EntityManager entityManager;

    /**
     * Call the stored procedure and fetch the results.
     * 
     * @return List of unique field_3 values.
     */
    public List<String> getCombinedData() {
        // Create the stored procedure query
        StoredProcedureQuery query = entityManager.createNamedStoredProcedureQuery("IntrinsicCandidate.getCombinedData");

        // Execute the procedure
        query.execute();

        // Fetch and return the results
        return query.getResultList();
    }
}
```
- Step 4: Expose the Service via Controller
- Here’s how the controller can expose the stored procedure results:

```java
Copy code
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class IntrinsicCandidateController {

    @Autowired
    private IntrinsicCandidateService service;

    @GetMapping("/api/combined-data")
    public List<String> getCombinedData() {
        return service.getCombinedData();
    }
}
```
- Step 5: Test the API
- Call the endpoint /api/combined-data.
- It should invoke the stored procedure and return the distinct field_3 values.

- Update the stored procedure (get_combined_data) to reflect changes in tables or columns.
Example:

```sql
Copy code
ALTER PROCEDURE get_combined_data()
BEGIN
    SELECT DISTINCT field_4
    FROM (
        SELECT field_2 AS unique_field, field_4 FROM intrinsic_candidate
        UNION
        SELECT field_17 AS unique_field, field_4 FROM intrinsic_candidate_001
    ) combined_data
    WHERE field_4 IS NOT NULL;
END;
```
- In the Application:

- Update the entity definition or the service layer if the structure of results changes (e.g., multiple fields returned).


- To transition from using StringBuilder SQL queries to stored procedures in Hibernate, you can simplify the codebase by getting rid of certain classes and components that are no longer necessary. Below is a guide on which classes or parts of the application can be removed:

- StringBuilder-Based Query Classes
Any classes or methods dedicated to dynamically building SQL queries using StringBuilder should be removed.
Example: If you have a service or utility method like this:

```java
Copy code
public String buildQuery() {
    StringBuilder query = new StringBuilder();
    query.append("SELECT DISTINCT field_3 ")
         .append("FROM (")
         .append("SELECT field_2 AS unique_field, field_3 FROM intrinsic_candidate ")
         .append("UNION ")
         .append("SELECT field_17 AS unique_field, NULL AS field_3 FROM intrinsic_candidate_001 ")
         .append(") combined_data ")
         .append("WHERE field_3 IS NOT NULL;");
    return query.toString();
}
```

- This is no longer necessary because the logic is now encapsulated in the stored procedure in the database.

- Native Query Execution Logic
If you previously used EntityManager to execute native SQL queries (e.g., createNativeQuery()), you can remove those parts of the code.
Example of code to remove:

```java
Copy code
public List<String> executeQuery() {
    String sql = buildQuery();
    return entityManager.createNativeQuery(sql).getResultList();
}
```
- This functionality is replaced by the stored procedure query using EntityManager.createNamedStoredProcedureQuery().

- DTO Classes or Maps for Query Results

- If you created custom DTOs or Map<String, Object> structures specifically to handle the output of native SQL queries, you may not need them anymore. Hibernate automatically maps the results of stored procedures to entities or specific return types, reducing boilerplate code.
For example:

```java
Copy code
public class IntrinsicCandidateDTO {
    private String field2;
    private String field3;

    // Getters and setters
}
```

- If this was only for query results and is not reused elsewhere, it can be removed.

- SQL Validation or Parameter Injection Code
- Any logic used to validate or inject parameters into raw SQL queries can be removed because stored procedures typically handle input validation within the database.

```java
Copy code
public String sanitizeQuery(String param) {
    // Logic to sanitize or format input for raw SQL
    return param.replace("'", "''");
}
```

1. MetricController
The MetricController is the entry point for the API, so it will generally stay. However, its implementation should be modified to work with the new stored procedure-based service logic.

Modifications:
Instead of calling a method in the service layer that uses StringBuilder or raw SQL, it will call a method that invokes the stored procedure.
Before:

```java
Copy code
@RestController
public class MetricController {

    @Autowired
    private MetricService metricService;

    @GetMapping("/api/metrics")
    public List<QueryResponse> getMetrics() {
        return metricService.getMetrics();
    }
}
```
After:

```java
Copy code
@RestController
public class MetricController {

    @Autowired
    private MetricService metricService;

    @GetMapping("/api/metrics")
    public List<String> getMetrics() {
        // Call the stored procedure through the service
        return metricService.getCombinedData();
    }
}
```
2. Metric
The Metric class likely represents the entity or model for database interaction. If this class is tied to a database table (e.g., intrinsic_candidate), it should stay unchanged because Hibernate still needs it for ORM mapping.

Keep it if:
It’s mapped to a table using JPA annotations.
You are using it as part of the Hibernate or database interaction.
Modify it if:
There are fields in Metric that are no longer relevant due to changes in how data is retrieved or stored.
Example (Keep or Modify):

```java
Copy code
@Entity
public class Metric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "field_2")
    private String field2;

    @Column(name = "field_3")
    private String field3;

    // Getters and setters
}
```
- If additional columns from intrinsic_candidate or intrinsic_candidate_001 are needed for stored procedure results, add them to this class.

3. QueryResponse
The QueryResponse class is used to structure API responses. Depending on how the stored procedure results are structured, this class might need modification or removal.

Options:
Keep it if:
You want to encapsulate stored procedure results in a structured object.
Modify its fields to align with the stored procedure output.
Example Modification: If the stored procedure returns only field_3, simplify QueryResponse:

```java
Copy code
public class QueryResponse {
    private String field3;

    // Constructor, getters, setters
}
```
Remove it if:
The stored procedure returns simple data types (e.g., a list of strings).
Replace it directly with native types in the MetricService or MetricController.
4. MetricService
The MetricService serves as the business logic layer. It will require significant modification to call the stored procedure instead of using raw SQL.

Before (Using StringBuilder):
```java
Copy code
@Service
public class MetricService {

    @Autowired
    private EntityManager entityManager;

    public List<QueryResponse> getMetrics() {
        String sql = buildQuery();
        List<Object[]> results = entityManager.createNativeQuery(sql).getResultList();
        return mapToQueryResponse(results);
    }

    private List<QueryResponse> mapToQueryResponse(List<Object[]> results) {
        // Map raw query results to QueryResponse objects
        // ...
    }
}
```
After (Using Stored Procedure):
```java
Copy code
@Service
public class MetricService {

    @Autowired
    private EntityManager entityManager;

    public List<String> getCombinedData() {
        StoredProcedureQuery query = entityManager.createNamedStoredProcedureQuery("IntrinsicCandidate.getCombinedData");
        query.execute();
        return query.getResultList(); // Directly return results
    }
}
```
