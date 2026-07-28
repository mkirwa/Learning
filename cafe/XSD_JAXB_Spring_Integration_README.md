# XSD, JAXB, Spring, Angular, and Oracle Integration Guide

## 1. Purpose

This document explains how an XML Schema Definition (`.xsd`) can be used in a Java Spring application, why the corresponding Java classes may not appear under `src/main/java`, how Java objects are converted to and from XML, what `ObjectFactory` and WSDL files do, how schema-derived classes are generated during a build, and how those classes relate to an Oracle database.

The application described here has:

- A Java Spring backend
- An Angular 19 frontend written in TypeScript
- An Oracle database
- One or more XSD files that define XML message structures

A common architecture is:

```text
Angular frontend
      |
      | JSON over HTTP
      v
Spring REST controllers
      |
      v
Spring services
      |
      +------------------------+
      |                        |
      v                        v
Oracle database          XML/SOAP integration
                               |
                               v
                        XSD-generated classes
```

The Angular frontend may never use the XSD directly. The XSD is often used by the Spring backend when communicating with another system through XML or SOAP.

---

## 2. What an XSD File Is

XSD stands for **XML Schema Definition**.

An XSD is a contract that defines the permitted structure of an XML document. It can specify:

- XML element names
- Element order
- Data types
- Required and optional elements
- Minimum and maximum occurrences
- Nested structures
- XML namespaces
- String length, patterns, numeric ranges, and other restrictions

A corrected simplified schema could look like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>

<xsd:schema
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:stns="java:lib.customerxml.javatypes"
    targetNamespace="java:lib.customerxml.javatypes"
    elementFormDefault="qualified">

    <xsd:simpleType name="idtype">
        <xsd:restriction base="xsd:string">
            <xsd:maxLength value="50"/>
        </xsd:restriction>
    </xsd:simpleType>

    <xsd:complexType name="CustomerType">
        <xsd:sequence>
            <xsd:element
                name="id"
                type="stns:idtype"
                minOccurs="0"
                maxOccurs="1000"/>
        </xsd:sequence>
    </xsd:complexType>

    <xsd:element name="customer" type="stns:CustomerType"/>

</xsd:schema>
```

This schema says:

- The root XML element is named `customer`.
- The root element uses the structure defined by `CustomerType`.
- `CustomerType` contains an `id` element.
- The `id` element is optional because `minOccurs="0"`.
- The `id` element may occur up to 1,000 times.
- Each `id` value follows the rules of `idtype`.

A valid XML document could be:

```xml
<customer xmlns="java:lib.customerxml.javatypes">
    <id>CUSTOMER-100</id>
    <id>CUSTOMER-101</id>
</customer>
```

---

## 3. Why the Java Class May Be Missing

A schema-derived class is often not manually written. A build tool generates it from the XSD.

Therefore, the class may not exist here:

```text
src/main/java/
```

It may instead be generated under one of these locations:

### Maven

```text
target/generated-sources/
target/generated-sources/jaxb/
target/generated-sources/xjc/
target/generated-sources/wsimport/
target/generated-sources/cxf/
```

### Gradle

```text
build/generated/
build/generated/sources/
build/generated/jaxb/
build/generated/wsdl/
```

The class may also be:

1. Generated only after running the build.
2. Stored inside another module.
3. Packaged inside a dependency JAR.
4. Generated from a WSDL that imports the XSD.
5. Given a different Java name.
6. Placed in a package selected by a JAXB binding file.
7. Excluded from source control because generated folders are listed in `.gitignore`.

Useful searches include:

```text
CustomerType
idtype
@XmlRootElement
@XmlType
@XmlElement
@XmlElementDecl
ObjectFactory
JAXBElement
Jaxb2Marshaller
JAXBContext
Unmarshaller
Marshaller
xjc
wsimport
wsdl2java
jaxb
generate-sources
```

Also inspect:

```text
pom.xml
build.gradle
build.gradle.kts
*.xjb
*.wsdl
.gitignore
src/main/resources/
src/main/xsd/
src/main/wsdl/
```

---

## 4. What the Generated Java Class May Look Like

The generated class may look similar to this:

```java
package lib.customerxml.javatypes;

