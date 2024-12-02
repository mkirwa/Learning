# CAFE MANAGEMENT SYSTEM #

## Accessing the Database ##

```
mysql -u root -p
```

## Packages ##

This project contains the following packages.

- Constants: Stores constant values used across the application.
- DAO: Contains data access objects for database interactions.
- JWT: Manages JSON Web Token creation and validation.
- POJO: Plain Old Java Object. Defines simple data model objects. Creates the model of the project.
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

Alt Insert equivalent for mac -> command + N 

Database query to show a query that created the table - shows how the table is created in spring boot.
```dockerfile
show create table product;
```
### Generating PDF ###
#### APIs to Generate PDF ####
- We are rendering data in form of UI
- We take this data and generate a pdf out of it 
- Store it in a place and update the db then return tue uui i.e. the build id. 
#### Classes and code involved #####
- POJO  'Bill' implements serializable 
  - fghdghghdgh


## Angular JS ##
- npm i installs the dependencies from package.json and creates node_modules.

- Environments Folder -> URL for the apis go here. 
- Assets -> All the images go here that are being used by the application. 
- App -> Contains app modules. 

- index.html -> the main file of the application. 
- style.scss -> defines all the common css files. 

### App ###

- app-routing.module.ts -> 
- app.component.html -> html file for the component. 
- app.component.scss -> css files for the component. 
- app.component.spect.ts -> 
- app.component.ts -> 
- app.module.ts -> MAIN Module of the project

### TYPESCRIPT ###

-  It is a superset of JavaScript, which means it extends JavaScript by adding new features, primarily static typing - Static typing is a feature in programming languages where the type of a variable is known and checked at compile-time, rather than at runtime. TypeScript is designed to develop large-scale applications and transcompiles to plain JavaScript, ensuring compatibility with existing JavaScript code and environments.

### best-seller ###

- Contains home-page app

### dashboard ###

- Dashboard app 

### layouts ###

- Contains the layout for the application. 

### Environments ###

- environment.ts -> Adding the urls for the apis. 

### Services ###

- Folder for linking services to front end. 

- The command `ng g s user` in an Angular project is a shorthand for generating a new service using the Angular CLI. Here's what each part of the command does:

- `ng` : This is the Angular CLI command. It allows you to interact with Angular's command-line interface.

- `g`: This stands for generate. It's a command that tells Angular CLI to create a new file or set of files for a specific Angular feature.

- `s` : This is shorthand for service. It tells Angular CLI to generate a new service.

- `user` : This is the name of the service you want to generate. In this case, a service called UserService will be created.

#### What Happens When You Run ng g s user? ####

- File Creation:

- Angular CLI generates two files:
  - user.service.ts: The TypeScript file containing the UserService class. This is where you'll define the service logic.
  - user.service.spec.ts: The accompanying test file for the service, used for writing unit tests.

#### Service Class: ####

- The generated user.service.ts file will include a basic service class, typically with the @Injectable() decorator, which makes the service injectable into other components or services in your application.

- Example content of user.service.ts:

```typescript

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

}

```

- The providedIn: 'root' setting means that this service is available as a singleton across the entire application.

#### Unit Testing: ####

- The user.service.spec.ts file is a test suite generated to help you write unit tests for your service. It uses Jasmine and Angular's testing utilities.

#### Usage ####

- Once generated, you can inject the UserService into any component or other service where you need to use it:

```typescript
import { UserService } from './user.service';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent {

  constructor(private userService: UserService) {
    // Now you can use userService in this component
  }

}
```

#### Summary ####
- The ng g s user command is a convenient way to quickly create a new service in your Angular project, complete with a basic setup and testing file. This service can then be used to manage and encapsulate specific logic, making it easier to maintain and test your application.

#### Material Component ####

- All Angular component materials used by the application, for example what is used for the user dialog feature. material-module.ts file contains all these components.  


## JAVA UNIT TESTS ##

- you can use JUnit and Mockito (or another mocking framework). Here's a basic guide on how you can do this:

### SETUP YOUR TESTING ENVIRONMENT ###

