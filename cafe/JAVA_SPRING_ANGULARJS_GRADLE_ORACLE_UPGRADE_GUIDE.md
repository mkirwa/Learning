# Java Spring + AngularJS + Gradle + Oracle JDBC Beginner Guide

> **Purpose:** Explain the pieces commonly found in an older or enterprise Java/Spring backend with an AngularJS frontend, Oracle database access, Gradle build scripts, Groovy setup scripts, Apache Axis, Tomcat, and Oracle Security Developer Tools (OSDT).  
>
> This guide assumes you are relatively new to Java and uses one running example: **a Car Inventory application**.

---

# 1. The BLUF

If you only remember one thing, remember this:

**Your application is made of layers, and each file/tool has a different job.**

```text
AngularJS browser application
        |
        | HTTP request, usually JSON
        v
Spring Controller
        |
        v
Spring Service
        |
        v
Repository / DAO
        |
        v
JDBC / DataSource
        |
        v
Oracle JDBC Driver
        |
        v
Oracle Database
```

Around those application layers are build and deployment tools:

```text
build.gradle
   |
   | tells Gradle:
   | - which Java/Spring libraries are required
   | - which Oracle JDBC driver is required
   | - how to compile/test/package the application
   v
Gradle build
   |
   v
JAR or WAR
   |
   | possibly copied/deployed by SetupDoc.groovy
   v
Tomcat
   |
   v
Running Spring application
```

A useful mental model is:

- **Gradle** gets the ingredients and builds the application.
- **JARs** are packages containing compiled Java code and resources.
- **Tomcat** provides a web-server/servlet runtime for many traditional Java web applications.
- **Spring** creates and connects application objects for you.
- **JDBC** is Java's standard database API.
- **Oracle JDBC** is Oracle's implementation that understands how to talk to an Oracle database.
- **DataSource** is an object that knows how to give your application database connections.
- **AngularJS** runs in the browser and calls Spring endpoints.
- **Groovy setup scripts** often automate deployment/environment setup.
- **Axis** is commonly found in older applications that consume or expose SOAP web services.
- **OSDT** is Oracle Security Developer Tools and is unrelated to normal SQL unless the application also uses Oracle security/PKI/XML-security functionality.

---

# 2. Our Running Example: Car Inventory

Imagine an application where a browser shows cars from an Oracle table.

Oracle table:

```sql
CREATE TABLE CAR (
    ID          NUMBER PRIMARY KEY,
    CAR_CODE    VARCHAR2(20),
    DESCRIPTION VARCHAR2(200),
    ENABLED     NUMBER(1)
);
```

The user opens the AngularJS page and clicks **Load Cars**.

The flow is:

```text
AngularJS
    GET /api/cars
        |
        v
CarController
        |
        v
CarService
        |
        v
CarRepository
        |
        v
JdbcTemplate
        |
        v
DataSource
        |
        v
Oracle JDBC driver
        |
        v
Oracle database
```

This single example will be used throughout the guide.

---

# 3. What Is `build.gradle`?

`build.gradle` is a **Gradle build script**.

Gradle is the program that builds your Java application.

A beginner-friendly way to think about it is:

> `build.gradle` is the recipe Gradle follows to turn your source code into a runnable application.

It can tell Gradle:

1. which Java version to use,
2. which external libraries to download,
3. where those libraries come from,
4. how to run tests,
5. whether to create a JAR or WAR,
6. how to package files,
7. what should or should not be included in the final deployment.

Example:

```groovy
plugins {
    // Adds normal Java compilation tasks.
    id 'java'

    // Adds the api/implementation dependency separation.
    id 'java-library'

    // Creates a WAR file for deployment to an external servlet container
    // such as Tomcat.
    id 'war'
}

repositories {
    // Search Maven Central for third-party dependencies.
    mavenCentral()
}

dependencies {

    // Spring Web contains things such as:
    // @RestController
    // @RequestMapping
    // HTTP request/response infrastructure
    implementation 'org.springframework:spring-webmvc:...'

    // Spring JDBC contains JdbcTemplate and other database helpers.
    implementation 'org.springframework:spring-jdbc:...'

    // Oracle JDBC driver.
    //
    // If our Java source only uses standard JDBC/DataSource interfaces
    // and Oracle's driver is needed only when the application actually runs,
    // runtimeOnly may be appropriate.
    runtimeOnly 'com.oracle.database.jdbc:ojdbc11:...'

    // JUnit is needed while compiling and running tests,
    // but is not part of the production application.
    testImplementation 'org.junit.jupiter:junit-jupiter:...'
}
```

The exact versions in a real project must match the Spring, Java, Oracle, and Gradle versions being used.

---

# 4. What Is a Dependency?

A **dependency** is code written somewhere else that your application needs.

Suppose you write:

```java
JdbcTemplate jdbcTemplate;
```

You did not personally write `JdbcTemplate`.

Spring did.

Therefore your build needs the JAR that contains `JdbcTemplate`.

Gradle downloads that dependency and places it on the appropriate **classpath**.

---

# 5. What Is a Classpath?

The **classpath** is essentially a list of places where Java should look for classes.

If your source contains:

```java
import org.springframework.jdbc.core.JdbcTemplate;
```

Java must be able to find:

```text
org/springframework/jdbc/core/JdbcTemplate.class
```

inside one of the JARs on the classpath.

There are different classpaths for different stages:

```text
compileClasspath
    Libraries needed while compiling Java source.

runtimeClasspath
    Libraries needed when the program actually runs.

testCompileClasspath
    Libraries needed to compile tests.

testRuntimeClasspath
    Libraries needed while tests run.
```

This distinction is the reason Gradle has dependency types such as:

```groovy
api
implementation
runtimeOnly
testImplementation
```

---

# 6. `runtimeOnly`

Example:

```groovy
runtimeOnly 'com.oracle.database.jdbc:ojdbc11:...'
```

`runtimeOnly` means:

> "My application needs this dependency while it is running, but my own source code does not need it directly in order to compile."

A classic example is a JDBC driver.

Your repository might use only standard interfaces:

```java
import javax.sql.DataSource;
import java.sql.Connection;
```

Those interfaces are already known to Java.

Your source may not say:

```java
import oracle.jdbc.OracleDriver;
```

However, at runtime something still has to understand:

```text
jdbc:oracle:thin:@...
```

That something is the Oracle JDBC driver.

So:

```text
Compile time:
    Java sees DataSource and Connection.
    Oracle driver might not be directly needed by source code.

Runtime:
    An actual connection to Oracle is requested.
    Oracle's JDBC implementation is required.
```

## Important exception

If your Java source directly imports an Oracle class:

```java
import oracle.jdbc.datasource.impl.OracleDataSource;
```

then Oracle JDBC classes are needed at **compile time too**.

In that situation, making the *only* Oracle dependency `runtimeOnly` would normally be insufficient unless another compile dependency happens to provide those classes.

You might instead see:

```groovy
implementation 'com.oracle.database.jdbc:ojdbc11:...'
```

or, in a shared library:

```groovy
api 'com.oracle.database.jdbc:ojdbc11:...'
```

The correct scope depends on how the dependency appears in the code.

---

# 7. What Is JDBC?

JDBC stands for **Java Database Connectivity**.

JDBC is a standard Java API that lets Java applications work with relational databases.

The important point is:

```text
JDBC is the common Java contract.

Oracle JDBC is Oracle's implementation of that contract.
```

This is similar to saying:

```text
Interface        = rules
Implementation   = actual object that follows the rules
```

A simplified JDBC example:

```java
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class CarDao {

    public void findCars(Connection connection) throws Exception {

        // The SQL we want Oracle to execute.
        String sql = "SELECT ID, CAR_CODE FROM CAR";

        // Ask the database connection to prepare the SQL.
        PreparedStatement statement =
                connection.prepareStatement(sql);

        // Execute the query.
        ResultSet results = statement.executeQuery();

        // Move through each returned database row.
        while (results.next()) {

            long id = results.getLong("ID");
            String carCode = results.getString("CAR_CODE");

            System.out.println(id + " " + carCode);
        }
    }
}
```