import java.util.ArrayList;
import java.util.List;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlType;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(
    name = "CustomerType",
    propOrder = {"id"}
)
public class CustomerType {

    @XmlElement(name = "id")
    protected List<String> id;

    public List<String> getId() {
        if (id == null) {
            id = new ArrayList<>();
        }
        return this.id;
    }
}
```

Older projects may use:

```java
javax.xml.bind.annotation.XmlElement
```

Newer Spring Boot 3 applications normally use:

```java
jakarta.xml.bind.annotation.XmlElement
```

The generated code may not contain:

```java
@Size(max = 1000)
```

This is because:

```xml
maxOccurs="1000"
```

is an XML schema occurrence rule, while:

```java
@Size(max = 1000)
```

is a Jakarta Bean Validation rule.

A normal JAXB generator usually creates a `List`, but it does not always add Bean Validation annotations. Adding `@Size` may require a separate plugin, an XJC extension, or custom code.

---

## 5. Why Marshalling and Unmarshalling Are Needed

Java code works with objects. XML integrations work with text documents.

Marshalling and unmarshalling translate between those two representations.

### Marshalling

**Marshalling** converts a Java object into XML.

```text
Java object -> XML document
```

Example Java object:

```java
CustomerType customer = new CustomerType();
customer.getId().add("CUSTOMER-100");
customer.getId().add("CUSTOMER-101");
```

After marshalling:

```xml
<customer xmlns="java:lib.customerxml.javatypes">
    <id>CUSTOMER-100</id>
    <id>CUSTOMER-101</id>
</customer>
```

Marshalling is needed when the application must:

- Send an XML request to another system
- Return an XML response
- Call a SOAP web service
- Create an XML export file
- Store XML in an Oracle `XMLTYPE` column
- Publish a message in an XML-based format

### Unmarshalling

**Unmarshalling** converts XML into a Java object.

```text
XML document -> Java object
```

For example, this XML:

```xml
<customer xmlns="java:lib.customerxml.javatypes">
    <id>CUSTOMER-100</id>
</customer>
```

could become:

```java
CustomerType customer = ...;
String firstId = customer.getId().get(0);
```

Unmarshalling is needed when the application must:

- Receive an XML request
- Read an XML response from another system
- Process an imported XML file
- Consume a SOAP response
- Read XML stored in the database
- Validate and process structured XML messages

Without unmarshalling, application code would have to manually navigate XML nodes and convert text values into Java types.

### JAXB Example

```java
JAXBContext context = JAXBContext.newInstance(CustomerType.class);

Unmarshaller unmarshaller = context.createUnmarshaller();
CustomerType customer =
    (CustomerType) unmarshaller.unmarshal(xmlInputStream);

Marshaller marshaller = context.createMarshaller();
marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
marshaller.marshal(customer, outputStream);
```

In Spring, `Jaxb2Marshaller` may be used instead of creating the JAXB context manually.

---

## 6. Meaning of the Generated-Name Statement

The statement:

> The generated name depends on the surrounding `complexType`, top-level element declarations, and any JAXB binding customisations.

means that the XML element name does not always become the Java class name.

Consider this schema:

```xml
<xsd:complexType name="CustomerInformationType">
    <xsd:sequence>
        <xsd:element
            name="id"
            type="xsd:string"
            minOccurs="0"
            maxOccurs="1000"/>
    </xsd:sequence>
</xsd:complexType>

<xsd:element
    name="customer"
    type="stns:CustomerInformationType"/>
