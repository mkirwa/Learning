# Spring Dependency Injection Fundamentals for `Descriptive` / `CarService`

## BLUF — The Real Issue

The real blocker is **not the `isCarEnabled` boolean itself**.

The real issue is:

> `Descriptive` is manually instantiated in many places using `new`, so those instances are **not managed by Spring**. Because Spring does not create those objects, Spring cannot automatically inject `CarService`, `CarFormatSvc`, or other Spring beans into them.

There are also two related but separate problems:

1. `private final CarService carService;` causes:

   ```text
   field carService might not have been initialized
   ```

   because **every constructor in `Descriptive` must initialize a `final` field**.

2. Attempting to retrieve/inject `CarService` through Spring can cause:

   ```text
   No qualifying bean available
   expected at least 1 bean which qualifies as autowire candidate
   ```

   This means Spring cannot find a bean matching the exact `CarService` type in the relevant `ApplicationContext`.

A concise way to describe the blocker to another engineer is:

> `Descriptive` is not Spring-managed and is instantiated directly in multiple places. Because of that, dependencies such as `CarService` are not injected into those objects. Passing `isCarEnabled` directly into `formatDescription()` would require changing many existing callers, so the problem is finding the lowest-impact way to introduce the dependency at the object-creation boundary.

---

# 1. What Is a Java Object?

Consider this class:

```java
public class Car {

    private String color;

    public Car(String color) {

        /*
         * Save the value passed to the constructor
         * into this particular Car object's field.
         */
        this.color = color;
    }

    public String getColor() {
        return color;
    }
}
```

When you write:

```java
Car myCar = new Car("Blue");
```

Java creates a new object.

Conceptually:

```text
myCar
  |
  v
+-------------+
| Car object  |
|             |
| color=Blue  |
+-------------+
```

If you create another:

```java
Car anotherCar = new Car("Red");
```

you now have two independent objects:

```text
myCar
  |
  v
Car #1
color = Blue


anotherCar
  |
  v
Car #2
color = Red
```

This distinction becomes extremely important with Spring.

---

# 2. What Does `new` Mean?

When you write:

```java
Descriptive descriptive = new Descriptive();
```

you are telling **Java** to create that object.

Spring is not automatically involved.

Example:

```java
public class Descriptive {

    /*
     * This is an object reference.
     *
     * Nobody has assigned anything to it yet.
     */
    private CarService carService;

    public String formatDescription() {

        /*
         * Because carService was never assigned,
         * its value is null.
         */
        System.out.println(carService);

        return "";
    }
}
```

Then:

```java
Descriptive descriptive = new Descriptive();

descriptive.formatDescription();
```

prints:

```text
null
```

That is because nobody ever assigned a real `CarService` object to the field.

---

# 3. What Is `null`?

Suppose you declare:

```java
private CarService carService;
```

but never assign an object to it.

The field is:

```java
null
```

Conceptually:

```text
carService
    |
    v
 NOTHING
```

Therefore this fails:

```java
carService.getCarEnabledValue();
```

because it is effectively:

```text
NOTHING.getCarEnabledValue()
```

That results in a `NullPointerException`.

---

# 4. `boolean` vs `Boolean`

These are different:

```java
boolean isCarEnabled;
```

and:

```java
Boolean isCarEnabled;
```

Lowercase `boolean` is a primitive.

A boolean field defaults to:

```text
false
```

and cannot be `null`.

Example:

```java
public class Example {

    /*
     * Primitive boolean.
     *
     * If this field is never explicitly initialized,
     * Java gives it the default value false.
     */
    private boolean enabled;

    public void printValue() {
        System.out.println(enabled);
    }
}
```

This prints:

```text
false
```

But this:

```java
private Boolean enabled;
```

uses the wrapper object type `Boolean`.

That reference can be:

```java
null
```

So in this problem, the object that is probably null is:

```java
carService
```

or:

```java
carFormatSvc
```

not a primitive `boolean`.

---

# 5. What Is a Field?

Consider:

```java
public class Descriptive {

    private CarService carService;
}
```

`carService` is a **field**.

It belongs to each individual `Descriptive` object.

For example:

```java
Descriptive d1 = new Descriptive();
Descriptive d2 = new Descriptive();
```

creates:

```text
d1
 |
 v
Descriptive #1
carService = null


d2
 |
 v
Descriptive #2
carService = null
```

If one of those objects is later given a valid `CarService`, that does not automatically update every other `Descriptive` instance.

---

# 6. What Is a Constructor?

A constructor runs when an object is created.

Example:

```java
public class Descriptive {

    private CarService carService;

    /*
     * Constructor.
     *
     * Any code that creates Descriptive using this
     * constructor must provide a CarService.
     */
    public Descriptive(CarService carService) {

        /*
         * "this.carService" means the field belonging
         * to this particular Descriptive object.
         *
         * "carService" on the right is the parameter
         * passed into the constructor.
         */
        this.carService = carService;
    }
}
```

Then:

```java
CarService service = somehowGetCarService();

Descriptive descriptive =
        new Descriptive(service);
```

gives:

```text
Descriptive
    |
    +---- carService
              |
              v
         CarService object
```

---

# 7. What Does `this` Mean?

Consider:

```java
public class Car {

    private String color;

    public Car(String color) {

        /*
         * Left side:
         * field belonging to this object.
         *
         * Right side:
         * constructor parameter.
         */
        this.color = color;
    }
}
```

Likewise:

```java
this.isCarEnabled =
        carService.getCarEnabledValue();
```

means:

> Store the result in the `isCarEnabled` field belonging to the current object.

---

# 8. Field vs Local Variable

This:

```java
private boolean isCarEnabled;

public String formatText(...) {

    this.isCarEnabled =
            carService.getCarEnabledValue();
}
```

stores the value on the object.

This:

```java
public String formatText(...) {

    /*
     * Local variable.
     *
     * It exists only while this particular
     * method invocation is running.
     */
    boolean isCarEnabled =
            carService.getCarEnabledValue();
}
```

stores it only for that method call.

Conceptually:

```text
FIELD

CarFormatSvcImpl
      |
      +---- isCarEnabled
             stays on object
```

versus:

```text
LOCAL VARIABLE

formatText()
     |
     +---- isCarEnabled
             exists only during call
```

For request-specific or operation-specific values, local variables are usually safer.

---

# 9. What Does `final` Mean?

You tried:

```java
private final CarService carService;
```

and received:

```text
field carService might not have been initialized
```

`final` means the field must be assigned exactly once.

This is valid:

```java
public class Descriptive {

    private final CarService carService;

    public Descriptive(CarService carService) {

        /*
         * Good:
         * final field initialized.
         */
        this.carService = carService;
    }
}
```

But this is not:

```java
public class Descriptive {

    private final CarService carService;

    public Descriptive() {

        /*
         * ERROR:
         *
         * carService is final but is never assigned.
         */
    }
}
```

---

# 10. Why Multiple Constructors Matter

Suppose `Descriptive` has multiple constructors:

```java
public class Descriptive {

    private final CarService carService;

    public Descriptive() {

        // ERROR:
        // carService not initialized.
    }

    public Descriptive(String text) {

        // ERROR:
        // carService not initialized.
    }

    public Descriptive(String text, int size) {

        // ERROR:
        // carService not initialized.
    }

    public Descriptive(CarService carService) {

        /*
         * This constructor is valid because
         * it initializes the final field.
         */
        this.carService = carService;
    }
}
```

Every possible constructor path must initialize a `final` field.

This explains the Java compiler error you encountered.

---

# 11. What Is an Interface?

You likely have something like:

```java
public interface CarFormatSvc {

    String formatText(String text);

    boolean isCarEnabledFxn();
}
```

An interface defines a contract.

Then:

```java
public class CarFormatSvcImpl
        implements CarFormatSvc {

    @Override
    public String formatText(String text) {
        return text;
    }

    @Override
    public boolean isCarEnabledFxn() {
        return true;
    }
}
```

The relationship is:

```text
CarFormatSvc
     ^
     |
CarFormatSvcImpl
```

The interface defines what must exist.

The implementation provides the actual behavior.

---

# 12. Why Interfaces Matter to Spring

Spring can inject an implementation into a variable whose type is an interface.

Example:

```java
private final CarFormatSvc carFormatSvc;
```

If Spring knows:

```java
@Service
public class CarFormatSvcImpl
        implements CarFormatSvc {
}
```