Spring's `JdbcTemplate` makes this considerably easier.

---

# 8. JDBC vs Oracle JDBC

JDBC contains common interfaces/classes such as:

```java
java.sql.Connection
java.sql.PreparedStatement
java.sql.ResultSet
javax.sql.DataSource
```

Oracle supplies classes that implement or extend JDBC behavior, for example:

```java
oracle.jdbc.datasource.OracleDataSource
oracle.jdbc.datasource.impl.OracleDataSource
```

Conceptually:

```text
Your code
    |
    v
JDBC API
    |
    v
Oracle JDBC driver
    |
    v
Oracle network protocol
    |
    v
Oracle database
```

You could theoretically change databases and keep much of your code using generic JDBC interfaces, although real enterprise applications often contain vendor-specific SQL and Oracle-specific APIs.

---

# 9. What Could `database.jdbc` Mean?

`database.jdbc` is **not a universal Java or Spring keyword**.

Its meaning depends on your project's Gradle configuration.

For example, an organization might create this:

```groovy
ext {
    database = [
        jdbc: 'com.oracle.database.jdbc:ojdbc11:...'
    ]
}
```

Then this:

```groovy
runtimeOnly database.jdbc
```

is effectively similar to:

```groovy
runtimeOnly 'com.oracle.database.jdbc:ojdbc11:...'
```

So:

```text
database
    |
    +-- jdbc
         |
         +-- "com.oracle.database.jdbc:ojdbc11:..."
```

The company created a reusable variable so the full Maven coordinate does not have to be repeated everywhere.

To determine exactly what `database.jdbc` means in your project, search the repository for:

```text
database =
database.jdbc
ext {
dependencies.gradle
versions.gradle
libs.versions.toml
```

The value may be declared in:

```text
build.gradle
settings.gradle
gradle/*.gradle
a company Gradle plugin
a version catalog
```

---

# 10. What Could `custom.com` Mean?

`custom.com` is also not inherently a Java/Spring keyword.

It could be several things.

## Possibility A: part of a dependency coordinate

Example:

```groovy
implementation 'com.custom:car-common:4.1.0'
```

Maven/Gradle dependencies commonly use:

```text
group : artifact : version
```

Example:

```text
com.custom          car-common           4.1.0
   |                    |                  |
 group               artifact            version
```

## Possibility B: a company Maven repository

Example:

```groovy
repositories {
    maven {
        url = uri('https://repo.custom.com/maven')
    }
}
```

This means:

> "Gradle, look at our company's artifact server when searching for JARs."

## Possibility C: a custom Gradle object/property

A company plugin can define almost any property name.

Therefore a line containing `custom.com` should always be interpreted with its surrounding code.

---

# 11. What Does `api` Mean in Gradle?

`api` is normally used with Gradle's `java-library` plugin.

Example:

```groovy
api 'com.custom:car-domain:2.0.0'
```

`api` means:

> "This dependency is not only used internally by my library; types from this dependency are part of my library's public contract."

Suppose module A has:

```java
public class CarService {

    public ExternalCar getCar() {
        ...
    }
}
```

`ExternalCar` comes from another dependency.

Anyone compiling against `CarService` must also know what `ExternalCar` is.

Therefore exposing that dependency with `api` can make sense.

Compare:

```groovy
api 'com.example:car-types:1.0'
```

with:

```groovy
implementation 'com.example:car-types:1.0'
```

A simplified mental model:

```text
api
    "My consumers need to see this dependency."

implementation
    "I need it internally, but consumers should not automatically
     depend on it as part of my public API."

runtimeOnly
    "I need it when the application runs, not to compile my source."
```

For application code that is not itself a reusable library, `implementation` is usually more common than `api`.

---

# 12. What Is Apache Axis?

Apache Axis is associated with **SOAP web services**.

It is especially common in older enterprise Java applications.

Suppose your car application must call a legacy insurance service:

```text
Car Application
       |
       | SOAP XML
       v
Insurance Web Service
```

SOAP usually involves XML such as:

```xml
<soap:Envelope>
    <soap:Body>
        <getInsuranceRate>
            <carCode>TOYOTA</carCode>
        </getInsuranceRate>
    </soap:Body>
</soap:Envelope>
```

Axis can:

- create SOAP requests,
- send them,
- receive SOAP responses,
- map XML data to Java objects,
- generate Java client classes from WSDL definitions.

A WSDL is a contract describing a SOAP web service.

So this:

```text
WSDL
   |
   | code generation
   v
Generated Java classes
   |
   | used by application
   v
Axis SOAP runtime
   |
   v
Remote SOAP service
```

---

# 13. Why Might Axis Be `runtimeOnly`?

You might see:

```groovy
runtimeOnly axis.someLibrary
```

The reason can be that the application's source code compiles against:

- generated interfaces,
- another wrapper library,
- standard APIs,

while the Axis implementation is loaded only when SOAP calls execute.

However, this is project-specific.

If source code directly imports Axis classes:

```java
import org.apache.axis.client.Call;
import org.apache.axis.client.Service;
```

then Axis is also a compile-time dependency.

The rule is:

```text
Direct source import?
    Usually compile dependency.

Only dynamically/reflection/service-provider loaded at runtime?
    runtimeOnly may be enough.
```

---

# 14. What Is `rootSpec.exclude`?

If you see something resembling:

```groovy
rootSpec.exclude(...)
```

it is likely connected to Gradle's **copy/archive packaging rules**.

Gradle archive tasks such as WAR/JAR use copy specifications.

An exclusion means:

> "When assembling this output, do not copy/package files that match this rule."

A more common-looking example is:

```groovy
war {
    exclude 'WEB-INF/lib/old-library.jar'
}
```

Conceptually:

```text
Files Gradle could package
    |
    +-- application classes
    +-- Spring libraries
    +-- JDBC driver
    +-- Axis library
    +-- old-library.jar   <-- excluded
```

Why would an old enterprise project exclude a JAR?

Common reasons include:

1. Tomcat/application server already provides it.
2. Another version must be used instead.
3. Two copies would produce class-loading conflicts.
4. The library belongs in a separate shared server directory.
5. Security policy prohibits packaging it.
6. The deployment script inserts the library later.

Be cautious during upgrades: removing an exclusion without understanding why it exists can produce duplicate or incompatible classes at runtime.

---

# 15. JAR vs WAR

A **JAR** is a Java Archive.

Example:

```text
car-service.jar
```

It may contain:

```text
com/custom/car/CarService.class
com/custom/car/CarRepository.class
application.properties
```

A **WAR** is a Web Application Archive.

Traditional servlet-container applications frequently deploy:

```text
car-application.war
```

to Tomcat.

Typical WAR contents:

```text
car-application.war
|
+-- WEB-INF/
    |
    +-- classes/
    |   +-- compiled application classes
    |
    +-- lib/
        +-- Spring JARs
        +-- JDBC JARs
        +-- company JARs
```

Traditional deployment:

```text
build.gradle
    |
    v
Gradle
    |
    v
car-application.war
    |
    v
Tomcat/webapps/
    |
    v
Tomcat starts application
```

Modern Spring Boot applications often run as executable JARs instead, but many enterprise systems still use external Tomcat and WAR deployment.

---

# 16. What Is `SetupDoc.groovy`?

`SetupDoc.groovy` is **not a standard Spring file**.

It is almost certainly a custom project or company script.

Groovy is a JVM language with syntax that is often shorter than Java.

Gradle itself commonly uses Groovy syntax.

A file called:

```text
SetupDoc.groovy
```

might automate things such as:

- preparing installation folders,
- transferring files,
- installing JARs,
- configuring Tomcat,
- testing JDBC connectivity,
- copying certificates,
- configuring Oracle security libraries,
- generating setup documentation.

