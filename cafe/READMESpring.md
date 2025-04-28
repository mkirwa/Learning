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






