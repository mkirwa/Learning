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


