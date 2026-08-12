# Passing `isCarEnabled` Through Multiple Classes to `Descriptive`

## BLUF

If `CarService` works correctly in `CarFormatSvcImpl`, but `Descriptive` is **not Spring-managed**, a clean solution is:

> Get `isCarEnabled` in the Spring-managed service, then pass that value down through each class in the call chain until it reaches `Descriptive`.

This avoids trying to inject `CarService` into `Descriptive`.

```text
CarService
    |
    v
CarFormatSvcImpl
    |
    | isCarEnabled
    v
Class A
    |
    | isCarEnabled
    v
Class B
    |
    | isCarEnabled
    v
Class C
    |
    | isCarEnabled
    v
Descriptive
```

Once `isCarEnabled` is a normal Java `boolean`, Spring no longer matters for passing that value.

---

# 1. Basic Example

Assume the application flow is:

```text
CarFormatSvcImpl.formatText()
        |
        v
FormatProcessor.process()
        |
        v
FormatBuilder.build()
        |
        v
Descriptive.formatDescription()
```

## `CarFormatSvcImpl`

```java
@Service
public class CarFormatSvcImpl implements CarFormatSvc {

    private final CarService carService;
    private final FormatProcessor formatProcessor;

    public CarFormatSvcImpl(
            CarService carService,
            FormatProcessor formatProcessor) {

        this.carService = carService;
        this.formatProcessor = formatProcessor;
    }

    public String formatText(String text) {

        /*
         * Get the value while we are still inside
         * the Spring-managed class where CarService works.
         */
        boolean isCarEnabled =
                carService.getCarEnabledValue();

        /*
         * Pass the value to the next class.
         */
        return formatProcessor.process(
                text,
                isCarEnabled
        );
    }
}
```

## `FormatProcessor`

```java
public class FormatProcessor {

    private final FormatBuilder formatBuilder;

    public FormatProcessor(
            FormatBuilder formatBuilder) {

        this.formatBuilder = formatBuilder;
    }

    public String process(
            String text,
            boolean isCarEnabled) {

        /*
         * This class does not need to use the value.
         * It can simply forward it.
         */
        return formatBuilder.build(
                text,
                isCarEnabled
        );
    }
}
```

## `FormatBuilder`

```java
public class FormatBuilder {

    public String build(
            String text,
            boolean isCarEnabled) {

        /*
         * Descriptive is manually created.
         *
         * Instead of trying to inject CarService into it,
         * give it the boolean directly.
         */
        Descriptive descriptive =
                new Descriptive(isCarEnabled);

        /*
         * The existing formatDescription() method
         * can remain unchanged.
         */
        return descriptive.formatDescription(text);
    }
}
```

## `Descriptive`

```java
public class Descriptive {

    /*
     * This value belongs to this specific
     * Descriptive instance.
     */
    private final boolean isCarEnabled;

    public Descriptive(
            boolean isCarEnabled) {

        this.isCarEnabled = isCarEnabled;
    }

    public String formatDescription(
            String text) {

        /*
         * No new parameter was added to
         * formatDescription().
         */
        if (isCarEnabled) {
            return "Enabled: " + text;
        }

        return text;
    }
}
```

Complete flow:

```text
CarService
    |
    | getCarEnabledValue()
    v
CarFormatSvcImpl
    |
    | isCarEnabled
    v
FormatProcessor
    |
    | isCarEnabled
    v
FormatBuilder
    |
    | new Descriptive(isCarEnabled)
    v
Descriptive
    |
    v
formatDescription()
```

---

# 2. Passing the Boolean Through Many Classes

Suppose the real call chain is:

```text
CarFormatSvcImpl
     |
     v
CarFormatter
     |
     v
FormatProcessor
     |
     v
DescriptionBuilder
     |
     v
FormatFactory
     |
     v
Descriptive
```

You can keep forwarding the same value.

## `CarFormatSvcImpl`

```java
public String formatText(Car car) {

    /*
     * Determine the value once.
     */
    boolean isCarEnabled =
            carService.getCarEnabledValue();

    return carFormatter.format(
            car,
            isCarEnabled
    );
}
```

## `CarFormatter`

```java
public String format(
        Car car,
        boolean isCarEnabled) {

    /*
     * CarFormatter may not need the boolean.
     * It simply forwards it.
     */
    return formatProcessor.process(
            car,
            isCarEnabled
    );
}
```

## `FormatProcessor`

```java
public String process(
        Car car,
        boolean isCarEnabled) {

    return descriptionBuilder.build(
            car,
            isCarEnabled
    );
}
```

## `DescriptionBuilder`

```java
public String build(
        Car car,
        boolean isCarEnabled) {

    return formatFactory.createDescription(
            car,
            isCarEnabled
    );
}
```