Ensure you have the necessary dependencies in your pom.xml (for Maven) or build.gradle (for Gradle) for JUnit and Mockito.

#### MAVEN ####

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-api</artifactId>
    <version>5.7.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>3.6.0</version>
    <scope>test</scope>
</dependency>

```
#### GROOVY ####

```groovy
testImplementation 'org.junit.jupiter:junit-jupiter-api:5.7.0'
testImplementation 'org.mockito:mockito-core:3.6.0'
```
### EXAMPLE ###

- Let's go through an example of a login API that checks if a specific user exists in the `cafe` database in the `usersTable`. 
- If the user is not found, we'll throw an exception on the backend, and the AngularJS frontend will catch that exception and handle it appropriately.
- Handles it appropriately by showing a message like "user is not in the database, userid".

#### Backend (Java) ####

- First, we need to define the login API in the service layer, repository, and exception handling.

1. Service Class (LoginService)
   - This service class will check if the user exists in the usersTable.

```java
@Service
public class LoginService {

    @Autowired
    private UserRepository userRepository;

    public User login(String userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("User is not in the database, " + userId));
    }
}
```
2. Repository Interface (UserRepository)
   - This repository will query the usersTable in the cafe database.
   
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUserId(String userId);
}
```
3. Custom Exception Class (UserNotFoundException)
   - This custom exception will be thrown when the user is not found in the database.
```java
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
```
4. Controller Class (LoginController)
   - The controller handles the HTTP request and response for the login API.

```java
@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private LoginService loginService;

    @PostMapping("/login")
    public ResponseEntity<User> loginUser(@RequestParam String userId) {
        User user = loginService.login(userId);
        return ResponseEntity.ok(user);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFoundException(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
```
### Unit Test for Backend (JUnit) ###
Here’s a unit test for the login method in the LoginService class:

```java
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Optional;

public class LoginServiceTest {

    @InjectMocks
    private LoginService loginService;

    @Mock
    private UserRepository userRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testLoginThrowsUserNotFoundExceptionWhenUserNotFound() {
        // Arrange
        String userId = "testUser";
        when(userRepository.findByUserId(userId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> loginService.login(userId), 
            "User is not in the database, " + userId);
    }
}

```
### Frontend (AngularJS) ###

- On the frontend, you’ll make a call to the login API and handle the error when the user is not found.

#### AngularJS Service ####

```javascript
app.service('loginService', function($http, $q) {
    this.login = function(userId) {
        return $http.post('/api/login', { userId: userId })
            .catch(function(response) {
                if (response.status === 404) {
                    // Handle not found error
                    alert('User is not in the database, ' + userId);
                }
                return $q.reject(response);
            });
    };
});

```

### AngularJS Controller ###

- You can then call the loginService in your controller.

```javascript
app.controller('LoginController', function($scope, loginService) {
    $scope.login = function() {
        loginService.login($scope.userId)
            .then(function(response) {
                // Handle successful login
                console.log('Login successful:', response.data);
            })
            .catch(function(error) {
                // Error handling is done in the service
            });
    };
});

```

### Explanation: ###
#### Backend: ####

- `LoginService:` Checks if the user exists in the database. If not, it throws a UserNotFoundException with a message containing the user ID.
- `LoginController:` Exposes an endpoint to handle login requests. It catches the `UserNotFoundException` and returns a `404 Not Found` response with the error message.
- `LoginServiceTest:` Verifies that the `UserNotFoundException` is thrown when the user isn't found in the database.

#### Frontend (AngularJS): ####

- `loginService:` Makes a POST request to the `/api/login` endpoint. If the backend responds with a `404 Not Found` error, it alerts the user with the message `"User is not in the database, userid".`
- `LoginController:` Invokes the `loginService` and handles the login process.

- This setup ensures that if a user isn’t found in the database, the backend throws an exception, and the frontend properly handles it by showing a user-friendly message.

### QUICK COMMANDS ###

#### Create a folder with .scss, .html spec.ts and component.ts files ####
- This command creates the respective files for the page and updates the app.component.ts folder. 