Its exact purpose can only be known by reading the file.

---

# 17. What Might `FTPHelper` Be?

`FTPHelper` is probably a **helper class written by your application/company or provided by another internal library**.

It is not a Spring keyword.

Its purpose may be something like:

```groovy
FTPHelper.upload(
    "car-app.war",
    "/server/tomcat/webapps/car-app.war"
)
```

Conceptually:

```text
Local build machine
      |
      | FTP/SFTP
      v
Remote server
      |
      v
Tomcat deployment directory
```

Search for:

```text
class FTPHelper
import ...FTPHelper
FTPHelper.
```

The import statement is especially valuable because it tells you which package/library owns the class.

---

# 18. What Might `Chan` or `Channel` Mean?

`Chan` by itself is not a standard Spring concept.

In deployment scripts, it may be a variable referring to a network/SSH/SFTP channel.

For example, libraries such as SSH clients use the idea of:

```text
Session
   |
   v
Channel
   |
   v
SFTP command/file transfer
```

You might see something conceptually like:

```groovy
def chan = session.openChannel("sftp")
chan.connect()
```

Do not assume this interpretation without looking at the import and declaration.

Search upward for:

```text
def chan
Channel chan
chan =
import ...Channel
```

---

# 19. Why Would `SetupDoc.groovy` Mention JDBC?

A deployment/setup script may need to verify:

> "Can this environment actually connect to the Oracle database?"

For example:

```groovy
// Illustrative only.
def jdbcUrl = "jdbc:oracle:thin:@//dbhost:1521/CARS"

println "Testing database connection..."
```

The script might:

- install the JDBC driver,
- build a JDBC URL,
- test credentials,
- create configuration files,
- document driver locations.

This is different from your normal application's repository code.

---

# 20. Why Would `SetupDoc.groovy` Mention a JAR?

A setup script commonly needs to copy/install specific JARs.

Example:

```text
build/libs/car-app.war
oracle/ojdbc11.jar
oracle/osdt_core.jar
oracle/osdt_cert.jar
```

The script may decide:

```text
Which JAR?
Where is it?
Which Tomcat instance gets it?
Should it go in WEB-INF/lib?
Should it go in TOMCAT_HOME/lib?
```

Those choices affect Java class loading.

---

# 21. What Is a Tomcat Instance?

Apache Tomcat is a Java servlet container/web server.

A **Tomcat instance** means a particular configured/running Tomcat environment.

For example:

```text
/opt/tomcat-car-dev
/opt/tomcat-car-test
/opt/tomcat-car-prod
```

Each might have its own:

```text
conf/
logs/
webapps/
temp/
work/
lib/
```

Your WAR could be deployed to:

```text
/opt/tomcat-car-prod/webapps/car.war
```

Tomcat starts the application and gives Spring an environment in which to serve HTTP requests.

---

# 22. What Is Oracle OSDT?

OSDT means **Oracle Security Developer Tools**.

You may see JARs such as:

```text
osdt_core.jar
osdt_cert.jar
osdt_xmlsec.jar
```

These are not ordinary JDBC database drivers.

They are associated with Oracle security functionality such as:

- certificates,
- cryptography,
- PKI,
- XML signatures/encryption,
- SAML/security protocols.

So keep these concepts separate:

```text
ojdbc*.jar
    Oracle database connectivity.

osdt_*.jar
    Oracle security tooling.
```

An old application may need both.

---

# 23. The Most Important OracleDataSource Concept

A `DataSource` is basically a **factory that gives you database connections**.

Think of it this way:

```text
DataSource
    |
    | getConnection()
    v
Connection
    |
    | execute SQL
    v
Oracle Database
```

Instead of manually creating a database connection everywhere, code asks the DataSource for one.

---

# 24. `oracle.jdbc.pool.OracleDataSource`

Older applications may contain:

```java
import oracle.jdbc.pool.OracleDataSource;
```

Then:

```java
OracleDataSource ods = new OracleDataSource();

ods.setURL("jdbc:oracle:thin:@//dbhost:1521/CARS");
ods.setUser("car_app");
ods.setPassword("secret");
```

Here:

```text
OracleDataSource
    = the class/type.

ods
    = merely the variable name chosen by the programmer.

setURL(...)
setUser(...)
setPassword(...)
    = setter methods configuring the object.
```

`ods` probably means:

```text
Oracle Data Source
O      D    S
```

but the variable could legally be called anything:

```java
OracleDataSource database;
OracleDataSource oracle;
OracleDataSource myDataSource;
```

---

# 25. `oracle.jdbc.datasource.impl.OracleDataSource`

Newer Oracle JDBC APIs use the newer data-source package organization.

A common pattern is:

```java
// Interface: describes Oracle-specific DataSource behavior.
import oracle.jdbc.datasource.OracleDataSource;

public class DatabaseFactory {

    public OracleDataSource createDataSource() throws Exception {

        // Concrete implementation of the interface.
        OracleDataSource ods =
                new oracle.jdbc.datasource.impl.OracleDataSource();

        ods.setURL("jdbc:oracle:thin:@//dbhost:1521/CARS");
        ods.setUser("car_app");
        ods.setPassword("secret");

        return ods;
    }
}
```

This demonstrates a fundamental Java concept:

```text
Interface
    oracle.jdbc.datasource.OracleDataSource
          ^
          |
          | implemented by
          |
Concrete class
    oracle.jdbc.datasource.impl.OracleDataSource
```

A simplified analogy:

```java
List<String> names = new ArrayList<>();
```

Here:

```text
List
    interface

ArrayList
    implementation
```

Similarly:

```java
OracleDataSource ods =
    new oracle.jdbc.datasource.impl.OracleDataSource();
```

means:

> "Store an object created from Oracle's concrete implementation in a variable typed as the OracleDataSource interface."

---

# 26. `pool.OracleDataSource` vs `datasource.impl.OracleDataSource`

This is important during an Oracle JDBC upgrade.

Older code may use:

```java
oracle.jdbc.pool.OracleDataSource
```

Newer Oracle documentation recommends, for common modern scenarios:

```java
oracle.jdbc.datasource.impl.OracleDataSource
```

Oracle has retained some older package classes for compatibility, but newer APIs increasingly center on the `oracle.jdbc.datasource` and `oracle.jdbc.datasource.impl` packages.

Therefore, after upgrading an Oracle JDBC driver, you may see:

- deprecation warnings,
- package changes,
- source compilation failures,
- recommendations to replace old Oracle classes.

Do **not** blindly replace every import.

First determine:

1. Which Oracle JDBC driver version you currently use.
2. Which version you are upgrading to.
3. Whether code relies on special behavior from an older class.
4. Whether you use a connection pool such as HikariCP or Oracle UCP.
5. Whether Tomcat itself creates the DataSource through JNDI.

---

# 27. What Does `ods.set...` Mean?

Example:

```java
OracleDataSource ods =
        new oracle.jdbc.datasource.impl.OracleDataSource();

ods.setURL("jdbc:oracle:thin:@//dbhost:1521/CARS");
ods.setUser("car_app");
ods.setPassword("secret");
```

Read it in English:

```text
Create an Oracle DataSource object.
Call it "ods".

Tell ods which Oracle database URL to use.
Tell ods which username to use.
Tell ods which password to use.
```

Then:

```java
Connection connection = ods.getConnection();
```

means:

> "Ask the configured Oracle DataSource to create/give me a database connection."

---

# 28. JDBC URL

Example:

```text
jdbc:oracle:thin:@//dbhost:1521/CARS
```

Breakdown:

```text
jdbc
    Java database connectivity URL.

oracle
    Database vendor.

thin
    Oracle's pure-Java Thin driver.

dbhost
    Database server hostname.

1521
    Typical Oracle listener port.

CARS
    Database service name in this example.
```

---

# 29. How Spring Uses a DataSource

Now we connect Oracle to Spring.

Example configuration:

```java
package com.example.car.config;

import oracle.jdbc.datasource.OracleDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.SQLException;

@Configuration
public class DatabaseConfiguration {

    /*
     * @Configuration tells Spring:
     *
     * "This class contains application configuration.
     *  Look inside it for objects that Spring should manage."
     */


    @Bean
    public DataSource dataSource() throws SQLException {

        /*
         * @Bean tells Spring:
         *
         * "Call this method during application startup.
         *  Take the returned object and put it into the
         *  Spring ApplicationContext."
         *
         * The ApplicationContext is roughly Spring's registry
         * of managed objects.
         */

        OracleDataSource ods =
                new oracle.jdbc.datasource.impl.OracleDataSource();

        /*
         * Configure where Oracle lives.
         */
        ods.setURL("jdbc:oracle:thin:@//dbhost:1521/CARS");

        /*
         * Configure database credentials.
         *
         * DO NOT hard-code production passwords like this.
         * They normally come from environment variables,
         * a secret manager, JNDI, or configuration.
         */
        ods.setUser("car_app");
        ods.setPassword("secret");

        /*
         * Return it as the standard javax.sql.DataSource type.
         *
         * This allows the rest of the application to depend
         * on the standard DataSource abstraction instead of
         * Oracle-specific code.
         */
        return ods;
    }
}
```

Then another Spring bean can request it:

```java
@Repository
public class CarRepository {

    private final JdbcTemplate jdbcTemplate;

    public CarRepository(DataSource dataSource) {

        /*
         * Spring sees that this constructor needs a DataSource.
         *
         * Spring already has the DataSource created by
         * DatabaseConfiguration.dataSource().
         *
         * Therefore Spring injects that object here.
         */
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }
}
```

This is **dependency injection**.

---

# 30. Spring Dependency Injection

Without Spring:

```java
public class CarService {

    private CarRepository repository =
            new CarRepository(...);
}
```

`CarService` must figure out how to construct everything itself.

With Spring:

```java
@Service
public class CarService {

    private final CarRepository repository;

    public CarService(CarRepository repository) {
        this.repository = repository;
    }
}
```

Spring effectively says:

```text
CarService needs CarRepository.

I already created a CarRepository bean.

I will pass it into the CarService constructor.
```

This is one of the biggest reasons Spring exists.

---

# 31. A Spring Application That Uses Spring Extensively

Below is an intentionally verbose example.

## Application entry point

```java
package com.example.car;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CarApplication {

    /*
     * @SpringBootApplication is a convenience annotation.
     *
     * Among other things, it tells Spring Boot to:
     *
     * 1. Treat this as a configuration class.
     * 2. Enable Spring Boot auto-configuration.
     * 3. Scan this package and subpackages for Spring components.
     *
     * During startup, Spring discovers classes such as:
     *
     * @RestController
     * @Service
     * @Repository
     * @Configuration
     * @Component
     */

    public static void main(String[] args) {

        /*
         * This starts Spring.
         *
         * Spring creates an ApplicationContext,
         * discovers beans,
         * creates them,
         * injects their dependencies,
         * configures the web server,
         * and eventually starts accepting HTTP requests.
         */
        SpringApplication.run(CarApplication.class, args);
    }
}
```

---

# 32. Domain Object / DTO

```java
package com.example.car.api;

public class CarDto {

    /*
     * DTO = Data Transfer Object.
     *
     * This object is what we want to send across the HTTP boundary
     * to the AngularJS frontend.
     */

    private long id;
    private String carCode;
    private String description;
    private boolean enabled;

    public CarDto(
            long id,
            String carCode,
            String description,
            boolean enabled) {

        this.id = id;
        this.carCode = carCode;
        this.description = description;
        this.enabled = enabled;
    }

    public long getId() {
        return id;
    }

    public String getCarCode() {
        return carCode;
    }

    public String getDescription() {
        return description;
    }

    public boolean isEnabled() {
        return enabled;
    }
}
```

Spring/Jackson can serialize it to JSON:

```json
{
  "id": 10,
  "carCode": "TOY",
  "description": "Toyota 4Runner",
  "enabled": true
}
```

---

# 33. Repository Layer

```java
package com.example.car.repository;

import com.example.car.api.CarDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CarRepository {

    /*
     * @Repository tells Spring:
     *
     * "This class belongs to the persistence/database layer."
     *
     * Because component scanning finds this class,
     * Spring creates a CarRepository object for us.
     */


    private final JdbcTemplate jdbcTemplate;

    /*
     * Constructor injection.
     *
     * Spring sees:
     *
     * CarRepository requires JdbcTemplate.
     *
     * If Spring has a JdbcTemplate bean, it passes that bean here.
     *
     * Constructor injection is generally preferable to hiding
     * dependencies inside fields with @Autowired.
     */
    public CarRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }


    public List<CarDto> findAllEnabledCars() {

        /*
         * SQL still executes in Oracle.
         *
         * JdbcTemplate is only a Java helper around normal JDBC.
         */
        String sql =
                """
                SELECT ID,
                       CAR_CODE,
                       DESCRIPTION,
                       ENABLED
                  FROM CAR
                 WHERE ENABLED = 1
                 ORDER BY CAR_CODE
                """;

        /*
         * jdbcTemplate.query:
         *
         * 1. Gets a Connection from the configured DataSource.
         * 2. Creates/executes the SQL statement.
         * 3. Iterates over the ResultSet.
         * 4. Calls our lambda for each row.
         * 5. Closes JDBC resources correctly.
         */
        return jdbcTemplate.query(
                sql,
                (resultSet, rowNumber) -> {

                    /*
                     * Convert one database row into one Java object.
                     */
                    return new CarDto(
                            resultSet.getLong("ID"),
                            resultSet.getString("CAR_CODE"),
                            resultSet.getString("DESCRIPTION"),
                            resultSet.getInt("ENABLED") == 1
                    );
                }
        );
    }
}
```

---

# 34. Service Layer

```java
package com.example.car.service;

import com.example.car.api.CarDto;
import com.example.car.repository.CarRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CarService {

    /*
     * @Service tells Spring:
     *
     * "This class contains business logic."
     *
     * Spring will create a CarService bean.
     */


    private final CarRepository carRepository;


    /*
     * CarService depends on CarRepository.
     *
     * Spring supplies the repository when constructing this service.
     */
    public CarService(CarRepository carRepository) {
        this.carRepository = carRepository;
    }


    @Transactional(readOnly = true)
    public List<CarDto> getAvailableCars() {

        /*
         * @Transactional tells Spring to place transaction
         * behavior around this method.
         *
         * Conceptually Spring creates a proxy:
         *
         * BEGIN/obtain transaction
         *       |
         *       v
         * call getAvailableCars()
         *       |
         *       v
         * COMMIT or ROLLBACK
         *
         * readOnly=true tells Spring/database infrastructure that
         * this operation is intended only to read data.
         */

        List<CarDto> cars =
                carRepository.findAllEnabledCars();


        /*
         * Business rules could be added here.
         *
         * Example:
         * - remove cars customer is not authorized to view,
         * - enrich descriptions,
         * - call another service,
         * - calculate availability.
         */

        return cars;
    }
}
```

---

# 35. Controller Layer

```java
package com.example.car.controller;

import com.example.car.api.CarDto;
import com.example.car.service.CarService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cars")
public class CarController {

    /*
     * @RestController tells Spring MVC:
     *
     * "This object handles HTTP requests.
     *  Method return values should normally be written
     *  into the HTTP response body."
     */


    private final CarService carService;


    /*
     * Spring injects the CarService bean here.
     */
    public CarController(CarService carService) {
        this.carService = carService;
    }


    @GetMapping
    public List<CarDto> getCars() {

        /*
         * @GetMapping means this method handles:
         *
         * GET /api/cars
         *
         * The returned List<CarDto> is converted by Spring/Jackson
         * to JSON for the browser.
         */
        return carService.getAvailableCars();
    }
}
```

---

# 36. What Spring Actually Did for You