then Spring can inject `CarFormatSvcImpl` where a `CarFormatSvc` is required.

But only if the implementation is actually registered as a Spring bean.

---

# 13. What Is Dependency Injection?

Without Spring:

```java
CarService carService =
        new CarServiceImpl();

CarFormatSvcImpl formatService =
        new CarFormatSvcImpl(carService);
```

You manually create and connect the objects.

With Spring:

```java
@Service
public class CarServiceImpl
        implements CarService {
}
```

and:

```java
@Service
public class CarFormatSvcImpl {

    private final CarService carService;

    public CarFormatSvcImpl(
            CarService carService) {

        this.carService = carService;
    }
}
```

Spring performs the object creation and connection for you.

Conceptually, Spring does something similar to:

```java
CarService carService =
        new CarServiceImpl();

CarFormatSvcImpl formatService =
        new CarFormatSvcImpl(carService);
```

That automatic connection is dependency injection.

---

# 14. What Is a Dependency?

If this class:

```java
public class CarFormatSvcImpl {

    private CarService carService;
}
```

needs `CarService` to perform its job, then `CarService` is a dependency.

Conceptually:

```text
CarFormatSvcImpl
       |
       | depends on
       v
   CarService
```

Dependency injection means something else supplies the dependency.

---

# 15. What Is a Spring Bean?

A Spring bean is an object that Spring creates, knows about, and manages.

For example:

```java
@Service
public class CarServiceImpl
        implements CarService {
}
```

Spring can create and manage an instance of this class.

Conceptually:

```text
Spring ApplicationContext

+--------------------------------+
|                                |
| CarServiceImpl object          |
|                                |
| CarFormatSvcImpl object        |
|                                |
| OtherService object            |
|                                |
+--------------------------------+
```

These managed objects are beans.

---

# 16. How Does Something Become a Bean?

Common Spring annotations include:

```java
@Service
```

```java
@Component
```

```java
@Repository
```

```java
@Controller
```

and explicit bean definitions:

```java
@Bean
```

Example:

```java
@Service
public class CarServiceImpl
        implements CarService {
}
```

or:

```java
@Configuration
public class BaseConfig {

    @Bean
    public CarService carService() {

        /*
         * Spring stores the object returned by
         * this method as a bean.
         */
        return new CarServiceImpl();
    }
}
```

---

# 17. What Does `@Autowired` Actually Mean?

Suppose:

```java
@Component
public class Example {

    @Autowired
    private CarService carService;
}
```

This does **not** mean:

> Every `Example` object ever created will receive `CarService`.

It means:

> If Spring creates/manages this `Example` object, Spring will try to inject `CarService`.

If Spring creates the object:

```text
Example #1
carService = VALID
```

But if your code does:

```java
Example example =
        new Example();
```

that creates:

```text
Example #2
carService = NULL
```

because Spring was not involved.

---

# 18. This Is Exactly What Is Happening to `Descriptive`

Your real situation is effectively:

```java
public class Descriptive {

    @Autowired
    private CarService carService;
}
```

while elsewhere:

```java
Descriptive d1 = new Descriptive();
Descriptive d2 = new Descriptive();
Descriptive d3 = new Descriptive();
```

Those manually created objects are not automatically processed by Spring.

Therefore:

```text
d1.carService = null
d2.carService = null
d3.carService = null
```

This is the core problem.

---

# 19. Why Adding `@Component` Is Not Enough

You could write:

```java
@Component
public class Descriptive {

    @Autowired
    private CarService carService;
}
```

Spring may create:

```text
Descriptive #1
carService = valid
```

But existing code can still do:

```java
new Descriptive();
```

creating:

```text
Descriptive #2
carService = null
```

and:

```text
Descriptive #3
carService = null
```

So you could have:

```text
                 Spring
                    |
                    v
             Descriptive #1
             CarService OK


Application Code
     |
     +---- new Descriptive()
     |          |
     |          v
     |     Descriptive #2
     |     CarService NULL
     |
     +---- new Descriptive()
                |
                v
           Descriptive #3
           CarService NULL
```

This explains why merely adding Spring annotations may not fix the runtime behavior.

---

# 20. What Is the Spring `ApplicationContext`?

Think of `ApplicationContext` as Spring's container/registry of managed objects.