```

The generator sees two different declarations:

1. A reusable complex type named `CustomerInformationType`
2. A top-level XML element named `customer`

The Java class will commonly be named:

```java
CustomerInformationType
```

not:

```java
Customer
```

The root `customer` element may be represented separately through:

- `@XmlRootElement`
- `JAXBElement<CustomerInformationType>`
- A method in `ObjectFactory`

### Anonymous Complex Type

This schema defines the structure directly inside the element:

```xml
<xsd:element name="customer">
    <xsd:complexType>
        <xsd:sequence>
            <xsd:element name="id" type="xsd:string"/>
        </xsd:sequence>
    </xsd:complexType>
</xsd:element>
```

A generator may create a class named `Customer`, because there is no separately named complex type.

### JAXB Binding Customisation

A binding file can override the generated name.

Example `bindings.xjb`:

```xml
<jxb:bindings
    version="3.0"
    xmlns:jxb="https://jakarta.ee/xml/ns/jaxb"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema">

    <jxb:bindings
        schemaLocation="customer.xsd"
        node="/xsd:schema">

        <jxb:schemaBindings>
            <jxb:package name="com.example.integration.customer"/>
        </jxb:schemaBindings>

        <jxb:bindings
            node="//xsd:complexType[@name='CustomerInformationType']">
            <jxb:class name="CustomerRecord"/>
        </jxb:bindings>

    </jxb:bindings>
</jxb:bindings>
```

This could generate:

```java
package com.example.integration.customer;

public class CustomerRecord {
    // Generated fields and methods
}
```

Therefore, searching only for `Customer.java` may not find the generated class.

---

## 7. What `ObjectFactory` Is

`ObjectFactory` is a JAXB-generated helper class.

It usually contains methods for creating instances of schema-derived Java types.

Example:

```java
@XmlRegistry
public class ObjectFactory {

    public ObjectFactory() {
    }

    public CustomerType createCustomerType() {
        return new CustomerType();
    }
}
```

Usage:

```java
ObjectFactory factory = new ObjectFactory();

CustomerType customer = factory.createCustomerType();
customer.getId().add("CUSTOMER-100");
```

### Creating Root XML Elements

`ObjectFactory` may also contain methods annotated with `@XmlElementDecl`.

```java
private static final QName CUSTOMER_QNAME =
    new QName("java:lib.customerxml.javatypes", "customer");

@XmlElementDecl(
    namespace = "java:lib.customerxml.javatypes",
    name = "customer"
)
public JAXBElement<CustomerType> createCustomer(CustomerType value) {
    return new JAXBElement<>(
        CUSTOMER_QNAME,
        CustomerType.class,
        null,
        value
    );
}
```

Usage:

```java
ObjectFactory factory = new ObjectFactory();

CustomerType customer = factory.createCustomerType();
customer.getId().add("CUSTOMER-100");

JAXBElement<CustomerType> rootElement =
    factory.createCustomer(customer);
```

The `JAXBElement` supplies information that the Java type itself may not contain, including:

- The XML element name
- The XML namespace
- The declared Java type
- The element value

`ObjectFactory` is especially important when a named XSD complex type is reusable and is not permanently tied to one root element.

---

## 8. How Java Classes Are Generated During the Build

The project build normally includes a code-generation plugin.

The simplified build sequence is:

```text
1. Read XSD or WSDL files
2. Run an XSD/WSDL code generator
3. Write Java source files into a generated-sources directory
4. Add that directory to the Java compiler source path
5. Compile generated and handwritten Java code together
6. Package everything into the application JAR or WAR
```

### Typical Maven Lifecycle

```text
validate
generate-sources  <- JAXB/XJC generation commonly occurs here
process-sources
compile
test
package
```

Running:

```bash
mvn clean compile
```

usually performs generation and compilation.

Running:

```bash
mvn clean generate-sources
```

can be useful when you only want to inspect generated files.

### Example Maven Configuration

The exact plugin and version depend on the Java and Spring versions used by the project. A typical configuration resembles:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>jaxb2-maven-plugin</artifactId>

            <executions>
                <execution>
                    <id>generate-customer-model</id>
                    <goals>
                        <goal>xjc</goal>
                    </goals>
                </execution>
            </executions>

            <configuration>
                <sources>
                    <source>
                        ${project.basedir}/src/main/resources/xsd
                    </source>
                </sources>

                <outputDirectory>
                    ${project.build.directory}/generated-sources/jaxb
                </outputDirectory>

                <clearOutputDir>false</clearOutputDir>
            </configuration>
        </plugin>
    </plugins>
</build>
```