## `FormatFactory`

```java
public String createDescription(
        Car car,
        boolean isCarEnabled) {

    /*
     * Pass the value to Descriptive at creation time.
     */
    Descriptive descriptive =
            new Descriptive(
                    car,
                    isCarEnabled
            );

    /*
     * Existing formatDescription signature
     * remains unchanged.
     */
    return descriptive.formatDescription();
}
```

## `Descriptive`

```java
public class Descriptive {

    private final Car car;
    private final boolean isCarEnabled;

    public Descriptive(
            Car car,
            boolean isCarEnabled) {

        this.car = car;
        this.isCarEnabled = isCarEnabled;
    }

    public String formatDescription() {

        if (isCarEnabled) {
            // Car-enabled formatting logic.
        }

        return "";
    }
}
```

---

# 3. Intermediate Classes Do Not Have to Use the Boolean

This is valid:

```java
public String process(
        Car car,
        boolean isCarEnabled) {

    /*
     * This method does not use isCarEnabled.
     *
     * Its only responsibility here is to preserve
     * the value for the next layer.
     */
    return nextClass.doSomething(
            car,
            isCarEnabled
    );
}
```

The value is simply traveling with the current operation.

---

# 4. Why This Is Better Than Calling Back Into `CarFormatSvcImpl`

Avoid this design:

```text
CarFormatSvcImpl
       |
       v
 Descriptive
       |
       v
CarFormatSvcImpl
```

For example:

```java
boolean value =
        carFormatSvc.isCarEnabledFxn();
```

This makes `Descriptive` depend back on the higher-level service and can create:

- circular dependencies;
- difficult Spring wiring;
- hidden dependencies;
- shared mutable state;
- confusing execution flow.

Instead, allow data to move in the same direction as execution:

```text
CarFormatSvcImpl
       |
       | isCarEnabled
       v
   Class A
       |
       v
   Class B
       |
       v
Descriptive
```

---

# 5. Avoid Shared Mutable State on `CarFormatSvcImpl`

Avoid storing request-specific values like this:

```java
@Service
public class CarFormatSvcImpl {

    private boolean isCarEnabled;
}
```

and:

```java
this.isCarEnabled =
        carService.getCarEnabledValue();
```

A normal Spring service is commonly shared between multiple requests.

Conceptually:

```text
              CarFormatSvcImpl
                    |
             isCarEnabled
                    |
          +---------+---------+
          |                   |
      Request A           Request B
          |                   |
        true                false
```

One request could overwrite the value used by another.

Prefer:

```java
boolean isCarEnabled =
        carService.getCarEnabledValue();
```

as a local variable.

---

# 6. If `Descriptive` Has Many Constructors

Suppose `Descriptive` currently has:

```java
public Descriptive() {
}

public Descriptive(String text) {
}

public Descriptive(
        String text,
        String type) {
}
```

Adding:

```java
private final boolean isCarEnabled;
```

means every constructor must initialize it.

One approach is constructor chaining.

```java
public class Descriptive {

    private final String text;
    private final String type;
    private final boolean isCarEnabled;

    public Descriptive() {
        this(
                null,
                null,
                false
        );
    }

    public Descriptive(
            String text) {

        this(
                text,
                null,
                false
        );
    }

    public Descriptive(
            String text,
            String type) {

        this(
                text,
                type,
                false
        );
    }

    /*
     * Main constructor.
     *
     * Callers that know the real value can use this.
     */
    public Descriptive(
            String text,
            String type,
            boolean isCarEnabled) {

        this.text = text;
        this.type = type;
        this.isCarEnabled = isCarEnabled;
    }
}
```

## Important Warning

Do not use:

```java
false
```

as a default merely to satisfy the compiler if that would produce incorrect business behavior.

Determine whether:

- `false` is truly a safe default;
- every important caller should provide the real value;
- or another design is more appropriate.

---

# 7. When Passing One Boolean Is Fine

If you only need:

```java
boolean isCarEnabled
```

then passing it through several classes is perfectly reasonable:

```java
classA.method(..., isCarEnabled);
classB.method(..., isCarEnabled);
classC.method(..., isCarEnabled);
```

and finally:

```java
new Descriptive(..., isCarEnabled);
```

---

# 8. When Parameter Passing Starts Becoming Messy

If you later need:

```java
boolean isCarEnabled;
boolean useNewFormat;
boolean includeDetails;
String carCode;
String region;
String language;
```

methods can become difficult to maintain:

```java
process(
        car,
        isCarEnabled,
        useNewFormat,
        includeDetails,
        carCode,
        region,
        language
);
```

At that point, introduce a context object.

---

# 9. Scalable Option: `CarFormatContext`

