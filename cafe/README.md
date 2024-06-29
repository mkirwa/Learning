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

## Implementing GWT Token ##

- JWT - Json Web Token. When the api is accessed, it checks if that is a valid user or not. 
- When the user logs in for the first time, it checks the database for the user.
- If the user exists then it assigns that user a valid token
- Whenever the user logs in from next time, we check this token and give this user access. 
- 