The generated files may appear under:

```text
target/generated-sources/jaxb/
```

### Generation from a WSDL

For SOAP services, the project may use a plugin such as:

- `jaxws-maven-plugin`
- `cxf-codegen-plugin`
- A `wsimport` task
- A `wsdl2java` task

The generator reads the WSDL and any XSDs imported by it. It may generate:

- Request classes
- Response classes
- JAXB model classes
- `ObjectFactory`
- SOAP service interfaces
- SOAP client classes
- Exception or fault classes

### IDE Behaviour

IntelliJ IDEA or Eclipse may mark the generated folder as a generated source root. This allows imports and navigation to work even though the code is outside `src/main/java`.

If generated imports are unresolved:

1. Run the build.
2. Refresh the Maven or Gradle project.
3. Confirm the generated directory exists.
4. Confirm the IDE recognises it as a source root.
5. Check the build log for XJC, JAXB, WSDL, or schema errors.

---

## 9. What a WSDL Is

WSDL stands for **Web Services Description Language**.

A WSDL is an XML document that describes a SOAP web service.

An XSD defines data structures. A WSDL defines the service operation and uses XSD types for the request and response data.

A WSDL can describe:

- The service name
- Available operations
- Request message types
- Response message types
- Error or fault messages
- The SOAP protocol and binding style
- The service endpoint address
- Imported XSD schemas

Example conceptual operation:

```text
Operation: getCustomer

Request:
    GetCustomerRequest
        customerId

Response:
    GetCustomerResponse
        customer
```

A simplified WSDL structure may contain:

```xml
<wsdl:definitions>

    <wsdl:types>
        <!-- Inline XSDs or imported XSDs -->
    </wsdl:types>

    <wsdl:message name="GetCustomerRequest">
        <!-- Request definition -->
    </wsdl:message>

    <wsdl:message name="GetCustomerResponse">
        <!-- Response definition -->
    </wsdl:message>

    <wsdl:portType name="CustomerServicePortType">
        <!-- Operations -->
    </wsdl:portType>

    <wsdl:binding name="CustomerServiceSoapBinding">
        <!-- SOAP binding details -->
    </wsdl:binding>

    <wsdl:service name="CustomerService">
        <!-- Endpoint address -->
    </wsdl:service>

</wsdl:definitions>
```

The relationship is:

```text
XSD:
Defines what Customer, CustomerId, Address, and other data look like.

WSDL:
Defines what service operations exist and which XSD-defined data each
operation accepts and returns.
```

A WSDL generator can produce Java classes and SOAP client code.

---

## 10. How XSD-Generated Classes Map to Oracle

XSD-generated JAXB classes do not normally map directly to database tables.

They are usually **integration models** or **XML data-transfer objects**.

JPA entity classes are normally used for relational database mapping.

### Separate Models

```text
XML document
     |
     v
JAXB-generated CustomerType
     |
     | application mapping
     v
JPA CustomerEntity
     |
     | Hibernate/JPA
     v
Oracle CUSTOMER table
```

### JAXB Integration Model

```java
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "CustomerType")
public class CustomerType {

    @XmlElement(name = "id")
    protected List<String> id;
}
```

### JPA Database Entity

```java
@Entity
@Table(name = "CUSTOMER")
public class CustomerEntity {

    @Id
    @Column(name = "CUSTOMER_ID")
    private Long customerId;

    @Column(name = "EXTERNAL_ID")
    private String externalId;

    // Getters and setters
}
```