Create a plain Java object representing the current formatting operation.

```java
public class CarFormatContext {

    private final boolean carEnabled;

    public CarFormatContext(
            boolean carEnabled) {

        this.carEnabled = carEnabled;
    }

    public boolean isCarEnabled() {
        return carEnabled;
    }
}
```

This does not need Spring.

---

# 10. Create the Context in `CarFormatSvcImpl`

```java
public String formatText(Car car) {

    /*
     * CarService works here.
     */
    boolean isCarEnabled =
            carService.getCarEnabledValue();

    /*
     * Turn the service result into ordinary data.
     */
    CarFormatContext context =
            new CarFormatContext(
                    isCarEnabled
            );

    /*
     * Pass one object down the call chain.
     */
    return carFormatter.format(
            car,
            context
    );
}
```

---

# 11. Forward the Context

```java
public String format(
        Car car,
        CarFormatContext context) {

    return formatProcessor.process(
            car,
            context
    );
}
```

Next:

```java
public String process(
        Car car,
        CarFormatContext context) {

    return descriptionBuilder.build(
            car,
            context
    );
}
```

Next:

```java
public String build(
        Car car,
        CarFormatContext context) {

    Descriptive descriptive =
            new Descriptive(
                    car,
                    context
            );

    return descriptive.formatDescription();
}
```

---

# 12. Use the Context in `Descriptive`

```java
public class Descriptive {

    private final Car car;
    private final CarFormatContext context;

    public Descriptive(
            Car car,
            CarFormatContext context) {

        this.car = car;
        this.context = context;
    }

    public String formatDescription() {

        if (context.isCarEnabled()) {
            // Enabled formatting logic.
        }

        return "";
    }
}
```

---

# 13. Why the Context Object Scales Better

Today:

```java
public class CarFormatContext {

    private final boolean carEnabled;
}
```

Later:

```java
public class CarFormatContext {

    private final boolean carEnabled;
    private final boolean useNewFormat;
    private final String region;
    private final String carCode;
}
```

The intermediate methods can still remain:

```java
process(
        car,
        context
);
```

rather than:

```java
process(
        car,
        isCarEnabled,
        useNewFormat,
        region,
        carCode
);
```

---

# 14. Spring Boundary

A useful mental model is:

```text
              SPRING-MANAGED AREA

CarService
    |
    v
CarFormatSvcImpl
    |
    | convert service result into normal data
    v


              NORMAL JAVA AREA

isCarEnabled / CarFormatContext
    |
    v
Class A
    |
    v
Class B
    |
    v
Class C
    |
    v
Descriptive
```

`Descriptive` no longer needs:

```java
@Autowired
```

or:

```java
ApplicationContext
```

or:

```java
CarService
```

It receives only the information needed for formatting.

---

# 15. Boolean vs Context Object

## Use the Boolean Directly When

You only need one or two values and the call chain is manageable.

```java
classA.method(..., isCarEnabled);
classB.method(..., isCarEnabled);
classC.method(..., isCarEnabled);
```

## Use a Context Object When

You have several values or expect the feature to grow.

```java
classA.method(..., context);
classB.method(..., context);
classC.method(..., context);
```

---

# 16. Recommended Design for This Situation

Given these constraints:

- `CarService` works in `CarFormatSvcImpl`;
- `Descriptive` is not Spring-managed;
- `Descriptive` is instantiated manually in many places;
- changing every `formatDescription()` signature would be expensive;

a strong approach is:

```text
CarService
    |
    v
CarFormatSvcImpl
    |
    | get isCarEnabled
    v
Pass value/context through intermediate classes
    |
    v
Give value/context to Descriptive when creating it
    |
    v
Keep formatDescription(...) unchanged
```

For one boolean:

```java
new Descriptive(..., isCarEnabled);
```

For several related values:

```java
new Descriptive(..., context);
```

---

# 17. One-Sentence Blocker Explanation

> Since `Descriptive` is manually instantiated and therefore cannot reliably use Spring dependency injection, I am retrieving `isCarEnabled` in the already Spring-managed `CarFormatSvcImpl` and passing that request-specific value through the existing call chain until the `Descriptive` instance is created, avoiding both a circular dependency and shared mutable state.

---

# 18. Final Recommendation

Start with the simplest implementation if only one boolean is required:

```java
someMethod(..., isCarEnabled);
```

Pass it through each intermediate layer and eventually use:

```java
new Descriptive(..., isCarEnabled);
```

If several related values begin moving through the same chain, introduce:

```java
CarFormatContext
```

and pass that instead:

```java
someMethod(..., context);
```

This keeps the Spring dependency where it already works, keeps `Descriptive` as a plain Java object, and avoids changing the widely-used `formatDescription()` method signature.
