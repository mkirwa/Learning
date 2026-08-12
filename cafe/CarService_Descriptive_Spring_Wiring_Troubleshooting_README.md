# Troubleshooting `CarService` Injection in a Non-Spring-Managed `Descriptive` Class

## BLUF

The core issue is:

> `Descriptive` is instantiated manually in many places, so Spring does not manage those instances. Because of that, Spring cannot automatically inject `CarService`, `CarFormatSvc`, or any other dependency into those `Descriptive` objects.

You are currently seeing two different errors:

1. **`field carService might not have been initialized`**
   - This is a Java compiler error.
   - It happens because `carService` is declared `final`, but not every `Descriptive` constructor assigns it.

2. **`Unsatisfied dependency expressed through constructor parameter 0 ... No qualifying bean available`**
   - This is a Spring error.
   - It means Spring tried to inject a type but could not find a matching bean in the `ApplicationContext`.

These errors have different causes and should be investigated separately.

---

# Current Project Structure

```text
services/
└── carformatsvc/
    ├── service/
    │   └── CarFormatSvcImpl.java
    │
    └── format/
        └── descriptive/
            └── Descriptive.java
```

`CarFormatSvcImpl` successfully gets a value from `CarService`:

```java
this.isCarEnabled = carService.getCarEnabledValue();
```

However, inside `Descriptive`, attempts to inject or access `CarService` result in `null`.

The reason is that `Descriptive` is created manually in many places using `new`.

---

# 1. Why `Descriptive` Cannot Use Normal Spring Injection

Spring only performs dependency injection on objects that Spring itself manages.

For example:

```java
@Component
public class Descriptive {

    @Autowired
    private CarService carService;
}
```

This only works if Spring creates the `Descriptive` instance.

This can receive injection:

```text
Spring
  |
  +---- creates Descriptive
          |
          +---- injects CarService
```

But this cannot automatically receive injection:

```java
Descriptive descriptive = new Descriptive();
```

because Java created it directly:

```text
Application code
  |
  +---- new Descriptive()
          |
          +---- Spring is never involved
```

Therefore:

```java
carService == null
```

inside that object.

---

# 2. Why `private final CarService carService;` Fails to Compile

Suppose `Descriptive` has several constructors:

```java
public class Descriptive {

    private final CarService carService;

    public Descriptive() {
        // carService is not assigned
    }

    public Descriptive(String text) {
        // carService is not assigned
    }

    public Descriptive(String text, String type) {
        // carService is not assigned
    }
}
```

Because `carService` is `final`, Java requires it to be assigned before every constructor finishes.

Java sees this:

```java
new Descriptive();
```

and asks:

```text
What value should carService have?
```

No value was assigned.

Therefore the compiler reports:

```text
field carService might not have been initialized
```

Changing:

```java
private final CarService carService;
```

to:

```java
private CarService carService;
```

removes the compiler error, but it does **not** solve the dependency problem.

The field will simply default to:

```java
null
```

for manually-created `Descriptive` instances.

---

# 3. Why Spring Says `No Qualifying Bean Available`

The second error looks approximately like:

```text
Unsatisfied dependency expressed through constructor parameter 0

No qualifying bean of type '...CarService' available

expected at least 1 bean which qualifies as autowire candidate
```

This means Spring attempted something conceptually like:

```java
public SomeSpringBean(CarService carService) {
    this.carService = carService;
}
```

but when Spring searched its `ApplicationContext`, it found zero beans matching that `CarService` type.

This is different from `Descriptive.carService == null`.

The key question becomes:

> How is the working `carService` inside `CarFormatSvcImpl` currently being created or populated?

---

# 4. Inspect the Working `CarService` First

You already know this works:

```java
carService.getCarEnabledValue();
```

inside `CarFormatSvcImpl.java`.

Before changing `Descriptive`, determine how that working `carService` is provided.

Possible patterns include:

## Pattern A — Field Injection

```java
@Autowired
private CarService carService;
```

## Pattern B — Constructor Injection

```java
private final CarService carService;

public CarFormatSvcImpl(CarService carService) {
    this.carService = carService;
}
```

## Pattern C — Manual Construction

```java
private CarService carService =
        new CarServiceImpl();
```

## Pattern D — Configuration / Factory

```java
@Bean
public CarService carService() {
    return new CarServiceImpl(...);
}
```

## Pattern E — Inherited From a Base Class

```java
public class CarFormatSvcImpl extends BaseService {
}
```

with:

```java
public class BaseService {
    protected CarService carService;
}
```

## Pattern F — Setter Injection

```java
@Autowired
public void setCarService(CarService carService) {
    this.carService = carService;
}
```

The safest solution is usually to reuse the mechanism already working in the application.

---

# 5. Compare the `CarService` Imports