### Mapper

```java
@Component
public class CustomerMapper {

    public CustomerEntity toEntity(CustomerType xmlCustomer) {
        CustomerEntity entity = new CustomerEntity();

        if (xmlCustomer != null
                && xmlCustomer.getId() != null
                && !xmlCustomer.getId().isEmpty()) {
            entity.setExternalId(xmlCustomer.getId().get(0));
        }

        return entity;
    }
}
```

The mapping may be implemented with:

- Handwritten mapper classes
- MapStruct
- Spring converters
- Service-layer logic
- An enterprise mapping framework

### Why the Models Are Usually Kept Separate

The XML model and database model solve different problems.

The XSD model represents:

- An external XML contract
- XML element order
- XML namespaces
- XML occurrence rules
- SOAP request and response structures

The JPA model represents:

- Tables
- Columns
- Primary keys
- Foreign keys
- Relationships
- Database constraints
- Fetch and persistence behaviour

Using a generated JAXB class directly as a JPA entity can tightly couple the database design to an external XML contract. It can also cause regeneration to overwrite manually added persistence annotations.

A safer design is:

```text
Controller or SOAP endpoint
        |
        v
XML DTO / generated JAXB class
        |
        v
Mapper
        |
        v
Domain model or JPA entity
        |
        v
Repository
        |
        v
Oracle
```

---

## 11. Repeated XML Elements Versus Relational Tables

This XSD declaration:

```xml
<xsd:element
    name="id"
    type="stns:idtype"
    minOccurs="0"
    maxOccurs="1000"/>
```

commonly becomes:

```java
List<String> id;
```

A relational database cannot normally store a Java `List<String>` directly in one ordinary `VARCHAR2` column without additional conversion.

Possible database designs include:

### One-to-Many Child Table

```text
CUSTOMER
--------
CUSTOMER_ID
NAME

CUSTOMER_EXTERNAL_ID
--------------------
CUSTOMER_EXTERNAL_ID_ID
CUSTOMER_ID
EXTERNAL_ID
```

JPA example:

```java
@Entity
@Table(name = "CUSTOMER")
public class CustomerEntity {

    @Id
    @Column(name = "CUSTOMER_ID")
    private Long customerId;

    @ElementCollection
    @CollectionTable(
        name = "CUSTOMER_EXTERNAL_ID",
        joinColumns = @JoinColumn(name = "CUSTOMER_ID")
    )
    @Column(name = "EXTERNAL_ID")
    private List<String> externalIds = new ArrayList<>();
}
```

### XML Storage

Oracle can store the original XML in an `XMLTYPE` column. The application may:

1. Marshal the Java object to XML.
2. Store the XML in Oracle.
3. Retrieve the XML later.
4. Unmarshal it back into Java.

### JSON or Character Large Object Storage

Some systems serialize the collection into JSON or text and store it in a `CLOB`. This is possible but may make relational querying and constraints more difficult.

The actual database mapping cannot be determined from `maxOccurs="1000"` alone. The repository, entity classes, SQL statements, or stored procedures must be inspected.

---

## 12. Typical End-to-End Flows

### SOAP Request Received by Spring

```text
External system
      |
      | SOAP/XML request
      v
Spring SOAP endpoint
      |
      | unmarshal XML
      v
Generated request object
      |
      | map
      v
Domain object or JPA entity
      |
      v
Repository
      |
      v
Oracle
```

### SOAP Request Sent by Spring

```text
Oracle
      |
      v
Repository
      |
      v
JPA entity or domain object
      |
      | map
      v
Generated JAXB request object
      |
      | marshal
      v
SOAP/XML request
      |
      v
External system
```

### Angular REST Flow

```text
Angular TypeScript model
      |
      | JSON
      v
Spring REST DTO
      |
      | map
      v
JPA entity
      |
      v
Oracle
```

The Angular REST flow and the XML/SOAP flow can coexist in the same backend.

---

