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