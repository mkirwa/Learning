# Spring Framework Overview

## Introduction
The **Spring Framework** is an open-source framework for Java that simplifies enterprise application development. It provides support for **dependency injection (DI), aspect-oriented programming (AOP), transaction management, security, and web application development**.

## How Spring Framework Works
Spring is modular and allows developers to use only the necessary components. Here’s an overview of its core functionalities:

### 1. **Dependency Injection (DI)**
Spring manages object dependencies automatically, making the code more maintainable and testable.

**Example:**
```java
@Component
public class Engine {
    public void start() {
        System.out.println("Engine started!");
    }
}

@Component
public class Car {
    private final Engine engine;

    @Autowired
    public Car(Engine engine) { // Dependency Injection
        this.engine = engine;
    }

    public void drive() {
        engine.start();
        System.out.println("Car is moving!");
    }
}
```

### 2. **Spring Container & Bean Management**
Spring provides **ApplicationContext** to manage beans at runtime.

**Example:**
```java
@Configuration
@ComponentScan("com.example")
public class AppConfig {}

public class MainApp {
    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        Car car = context.getBean(Car.class);
        car.drive();
    }
}
```

### 3. **Aspect-Oriented Programming (AOP)**
Spring AOP helps separate cross-cutting concerns like logging and security.

**Example:**
```java
@Aspect
@Component
public class LoggingAspect {
    @Before("execution(* com.example.Car.drive(..))")
    public void logBefore() {
        System.out.println("Logging before the method execution...");
    }
}
```

### 4. **Spring MVC for Web Applications**
Spring MVC follows the **Model-View-Controller (MVC)** pattern for web applications.

**Example:**
```java
@RestController
@RequestMapping("/cars")
public class CarController {
    
    @GetMapping("/{id}")
    public String getCar(@PathVariable int id) {
        return "Car with ID: " + id;
    }
}
```
**API Endpoint:** `GET http://localhost:8080/cars/1`

## Spring Framework Modules

| **Module**       | **Description** |
|-----------------|---------------|
| **Spring Core**  | Provides DI & IoC container. |
| **Spring AOP**   | Implements Aspect-Oriented Programming. |
| **Spring MVC**   | For building web applications. |
| **Spring Boot**  | Simplifies configuration and deployment. |
| **Spring Security** | Manages authentication & authorization. |
| **Spring Data**  | Simplifies database access (JPA, JDBC). |
| **Spring Cloud** | Helps build microservices. |

## Benefits of Using Spring Framework
✅ **Simplifies Development** – Reduces boilerplate code.  
✅ **Modular** – Use only what you need.  
✅ **Flexible** – Works with various databases and technologies.  
✅ **Scalable** – Supports microservices architecture.  
✅ **Secure** – Provides built-in security features.  


# Batch Lookup Optimization for Toyota and Ford Entities

## Overview
This document outlines the optimization strategy for handling nested lists of `VehicleAssociation` objects, where `toyotaId` or `fordId` needs to be batch-fetched from the database to improve performance. Instead of making multiple database queries, we perform **batch processing** using Java Streams and Maps.

## Problem Statement
The original implementation performed an **N+1 query problem**, where for each `VehicleAssociation`, individual lookups were made for `ToyotaEntity` and `FordEntity`. This resulted in excessive database calls and poor performance.

### **Example Data Structure**
We receive a nested list structure:
```java
List<List<VehicleAssociation>> toyotaIdsAndFords;
```
The structure can contain multiple lists, each containing multiple `VehicleAssociation` objects:
```
[
  [ [toyotaId: T1, fordId: F1] ],
  [ [toyotaId: T2, fordId: null], [toyotaId: null, fordId: F2], [toyotaId: T3, fordId: null] ],
  [ [toyotaId: null, fordId: F3] ]
]
```
- If `toyotaId` is **not null**, we fetch `ToyotaEntity`.
- If `toyotaId` is **null** but `fordId` is **not null**, we fetch `FordEntity`.

## Solution Approach
1. **Flatten the Nested Lists** into a `Stream<VehicleAssociation>`.
2. **Extract Unique toyotaIds and fordIds** into two separate sets.
3. **Batch query `ToyotaDao` and `FordDao`** instead of making individual queries.
4. **Store fetched results in Maps** for quick lookup.
5. **Update `VehicleAssociation` with batch-fetched data**.

## Implementation Changes

### 1️⃣ **Flatten and Collect Toyota & Ford IDs**
```java
// Step 1: Flatten nested lists and extract IDs
Set<String> toyotaIds = new HashSet<>();
Set<String> fordIds = new HashSet<>();

toyotaIdsAndFords.stream()
    .flatMap(List::stream) // Flatten List<List<VehicleAssociation>> to Stream<VehicleAssociation>
    .forEach(vehicleAssoc -> {
        if (vehicleAssoc.getToyotaId() != null) {
            toyotaIds.add(vehicleAssoc.getToyotaId());
        } else if (vehicleAssoc.getFordId() != null) {
            fordIds.add(vehicleAssoc.getFordId());
        }
    });
```

### 2️⃣ **Batch Fetch from DAOs**
```java
// Step 2: Batch fetch ToyotaEntity and FordEntity
Map<String, ToyotaEntity> toyotaEntityMap = toyotaDao.findBatch(toyotaIds)
    .stream()
    .collect(Collectors.toMap(ToyotaEntity::getToyotaId, Function.identity()));

Map<String, FordEntity> fordEntityMap = fordDao.findBatch(fordIds)
    .stream()
    .collect(Collectors.toMap(FordEntity::getFordId, Function.identity()));
```

### 3️⃣ **Update Entities Using the Pre-Fetched Data**
```java
// Step 3: Process the VehicleAssociations with the fetched data
for (List<VehicleAssociation> vehicleAssocList : toyotaIdsAndFords) {
    for (VehicleAssociation vehicleAssoc : vehicleAssocList) {
        if (vehicleAssoc.getToyotaId() != null) {
            vehicleAssoc.setToyotaEntity(toyotaEntityMap.get(vehicleAssoc.getToyotaId()));
        }
        if (vehicleAssoc.getFordId() != null) {
            vehicleAssoc.setFordEntity(fordEntityMap.get(vehicleAssoc.getFordId()));
        }
    }
}
```

## Alternative Ways to Access Toyota IDs
If `VehicleAssociation` does not have `getToyotaId()`, try these approaches:

### **1️⃣ Check for a Different Method or Field**
```java
vehicleAssoc.getToyota().getId(); // If `vehicleAssoc` has a `getToyota()` method
```

### **2️⃣ Inspect Available Fields**
```java
System.out.println(Arrays.toString(vehicleAssoc.getClass().getMethods()));
```
This prints all methods available on `VehicleAssociation`, helping locate `toyotaId`.

### **3️⃣ Check if it's a Field Instead of a Method**
```java
String toyotaId = vehicleAssoc.toyotaId; // If it's a public field
```