Conceptually:

```text
ApplicationContext
      |
      +---- "carService"
      |       |
      |       v
      |    CarServiceImpl
      |
      +---- "carFormatSvc"
      |       |
      |       v
      |    CarFormatSvcImpl
      |
      +---- other beans...
```

You can ask Spring:

```java
CarService carService =
        applicationContext.getBean(
                CarService.class
        );
```

This means:

> Spring, give me the bean that matches `CarService`.

But Spring can only return one if it knows about one.

---

# 21. Understanding "No Qualifying Bean"

You encountered an error similar to:

```text
No qualifying bean available
expected at least 1 bean which qualifies
as autowire candidate
```

Plain English:

> Spring looked through the beans it knows about and could not find one matching the requested type.

For example:

```java
@Component
public class Something {

    private final CarService carService;

    public Something(CarService carService) {
        this.carService = carService;
    }
}
```

Spring tries to satisfy:

```text
Need:
CarService
```

but if its container only has:

```text
CustomerService
AccountService
CarFormatSvc
DatabaseService
```

then Spring fails.

---

# 22. Why Does `CarService` Work in `CarFormatSvcImpl`?

This is one of the most important diagnostic questions.

You already know this works:

```java
carService.getCarEnabledValue();
```

inside `CarFormatSvcImpl`.

That means something is providing a real `carService` object there.

Find out exactly how.

Possible patterns:

## Pattern A — field injection

```java
@Autowired
private CarService carService;
```

## Pattern B — constructor injection

```java
private final CarService carService;

public CarFormatSvcImpl(
        CarService carService) {

    this.carService = carService;
}
```

## Pattern C — manual creation

```java
private CarService carService =
        new CarServiceImpl();
```

## Pattern D — configuration lookup

```java
private CarService carService =
        someConfig.getCarService();
```

## Pattern E — inherited from a base class

```java
public class CarFormatSvcImpl
        extends SomeBaseClass {
}
```

## Pattern F — setter injection

```java
public void setCarService(
        CarService carService) {

    this.carService = carService;
}
```

These scenarios require different fixes.

---

# 23. Imports Matter

Suppose the working class imports:

```java
import services.car.CarService;
```

but another class imports:

```java
import services.configuration.CarService;
```

Both names appear as:

```text
CarService
```

but Java treats them as different types.

Spring may have a bean for:

```text
services.car.CarService
```

while your new code requests:

```text
services.configuration.CarService
```

Result:

```text
No qualifying bean
```

Always compare the exact imports.

---

# 24. A Bean Definition Must Return the Right Type

Suppose `BaseConfig` contains:

```java
@Configuration
public class BaseConfig {

    @Bean
    public CarService carService() {

        return new CarServiceImpl();
    }
}
```

That registers a `CarService`.

But this:

```java
@Bean
public String carServiceUrl() {

    return "https://something";
}
```

registers a `String`, not `CarService`.

The return type matters.

---

# 25. What Is Component Scanning?

Spring has to discover Spring-managed classes.

For example:

```text
com.company.myapp
│
├── service
│   └── ServiceA
│
├── controller
│   └── ControllerA
│
└── format
    └── Formatter
```

If the application scans `com.company.myapp`, it can discover annotated classes underneath it.

But a class outside the scan path may not be found.

For example:

```text
other.company.service
└── CarServiceImpl
```

If Spring never discovers/registers it, then:

```java
@Autowired
CarService carService;
```

may fail.

---

# 26. Constructor Injection

This is constructor injection:

```java
public class CarFormatSvcImpl {

    private final CarService carService;

    public CarFormatSvcImpl(
            CarService carService) {

        this.carService = carService;
    }
}
```

It clearly says:

> `CarFormatSvcImpl` requires `CarService`.

This is generally easier to reason about than hidden field injection.

But it only works automatically if Spring creates the object.

---

# 27. Constructor Injection Does Not Automatically Fix Manual Objects

This:

```java
public class Descriptive {

    public Descriptive(
            CarService carService) {
    }
}
```

means Java requires:

```java
new Descriptive(carService);
```

It does **not** mean this will work:

```java
new Descriptive();
```

Some caller still has to provide the dependency.

That is why manually created `Descriptive` instances are the central issue.

---

