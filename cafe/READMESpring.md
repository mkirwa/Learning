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

---
**Author:** Development Team  
**Last Updated:** [Insert Date]