### **4️⃣ If It's Stored in a Map or JSON-Like Structure**
```java
String toyotaId = (String) vehicleAssoc.getProperties().get("toyotaId");
```

### **5️⃣ Debugging the Object Structure**
```java
System.out.println(new ObjectMapper().writeValueAsString(vehicleAssoc));
```

### **Alternative: Modify the Entity**
```java
public String getToyotaId() {
    return this.toyota != null ? this.toyota.getId() : null;
}
```

## Performance Gains
✅ **Eliminates N+1 Query Problem** – Instead of executing one query per `VehicleAssociation`, we perform a **single batch query** for each entity type.  
✅ **Optimized Query Execution** – Less database overhead and reduced latency.  
✅ **O(1) Lookup Performance** – Using **HashMap** ensures near-instant lookup instead of iterating through lists.  
✅ **Scalable for Large Datasets** – Can handle thousands of `VehicleAssociation` objects efficiently.

## Next Steps
- Implement `findBatch(Set<String> ids)` in `ToyotaDao` and `FordDao` to support batch fetching.
- Consider caching frequently accessed entity data.
- Refactor `setFordInformationFromLookup()` to adopt the same batch-processing approach.

______________________________________________________________________________________________________________________________________________________________________________

# Accessing and Storing ToyotaEntityMap and FordEntityMap

## Overview
This document describes various ways to store and access `toyotaEntityMap` and `fordEntityMap`, which are Hibernate properties, across multiple classes. It also explains Dependency Injection (DI) and provides different approaches to managing these entity maps.

## Understanding Hibernate Properties
In Hibernate, **entity properties** refer to fields mapped to database columns. These fields are managed by Hibernate and usually require getters and setters to be accessed properly.

### Example:
```java
@Entity
public class ToyotaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String toyotaId;

    private String modelName;
    private String carCode;

    public String getToyotaId() { return toyotaId; }
    public void setToyotaId(String toyotaId) { this.toyotaId = toyotaId; }

    public String getCarCode() { return carCode; }
    public void setCarCode(String carCode) { this.carCode = carCode; }
}
```
### Key Hibernate Rules:
- Hibernate **requires getters and setters** for private fields.
- Properties are **mapped to database fields** and Hibernate manages their lifecycle.

## Understanding Dependency Injection (DI)
Dependency Injection (DI) is a design pattern where dependencies are **provided from outside a class** rather than being created within it. This avoids hardcoded dependencies and improves maintainability.

### Example of DI:
```java
@Service
public class VehicleService {
    private final ToyotaDao toyotaDao;

    @Autowired
    public VehicleService(ToyotaDao toyotaDao) {
        this.toyotaDao = toyotaDao;
    }

    public ToyotaEntity getToyotaById(String id) {
        return toyotaDao.findById(id).orElse(null);
    }
}
```
✅ **Advantages of Dependency Injection:**
- Reduces coupling between classes.
- Allows for better unit testing with mock objects.
- Managed by Spring’s lifecycle.

## Approaches to Storing and Accessing ToyotaEntityMap and FordEntityMap

### **1️⃣ Using a Static Utility Class (No Dependency Injection)**
Create a utility class with static methods to store and retrieve entity maps globally.

```java
public class VehicleDataStore {
    private static Map<String, ToyotaEntity> toyotaEntityMap = new HashMap<>();
    private static Map<String, FordEntity> fordEntityMap = new HashMap<>();

    public static void setToyotaEntityMap(Map<String, ToyotaEntity> map) {
        toyotaEntityMap = map;
    }

    public static Map<String, ToyotaEntity> getToyotaEntityMap() {
        return toyotaEntityMap;
    }

    public static void setFordEntityMap(Map<String, FordEntity> map) {
        fordEntityMap = map;
    }

    public static Map<String, FordEntity> getFordEntityMap() {
        return fordEntityMap;
    }
}
```
✅ **Pros:** Works without dependency injection.
❌ **Cons:** Data persists globally, even if not needed.

---

### **2️⃣ Using a Singleton Class (Encapsulation Without DI)**
Create a singleton to ensure a single instance manages the entity maps.

```java
public class VehicleSingleton {
    private static final VehicleSingleton instance = new VehicleSingleton();
    private Map<String, ToyotaEntity> toyotaEntityMap = new HashMap<>();
    private Map<String, FordEntity> fordEntityMap = new HashMap<>();

    private VehicleSingleton() {}

    public static VehicleSingleton getInstance() {
        return instance;
    }

    public void setToyotaEntityMap(Map<String, ToyotaEntity> map) {
        this.toyotaEntityMap = map;
    }

    public Map<String, ToyotaEntity> getToyotaEntityMap() {
        return toyotaEntityMap;
    }
}
```
✅ **Pros:** Controls access using `getInstance()`.
❌ **Cons:** Requires manual access with `getInstance()`.

---

### **3️⃣ Using Spring Service for DI (Recommended for Spring Apps)**
If using Spring Boot, a service-based approach is recommended.

```java
@Service
public class VehicleCacheService {
    private Map<String, ToyotaEntity> toyotaEntityMap = new HashMap<>();
    private Map<String, FordEntity> fordEntityMap = new HashMap<>();

    public void setToyotaEntityMap(Map<String, ToyotaEntity> map) {
        this.toyotaEntityMap = map;
    }

    public Map<String, ToyotaEntity> getToyotaEntityMap() {
        return toyotaEntityMap;
    }
}
```

Injecting and using the service:
```java
@Autowired
private VehicleCacheService vehicleCacheService;

public void processVehicles() {
    ToyotaEntity toyota = vehicleCacheService.getToyotaEntityMap().get("T123");
    System.out.println(toyota != null ? toyota.getCountryCode3() : "Not Found");
}
```
✅ **Pros:** Works well in large-scale Spring applications.
❌ **Cons:** Requires `@Autowired` injection.

---

## **Comparison of Approaches**
| Approach | Best Use Case |
|----------|--------------|
| **Static Utility Class** | Simple global access without DI. |
| **Singleton Class** | Controlled access, avoids global state. |
| **Spring Service (Recommended)** | Best for scalable Spring apps. |

## Conclusion
For a Spring-based application, **dependency injection using a service (`@Service`) is recommended**. If DI is not an option, a **Singleton class** provides better encapsulation than a static utility class.

Would you like modifications to fit your existing project structure? 🚀

# How to Join Toyota Data in VehicleAssociationEntity

## Overview
This document explains how to use `@SecondaryTable` in `VehicleAssociationEntity` to pull `ToyotaCarCode` from the `Toyota` table using `CarId`. The implementation prevents accidental updates to the `Toyota` table while ensuring seamless data retrieval.

## Problem Statement
- The `VehicleAssociation` table contains `CarId`, which is also present in the `Toyota` table.
- We need to fetch `ToyotaCarCode` from the `Toyota` table without modifying `Toyota` data.
- Using `@SecondaryTable`, we will join `Toyota` to `VehicleAssociationEntity` and store `ToyotaCarCode` in a transient field.