For those few classes, Spring may have done all of this:

```text
1. Started the application.
2. Scanned packages.
3. Found @Configuration.
4. Created the DataSource.
5. Auto-created/configured JdbcTemplate.
6. Found @Repository.
7. Created CarRepository.
8. Injected JdbcTemplate into CarRepository.
9. Found @Service.
10. Created CarService.
11. Injected CarRepository into CarService.
12. Found @RestController.
13. Created CarController.
14. Injected CarService into CarController.
15. Registered GET /api/cars.
16. Configured JSON serialization.
17. Added transaction interception around @Transactional.
18. Started or connected to the servlet web runtime.
```

That is why a Spring upgrade can affect many seemingly unrelated files.

---

# 37. AngularJS Frontend Example

If by "Angular JS" you mean **AngularJS 1.x**, a frontend might look like this:

```javascript
angular
    .module('carApp')
    .service('carService', function ($http) {

        /*
         * $http sends an HTTP request to the Spring backend.
         */
        this.getCars = function () {

            /*
             * Spring's @GetMapping("/api/cars")
             * handles this request.
             */
            return $http.get('/api/cars');
        };
    });
```

Controller:

```javascript
angular
    .module('carApp')
    .controller('CarController', function ($scope, carService) {

        /*
         * Initialize the screen with an empty list.
         */
        $scope.cars = [];


        $scope.loadCars = function () {

            carService.getCars()
                .then(function (response) {

                    /*
                     * Spring returned JSON.
                     *
                     * AngularJS converted the JSON response
                     * into JavaScript objects.
                     */
                    $scope.cars = response.data;
                })
                .catch(function (error) {

                    console.error('Could not load cars', error);
                });
        };
    });
```

HTML:

```html
<table>
    <tr ng-repeat="car in cars">
        <td>{{ car.id }}</td>
        <td>{{ car.carCode }}</td>
        <td>{{ car.description }}</td>
    </tr>
</table>
```

---

# 38. How AngularJS and Spring Are Connected

They are usually connected by **HTTP contracts**, not direct Java references.

```text
AngularJS
    |
    | GET /api/cars
    | Accept: application/json
    v
Spring Controller
    |
    v
JSON response
```

This is why a backend Spring upgrade can break the frontend even when no JavaScript changes were made.

Examples:

- endpoint path changed,
- authentication changed,
- CSRF rules changed,
- CORS rules changed,
- JSON property names changed,
- date formatting changed,
- null handling changed,
- HTTP status changed,
- exception/error JSON changed,
- servlet context path changed.

---

# 39. What You Need to Know Before a Spring Upgrade

The first rule is:

> **Do not start by changing Spring version numbers blindly.**

First build a map of the existing application.

You need to identify at least:

```text
Java/JDK version
Gradle wrapper version
Spring Framework version
Spring Boot version, if Boot is used
Spring Security version
Spring Data version, if used
Spring Batch version, if used
Hibernate/JPA version, if used
Oracle JDBC driver version
Oracle database version
Tomcat version
WAR vs executable JAR
Axis version
OSDT versions
company/internal libraries
AngularJS version
test libraries
CI/CD Java and Gradle versions
production server Java version
```

---

# 40. How to Find Those Versions

## Gradle wrapper

Look at:

```text
gradle/wrapper/gradle-wrapper.properties
```

You will see something resembling:

```text
distributionUrl=...gradle-8.x-bin.zip
```

or another Gradle version.

## Java

Run:

```bash
java -version
```

and:

```bash
./gradlew -version
```

Those can be different if Gradle uses a different JVM.

## Spring dependencies

Run:

```bash
./gradlew dependencies
```

For a more focused runtime tree:

```bash
./gradlew dependencies --configuration runtimeClasspath
```

Search for Spring:

```bash
./gradlew dependencies --configuration runtimeClasspath | grep spring
```

## Oracle JDBC

Use:

```bash
./gradlew dependencyInsight \
  --dependency ojdbc \
  --configuration runtimeClasspath
```

## Spring Framework

Example:

```bash
./gradlew dependencyInsight \
  --dependency spring-core \
  --configuration runtimeClasspath
```

## Tomcat

If embedded:

```bash
./gradlew dependencyInsight \
  --dependency tomcat \
  --configuration runtimeClasspath
```

If externally installed, inspect the server separately.

---

# 41. Understand Dependency Graphs Before Upgrading

You may explicitly request:

```groovy
implementation 'some-company-library:1.0'
```

but that library may itself depend on:

```text
Spring 5
Axis
old Oracle JDBC
old Jackson
javax.servlet
```

Those are **transitive dependencies**.

Example:

```text
your-app
   |
   +-- custom-company-lib:1.0
          |
          +-- spring-core:5.x
          +-- axis:1.x
          +-- old-security-lib
```

You might upgrade your own Spring declaration and still receive an old Spring JAR through another dependency.

That creates version conflicts.

Use:

```bash
./gradlew dependencyInsight
```

to find **why** a particular version is present.

---

# 42. Upgrade Strategy for a Large Codebase

The safest approach is incremental.

Do not attempt:

```text
Old Java
+ old Gradle
+ old Spring
+ old Tomcat
+ old Oracle JDBC
+ old company libraries
```

to:

```text
Everything newest
```

in one giant commit.

Instead, use controlled stages.

---

# 43. Phase 1 — Establish a Known-Good Baseline

Before upgrades:

```bash
./gradlew clean test
```

Then run integration tests.

Then manually test important user journeys.

For our car application:

```text
GET /api/cars works.
Search works.
Add car works.
Edit car works.
Database transaction rollback works.
Login works.
SOAP call works.
File transfer works.
Application deploys to Tomcat.
```

If tests are weak, add **characterization tests**.

A characterization test records existing behavior before you change internals.

Example:

```java
@SpringBootTest
class CarServiceIntegrationTest {

    @Autowired
    private CarService carService;

    @Test
    void shouldReturnOnlyEnabledCars() {

        List<CarDto> cars =
                carService.getAvailableCars();

        // This captures an important behavior that must survive the upgrade.
        assertTrue(
                cars.stream().allMatch(CarDto::isEnabled)
        );
    }
}
```

---

# 44. Phase 2 — Upgrade to the Latest Patch of Your Current Line

Example concept:

```text
Spring Boot 2.old
      |
      v
latest supported 2.x release
      |
      v
Spring Boot 3.x
```

or:

```text
Spring Boot 3.old
      |
      v
Spring Boot 3.5
      |
      v
Spring Boot 4
```

Why?

Because later patch versions often:

- show newer deprecation warnings,
- provide migration helpers,
- support transitional dependency versions,
- make the next major jump smaller.

---

# 45. Phase 3 — Separate JDK Upgrade From Spring Changes When Possible

Spring generations have minimum Java versions.

For example, Spring Framework 6 requires Java 17+.

Modern Spring Boot major versions also have Java baselines.

Therefore a Spring upgrade may force a JDK upgrade.

That affects:

```text
Source code
Gradle
CI
developer laptops
Tomcat
Oracle JDBC
company JARs
code-generation tools
Axis
Groovy
test tools
deployment scripts
```

Treat Java compatibility as a project by itself.

---

# 46. Gradle Must Support the JDK Too

The application Java version and Gradle launcher compatibility are related but distinct.

Check:

```bash
./gradlew -version
```

If you upgrade Java but leave an ancient Gradle wrapper, Gradle itself may fail before Java compilation even starts.

Gradle toolchains are useful:

```groovy
java {
    toolchain {
        languageVersion =
                JavaLanguageVersion.of(17)
    }
}
```

This makes the intended compilation JDK explicit.

---

# 47. The Big `javax` to `jakarta` Migration

This is one of the most important changes in newer Spring generations.

Older enterprise Java code often imports:

```java
import javax.servlet.http.HttpServletRequest;
import javax.persistence.Entity;
import javax.validation.Valid;
```

Newer Jakarta-based stacks use packages such as:

```java
import jakarta.servlet.http.HttpServletRequest;
import jakarta.persistence.Entity;
import jakarta.validation.Valid;
```

This is **not** merely cosmetic.

A class compiled against `javax.servlet.*` is not automatically the same type as one compiled against `jakarta.servlet.*`.

Search the codebase:

```bash
grep -R "import javax\." src/main/java
```

or with ripgrep:

```bash
rg "javax\." src/main/java
```

Then categorize each result.

Do not blindly replace every `javax` import because some `javax.*` packages remain part of Java SE.

Focus on Jakarta EE technologies such as:

```text
servlet
persistence
validation
transaction
annotation
ws.rs
xml.bind
```

depending on the application.

---

# 48. External Tomcat Is a Major Upgrade Constraint

If you deploy a WAR to external Tomcat, this relationship matters:

```text
Spring generation
      |
      v
Servlet API generation
      |
      v
Tomcat generation
```

You cannot assume an old Tomcat will run a new Jakarta-based application.

In a large enterprise upgrade, treat the runtime server as part of the application.

Questions:

```text
What Tomcat version is in DEV?
What version is in TEST?
What version is in PROD?
Who owns the server?
Can it be upgraded?
Does the server have shared JARs?
Does it provide the DataSource through JNDI?
Does SetupDoc.groovy install libraries into TOMCAT_HOME/lib?
```

These questions can be more important than editing Java source.

---

# 49. Oracle JDBC During the Spring Upgrade

Check the current driver:

```bash
./gradlew dependencyInsight \
  --dependency ojdbc \
  --configuration runtimeClasspath
```

Then search Java source:

```bash
rg "oracle\.jdbc" src
```

Look for:

```text
oracle.jdbc.pool.OracleDataSource
oracle.jdbc.datasource.impl.OracleDataSource
OracleDriver
OracleConnection
OracleTypes
```

The more Oracle-specific classes your code imports, the more likely a driver upgrade can require code changes.

If your repositories depend mostly on:

```java
DataSource
JdbcTemplate
Connection
PreparedStatement
ResultSet
```

the migration is usually easier.

---

# 50. Prefer Standard Interfaces at Boundaries

This:

```java
public class CarRepository {

    private final DataSource dataSource;

    public CarRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }
}
```

is less tightly coupled to Oracle than:

```java
public class CarRepository {

    private final oracle.jdbc.datasource.impl.OracleDataSource dataSource;

    ...
}
```

Configure Oracle-specific details in one configuration location and expose a standard:

```java
javax.sql.DataSource
```

or, under the relevant modern API stack, the standard DataSource type used by the JDK/JDBC API.

This limits how many files need Oracle-specific modifications.

---

# 51. Be Careful With Connection Pools

A `DataSource` and a **connection pool** are related but not identical concepts.

Without pooling:

```text
Request
   |
create physical DB connection
   |
use
   |
close
```

Creating physical connections is expensive.

Pooling:

```text
Pool
+-- connection 1
+-- connection 2
+-- connection 3
+-- connection 4

Request borrows connection 2
uses it
closes it
    |
    v
connection 2 returns to pool
```

Spring Boot commonly configures a connection pool automatically when appropriate dependencies are available.

An enterprise application may instead use:

- Tomcat JDBC pool,
- HikariCP,
- Oracle UCP,
- application-server/JNDI-managed pool.

Before changing `OracleDataSource` code, determine who owns pooling.

---

# 52. JNDI DataSource Case

An external Tomcat might create the database pool instead of Spring.

Tomcat configuration could conceptually define:

```text
jdbc/CarDatabase
```

Then Spring merely looks it up.

Flow:

```text
Tomcat
    |
    | creates DB pool
    v
JNDI name: jdbc/CarDatabase
    |
    v
Spring
    |
    v
CarRepository
```

If that is your architecture, replacing Java-side OracleDataSource creation may be completely unnecessary.

This is why you must determine where the DataSource actually comes from.

---

# 53. Spring Security Is Usually a High-Risk Area

Spring Security major upgrades commonly affect configuration APIs.

Search for:

```text
@EnableWebSecurity
SecurityFilterChain
WebSecurityConfigurerAdapter
HttpSecurity
csrf
cors
authorizeRequests
authorizeHttpRequests
antMatchers
requestMatchers
```

Also test the AngularJS behavior:

```text
Login
Logout
Session cookies
CSRF token
401 behavior
403 behavior
CORS
API authorization
```

A backend security upgrade can look like an AngularJS bug when the real issue is the server rejecting requests.

---

# 54. JSON Serialization Is an AngularJS Compatibility Risk

Suppose the old backend returned:

```json
{
  "carCode": "TOY",
  "enabled": true
}
```

and the upgraded backend returns:

```json
{
  "code": "TOY",
  "isEnabled": true
}
```

AngularJS code expecting:

```javascript
car.carCode
```

will break.

Therefore create API contract tests.

Example:

```java
@WebMvcTest(CarController.class)
class CarControllerTest {

    @Test
    void responseMustKeepCarCodeProperty() throws Exception {

        // Test omitted for brevity.
        //
        // The important point is to verify the exact JSON shape
        // expected by the AngularJS frontend.
    }
}
```

---

# 55. Axis Is a Special Risk in an Old Application

If the application still uses Apache Axis, identify:

```text
Axis 1 vs Axis2
WSDL files
generated Java source
SOAP endpoints
JAX-RPC/JAX-WS APIs
javax dependencies
custom serializers
SOAP handlers
authentication
TLS configuration
```

Older SOAP stacks often have assumptions tied to older Java/Jakarta libraries.

Do not upgrade Axis, Spring, Java, and SOAP-generated code simultaneously unless necessary.

First write integration tests around the SOAP boundary.

For example:

```java
@Test
void insuranceSoapServiceStillReturnsRate() {

    // Given a known test car
    //
    // When legacy SOAP client calls remote/test stub
    //
    // Then verify the same business result.
}
```

---

# 56. OSDT Is Another Compatibility Boundary

Search:

```bash
rg "osdt|oracle\.security" .
```

Determine:

```text
Which OSDT JARs are used?
Who provides them?
Are they packaged in the WAR?
Are they installed into Tomcat/lib?
Does SetupDoc.groovy copy them?
What Oracle product/version supplied them?
What features use them?
```

Do not assume they can simply be deleted because they are not JDBC drivers.

The application may depend on them for certificates, SAML, XML signatures, or other security processing.

---

# 57. Internal Company JARs Are Often the Real Blocker

Suppose:

```groovy
api 'com.custom:enterprise-framework:7.2'
```

and that company framework internally uses:

```text
Spring 5
javax.servlet
old Oracle JDBC
old Axis
```

Your application cannot safely migrate just by changing:

```groovy
springVersion = ...
```

You may need a new version of the company library.

Therefore for every internal dependency ask:

```text
Who owns it?
Is source available?
What Java version was it compiled with?
Which Spring generation does it expect?
Does it expose javax types in public APIs?
Is a Jakarta-compatible release available?
```

---

# 58. Why `api` Dependencies Matter During Upgrades

Suppose:

```groovy
api 'com.custom:legacy-api:1.0'
```

and its public method is:

```java
public javax.servlet.http.HttpServletRequest getRequest();
```

The legacy `javax` type has leaked through the module boundary.

That can force consumers to keep the old API or upgrade the shared module first.

This is exactly why `api` dependencies deserve special attention during large Spring upgrades.

---

# 59. A Practical Large-Codebase Upgrade Sequence

A useful sequence is:

```text
Step 1
Inventory everything.

Step 2
Get the current application green:
compile + unit tests + integration tests.

Step 3
Add tests around risky boundaries:
HTTP, database, SOAP, security.

Step 4
Upgrade to latest patch of current Spring line.

Step 5
Upgrade Gradle enough to support target JDK.

Step 6
Upgrade JDK.

Step 7
Resolve compiler/deprecation issues.

Step 8
Upgrade Spring/Spring Boot one major generation.

Step 9
Handle javax -> jakarta where applicable.

Step 10
Upgrade external Tomcat/servlet container as required.

Step 11
Upgrade Oracle JDBC and repair Oracle API usages.

Step 12
Validate Axis/SOAP integration.

Step 13
Validate OSDT/security integration.

Step 14
Upgrade incompatible internal company dependencies.

Step 15
Run AngularJS API regression tests.

Step 16
Deploy to DEV.

Step 17
Run smoke/integration/performance tests.

Step 18
Promote through controlled environments.
```

The exact order can change based on dependency constraints, but the goal is the same:

> Keep each change small enough that when something breaks, you know which change caused it.

---

# 60. Example of a Bad Upgrade Commit

Avoid:

```text
Commit:
"Upgrade platform"

Changes:
- Java 8 -> Java 21
- Gradle 5 -> Gradle 9
- Spring 5 -> Spring 7
- Boot 2 -> Boot 4
- Tomcat 9 -> 11
- Oracle JDBC old -> newest
- Axis upgrade
- OSDT upgrade
- AngularJS dependency changes
- security rewrite
- package javax -> jakarta
```

If the application fails with:

```text
NoClassDefFoundError
```

you now have ten possible causes.

---

# 61. Better Upgrade Commits

Example:

```text
Commit 1:
Add regression tests for /api/cars.

Commit 2:
Upgrade Spring Boot to latest patch on current major.

Commit 3:
Remove deprecated configuration.

Commit 4:
Upgrade Gradle wrapper.

Commit 5:
Move build to Java 17.

Commit 6:
Move Spring Boot major version.

Commit 7:
Migrate servlet imports from javax to jakarta.

Commit 8:
Upgrade Tomcat deployment environment.

Commit 9:
Upgrade Oracle JDBC driver.

Commit 10:
Migrate old OracleDataSource imports.

Commit 11:
Repair Axis integration.

Commit 12:
Run and document AngularJS regression suite.
```

Now each failure is easier to isolate.

---

# 62. Compile Errors vs Runtime Errors

This distinction is critical.

## Compile-time error

Example:

```text
package oracle.jdbc.pool does not exist
```

This means the compiler cannot find the class.

Investigate:

```text
Dependency scope
JAR version
changed package
removed API
Gradle compileClasspath
```

## Runtime error

Example:

```text
java.lang.NoClassDefFoundError:
oracle/security/...
```

Compilation succeeded, but the running application cannot find a class.

Investigate:

```text
runtimeOnly dependencies
WAR contents
Tomcat shared libs
rootSpec.exclude
SetupDoc.groovy copying
classpath order
duplicate JARs
```

That difference often tells you exactly which layer to inspect.

---

# 63. Spring Bean Errors

An upgrade may produce:

```text
NoSuchBeanDefinitionException
```

Meaning:

> Spring tried to inject an object, but no matching bean was registered.

Or:

```text
UnsatisfiedDependencyException
```

Meaning:

> Spring could not construct an object because one of its required dependencies could not be provided.

For example:

```java
@Service
public class CarService {

    private final CarRepository repository;

    public CarService(CarRepository repository) {
        this.repository = repository;
    }
}
```

If Spring no longer discovers `CarRepository`, creating `CarService` fails.

Check:

```text
component scanning
annotations
configuration class locations
conditional beans
profiles
bean names
qualifiers
changed auto-configuration
```

---

# 64. Class-Loading Errors

Old enterprise WAR applications frequently fail with:

```text
ClassNotFoundException
NoClassDefFoundError
NoSuchMethodError
AbstractMethodError
ClassCastException
```

`NoSuchMethodError` is especially suggestive of incompatible JAR versions.

Example:

```text
Code compiled against library version 2
but runtime loaded library version 1.
```

This can happen when:

```text
WAR contains library v2

AND

Tomcat/lib contains library v1
```

Then classloader behavior determines what wins.

This is why `rootSpec.exclude`, Tomcat shared JARs, and SetupDoc deployment logic matter during an upgrade.

---

# 65. Inspect the Built WAR

Never assume the correct dependencies are in the deployment.

After:

```bash
./gradlew clean war
```

inspect the artifact:

```bash
jar tf build/libs/car-app.war
```

Look for:

```text
WEB-INF/lib/spring-...
WEB-INF/lib/ojdbc...
WEB-INF/lib/axis...
WEB-INF/lib/osdt...
```

Compare that against Tomcat's:

```text
TOMCAT_HOME/lib
```

and any deployment/setup scripts.

---

# 66. Use `dependencyInsight` Constantly

Example:

```bash
./gradlew dependencyInsight \
  --dependency spring-core \
  --configuration runtimeClasspath
```

This answers:

> Why is this version of `spring-core` in the application?

Another:

```bash
./gradlew dependencyInsight \
  --dependency ojdbc \
  --configuration runtimeClasspath
```

Another:

```bash
./gradlew dependencyInsight \
  --dependency axis \
  --configuration runtimeClasspath
```

For upgrade work, this command is one of the most useful Gradle tools you can learn.

---

# 67. Search the Codebase by Technology

Before changing dependencies:

```bash
rg "@Autowired" src
rg "@Service" src
rg "@Repository" src
rg "@RestController" src
rg "@Configuration" src
rg "@Bean" src
rg "@Transactional" src
rg "javax\." src
rg "jakarta\." src
rg "oracle\.jdbc" src
rg "OracleDataSource" src
rg "JdbcTemplate" src
rg "DataSource" src
rg "org\.apache\.axis" src
rg "osdt|oracle\.security" .
rg "FTPHelper" .
rg "Tomcat|tomcat" .
```

This gives you a rough dependency map before editing anything.

---

# 68. Create an Upgrade Spreadsheet/Matrix

For a large codebase, track dependencies like this:

| Area | Current | Target | Source Usage | Runtime Usage | Risk |
|---|---|---|---|---|---|
| Java | old JDK | target JDK | everywhere | everywhere | High |
| Gradle | current wrapper | compatible wrapper | build | build | High |
| Spring | current | target | extensive | extensive | High |
| Tomcat | current | compatible target | none | hosting | High |
| Oracle JDBC | current | target | DataSource/JDBC | database | High |
| Axis | current | determine | SOAP client | SOAP | High |
| OSDT | current | determine | security code | security | Medium/High |
| AngularJS | current | unchanged initially | frontend | browser | Medium |
| company libs | versions | compatible versions | varies | varies | Very High |

Do not upgrade a row until you understand its dependencies on the other rows.

---

# 69. Spring Upgrade Example: Before and After Thinking

Suppose current code says:

```java
import oracle.jdbc.pool.OracleDataSource;

@Configuration
public class DatabaseConfiguration {

    @Bean
    public DataSource dataSource() throws SQLException {

        OracleDataSource ods =
                new OracleDataSource();

        ods.setURL(url);
        ods.setUser(username);
        ods.setPassword(password);

        return ods;
    }
}
```

Do not immediately change it just because you are upgrading Spring.

Ask:

```text
Did Spring require this change?
Or did the Oracle JDBC upgrade require it?
```

If Spring was upgraded but Oracle JDBC remained compatible, this code may not need immediate modification.

Later, when upgrading Oracle JDBC, you might intentionally change Oracle API usage:

```java
import oracle.jdbc.datasource.OracleDataSource;

@Configuration
public class DatabaseConfiguration {

    @Bean
    public DataSource dataSource() throws SQLException {

        OracleDataSource ods =
                new oracle.jdbc.datasource.impl.OracleDataSource();

        ods.setURL(url);
        ods.setUser(username);
        ods.setPassword(password);

        return ods;
    }
}
```

Separating those commits tells you which upgrade caused a failure.

---

# 70. Better Spring Configuration With External Properties

Do not hard-code this:

```java
ods.setPassword("secret");
```

Instead use configuration.

Example properties:

```properties
app.datasource.url=jdbc:oracle:thin:@//dbhost:1521/CARS
app.datasource.username=car_app
app.datasource.password=${CAR_DATABASE_PASSWORD}
```

Configuration:

```java
@Configuration
public class DatabaseConfiguration {

    @Bean
    public DataSource dataSource(
            @Value("${app.datasource.url}") String url,
            @Value("${app.datasource.username}") String username,
            @Value("${app.datasource.password}") String password)
            throws SQLException {

        OracleDataSource ods =
                new oracle.jdbc.datasource.impl.OracleDataSource();

        ods.setURL(url);
        ods.setUser(username);
        ods.setPassword(password);

        return ods;
    }
}
```

Now environments can use different values without recompiling Java.

---

# 71. Keep AngularJS Stable During the Backend Upgrade

If the main project is a Spring modernization, do **not** unnecessarily rewrite AngularJS at the same time.

First preserve the HTTP contract:

```text
same routes
same request payloads
same response payloads
same status codes
same authentication behavior
same cookie behavior
```

Once the backend upgrade is stable, a frontend modernization can be planned separately.

If this is truly AngularJS 1.x, remember that official AngularJS support ended in January 2022, so it should be treated as a separate technical-debt/security planning item rather than casually bundled into a Spring upgrade.

---

# 72. API Contract Test Example

A strong backend test can protect AngularJS.

```java
@WebMvcTest(CarController.class)
class CarControllerContractTest {

    /*
     * The actual test setup depends on your Spring version.
     *
     * The concept is what matters:
     *
     * Call GET /api/cars
     *
     * Assert:
     * - HTTP 200
     * - Content-Type JSON
     * - property is called "carCode"
     * - property is called "description"
     * - enabled is boolean
     */
}
```

This allows Spring internals to change without silently changing the frontend contract.

---

# 73. Database Contract Test Example

Protect Oracle behavior too.

```java
@SpringBootTest
class CarRepositoryIntegrationTest {

    @Autowired
    private CarRepository repository;


    @Test
    void queryStillMapsOracleRowsCorrectly() {

        List<CarDto> cars =
                repository.findAllEnabledCars();

        /*
         * Verify behavior important to business logic.
         *
         * Examples:
         * - Oracle NUMBER maps correctly.
         * - VARCHAR2 values are preserved.
         * - ordering still works.
         * - null handling remains correct.
         */
    }
}
```

---

# 74. SOAP Contract Test Example

Protect Axis integration:

```java
@SpringBootTest
class InsuranceSoapClientTest {

    @Test
    void shouldParseLegacySoapResponse() {

        /*
         * Use either:
         *
         * - a test SOAP server,
         * - WireMock/custom stub,
         * - recorded safe response fixture.
         *
         * Verify the same business data is produced before
         * and after the Java/Spring upgrade.
         */
    }
}
```

---

# 75. Deployment Contract Test

If SetupDoc.groovy and Tomcat are involved, the build succeeding is not enough.

Verify:

```text
WAR generated
WAR copied to correct server
required external JARs copied
excluded JARs still intentionally excluded
Tomcat starts
JNDI DataSource resolves
database login works
SOAP endpoint works
certificates/security libraries load
health/smoke endpoint succeeds
```

---

# 76. Spring Upgrade Failure Triage

When something breaks, first classify it:

```text
BUILD FAILURE
    Gradle/plugin/JDK/build-script problem.

COMPILATION FAILURE
    Source/API/dependency scope/package problem.

SPRING STARTUP FAILURE
    Bean/configuration/auto-configuration/property problem.

TOMCAT DEPLOYMENT FAILURE
    servlet/runtime/classloader/WAR problem.

DATABASE FAILURE
    JDBC/driver/DataSource/credentials/network/SQL problem.

SOAP FAILURE
    Axis/WSDL/XML/TLS/generated-client problem.

FRONTEND FAILURE
    API/security/CORS/JSON contract problem.
```

This prevents random edits.

---

# 77. Example End-to-End Debugging

Suppose after the upgrade AngularJS shows an empty grid.

Do not immediately blame AngularJS.

Follow the flow:

```text
1. Browser Network tab:
   Did GET /api/cars run?

2. HTTP status:
   200?
   401?
   403?
   500?

3. Spring Controller:
   Is request reaching CarController?

4. CarService:
   Is it being called?

5. Repository:
   Did SQL execute?

6. DataSource:
   Did it obtain a connection?

7. Oracle:
   Did query return rows?

8. JSON:
   Does response still use "carCode"?

9. AngularJS:
   Is response.data assigned correctly?
```

A layered architecture gives you a layered debugging process.

---

# 78. Questions I Would Ask About Your Specific Codebase

To make this guide specific to your actual upgrade, gather these exact snippets/files:

```text
1. build.gradle
2. settings.gradle
3. gradle-wrapper.properties
4. SetupDoc.groovy
5. imports around FTPHelper
6. declaration of Chan/Channel
7. every OracleDataSource import
8. code around ods.set...
9. DataSource/Spring configuration classes
10. application.properties / YAML
11. Tomcat/JNDI configuration if applicable
12. Spring version declarations
13. Oracle JDBC version declaration
14. Axis dependency/version
15. OSDT JAR declarations
16. one Controller
17. one Service
18. one Repository/DAO
19. Spring Security configuration
20. AngularJS $http service calling the backend
```

With those pieces, every vague concept such as `database.jdbc`, `custom.com`, `FTPHelper`, and `Chan` can be traced to its exact source instead of guessed.

---

# 79. A Short Explanation You Could Give to a Teammate

> "I’m mapping how our build-time dependencies, deployment scripts, server runtime, and Spring database configuration fit together before upgrading Spring. The main risk is that this is an older enterprise stack: Gradle packages some dependencies, SetupDoc/Tomcat may provide others at runtime, and the application uses Oracle-specific JDBC classes plus legacy libraries such as Axis/OSDT. I need to identify which dependencies are compile-time, runtime-only, server-provided, or exposed through shared APIs so that a Spring/JDK upgrade doesn’t create classpath or Jakarta compatibility problems."

---

# 80. Final Mental Model

```text
SOURCE CODE
    |
    | imports classes
    v
GRADLE
    |
    | resolves compile/runtime dependencies
    | compiles
    | tests
    | packages
    v
JAR / WAR
    |
    | perhaps manipulated by SetupDoc.groovy
    v
TOMCAT / RUNTIME
    |
    | starts Spring
    v
SPRING APPLICATION CONTEXT
    |
    | creates beans
    | injects dependencies
    | configures controllers/services/repositories
    v
JDBC / DATASOURCE
    |
    | asks Oracle driver for connections
    v
ORACLE DATABASE

ANGULARJS
    |
    | HTTP + JSON
    v
SPRING CONTROLLERS

AXIS
    |
    | SOAP + XML
    v
LEGACY REMOTE SERVICES

OSDT
    |
    | certificates / cryptography / Oracle security APIs
    v
SECURITY INTEGRATIONS
```

If you understand that diagram, the individual files become much easier to reason about.

---

# 81. References Used for the Concepts in This Guide

The concepts in this guide were checked against current official documentation from:

- Gradle User Manual — dependency configurations, Java plugin, copy specifications, compatibility, and toolchains.
- Oracle Database JDBC Java API Reference — `OracleDataSource`, `oracle.jdbc.datasource.impl`, and older `oracle.jdbc.pool` packages.
- Oracle Security Developer Tools documentation — OSDT core/certificate/security libraries.
- Spring Framework and Spring Boot documentation — system requirements and migration guidance.
- Apache Axis documentation — SOAP engine, WSDL, and Axis client/server concepts.
- Official AngularJS documentation — AngularJS support status.

Because enterprise applications frequently wrap standard technologies with company-specific Gradle plugins and helper classes, names such as `database.jdbc`, `custom.com`, `SetupDoc.groovy`, `FTPHelper`, and `Chan` must be verified against the actual repository before treating any interpretation as definitive.
