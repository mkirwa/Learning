# CAFE MANAGEMENT SYSTEM #

## Accessing the Database ##

```
mysql -u root -p
password = password
```

## Packages ##

This project contains the following packages.

- Constants: Stores constant values used across the application.
- DAO: Contains data access objects for database interactions.
- JWT: Manages JSON Web Token creation and validation.
- POJO: Defines simple data model objects.
- rest: Contains RESTful web service classes.
- restImpl: Contains implementations of RESTful web services (if separated from interfaces).
- serviceImpl: Contains business logic implementations.
- utils: Provides utility classes and methods.
- wrapper: Contains wrapper classes to enhance or adapt object behavior.

- The Hibernate dialect is a configuration setting in Hibernate ORM (Object-Relational Mapping) that specifies the type of SQL database being used.
- This setting allows Hibernate to generate optimized SQL statements tailored for the specific database dialect. Different databases have unique SQL dialects, and Hibernate needs to know which one to use to ensure compatibility and take advantage of database-specific features.

SQL command to select and display all columns from user table. \G formats the output
in a vertical format instead of the default tabular format. 

```dockerfile
select * from user \G;
```

## Implementing JWT Token ##

- JWT - Json Web Token. When the api is accessed, it checks if that is a valid user or not. 
- When the user logs in for the first time, it checks the database for the user.
- If the user exists then it assigns that user a valid token
- Whenever the user logs in from next time, we check this token and give this user access. 

## JSON Web Token Claims ##
JWT (JSON Web Token) claims are pieces of information asserted about a subject (typically the user) that are encoded within the token. These claims are statements about an entity (typically, the user) and additional data. JWT claims can be used for:

1. Identifying the Subject: Claims like sub (subject) and name provide identity information.
2. Token Management: Claims like iat (issued at), exp (expiration), and nbf (not before) manage the token's validity period.
3. Custom Claims: These are application-specific claims that can carry any necessary information, such as user roles or permissions.
Here is a list of common JWT claims:
   - iss (issuer): Identifies the principal that issued the JWT.
   - sub (subject): Identifies the principal that is the subject of the JWT.
   - aud (audience): Identifies the recipients that the JWT is intended for.
   - exp (expiration time): Identifies the expiration time after which the JWT must not be accepted for processing.
   - nbf (not before): Identifies the time before which the JWT must not be accepted for processing.
   - iat (issued at): Identifies the time at which the JWT was issued.
   - jti (JWT ID): Provides a unique identifier for the JWT.

## Beans in Java ##
- In Java, beans are objects that are managed by a Spring IoC (Inversion of Control) container.
- These beans are created, configured, and assembled by the Spring framework. 
- Beans are essential components in the Spring framework as they allow for the following:
  - Dependency Injection: Beans can have their dependencies injected, allowing for loose coupling and easier testing.
  - Lifecycle Management: The Spring container manages the lifecycle of beans, including their creation, initialization, and destruction.
  - Configuration and Initialization: Beans can be configured through XML, annotations, or Java code, enabling consistent setup and initialization across different components.
  - Singleton or Prototype Scope: Beans can be defined as singletons or prototypes, controlling whether a single instance or multiple instances are created and used.

## Why do we need to mark a class as @Service in Java Spring? ##
- In Spring, marking a class as a service component using the @Service annotation serves several purposes:

  - Bean Creation: It informs Spring to create a bean of this class, allowing it to be managed by the Spring container.
  - Dependency Injection: It enables the class to be injected into other components using @Autowired, facilitating loose coupling and better testability.
  - Specialized Intent: It indicates that the class provides business logic, differentiating it from other component types like @Component, @Repository, or @Controller.
  - Configuration and Lifecycle Management: It allows Spring to manage the lifecycle and configuration of the service.
  
- By using @Service, you help maintain clear, organized code with well-defined roles for each component.

## Servlet ##

Servlets are Java programs that run on a web server and handle requests from web clients (usually browsers). They are used to create dynamic web content. When a client sends a request to a servlet, the servlet can process the request, interact with a database or other backend services, and generate a response, often in the form of HTML, JSON, or XML, which is then sent back to the client. Servlets are part of the Java Enterprise Edition (Java EE) and provide a robust and scalable way to handle web-based requests and responses.

### Key Features of Servlets: ###
1. Request Handling: Servlets handle various types of client requests, such as GET, POST, PUT, and DELETE.
2. Lifecycle Management: The servlet lifecycle includes initialization, request handling, and destruction phases.
3. Session Management: Servlets can manage user sessions, allowing for stateful interactions across multiple requests.
4. Integration with Other Java Technologies: Servlets can interact with JavaServer Pages (JSP), JavaBeans, and Enterprise JavaBeans (EJB), providing a comprehensive environment for web application development.

### Basic Servlet Lifecycle: ###
1. Initialization: When a servlet is first created, its init method is called.
2. Service: For each client request, the servlet's service method is called, which in turn calls the appropriate method (e.g., doGet, doPost).
3. Destruction: When the servlet is no longer needed, its destroy method is called for cleanup.

If you want to see what a JWT token contains. copy and paste it in this site -> https://jwt.io/