## Solution
### 1️⃣ **Update `VehicleAssociationEntity` with `@SecondaryTable`**

```java
@Entity
@Table(name = "VehicleAssociation")
@SecondaryTable(name = "Toyota", pkJoinColumns = @PrimaryKeyJoinColumn(name = "CarId"))
public class VehicleAssociationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "CarId")
    private String carId;

    @Transient  // Prevent accidental update to Toyota table
    private String toyotaCarCode;

    @Column(name = "ToyotaCarCode", table = "Toyota", insertable = false, updatable = false)
    private String dbToyotaCarCode;

    public String getToyotaCarCode() {
        return dbToyotaCarCode;  // Ensure only retrieved, not modified
    }

    // Getters and Setters
    public String getCarId() { return carId; }
    public void setCarId(String carId) { this.carId = carId; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}
```

### 2️⃣ **Explanation**
✅ **`@SecondaryTable(name = "Toyota")`** – Links the Toyota table to `VehicleAssociationEntity`.
✅ **`@PrimaryKeyJoinColumn(name = "CarId")`** – Joins tables using `CarId`.
✅ **`@Column(name = "ToyotaCarCode", table = "Toyota", insertable = false, updatable = false)`** – Prevents modifications to Toyota data.
✅ **`@Transient` for `toyotaCarCode`** – Ensures safe retrieval without persistence.

---

### 3️⃣ **Handling the "Wrong Number of Columns" Error**
If you encounter an error stating the entity has the wrong number of columns:
- Ensure **`CarId` exists in both `Toyota` and `VehicleAssociation` tables**.
- Verify database schema supports this type of join.
- If `CarId` is nullable in `VehicleAssociation`, enforce non-nullability:
  ```java
  @PrimaryKeyJoinColumn(name = "CarId", nullable = false)
  ```

---

### 4️⃣ **Querying the Data**
Fetching `VehicleAssociationEntity` will automatically include `ToyotaCarCode` from the `Toyota` table:

```java
VehicleAssociationEntity vehicle = vehicleAssociationRepo.findById(1L).orElse(null);
System.out.println("Toyota Car Code: " + vehicle.getToyotaCarCode());
```

## Benefits
✅ **Seamless data retrieval** without additional joins in queries.
✅ **Ensures Toyota data remains unmodifiable**.
✅ **Optimized performance using Hibernate's built-in mapping features**.

## Next Steps
- Ensure `CarId` is indexed for faster lookups.
- Consider caching frequently accessed data to optimize performance.
- Validate that `ToyotaCarCode` is correctly retrieved in integration tests.


# Joining Toyota Table in VehicleAssociationEntity SQL Query

## Overview
This document explains how to modify an SQL query to join the `Toyota` table with the `VehicleAssociation` table using `carId` as a common field. The goal is to retrieve the `toyotaCarCode` along with `carId` and `color` from `VehicleAssociationEntity`.

## Problem Statement
The current SQL query selects data only from `VehicleAssociationEntity`, but we need to **join the Toyota table** to retrieve `toyotaCarCode`, ensuring that it correctly associates with `carId`.

## Solution
Modify the SQL query to include a **LEFT JOIN** with the `Toyota` table based on `carId`.

### **Updated SQL Query**
```java
String carVehicleAssociationEntity =
    "SELECT carId.id, carId.color, toyota.toyotaCarCode " +
    "FROM tab.carId carId " +
    "LEFT JOIN tab.Toyota toyota ON carId.id = toyota.carId " +
    "WHERE carId.id IN (...)";
```

### **Explanation of Changes**
✅ **`LEFT JOIN tab.Toyota toyota ON carId.id = toyota.carId`** → Ensures that Toyota data is linked via `carId`.
✅ **`toyota.toyotaCarCode` added to `SELECT`** → Retrieves Toyota's car code.
✅ **`LEFT JOIN` instead of `INNER JOIN`** → Ensures results still appear even if `toyotaCarCode` is `NULL`.

---

## Alternative: Using JPQL (If Using JPA)
For JPA-based repositories, a JPQL query can achieve the same result:

```java
@Query("SELECT v.carId, v.color, t.toyotaCarCode " +
       "FROM VehicleAssociationEntity v " +
       "LEFT JOIN ToyotaEntity t ON v.carId = t.carId " +
       "WHERE v.carId IN :carIds")
List<Object[]> findVehicleAssociationsWithToyota(@Param("carIds") List<String> carIds);
```
✅ **Allows Hibernate to automatically handle entity joins**.

---

## Final SQL Query for Execution
If using **native SQL in Java**, ensure proper string concatenation:

```java
String carVehicleAssociationEntity =
    "SELECT carId.id, carId.color, toyota.toyotaCarCode " +
    "FROM tab.carId carId " +
    "LEFT JOIN tab.Toyota toyota ON carId.id = toyota.carId " +
    "WHERE carId.id IN (" + carIdList + ")";
```

✅ **Ensure `carIdList` is a properly formatted string list of IDs** to avoid syntax errors.

## Next Steps
- **Validate the query against the database** to ensure correct joins.
- **Check for any null values in `toyotaCarCode`** and confirm that `LEFT JOIN` retrieves all relevant data.
- **Optimize indexing on `carId` in both tables** to improve query performance.


# XML Ingestion, Processing, and Export Using Java, Hibernate, XSD, and Oracle

## **Overview**
This document provides a complete guide to processing XML data based on an XSD schema, storing it in an **Oracle database using Hibernate**, and exporting processed data back to XML.

## **Components and Relationships**
| **Component** | **Role** |
|--------------|---------|
| **Java** | Processes XML, validates it against XSD, and interacts with Hibernate. |
| **Hibernate** | ORM tool that maps Java classes to Oracle database tables. |
| **XSD (XML Schema Definition)** | Defines the structure and validation rules for XML data. |
| **Oracle Database** | Stores processed XML data. |
| **XML** | Format used for ingesting and exporting data. |

---

## **1️⃣ Define XSD Schema**
The XSD schema ensures XML data is structured correctly before processing.

```xml
<!-- ingest_schema.xsd -->
<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <xsd:element name="IngestRecord">
        <xsd:complexType>
            <xsd:sequence>
                <xsd:element name="RecordId" type="xsd:int"/>
                <xsd:element name="Name" type="xsd:string"/>
                <xsd:element name="Timestamp" type="xsd:dateTime"/>
                <xsd:element name="Status" type="xsd:string"/>
            </xsd:sequence>
        </xsd:complexType>
    </xsd:element>
</xsd:schema>
```

---

## **2️⃣ Example XML File for Ingestion**

```xml
<!-- ingest_data.xml -->
<IngestRecord xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="ingest_schema.xsd">
    <RecordId>1</RecordId>
    <Name>Sample Data</Name>
    <Timestamp>2024-03-01T12:00:00</Timestamp>
    <Status>Processed</Status>
</IngestRecord>
```