# 28. Dependency Injection Is Really Object Construction Management

A useful mental model is:

> Spring does not merely "fill variables." Spring manages how application objects are created and connected.

Example:

```text
                    Spring
                      |
         +------------+-------------+
         |                          |
         v                          v
    CarService                 OtherService
         |
         v
  CarFormatSvcImpl
         |
         v
     Controller
```

But when your code does:

```java
new Descriptive();
```

that object exists outside the Spring-managed object graph.

That is the architectural boundary.

---

# 29. Spring-Managed vs Plain Java Objects

Your application effectively has two worlds.

## Spring world

```text
Spring ApplicationContext

CarService
CarFormatSvcImpl
Controllers
Repositories
Other beans
```

## Plain Java world

```text
new Descriptive(...)
new Something(...)
new AnotherFormatter(...)
```

Your problem is trying to make a manually created `Descriptive` object automatically receive something from the Spring world.

---

# 30. What "Pass It Down" Means

Suppose:

```java
public String formatText(...) {

    /*
     * Get the value here.
     */
    boolean isCarEnabled =
            carService.getCarEnabledValue();

    /*
     * Pass the value directly to the next method.
     */
    return descriptive.formatDescription(
            text,
            isCarEnabled
    );
}
```

Then:

```java
public String formatDescription(
        String text,
        boolean isCarEnabled) {

    /*
     * No Spring is required to get the boolean.
     * It was simply passed as a Java parameter.
     */
}
```

That is what "pass it down" means.

---

# 31. Why Passing It Down Is Clean but Costly Here

Conceptually:

```text
CarService
     |
     v
CarFormatSvcImpl
     |
     | passes boolean
     v
Descriptive
```

This is simple and explicit.

However, `formatDescription(...)` is used widely.

Changing:

```java
formatDescription(a, b)
```

to:

```java
formatDescription(a, b, isCarEnabled)
```

could cause a large ripple of changes.

So the architecture is clean, but the migration cost is high.

---

# 32. Why Injecting `CarFormatSvc` Back into `Descriptive` Can Be Problematic

Suppose:

```text
CarFormatSvcImpl
      |
      | uses
      v
Descriptive
      |
      | uses
      v
CarFormatSvc
```

Now the dependency loops back:

```text
CarFormatSvcImpl
       |
       v
  Descriptive
       |
       v
CarFormatSvcImpl
```

This is a circular dependency.

Plain English:

> A depends on B, while B depends on A.

Circular dependencies usually indicate that responsibilities should be reorganized.

---

# 33. Why Storing `isCarEnabled` on a Singleton Service Can Be Risky

If:

```java
@Service
public class CarFormatSvcImpl {

    private boolean isCarEnabled;
}
```

Spring will usually create one shared service object per application context.

Conceptually:

```text
ONE CarFormatSvcImpl OBJECT

             isCarEnabled
                  |
        +---------+---------+
        |                   |
     Request A           Request B
```

Request A:

```java
this.isCarEnabled = true;
```

Request B:

```java
this.isCarEnabled = false;
```

Request A could then accidentally see Request B's value.

This is why request-specific or operation-specific data is often better kept in local variables or dedicated context objects.

---

# 34. Singleton Scope

Spring services are usually singleton-scoped by default.

Conceptually:

```text
             ONE OBJECT
                 |
         CarFormatSvcImpl
                 |
        isCarEnabled field
                 |
    +------------+------------+
    |            |            |
 Caller 1     Caller 2     Caller 3
```

That shared state requires caution.

---

# 35. Local Variables Avoid Shared Mutable State

Prefer when possible:

```java
public String formatText(...) {

    /*
     * Each call gets its own local variable.
     */
    boolean isCarEnabled =
            carService.getCarEnabledValue();

    // ...
}
```

Conceptually:

```text
Call A
  |
  +---- isCarEnabled = true


Call B
  |
  +---- isCarEnabled = false
```

They do not overwrite each other.

---

# 36. Treat Your Errors as Three Separate Problems

## Problem A — `Descriptive` is not Spring-managed

Because `Descriptive` is created using `new`, normal Spring dependency injection does not happen.

## Problem B — `final` field initialization error

```text
field carService might not have been initialized
```

This is a Java compiler rule.

Every constructor must initialize every `final` field.