Check the working import in `CarFormatSvcImpl.java`.

For example:

```java
import services.car.CarService;
```

Then compare it with the import in the new code.

They must refer to the exact same Java type.

These are completely different types to Java and Spring:

```java
services.car.CarService
```

and:

```java
services.carformatsvc.CarService
```

even though both have the simple name:

```text
CarService
```

A wrong import can produce:

```text
No qualifying bean of type '...CarService' available
```

even when another `CarService` bean exists.

---

# 6. Determine What the Working `CarService` Actually Is

Temporarily add debugging inside the working `CarFormatSvcImpl`.

```java
public String formatText(/* arguments */) {

    System.out.println(
            "carService object = " + carService
    );

    System.out.println(
            "carService runtime class = "
                    + carService.getClass().getName()
    );

    boolean isCarEnabled =
            carService.getCarEnabledValue();

    // Existing code...

    return "";
}
```

Possible output:

```text
carService object = com.company.car.CarServiceImpl@74ad21

carService runtime class =
com.company.car.CarServiceImpl
```

Or, if Spring proxies it:

```text
com.company.car.CarServiceImpl$$SpringCGLIB$$...
```

Both results are useful.

---

# 7. Ask Spring Whether It Knows About `CarService`

If `CarFormatSvcImpl` is Spring-managed, you can temporarily inject the `ApplicationContext`.

```java
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class CarFormatSvcImpl implements CarFormatSvc {

    private final ApplicationContext applicationContext;

    public CarFormatSvcImpl(
            ApplicationContext applicationContext
            /* other existing arguments */) {

        this.applicationContext = applicationContext;
    }

    public String formatText(/* arguments */) {

        String[] carServiceBeans =
                applicationContext.getBeanNamesForType(
                        CarService.class
                );

        System.out.println(
                "CarService beans = "
                        + Arrays.toString(carServiceBeans)
        );

        // Existing logic...

        return "";
    }
}
```

---

# 8. How to Interpret the Result

## Result A

If Spring prints:

```text
CarService beans = [carServiceImpl]
```

then Spring has a valid `CarService`.

That means any failure elsewhere may be caused by:

- a different Spring `ApplicationContext`;
- a wrong import;
- different configuration;
- a different `CarService` type.

## Result B

If Spring prints:

```text
CarService beans = []
```

then the working `carService` inside `CarFormatSvcImpl` may not actually be a Spring bean of that type.

Investigate:

- manual construction;
- inherited initialization;
- XML configuration;
- another factory;
- a different application context;
- a different interface type;
- legacy framework integration.

---

# 9. Possible Causes of `No Qualifying Bean`

## Cause A — `CarServiceImpl` Is Not a Spring Bean

You might have:

```java
public class CarServiceImpl implements CarService {
}
```

instead of:

```java
@Service
public class CarServiceImpl implements CarService {
}
```

Do not add `@Service` blindly if the project already creates this object using XML or `@Bean`.

First determine how the application currently configures services.

## Cause B — `CarService` Is Created With `@Bean`

```java
@Configuration
public class BaseConfig {

    @Bean
    public CarService carService() {
        return new CarServiceImpl(...);
    }
}
```

Make sure `BaseConfig` is actually loaded into the same Spring context used by your application.

## Cause C — Component Scanning Does Not Include the Implementation

Depending on package structure, `CarServiceImpl` may be outside the scan path.

Example:

```java
@SpringBootApplication
@ComponentScan(basePackages = {
        "services",
        "com.company"
})
public class Application {
}
```

Do not add this blindly in a large or legacy project.

## Cause D — `@Profile` or `@Conditional`

Check for:

```java
@Profile("prod")
```

or:

```java
@Conditional(...)
```

which can prevent the bean from existing in the active environment.

## Cause E — Multiple Spring Application Contexts

You may have:

```text
ApplicationContext A
    |
    +---- CarService
    +---- CarFormatSvcImpl

ApplicationContext B
    |
    +---- another part of the application
```

If the new helper lives in Context B, it may not see `CarService` from Context A.

---

# 10. Option: Static Spring Context Bridge

Because `Descriptive` is not Spring-managed and its method signature cannot easily change, one possible **legacy workaround** is a static Spring context helper.

Use this only after confirming Spring actually has the `CarService` bean.

## `SpringContext.java`

```java
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class SpringContext {

    private static ApplicationContext context;

    public SpringContext(
            ApplicationContext applicationContext) {

        SpringContext.context = applicationContext;
    }

    public static <T> T getBean(
            Class<T> beanClass) {

        if (context == null) {
            throw new IllegalStateException(
                    "Spring ApplicationContext has not been initialized."
            );
        }

        return context.getBean(beanClass);
    }
}
```

---

# 11. Use the Bean as a Local Variable in `Descriptive`