---

## **3️⃣ Define Hibernate Entity (Mapped to Oracle Table)**

```java
@Entity
@Table(name = "ingest_record")
public class IngestRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int recordId;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "timestamp")
    private LocalDateTime timestamp;
    
    @Column(name = "status")
    private String status;
    
    // Getters and Setters
}
```

---

## **4️⃣ Configure Hibernate for Oracle (persistence.xml)**

```xml
<persistence xmlns="http://xmlns.jcp.org/xml/ns/persistence" version="2.1">
    <persistence-unit name="myPersistenceUnit">
        <properties>
            <property name="jakarta.persistence.jdbc.driver" value="oracle.jdbc.OracleDriver"/>
            <property name="jakarta.persistence.jdbc.url" value="jdbc:oracle:thin:@localhost:1521:xe"/>
            <property name="jakarta.persistence.jdbc.user" value="myuser"/>
            <property name="jakarta.persistence.jdbc.password" value="mypassword"/>
            <property name="hibernate.dialect" value="org.hibernate.dialect.Oracle12cDialect"/>
            <property name="hibernate.hbm2ddl.auto" value="update"/>
        </properties>
    </persistence-unit>
</persistence>
```

---

## **5️⃣ XML Validation Against XSD**

```java
public class XMLValidator {
    public static boolean validateXML(String xmlPath, String xsdPath) {
        try {
            SchemaFactory factory = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
            Schema schema = factory.newSchema(new File(xsdPath));
            Validator validator = schema.newValidator();
            validator.validate(new StreamSource(new File(xmlPath)));
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
```

---

## **6️⃣ Parsing XML and Storing Data in Database**