## Problem C — no qualifying Spring bean

```text
No qualifying bean of type CarService
```

This is a Spring container/registration problem.

Spring cannot find the requested bean type.

These problems are related, but they are not identical.

---

# 37. What Is a Factory?

A factory is simply a class responsible for creating objects.

Without a factory:

```java
Descriptive d =
        new Descriptive(...);
```

With a factory:

```java
Descriptive d =
        descriptiveFactory.create(...);
```

Example:

```java
@Component
public class DescriptiveFactory {

    private final CarService carService;

    /*
     * The factory IS Spring-managed.
     *
     * Therefore Spring can inject CarService here.
     */
    public DescriptiveFactory(
            CarService carService) {

        this.carService = carService;
    }

    public Descriptive create(
            String existingValue) {

        /*
         * Descriptive remains a plain Java object.
         *
         * The factory explicitly supplies the
         * Spring-managed dependency.
         */
        return new Descriptive(
                existingValue,
                carService
        );
    }
}
```

Then:

```java
public class Descriptive {

    private final String existingValue;
    private final CarService carService;

    public Descriptive(
            String existingValue,
            CarService carService) {

        /*
         * All final fields are initialized.
         */
        this.existingValue = existingValue;
        this.carService = carService;
    }

    public String formatDescription(...) {

        /*
         * formatDescription's existing signature
         * does not need to change.
         */
        boolean enabled =
                carService.getCarEnabledValue();

        // Existing logic...

        return "";
    }
}
```

---

# 38. Why a Factory Helps

Instead of:

```text
Class A ---- new Descriptive()
Class B ---- new Descriptive()
Class C ---- new Descriptive()
Class D ---- new Descriptive()
Class E ---- new Descriptive()
```

you can gradually move toward:

```text
Class A ---+
Class B ---+
Class C ---+--> DescriptiveFactory --> Descriptive
Class D ---+
Class E ---+
```

Then changes to construction are centralized.

---

# 39. A Factory Still Needs a Spring Boundary

Suppose:

```java
@Service
public class SomeService {

    private final DescriptiveFactory factory;

    public SomeService(
            DescriptiveFactory factory) {

        this.factory = factory;
    }
}
```

This works because `SomeService` is Spring-managed.

But if another plain Java class does:

```java
new DescriptiveFactory(...)
```

you may simply move the dependency problem upward.

So you need to identify where Spring-managed code transitions into manually created objects.

---

# 40. Find the Spring Boundary

A likely runtime flow is:

```text
Controller
   |
   v
CarFormatSvcImpl         <-- Spring-managed
   |
   v
FormatFactory            <-- maybe Spring-managed
   |
   v
Descriptive              <-- manually created
   |
   v
formatDescription()
```

The key question is:

> Where is the first `new Descriptive(...)` executed from a Spring-managed object?

That is often the best place to introduce the dependency.

---

# 41. Prototype Scope

Spring also supports prototype-scoped beans.

Example:

```java
@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class Descriptive {

    private final CarService carService;

    public Descriptive(
            CarService carService) {

        this.carService = carService;
    }
}
```

Prototype means Spring can create a new instance each time one is requested.

Conceptually:

```text
get bean
   |
   +---- Descriptive #1

get bean
   |
   +---- Descriptive #2

get bean
   |
   +---- Descriptive #3
```

But existing code doing:

```java
new Descriptive();
```

still bypasses Spring.

Prototype scope only helps if the creation path is also changed to request instances from Spring.

---

# 42. ApplicationContext Lookup / Service Locator

A workaround for legacy code is:

```java
CarService carService =
        SpringContext.getBean(
                CarService.class
        );
```

This lets a plain Java object ask Spring for a bean.

Conceptually:

```text
Plain Java object
       |
       | asks
       v
Spring ApplicationContext
       |
       v
CarService
```

However, this hides dependencies and couples `Descriptive` to Spring.

It may be acceptable as a temporary legacy bridge, but it is usually not the cleanest long-term design.

---

# 43. Understanding the Error from ApplicationContext Lookup

Suppose:

```java
return context.getBean(
        CarService.class
);
```

Spring searches the current `ApplicationContext`.

If it finds a matching bean:

```text
FOUND
```

If not:

```text
No qualifying bean
```