If the bridge works, you do **not** need:

```java
private final CarService carService;
```

inside `Descriptive`.

Instead:

```java
public class Descriptive {

    public String formatDescription(
            /* KEEP ALL EXISTING ARGUMENTS */) {

        CarService carService =
                SpringContext.getBean(
                        CarService.class
                );

        boolean isCarEnabled =
                carService.getCarEnabledValue();

        if (isCarEnabled) {
            // Enabled formatting logic.
        }

        // Existing formatting logic...

        return "";
    }
}
```

This avoids the Java compiler error because there is no `final` field.

It also avoids changing the signature of `formatDescription(...)` throughout the codebase.

---

# 12. Why the Static Context Bridge Is Not Ideal

Although it may solve the immediate legacy-code problem, it has disadvantages:

- dependencies become hidden;
- unit testing is harder;
- framework coupling increases;
- future refactoring becomes harder.

Use it only when changing the creation paths of `Descriptive` would be prohibitively expensive.

---

# 13. Preferred Long-Term Option: A Factory

Because `Descriptive` is instantiated many times, a cleaner architecture is to centralize its construction.

```java
@Component
public class DescriptiveFactory {

    private final CarService carService;

    public DescriptiveFactory(
            CarService carService) {

        this.carService = carService;
    }

    public Descriptive create(
            /* existing runtime arguments */) {

        return new Descriptive(
                /* existing arguments, */
                carService
        );
    }
}
```

Then:

```java
public class Descriptive {

    private final CarService carService;

    public Descriptive(
            /* existing arguments, */
            CarService carService) {

        this.carService = carService;
    }

    public String formatDescription(
            /* EXISTING arguments */) {

        boolean isCarEnabled =
                carService.getCarEnabledValue();

        // Existing logic...

        return "";
    }
}
```

Architecture:

```text
                Spring
                  |
          +-------+-------+
          |               |
          v               v
 DescriptiveFactory    CarService
          |
          | creates
          v
     Descriptive
          |
          +---- receives CarService
```

---

# 14. Search for Existing Creation Points Before Adding a Factory

Search the project for:

```text
new Descriptive(
```

Also search for:

```text
DescriptiveFactory
FormatFactory
FormatterFactory
createDescriptive
getDescriptive
```

You may discover that many usages funnel through one factory or builder.

If so, fixing that one creation point may solve the issue with minimal changes.

---

# 15. Diagnostic Checklist

1. Inspect the working declaration in `CarFormatSvcImpl.java`.
2. Find exactly how `carService` is initialized.
3. Compare the exact `CarService` import in working and failing code.
4. Print the runtime class of the working service.
5. Ask the same `ApplicationContext` for beans of type `CarService`.
6. If the result is empty, investigate manual construction, XML, inheritance, profiles, scanning, or multiple contexts.
7. If Spring reports a bean, a temporary context bridge may work.
8. Long term, centralize `new Descriptive(...)` behind a Spring-managed factory.

---

# 16. Recommended Decision Tree

```text
Descriptive is created with "new"?
        |
        +---- YES
        |
        +---- Normal @Autowired inside Descriptive
              will NOT work automatically.
                    |
                    v
          Does formatDescription(...)
          have too many callers to change?
                    |
              +-----+-----+
              |           |
             YES          NO
              |           |
              v           v
       Avoid changing    Pass dependency/
       method signature  context explicitly
              |
              v
       Does Spring actually
       have CarService bean?
              |
        +-----+-----+
        |           |
       YES          NO
        |           |
        v           v
  Factory or       Find how working
  temporary        CarFormatSvcImpl
  context bridge   receives CarService
        |
        v
  Prefer factory
  long term
```

---

# 17. One-Sentence Blocker Explanation

You can explain the blocker to another developer like this:

> `Descriptive` is manually instantiated throughout the legacy codebase, so Spring cannot inject dependencies into it. Adding a final `CarService` field breaks existing constructors because every constructor must initialize it, while attempts to retrieve or inject `CarService` through Spring are failing because the relevant application context does not appear to contain a qualifying `CarService` bean—or the new code is using a different service type/context than the working `CarFormatSvcImpl`.

---

# 18. Recommended Next Action

Do **not** immediately modify every `Descriptive` constructor or every `formatDescription()` call.

First determine:

1. How the working `CarFormatSvcImpl.carService` is populated.
2. The exact package/import of that `CarService`.
3. Whether the same `ApplicationContext` reports beans for that type.
4. Whether the application has more than one Spring context.
5. Whether an existing factory already centralizes `new Descriptive(...)`.

Those answers will determine whether the smallest safe fix is:

- fixing the existing Spring bean registration;
- modifying an existing factory;
- introducing a `DescriptiveFactory`;
- or using a temporary Spring context bridge for the legacy class.