```java
public class XMLProcessor {
    public static void main(String[] args) {
        if (XMLValidator.validateXML("ingest_data.xml", "ingest_schema.xsd")) {
            try {
                DocumentBuilder dBuilder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
                Document doc = dBuilder.parse(new File("ingest_data.xml"));
                doc.getDocumentElement().normalize();
                
                EntityManagerFactory emf = Persistence.createEntityManagerFactory("myPersistenceUnit");
                EntityManager em = emf.createEntityManager();
                em.getTransaction().begin();
                
                IngestRecord record = new IngestRecord();
                record.setRecordId(Integer.parseInt(doc.getElementsByTagName("RecordId").item(0).getTextContent()));
                record.setName(doc.getElementsByTagName("Name").item(0).getTextContent());
                record.setTimestamp(LocalDateTime.parse(doc.getElementsByTagName("Timestamp").item(0).getTextContent()));
                record.setStatus(doc.getElementsByTagName("Status").item(0).getTextContent());
                
                em.persist(record);
                em.getTransaction().commit();
                em.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

---

## **7️⃣ Export Data from Database to XML**

```java
public class XMLExporter {
    public static void exportToXML() {
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("myPersistenceUnit");
        EntityManager em = emf.createEntityManager();
        
        List<IngestRecord> records = em.createQuery("SELECT r FROM IngestRecord r", IngestRecord.class).getResultList();
        em.close();
        
        try (FileWriter writer = new FileWriter("exported_data.xml")) {
            writer.write("<IngestRecords>\n");
            for (IngestRecord record : records) {
                writer.write("  <IngestRecord>\n");
                writer.write("    <RecordId>" + record.getRecordId() + "</RecordId>\n");
                writer.write("    <Name>" + record.getName() + "</Name>\n");
                writer.write("    <Timestamp>" + record.getTimestamp() + "</Timestamp>\n");
                writer.write("    <Status>" + record.getStatus() + "</Status>\n");
                writer.write("  </IngestRecord>\n");
            }
            writer.write("</IngestRecords>");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

---

## **📌 Summary**
✅ **Validate XML against XSD** before processing.
✅ **Parse XML and store data in Oracle using Hibernate**.
✅ **Retrieve data from Oracle and export it to an XML file**.

# Manual CSV Export in AG Grid with Data Flattening

## Overview

This guide explains how to manually extract and flatten data from AG Grid using JavaScript, especially in scenarios where the default `gridApi.exportDataAsCsv()` method does not handle nested or complex data correctly. It also details how the JavaScript spread operator (`...`) is used to safely clone and manipulate row data before export.

---

## Why Manual Export?

AG Grid's native CSV export can struggle with:

- Nested fields
- Master/detail (nested) grids
- Complex row transformations

Manually building a flat array of row data allows full control over the export format.

---

## Example: Manual Flattening Code

```ts
const flatData = [];
this.gridApi.forEachNode(node => {
  const row = { ...node.data };
  // Optionally flatten child/detail data
  flatData.push(row);
});
```

---

## Line-by-Line Explanation

### `const flatData = [];`

Initializes an empty array that will hold all the processed rows in a flat format.

### `this.gridApi.forEachNode(node => {`

Uses AG Grid’s built-in `forEachNode()` method to iterate through all rows in the grid.

### `const row = { ...node.data };`

Clones the row data using the **spread operator**:

- `node.data` is the raw row data.
- `{ ...node.data }` creates a **shallow copy** to avoid mutating the original grid data.
- node.data is the original object from AG Grid.
- { ...node.data } creates a new object with the same properties.
- This is called a shallow copy (a simple, one-level duplication).
- We are not modifying the grid's internal data — not just a copy. This can lead to:
    - Broken grid state
    - Unexpected UI bugs
    - Incorrect data exports late

### `flatData.push(row);`

Adds the flattened/cloned row to the `flatData` array.

---

## Adding Flattened Detail Grid Data

If using master/detail grids:

```ts
if (node.detailGridOptions?.api) {
  const detailData = [];
  node.detailGridOptions.api.forEachNode(detailNode => {
    detailData.push(detailNode.data);
  });
  row.detailSummary = JSON.stringify(detailData); // or flatten into row fields
}
```

This captures nested grid data and optionally transforms it into a string or separate fields.

---

## Exporting `flatData` as CSV

You can convert `flatData` to a CSV using libraries like [PapaParse](https://www.papaparse.com/):

```ts
import Papa from 'papaparse';
const csv = Papa.unparse(flatData);

// Trigger download
const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = 'export.csv';
link.click();
```

---

## Summary

| Component               | Purpose                                             |
| ----------------------- | --------------------------------------------------- |
| `forEachNode()`         | Iterate over all rows in the grid                   |
| Spread operator (`...`) | Clone each row’s data without mutating the original |
| `flatData`              | Stores processed row data ready for export          |
| PapaParse               | Converts array of objects to CSV string             |

This approach gives complete control over how the export behaves, supports custom formats, and handles nested or complex data reliably.

---

**Author:** Frontend Engineering Team\
**Last Updated:** [Insert Date]

What is to clone each rows data without mutating the original? What does that mean? 

# Language Selection API Integration

This project demonstrates how a frontend written in TypeScript communicates with a Java Spring Boot backend to handle user-selected language options. The frontend sends language selections as key-value pairs in a JSON payload. The backend receives this data, maps it to internal values (such as database IDs), and processes it accordingly.

---

## 📁 Project Overview

### Frontend (TypeScript)
- Constructs a payload of user-selected languages:
  ```ts
  const controllers = {
    languageSelection1: "Swahili",
    languageSelection2: "English"
  };
  ```
- Sends the payload to the backend using `fetch()` or Angular's `HttpClient`.

- Optionally loops through keys and values:
  ```ts
  Object.entries(controllers).forEach(([key, value]) => {
    console.log(`Key: ${key}, Value: ${value}`);
  });
  ```

---

### Backend (Java - Spring Boot)

#### DTO (Data Transfer Object)
```java
public class LanguageSelectionDTO {
    private String languageSelection1;
    private String languageSelection2;

    // Getters and Setters
    public String getLanguageSelection1() { return languageSelection1; }
    public void setLanguageSelection1(String languageSelection1) { this.languageSelection1 = languageSelection1; }

    public String getLanguageSelection2() { return languageSelection2; }
    public void setLanguageSelection2(String languageSelection2) { this.languageSelection2 = languageSelection2; }
}
```

#### REST Controller
```java
@RestController
@RequestMapping("/api")
public class LanguageController {

    @PostMapping("/language-selection")
    public ResponseEntity<String> handleLanguageSelection(@RequestBody LanguageSelectionDTO dto) {
        String lang1 = dto.getLanguageSelection1();
        String lang2 = dto.getLanguageSelection2();

        int lang1Id = mapLanguageToId(lang1);
        int lang2Id = mapLanguageToId(lang2);

        // Logic for saving or processing

        return ResponseEntity.ok("Languages processed");
    }

    private int mapLanguageToId(String language) {
        switch (language.toLowerCase()) {
            case "swahili": return 1;
            case "english": return 2;
            default: return -1;
        }
    }
}
```

---

## 🗃️ Sample Database Table (language_options)

| id | language   |
|----|------------|
| 1  | Swahili    |
| 2  | English    |
| 3  | French     |

---

## 🔁 Workflow Summary

1. User selects languages on the frontend.
2. Payload is constructed and sent to the backend.
3. Backend receives JSON and maps it to DTO.
4. Backend uses helper logic or database lookup to convert languages to internal IDs.
5. Data can be persisted, logged, or used in business logic.

---

## 📦 API Endpoint

- **URL:** `POST /api/language-selection`
- **Headers:** `Content-Type: application/json`
- **Sample Body:**
  ```json
  {
    "languageSelection1": "Swahili",
    "languageSelection2": "English"
  }
  ```
- **Response:**
  ```json
  "Languages processed"
  ```

---

## ✅ Technologies Used

- Frontend: TypeScript or Angular
- Backend: Java + Spring Boot
- Optional DB: MySQL / PostgreSQL

---

## 📌 Notes

- Language mapping can be improved by querying the database instead of using hardcoded logic.
- Input validation and error-handling can be added based on production needs.


```ts
const exportParamsFlattened: any[] = [];
this.gridApi.forEachNode((node: any) => {
    if (node.isSelected()) {
        const row = { ...node.data };
        exportParamsFlattened.push(row);
    }
});
```

## Another option 

```ts
const flattenNestedRows = (rows: any[]) => {
    let flattenedRows = [];
    rows.forEach(row => {
        // Check if the row has nested data and flatten accordingly
        flattenedRows.push(row);
        if (row.nestedRows && Array.isArray(row.nestedRows)) {
            row.nestedRows.forEach(nestedRow => {
                // Add the nested row with the parent row's info (if needed)
                flattenedRows.push({ ...row, ...nestedRow });
            });
        }
    });
    return flattenedRows;
};

const flattenedData = flattenNestedRows(gridData);
this.exportGrid.api.setGridOption('rowData', flattenedData);
this.exportGrid.api.exportDataAsCsv(exportParams);
```

## Option 1

```ts
// First, get all selected nodes (parent and nested rows)
const selectedNodes = this.gridApi.getSelectedNodes();  // This will return both parent and nested rows that are selected
const exportParamsFlattened: any[] = [];

// Loop through selected nodes
selectedNodes.forEach(node => {
    // If it's a parent row, you can export it (you can add extra logic to check specific row types)
    if (node.data) {
        exportParamsFlattened.push(node.data);  // Add the parent row data to export list
    }

    // If the node has nested rows, iterate through the nested rows
    if (node.data && node.data.nestedRows) {
        // Iterate through the nested rows to check if any are selected
        node.data.nestedRows.forEach(nestedRow => {
            // Check if the nested row is selected
            if (nestedRow.isSelected) {
                // Add the selected nested row to the export list
                exportParamsFlattened.push(nestedRow);
            }
        });
    }
});

// Now, export the selected nested rows
this.gridApi.exportDataAsCsv(Object.assign({ onlySelected: true }, { rowData: exportParamsFlattened }));
```

## Option 2

```ts
// First, get all selected parent nodes
const selectedNodes = this.gridApi.getSelectedNodes();
const exportParamsFlattened: any[] = [];

// Loop through selected parent nodes
selectedNodes.forEach(parentNode => {
    // Add parent row data
    exportParamsFlattened.push(parentNode.data);

    // Check if the parent node has a child grid (nested rows)
    const childGrid = parentNode.gridOptions.api; // Access the child grid API

    if (childGrid) {
        const childSelectedRows = childGrid.getSelectedRows();  // Get selected rows in the child grid (nested rows)
        
        // Add selected child rows to the export data
        childSelectedRows.forEach(childRow => {
            exportParamsFlattened.push(childRow);
        });
    }
});

// Now, export the selected rows (both parent and nested selected rows)
this.gridApi.exportDataAsCsv(Object.assign({ onlySelected: true }, { rowData: exportParamsFlattened }));
```

Here's a README template that explains how to access selected rows in AG Grid and export them to a CSV file. You can copy and paste this into a README file for your project:

---

# AG Grid - Exporting Selected Rows to CSV

## Description
This guide explains how to **access selected rows** in an AG Grid instance and export them to a CSV file. It provides two main approaches:

1. **Accessing selected rows using AG Grid's API (`getSelectedRows()` and `getSelectedNodes()`)**
2. **Accessing selected rows manually via HTML/CSS (fallback)**

The solution also includes functionality to **export the selected rows to CSV**.

## Prerequisites

Ensure you have the following:
- **AG Grid** installed and set up in your project.
- **Basic knowledge of TypeScript** and **JavaScript**.

## Accessing Selected Rows

### 1. Using `getSelectedRows()` (Preferred)

To get the selected rows in the grid, use AG Grid's `getSelectedRows()` method. This method will return the selected **parent rows**. Here's how to use it:

```typescript
const selectedRows = this.gridApi.getSelectedRows();  // Get selected parent rows

// Ensure that selectedRows is not empty
if (selectedRows.length > 0) {
    console.log(selectedRows); // Log the selected rows for debugging

    // Export the selected rows to CSV
    this.exportToCsv(selectedRows);
} else {
    console.log("No rows are selected");
}
```

### 2. Accessing Selected Rows via HTML (Fallback)

If `getSelectedRows()` doesn’t return the expected data, you can **manually access the selected rows** via their HTML elements using `querySelectorAll()`. Here's an example of how to access selected rows via HTML:

```typescript
// Accessing selected rows manually by querying the DOM
const selectedRowsHtml = document.querySelectorAll('.ag-row-selected');  // .ag-row-selected is the CSS class for selected rows in AG Grid

// Collect the data for each selected row
const selectedRows = [];
selectedRowsHtml.forEach(row => {
    const rowData = row.getAttribute('data-row-index');  // Assuming the row has a row-index attribute
    selectedRows.push(rowData);
});

// Export the selected rows to CSV
this.exportToCsv(selectedRows);
```

### **Note**: The `querySelectorAll('.ag-row-selected')` method targets rows with the `ag-row-selected` class, which is used by AG Grid for selected rows.

## Exporting Selected Rows to CSV

Once you've obtained the selected rows, you can **export them to a CSV file**. Here's a function to handle exporting the data:

```typescript
exportToCsv(selectedRows: any[]) {
    // Construct CSV from selected rows (assuming selectedRows is an array of objects)
    const headers = Object.keys(selectedRows[0]).join(',');  // Get the column headers (keys of the first row)
    const rows = selectedRows.map(row => Object.values(row).join(','));  // Convert row values to CSV string

    const csvContent = [headers, ...rows].join('\n');  // Combine headers and rows into CSV format

    // Create a Blob from the CSV content and trigger a download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'selected_rows.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();  // Trigger the download
    document.body.removeChild(link);  // Clean up the DOM after download
}
```

### **Explanation**:
1. **Get Column Headers**: `Object.keys(selectedRows[0])` retrieves the column headers for the CSV.
2. **Get Row Values**: `Object.values(row)` gets the row values and converts them into CSV format.
3. **Create Blob**: A `Blob` is created with the type `text/csv;charset=utf-8;` to ensure the file is saved with the correct encoding.
4. **Download**: The download is triggered programmatically using a hidden link element, and the CSV file is saved with the name `selected_rows.csv`.

## Final Steps

1. **Test Your Implementation**: 
   - Ensure that **rows are properly selected** in your grid.
   - Verify that the **CSV export works** and contains the expected data.

2. **Customize as Needed**: 
   - If your grid has a **nested structure** or uses **complex filtering** or **sorting**, you might need to adjust how rows are selected and exported.

---

## Conclusion

By using `getSelectedRows()` or directly accessing selected rows from the HTML, you can easily gather selected data and export it into a CSV file. The approach outlined in this guide helps you work around any issues with the default AG Grid methods, ensuring you can access and export the selected data to CSV even when working with more complex grid structures.


## OPTION 450

```ts 
// Now loop through the rows and export each master row and its nested rows (child rows)
    const allRows = masterDataCsv.split('\r\n').slice(1); // Skip the header and get data rows --- masterData ni ile ya kwanza

    // Assuming only 3 rows (1 master row + 2 nested rows), we export them in order
    allRows.forEach((masterRowCsv, index) => {
        exportData.push(this.prepareForExport(masterRowCsv));  // Add master row to export

        // For each master row, we need to export its child grid (nested rows)
        if (index < 2) {  // We only have 2 nested rows, check index 0 (master) and 1 (first child), and 2 (second child)
            const masterRowNode = this.gridApi.getRowNode(index); // Get the row node for the current master row
            const nestedGridRows = this.getNestedRowsForMasterRow(masterRowNode);  // Get child (nested) rows for this master row

            // Export the nested rows (child rows) under the corresponding master row
            nestedGridRows.forEach(childRow => {
                const childRowCsv = this.convertRowToCsv(childRow); // Convert each child row to CSV format
                exportData.push(this.prepareForExport(childRowCsv));  // Add child row to export data
            });
        }
    });

    return exportData;


// Helper function to get nested rows for a master row (child rows)
private getNestedRowsForMasterRow(masterRowNode: any): any[] {
    // Assuming the master row node contains a grid options for the nested grid (child grid)
    const childGridApi = masterRowNode.gridOptions.api;
    return childGridApi.getSelectedRows();  // Get the selected rows from the nested (child) grid
}

// Helper function to convert row to CSV format
private convertRowToCsv(row: any): string {
    return Object.values(row).join(',');  // Convert row object values to CSV format (comma-separated)
}

```


## OPTION 451 - get all the grids and columns and see which has data

```ts
public handleExportCsvWithDataOnly(exportParams: BaseExportParams): void {
    const exportData: Array<string> = new Array<string>();

    // Get all columns in the grid
    const allColumns = this.gridApi.getAllColumns();
    const selectedRows = this.gridApi.getDisplayedRowAtIndex(0); // Get the first displayed row to check headers, or iterate all rows

    const columnsWithData: string[] = [];  // This will store columns that have data
    const rows = this.gridApi.getAllRows();  // Get all rows in the grid

    // Check each column for data
    allColumns.forEach(col => {
        let hasData = false;
        
        // Iterate over all rows and check if the column has data
        rows.forEach(row => {
            if (row[col.colId] && row[col.colId] !== '') {
                hasData = true; // Found data for this column in the row
            }
        });

        // If data exists for this column, add it to columnsWithData
        if (hasData) {
            columnsWithData.push(col.colId);  // Add column ID (or header name) to columnsWithData
        }
    });

    // Prepare the header row (only including columns with data)
    const headerRow = allColumns
        .filter(col => columnsWithData.includes(col.colId))  // Only include columns with data
        .map(col => col.getColDef().headerName)
        .join(',');

    exportData.push(headerRow);  // Add header row to export data

    // Loop through each row and create CSV data for the selected columns
    rows.forEach(row => {
        const rowData = columnsWithData.map(colId => row[colId] || '');  // Get data for each selected column
        exportData.push(rowData.join(','));  // Join row data with commas and add to export data
    });

    // Export the data
    this.exportCsv(exportData);
}
```

**Toyota Java Service Architecture Overview**

This document provides an overview of the architectural structure and responsibilities of each package in the `toyota` Java service, with a focus on its JMS (Java Message Service) integration.

---

## 1. Controller

The `controller` package exposes REST endpoints to interact with the Toyota service.

*  Manages configuration-related endpoints.
* Allows clients to perform data queries.
* Handles retry settings and configurations.
* Triggers synchronization workflows, often interfacing with JMS queues.

**Example Usage:**

```http
GET /toyota/config
POST /toyota/retry/config
```

---

## 2. Converter

Responsible for transforming JMS messages into a more processable format.

* Converts raw JMS messages into a `Map<String, Object>` structure.

**Example:**

```java
Map<String, Object> data = converter.convert(message);
```

---

## 3. Daemon

Houses background scheduled jobs.

*  Scheduled job that retries failed operations or message deliveries.

**Example:**

```java
@Scheduled(cron = "0 0/5 * * * ?")
public void retryFailedMessages() { /* retry logic */ }
```

---

## 4. Error Handler

Global error handling layer.

* Captures and processes exceptions thrown in controller layer.

**Example:**

```java
@ControllerAdvice
public class ErrorHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handle(Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
    }
}
```

---

## 5. JMS

Handles message-based asynchronous communication.

### Listener:

*  Listens to the JMS queue and processes messages accordingly.

**Example:**

```java
@JmsListener(destination = "toyota.sync.queue")
public void receiveSyncMessage(String message) {
    // Processing logic
}
```

### Sender:

*  Defines JMS constants (e.g., queue names).
*  Enum or logic to manage message priorities.
*  Tracks supported JMS versions.
* Sends query messages to JMS queues.
* Detects and handles expired JMS messages.

**Example:**

```java
jmsTemplate.convertAndSend(TOYOTA_SYNC_QUEUE, message, m -> {
    m.setJMSPriority(HIGH_PRIORITY);
    return m;
});
```

---

## 6. Security

Encapsulates security-related utilities.

* **toyotaSecurityHelper.java**: Interface for security operations.
* **toyotaSecurityHelperImpl.java**: Implements authentication, token validation, etc.

**Example:**

```java
if (securityHelper.isValidToken(token)) {
    // Allow operation
}
```

---

## 7. Service

Contains business logic, orchestration, and implementation classes.

### Configuration:

* Logic for retrieving and updating configuration data.

### Query:

* Query business logic and data retrieval.

### Retry:

*  Retry rules and configuration.
*  Core retry logic.

### Sync:

*  Handles sync workflows and JMS message dispatch.

### Utility:

* Maps metadata formats (e.g., DTOs to entities).

**Example:**

```java

```

---

## Summary Architecture Flow:

```plaintext
Client --> Controller --> Service --> JMS Sender --> JMS Queue
                                         |
                           <--- JMS Listener (e.g. toyotaSyncQueueList)
                                         |
                           --> Processing --> Retry Daemon / Converter
```

---

This modular breakdown allows for scalable development, separation of concerns, and reliable asynchronous message processing using JMS.



# Java Message Service (JMS) - Overview and Example

## What is JMS?

**Java Message Service (JMS)** is a Java API that allows applications to create, send, receive, and read messages in a loosely coupled, asynchronous, and reliable way. JMS is commonly used for integrating different components of a distributed system through **message queues** and **topics**.

### Key Features:
- **Asynchronous communication**: Producers send messages without waiting for consumers to be ready.
- **Reliable delivery**: Messages are persisted until consumed.
- **Loosely coupled architecture**: Sender and receiver do not need to be online at the same time.

---

## JMS in Action – Conceptual Flow

1. **Producer** sends a message to a **JMS Queue**.
2. **Broker** (like ActiveMQ or RabbitMQ) stores the message.
3. **Consumer/Listener** receives and processes the message asynchronously.

---

## JMS Terminologies

| Term           | Description |
|----------------|-------------|
| **Queue**      | Point-to-point destination. One message to one receiver. |
| **Topic**      | Publish-subscribe destination. One message to multiple subscribers. |
| **Message**    | Data sent between applications. |
| **Producer**   | Component that sends messages. |
| **Consumer**   | Component that receives messages. |
| **Broker**     | Middleware (e.g. ActiveMQ) that routes messages. |

---

## Example – Toyota Service with JMS

Let’s say you want to sync Toyota metadata using JMS:

### Sender: `toyotaSyncQueryJmsMessages.java`

```java
@Autowired
private JmsTemplate jmsTemplate;

public void sendSyncRequest(String payload) {
    jmsTemplate.convertAndSend("toyota.sync.queue", payload, message -> {
        message.setJMSPriority(8); // High priority
        message.setStringProperty("messageVersion", "v1.0");
        return message;
    });
}


Here is a copy-paste-friendly `README.md` explaining **JMS (Java Message Service)** with context and example relevant to your Toyota service:

---

````markdown
# Java Message Service (JMS) - Overview and Example

## What is JMS?

**Java Message Service (JMS)** is a Java API that allows applications to create, send, receive, and read messages in a loosely coupled, asynchronous, and reliable way. JMS is commonly used for integrating different components of a distributed system through **message queues** and **topics**.

### Key Features:
- **Asynchronous communication**: Producers send messages without waiting for consumers to be ready.
- **Reliable delivery**: Messages are persisted until consumed.
- **Loosely coupled architecture**: Sender and receiver do not need to be online at the same time.

---

## JMS in Action – Conceptual Flow

1. **Producer** sends a message to a **JMS Queue**.
2. **Broker** (like ActiveMQ or RabbitMQ) stores the message.
3. **Consumer/Listener** receives and processes the message asynchronously.

---

## JMS Terminologies

| Term           | Description |
|----------------|-------------|
| **Queue**      | Point-to-point destination. One message to one receiver. |
| **Topic**      | Publish-subscribe destination. One message to multiple subscribers. |
| **Message**    | Data sent between applications. |
| **Producer**   | Component that sends messages. |
| **Consumer**   | Component that receives messages. |
| **Broker**     | Middleware (e.g. ActiveMQ) that routes messages. |

---

## Example – Toyota Service with JMS

Let’s say you want to sync Toyota metadata using JMS:

### Sender: `toyotaSyncQueryJmsMessages.java`

```java
@Autowired
private JmsTemplate jmsTemplate;

public void sendSyncRequest(String payload) {
    jmsTemplate.convertAndSend("toyota.sync.queue", payload, message -> {
        message.setJMSPriority(8); // High priority
        message.setStringProperty("messageVersion", "v1.0");
        return message;
    });
}
````

### Listener: `toyotaSyncQueueList.java`

```java
@JmsListener(destination = "toyota.sync.queue")
public void receiveMessage(String message) {
    System.out.println("Received sync message: " + message);
    // Process the sync request
}
```

---

## Tools Typically Used

| Tool             | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| **ActiveMQ**     | Open-source JMS broker                            |
| **JmsTemplate**  | Spring’s abstraction to send/receive JMS messages |
| **@JmsListener** | Annotation to define a JMS consumer               |

---

## Benefits in Toyota Service Context

* **Decoupling**: Controllers or services can send data to queues without knowing who processes it.
* **Retry Mechanism**: If processing fails, daemon jobs (e.g., `toyotaErrorRetryJob`) can reprocess messages.
* **Scalability**: Listeners can scale horizontally to consume more messages in parallel.

---

## Final Notes

* **JMS is ideal** for situations where asynchronous processing is needed (e.g., syncing metadata or retrying failed operations).
* **Ensure durability** and **dead-letter queue** support for failed message handling in production environments.

```


```

Based on your description, you're experiencing a **404 error** for a JSON file (`iac-definitions.json`) after upgrading to **Angular 18**, and you're also seeing missing UI components, potentially related to **Angular Material Stepper**. Let's break it down and provide a systematic approach to troubleshooting:

---

## 🔎 Breakdown of the Problem

### 1. **Error**

```
404 - iac-definitions.json not found at \common\js\IAX\s\IAC
```

* This likely means the file either **does not exist**, is **not copied during build**, or the **path is broken**.
* It could also be that **Angular 18’s stricter file path resolution** or **base href configuration** is interfering.

### 2. **Missing Component/UI**

* You mentioned that only the top component loads, and a second one (possibly controlled by a stepper or some logic) **doesn’t show up**.
* You suspect the issue is related to **Angular Material Stepper**, and you found the `material/` folder empty or not present.

---

## ✅ Step-by-Step Fix Suggestions

### ✅ Step 1: **Fix the 404 for `iac-definitions.json`**

* Confirm that the JSON file is located in the expected path in your `src/` folder.
* If it's a static asset, **ensure it's listed in `angular.json` under `assets`**:

```json
"assets": [
  "src/favicon.ico",
  "src/assets",
  "src/common/js/IAX/s/IAC/iac-definitions.json"
]
```

* If the path is dynamically loaded (e.g., via `HttpClient.get()`), confirm the **relative path** in your code matches where it's built.

  ```ts
  this.http.get('/assets/common/js/IAX/s/IAC/iac-definitions.json');
  ```

---

### ✅ Step 2: **Fix Material Stepper or Missing Module**

* Check that you're importing **Angular Material Stepper modules** properly in the component’s or shared module:

```ts
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
```

* Also ensure `BrowserAnimationsModule` is in your `AppModule`.

* Run:

```bash
npm install @angular/material@18 @angular/cdk@18
```

* If the `material/` folder appears empty, it could be a corrupted install. Try:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

### ✅ Step 3: **Inspect HTML for Second Component**

* If the second component isn’t loading, ensure:

  * It's included in the current route/template.
  * It's **declared in the right module**.
  * There are **no errors in the browser console** that are silently preventing its load.
  * If using \*ngIf, make sure the condition is true.

```html
<app-top-component></app-top-component>
<app-missing-component *ngIf="showSecondComponent"></app-missing-component>
```

---

### ✅ Step 4: **Look for Breaking Changes in Angular 18**

Angular 18 has minor but **strict compiler and dependency changes**. Review:

* Routes
* Component selectors
* Import paths
* Template syntax (check for deprecated APIs)

---

### ✅ Step 5: **Enable Debug Logs**

Use console logs and Angular DevTools to:

* Check if the second component is being created
* Inspect the DOM and lifecycle hooks (`ngOnInit`, etc.)

---

## 🧪 Optional: Fallback Diagnostic

If the app broke after Angular upgrade:

```bash
ng update
ng lint
ng build --verbose
```

Look for missing dependencies, deprecated APIs, or unexpected behavior.

---

## 📌 Summary

| Issue                           | Fix                                              |
| ------------------------------- | ------------------------------------------------ |
| `iac-definitions.json` 404      | Add it to `assets` in `angular.json`             |
| Missing Angular Material folder | Reinstall `@angular/material` and `@angular/cdk` |
| Stepper not rendering           | Re-import `MatStepperModule`, confirm HTML logic |
| Component not showing           | Check module declarations and \*ngIf conditions  |
| Angular 18 changes              | Run `ng lint`, use Angular DevTools              |

---

Would you like to share your `angular.json` file, part of the HTML file with the missing component, or any code using the JSON file? I can help tailor the fix even better.


Thanks — now we’re getting to the core issue:

---

### 🔍 What’s happening?

When you render this:

```html
<p-tab> {{ activeTab.tab }} </p-tab>
```

You see:

```
[object Object]
```

repeated 5 times.

---

### ✅ Why this is happening:

You're binding `activeTab.tab`, which is an **object**, and using `{{ activeTab.tab }}` in the template — Angular will call `.toString()` on it, and unless overridden, that returns:

```
[object Object]
```

You’re rendering the **whole tab object** instead of its `label`.

---

## ✅ How to Fix It

Here’s what you need to do:

---

### ✅ 1. Update Template to Show Each Tab's Label (and fix syntax):

```html
<p-tabs [value]="activeTab" (valueChange)="tabChanged($event)" class="navigation-tab-menu">
  <p-tablist>
    @for (tab of chipTabs; track tab.route) {
      <p-tab [value]="tab">
        <span>{{ tab.label }}</span>
      </p-tab>
    }
  </p-tablist>
</p-tabs>
```

> 🔄 This now binds each `p-tab` to the **tab object** (`[value]="tab"`)
> and displays the **label** of each tab (`{{ tab.label }}`)

---

### ✅ 2. Update `chipTabs` Structure

Ensure `chipTabs` looks like this in your `.ts`:

```ts
chipTabs = [
  { label: 'Tab One', route: 'tab_One' },
  { label: 'Tab Two', route: 'tab_Two' },
  { label: 'Tab Three', route: 'tab_Three' },
  { label: 'Tab Four', route: 'tab_Four' },
  { label: 'Tab Five', route: 'tab_Five' }
];
```

> If you’re using an enum or service that defines these values, that's fine — just make sure each item has a `label` and an identifier (e.g., `route` or `value`).

---

### ✅ 3. Set and Track Active Tab Properly

In your component:

```ts
activeTab = this.chipTabs[0]; // or wherever your default is

tabChanged(newTab: any) {
  this.activeTab = newTab;
  console.log('Switched to:', newTab.label); // no more [object Object]
}
```

---

### 🔄 Alternate: Track by string instead of object (if needed)

If you want to bind by a string value (like the route or enum key), use:

```html
<p-tabs [value]="activeTabKey" (valueChange)="tabChanged($event)">
  <p-tablist>
    @for (tab of chipTabs; track tab.route) {
      <p-tab [value]="tab.route">
        {{ tab.label }}
      </p-tab>
    }
  </p-tablist>
</p-tabs>
```

And then in `.ts`:

```ts
activeTabKey = 'tab_Two'; // or default value from enum

tabChanged(route: string) {
  this.activeTabKey = route;
  const tab = this.chipTabs.find(t => t.route === route);
  console.log('Changed to tab:', tab?.label);
}
```

---

## ✅ Summary

| Problem                     | Fix                                                               |
| --------------------------- | ----------------------------------------------------------------- |
| `[object Object]` in the UI | Use `{{ tab.label }}` not `{{ tab }}`                             |
| Incorrect `value` binding   | Use `[value]="tab"` instead of full object                        |
| Need to track by key        | Use `[value]="tab.route"` and update active route string manually |

---

Would you like help switching to route-based tab tracking (`routerLink` integration)?