```bash
ng g c forgot-password
```
#### Cleaning the Repo ####
```
ng cache clean
```
- Use the above command if your changes aren't being detected. 
#### If you get the following commit error from angular, fix it like so ####
```bash
Enumerating objects: 449, done.
Counting objects: 100% (449/449), done.
Delta compression using up to 8 threads
Compressing objects: 100% (376/376), done.
Writing objects: 100% (431/431), 28.29 MiB | 4.96 MiB/s, done.
Total 431 (delta 63), reused 416 (delta 48)
remote: Resolving deltas: 100% (63/63), completed with 16 local objects.
remote: error: Trace: f1799469b5552d9415bf07be98b8fd64a16411f1c6aaed128bcc549f797629c1
remote: error: See https://gh.io/lfs for more information.
remote: error: File cafe/Frontend/.angular/cache/18.0.7/angular-webpack/cd08257bb882acc3a5f3e480eb03ed46e35ce709/0.pack is 110.63 MB; this exceeds GitHub's file size limit of 100.00 MB
remote: error: GH001: Large files detected. You may want to try Git Large File Storage - https://git-lfs.github.com.
To https://github.com/mkirwa/Learning.git
 ! [remote rejected] main -> main (pre-receive hook declined)
error: failed to push some refs to 'https://github.com/mkirwa/Learning.git'
```
- The fix 
```bash
git filter-repo --strip-blobs-bigger-than 2M
git push --force 
```
#### Code to fix ####

- Look at signup.component.html - the error messages don't display like they are supposed to. Them mandatory and the invalid field.  

- The download folder came with the following packages. 

![Alt text](/images/image.png)

### Explaining the code structure ###

#### index.html ####

- This displays the main app. has <app-root> which is what links the rest of the application 

#### environments ####

- This folder displays the url of all these apis. 
ng g c forgot-password
#### app ####

- Here, we have the main modules of this projects. We have app.module.ts which links the rest of the applications. 

## ADDING A COMPONENT APPLICATION ##
1. Start by going to app folder and creating the html, scss, spec.ts and a .ts files. Running the following command automatically creates them for you. 
```bash
ng g c login
```
- This creates a component diretory called login

2. Modify the service directory to link to a service path. The service should have already been created in the back end. The service should look like so.

```ts
// Create method for login page
  login(data:any){
    return this.httpClient.post(`${this.url}/user/login`,data,{
      headers: new HttpHeaders().set('Content-Type','application/json')
    })
  }
```
3. Import your login component or the added component to the home directory. Add a function to handle your component on the home directory like so. 

```ts
  // Method to open login dialog. Added this method. -> Created by Mahlon Kirwa
  // This method is called when the login button is clicked at the home page
  handlLoginAction(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '550px';
    this.dialog.open(LoginComponent,dialogConfig);
  }
```
4. Add the login button or entry to the home page so that when the button is clicked, it calls the handle component on the home directory which calls the real login component like so.

```html
<div class="bg-image"></div>
<app-best-seller></app-best-seller>

<div class="wrapper sticky">
  <nav class="navbar-fixed-top">
    <a href="#" class="logo">
      <mat-icon>storefront</mat-icon> Cafe Management System
    </a>
    <ul>
      <li>
        <a (click)="handleLoginAction()">Login</a> <!-- THIS IS WHAT WAS ADDED-->
        <a (click)="handleSignupAction()">signup</a>
        <a (click)="handleForgotPasswordAction()">Forgot Password?</a>
      </li>
    </ul>
  </nav>
</div>
<div class="footer" id="signup">
  <h2>All right reserved BTech Days and Mahlon</h2>
</div>
```
5. Make sure the module is imported on app.module.ts so that it can implement or use all the impoted features.

6. Now go back to the login page and develop the application using the four files created. The defaults look like this. 

### login.component.ts ###
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

}

```
### login.component.html ###
```html
<p>login works!</p>
```

### login.component.scss ###
```scss

```

### login.component.spec.ts ###
```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

![alt text](/images/image-001.png)