## 13. How to Find the Actual Implementation

### Step 1: Find the XSD Location

Search for:

```text
*.xsd
customer.xsd
idtype
targetNamespace
```

Common directories:

```text
src/main/resources/xsd/
src/main/resources/schema/
src/main/xsd/
src/main/wsdl/
```

### Step 2: Inspect the Build File

Search `pom.xml` or Gradle files for:

```text
jaxb
xjc
wsimport
wsdl2java
cxf
generate-sources
generated-sources
schemaDirectory
wsdlDirectory
bindingDirectory
```

### Step 3: Generate the Sources

For Maven:

```bash
mvn clean generate-sources
```

or:

```bash
mvn clean compile
```

For Gradle:

```bash
./gradlew clean build
```

Then inspect:

```text
target/generated-sources/
build/generated/
```

### Step 4: Find the Generated Package

Search for:

```text
package-info.java
ObjectFactory.java
@XmlSchema
@XmlRegistry
```

`package-info.java` may show the Java package-to-XML-namespace mapping:

```java
@jakarta.xml.bind.annotation.XmlSchema(
    namespace = "java:lib.customerxml.javatypes",
    elementFormDefault =
        jakarta.xml.bind.annotation.XmlNsForm.QUALIFIED
)
package com.example.integration.customer;
```

### Step 5: Check Dependency JARs

Run:

```bash
mvn dependency:tree
```

Inspect likely model JARs:

```bash
jar tf customer-types.jar
```

Search for:

```text
Customer
CustomerType
ObjectFactory
package-info
```

### Step 6: Trace Application Usage

Search for:

```text
new CustomerType
createCustomer
JAXBElement<CustomerType>
Jaxb2Marshaller
unmarshal
marshal
WebServiceTemplate
@Endpoint
@PayloadRoot
@SoapAction
```

### Step 7: Trace Database Mapping

Search for:

```text
@Entity
@Table
@Repository
JpaRepository
JdbcTemplate
NamedParameterJdbcTemplate
RowMapper
StoredProcedure
SimpleJdbcCall
XMLTYPE
CUSTOMER
```

This reveals whether the application uses:

- JPA/Hibernate
- Spring JDBC
- MyBatis
- Stored procedures
- Oracle `XMLTYPE`
- Manual SQL mappings

---

## 14. Important Distinctions

### XSD Class Is Not Necessarily a Database Entity

```java
@XmlType
```

means the class participates in XML binding.

```java
@Entity
```

means the class participates in JPA persistence.

A class can technically contain both, but generated XML classes are normally kept separate from persistence entities.

### `maxOccurs` Is Not String Length

```xml
maxOccurs="1000"
```

means the `id` element can appear up to 1,000 times.

It does not mean each ID may contain 1,000 characters.

String length is expressed separately:

```xml
<xsd:maxLength value="1000"/>
```

### XML Namespace Is Not Automatically a Java Package

```xml
targetNamespace="java:lib.customerxml.javatypes"
```

identifies XML names.

The Java package may be derived from it, but it can be overridden by:

- Maven or Gradle configuration
- XJC command-line options
- A JAXB binding file
- WSDL generation configuration

---

## 15. Summary

The most likely explanation for the missing `Customer` class is that:

1. The Java model is generated from the XSD or a WSDL.
2. The generated class is placed under `target/generated-sources` or `build/generated`.
3. The class is named after a complex type such as `CustomerType`, not necessarily the `customer` XML element.
4. The class may be in another module or dependency JAR.
5. A JAXB binding file may have changed its class name or Java package.
6. `maxOccurs="1000"` generates a collection but does not necessarily generate `@Size(max = 1000)`.
7. JAXB classes generally map to JPA entities through a separate mapper rather than directly mapping to Oracle tables.

The key investigation points are the XSD, WSDL files, build configuration, generated-source directories, `ObjectFactory`, JAXB annotations, mapper classes, JPA entities, repositories, and Oracle access code.
