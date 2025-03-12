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