So before relying on this approach, establish whether the working `carService` inside `CarFormatSvcImpl` is actually registered as a Spring bean.

---

# 44. Diagnostic: Print the Actual Runtime `CarService`

Inside the class where `carService` already works:

```java
public String formatText(...) {

    /*
     * Print the object reference.
     */
    System.out.println(
            "carService = " + carService
    );

    /*
     * Print the runtime implementation class.
     *
     * This tells you what actual class sits behind
     * the CarService interface variable.
     */
    System.out.println(
            "Actual class = "
                    + carService
                        .getClass()
                        .getName()
    );

    boolean enabled =
            carService.getCarEnabledValue();

    // Existing logic...

    return "";
}
```

This can reveal whether the object is a specific implementation or a Spring proxy.

---

# 45. Polymorphism

Suppose:

```java
public interface Animal {

    void makeNoise();
}
```

and:

```java
public class Dog
        implements Animal {

    @Override
    public void makeNoise() {
        System.out.println("Woof");
    }
}
```

Then:

```java
Animal animal =
        new Dog();
```

The variable type is:

```text
Animal
```

The actual object is:

```text
Dog
```

The same can happen with:

```java
CarService carService =
        new CarServiceImpl();
```

Declared type:

```text
CarService
```

Runtime implementation:

```text
CarServiceImpl
```

---

# 46. How to Read "Constructor Parameter 0"

Suppose:

```java
public Something(
        CarService carService,
        AccountService accountService) {
}
```

Constructor parameters are numbered starting at zero:

```text
parameter 0 = CarService
parameter 1 = AccountService
```

So if Spring reports:

```text
Unsatisfied dependency expressed through
constructor parameter 0
```

it means it could not supply:

```java
CarService carService
```

This is a useful debugging technique.

---

# 47. How to Read Spring Startup Errors

Suppose the error says:

```text
Error creating bean with name 'descriptiveFactory'

Unsatisfied dependency expressed through
constructor parameter 0:

No qualifying bean of type
'com.example.CarService'
```

Translate it into plain English:

```text
Spring tried to create:
DescriptiveFactory

Its constructor needs:
parameter 0

Parameter 0 type:
CarService

Spring searched:
ApplicationContext

Result:
No matching CarService bean
```

This makes Spring errors much easier to understand.

---

# 48. Likely Current Architecture

Based on the discovered behavior:

```text
                        Spring
                           |
                +----------+-----------+
                |                      |
                v                      v
        CarFormatSvcImpl          other beans
                |
                |
            carService
            WORKS HERE
                |
                v
          formatText(...)
                |
                |
                v
        some formatting code
                |
                |
                +------ new Descriptive(...)
                           |
                           v
                      Descriptive
                           |
                      NOT managed
                           |
                           v
                     carService
                         NULL
```

This is the core problem.

---

# 49. The Boolean Is Not the Root Problem

The original question looked like:

```text
How do I get isCarEnabled into Descriptive?
```

The deeper issue is:

```text
How does Descriptive obtain dependencies?
```

The answer discovered so far is:

```text
It does not receive them automatically,
because Descriptive is manually instantiated.
```

That is the architectural issue.

---

# 50. Main Architectural Options

Your realistic options are:

1. Keep `Descriptive` as plain Java and pass required dependencies during construction.
2. Centralize `Descriptive` construction using a Spring-managed factory.
3. Gradually convert creation paths so Spring provides `Descriptive`.
4. Use `ApplicationContext.getBean(...)` as a legacy bridge.
5. Pass a formatting/context object through construction.
6. Eventually pass the value directly through the call chain if the codebase allows it.
7. Use prototype Spring beans if object creation can be shifted into Spring.

For this codebase, a **factory** is likely one of the strongest options if there is a common creation path.

---

# 51. Debugging Exercise

Open:

```text
services/carformatsvc/service/CarFormatSvcImpl.java
```

Find the working field:

```java
carService
```

Determine how it is populated.

Search for:

```java
@Autowired
private CarService carService;
```

or:

```java
private final CarService carService;
```

Then inspect the constructor.

Also inspect the exact import:

```java
import ???????.CarService;
```

Then search the project for:

```text
implements CarService
```

Look for something like:

```java
@Service
public class CarServiceImpl
        implements CarService {
}
```

Also search for:

```text
@Bean
```

together with:

```text
CarService
```

You may find:

```java
@Bean
public CarService carService() {
    ...
}
```

This investigation tells you how the working service comes into existence.

---

# 52. A Useful Spring Debugging Rule

Whenever you see:

```java
@Autowired
```

or constructor injection, ask:

> Who created this particular object?

If the answer is:

```text
Spring
```

dependency injection should be possible.

If the answer is:

```text
new
```

normal Spring injection usually does not happen.

This single question solves many Spring dependency-injection problems.

---

# 53. Follow the Object, Not Just the Class

Suppose:

```java
@Component
public class Descriptive {
}
```

That annotation applies to the class definition.

At runtime, you may still have:

```text
Descriptive class
       |
       +---- Object A created by Spring
       |
       +---- Object B created with new
       |
       +---- Object C created with new
       |
       +---- Object D created with new
```

Only Object A automatically participates in normal Spring dependency injection.

So do not ask only:

> Is `Descriptive` annotated?

Also ask:

> Was this particular `Descriptive` object created by Spring?

---

# 54. Why `CarFormatSvc.isCarEnabledFxn()` Did Not Solve the Problem

You added:

```java
public boolean isCarEnabledFxn() {
    return isCarEnabled;
}
```

That exposes the value.

But to call:

```java
carFormatSvc.isCarEnabledFxn();
```

you first need:

```java
carFormatSvc != null
```

Inside a manually created `Descriptive` instance, nobody assigned that field.

Therefore the getter was not the actual problem.

The missing object reference was.

---

# 55. Getters Do Not Solve Dependency Problems

A getter solves:

```text
How do I expose this field?
```

It does not solve:

```text
How does Descriptive obtain a CarFormatSvc object?
```

Those are two separate problems.

---

# 56. Core Concepts to Understand

The important concepts in this problem are:

```text
Java object
       ↓
new
       ↓
constructor
       ↓
fields / final
       ↓
interfaces + implementations
       ↓
dependencies
       ↓
Spring beans
       ↓
ApplicationContext
       ↓
dependency injection
       ↓
component scanning
       ↓
Spring-managed vs manually-created objects
       ↓
singleton state
       ↓
factories
```

Understanding these concepts gives you the foundation to reason through the bug instead of only trying different annotations.

---

# 57. How to Explain the Blocker to Another Engineer

A full technical explanation:

> `CarFormatSvcImpl` successfully has access to `CarService`, but `Descriptive` is not Spring-managed in practice because it is instantiated manually throughout the formatting code. Therefore adding `@Autowired` or a Spring-injected constructor to `Descriptive` does not affect those manually created instances. I also cannot simply add `isCarEnabled` to `formatDescription()` because that signature has a large call footprint. I need to identify how the existing `CarService` is provisioned and then centralize or bridge `Descriptive` construction without breaking all existing callers.

---

# 58. Short Stand-Up Version

> I'm blocked on dependency injection into `Descriptive`. It's manually instantiated in multiple places rather than managed by Spring, so `CarService` is null there. Passing the value directly would require changing a widely used method signature. I'm tracing the current construction path and how `CarService` is registered so I can introduce the dependency at the creation boundary instead.

---

# 59. Likely Target Architecture

A likely clean target is:

```text
                      Spring
                        |
                        v
                   CarService
                        |
                        v
                DescriptiveFactory
                        |
                        | creates
                        v
                   Descriptive
                        |
                        |
                        v
             formatDescription(...)
```

instead of:

```text
                       Spring
                         |
                    CarService

                         X
                         |
                         |
                  new Descriptive()
                         |
                         v
                  carService = null
```

This preserves `Descriptive` as a normal Java object while centralizing how it receives dependencies.

---

# 60. The Single Biggest Lesson

When debugging Spring dependency injection, always ask:

> **Who created this particular object?**

For `CarFormatSvcImpl`, the answer is probably Spring.

For `Descriptive`, the answer has already been discovered:

```java
new Descriptive(...)
```

That difference is the root of the current problem.

The next diagnostic step is to determine exactly how the working `carService` inside `CarFormatSvcImpl` is declared, imported, and initialized. That will explain the `No qualifying bean` error and help determine whether a factory, context bridge, or another design is the best solution.
