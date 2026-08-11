# Spring `@Autowired` Dependency Is `null` Inside `getDetails()`

## Overview

This guide explains how to troubleshoot a Spring application where a dependency such as `configService` is unexpectedly `null` inside a method like:

```java
public Details getDetails() throws Exception {
    // configService is unexpectedly null here
}
```

The most important concept is:

> Spring does **not** perform dependency injection every time `getDetails()` is called.

Spring injects dependencies when it creates and manages the object containing `getDetails()`.

Therefore, even if `ConfigService` is correctly declared as a Spring bean, `configService` can still be `null` if the class containing `getDetails()` was created outside the Spring container.

---

# 1. First Determine What Is Actually `null`

Before changing anything, determine whether:

```java
configService == null
```

or:

```java
configService != null
configService.getUrl() == null
```

These are two completely different problems.

## Case 1: The dependency itself is `null`

```java
configService == null
```

This normally indicates a Spring dependency injection / object lifecycle problem.

Typical causes include:

- The class containing `getDetails()` was created with `new`.
- The class containing `getDetails()` is not a Spring bean.
- The caller is not Spring-managed.
- The Spring configuration containing the bean was not loaded.
- Static fields or methods are being used incorrectly.
- A unit test manually instantiated the class.

## Case 2: The dependency exists but its configuration is `null`

```java
configService != null
configService.getUrl() == null
```

This normally indicates a property/configuration issue rather than an autowiring problem.

For example:

```properties
config.service.url=https://example.com/api
```

may be missing, misspelled, or loaded from the wrong profile.

---

# 2. The Most Likely Problem: The Class Was Created With `new`

Assume the class containing `getDetails()` looks like this:

```java
public class DetailsService {

    @Autowired
    private ConfigService configService;

    public Details getDetails() throws Exception {

        String url = configService.getUrl();

        // Additional logic...

        return null;
    }
}
```

If somewhere else in the application you do this:

```java
DetailsService service = new DetailsService();

service.getDetails();
```

then Spring did **not** create that `DetailsService` object.

As a result, Spring never gets an opportunity to inject:

```java
@Autowired
private ConfigService configService;
```

The field remains Java's default value:

```java
null
```

## What to search for

Search the entire project for:

```text
new DetailsService(
```

Replace `DetailsService` with the real class name containing `getDetails()`.

---

# 3. Recommended Fix: Make the Class a Spring Bean

Instead of manually creating the object, let Spring manage it.

## `DetailsService.java`

```java
import org.springframework.stereotype.Service;

@Service
public class DetailsService {

    private final ConfigService configService;

    /*
     * Constructor injection is preferred over field injection.
     *
     * Spring sees that DetailsService requires ConfigService.
     *
     * When Spring creates DetailsService it will:
     *
     * 1. Find a ConfigService bean.
     * 2. Create DetailsService.
     * 3. Pass the ConfigService bean into this constructor.
     *
     * Because configService is final, the dependency must be
     * supplied when the object is created.
     */
    public DetailsService(ConfigService configService) {
        this.configService = configService;
    }

    public Details getDetails() throws Exception {

        /*
         * If Spring successfully created this bean,
         * configService should already be available.
         */
        String url = configService.getUrl();

        // Continue normal processing here.

        return null;
    }
}
```

A single constructor generally does not require `@Autowired` in modern Spring.

---

# 4. The Caller Must Also Use Dependency Injection

Even if `DetailsService` is configured correctly, another class can still break the dependency chain by manually constructing it.

## Incorrect

```java
public class SomeCaller {

    public void process() throws Exception {

        /*
         * WRONG:
         *
         * Java creates this object directly.
         * Spring does not manage this instance.
         */
        DetailsService detailsService = new DetailsService();

        detailsService.getDetails();
    }
}
```

## Correct

```java
import org.springframework.stereotype.Service;

@Service
public class SomeCaller {

    private final DetailsService detailsService;

    /*
     * Spring injects its managed DetailsService bean here.
     */
    public SomeCaller(DetailsService detailsService) {
        this.detailsService = detailsService;
    }

    public void process() throws Exception {

        /*
         * This is the Spring-managed DetailsService instance.
         *
         * Its ConfigService dependency has already been injected.
         */
        detailsService.getDetails();
    }
}
```

---

# 5. The Entire Dependency Chain Must Be Spring-Managed

A healthy dependency chain might look like this:

```text
Spring Application Context
        |
        +---- ConfigService
        |
        +---- DetailsService
        |       |
        |       +---- ConfigService
        |
        +---- SomeCaller
                |
                +---- DetailsService
```

Every class that participates in the dependency chain should normally either:

1. Be created by Spring, or
2. Receive its dependencies explicitly from a Spring-managed object.

---

# 6. Verify the Class Containing `getDetails()` Is a Spring Bean

The class should normally have one of these annotations:

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

```java
@RestController
```

or be explicitly created using an `@Bean` method.

Example:

```java
@Service
public class DetailsService {

    private final ConfigService configService;

    public DetailsService(ConfigService configService) {
        this.configService = configService;
    }
}
```

If the class has no Spring stereotype annotation and no `@Bean` definition, Spring may never manage it.

---

# 7. Your `BaseConfig` Bean Can Be Correct and the Injection Can Still Fail

Suppose the application already contains:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BaseConfig {

    @Bean
    public ConfigService configService() {

        /*
         * Spring creates and stores this object
         * inside the ApplicationContext.
         */
        return new ConfigService("https://example.com");
    }
}
```

This tells Spring how to create a `ConfigService`.

It does **not** automatically make every arbitrary Java object eligible for injection.

For example:

```java
DetailsService service = new DetailsService();
```

still bypasses Spring.

---

# 8. Verify `BaseConfig` Is Actually Loaded

The presence of:

```java
@Configuration
public class BaseConfig
```

does not help if the configuration class is outside the application's component scan or is otherwise not loaded.

You can explicitly import it:

```java
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import(BaseConfig.class)
public class MyApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

This tells Spring explicitly to load `BaseConfig`.

---

# 9. Check Whether Spring Knows About `ConfigService`

You can temporarily ask the Spring `ApplicationContext` for the bean.

```java
import jakarta.annotation.PostConstruct;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class StartupBeanChecker {

    private final ApplicationContext applicationContext;

    public StartupBeanChecker(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @PostConstruct
    public void verifyConfigService() {

        /*
         * Ask Spring directly for ConfigService.
         *
         * If this succeeds, the ConfigService bean exists.
         *
         * If it fails, investigate BaseConfig,
         * component scanning, profiles, or configuration.
         */
        ConfigService configService =
                applicationContext.getBean(ConfigService.class);

        System.out.println(
                "ConfigService bean found: " + configService
        );
    }
}
```

If this successfully prints a bean, the problem is probably not the `ConfigService` bean itself.

Instead, investigate the object that is trying to use it.

---

# 10. Check Whether the URL Is `null`, Not the Bean

Consider:

```java
@Configuration
public class BaseConfig {

    @Value("${config.service.url}")
    private String configServiceUrl;

    @Bean
    public ConfigService configService() {
        return new ConfigService(configServiceUrl);
    }
}
```

The bean may exist perfectly well while this property is missing.

For example:

```java
configService != null
```

but:

```java
configService.getUrl() == null
```

Use temporary diagnostics:

```java
public Details getDetails() throws Exception {

    System.out.println(
            "configService object = " + configService
    );

    if (configService != null) {

        System.out.println(
                "configService URL = " + configService.getUrl()
        );
    }

    return null;
}
```

### Possible output

```text
configService object = com.example.ConfigService@4ab49
configService URL = null
```

In this case Spring injection is working.

Check the configuration instead.

For example:

```properties
config.service.url=https://example.com/api
```

Make sure the property name exactly matches:

```java
@Value("${config.service.url}")
```

Also verify the active Spring profile.

For example:

```text
application.properties
application-dev.properties
application-test.properties
application-prod.properties
```

The property may exist in one profile but not another.

---

# 11. Avoid Manually Creating `BaseConfig`

Do not do this:

```java
BaseConfig config = new BaseConfig();

ConfigService service = config.configService();
```

This creates a normal Java object outside Spring.

Instead, inject the bean Spring created:

```java
@Service
public class DetailsService {

    private final ConfigService configService;

    public DetailsService(ConfigService configService) {
        this.configService = configService;
    }
}
```

Your business class should not need to know that `ConfigService` came from `BaseConfig`.

That is one of the purposes of dependency injection.

---

# 12. Avoid Static Injection

Code like this is problematic:

```java
@Service
public class DetailsService {

    @Autowired
    private static ConfigService configService;

    public static Details getDetails() {

        // Problematic design.
        return null;
    }
}
```

Spring injects dependencies into bean instances.

Prefer normal instance fields and instance methods.

```java
@Service
public class DetailsService {

    private final ConfigService configService;

    public DetailsService(ConfigService configService) {
        this.configService = configService;
    }

    public Details getDetails() throws Exception {

        String url = configService.getUrl();

        return retrieveDetails(url);
    }

    private Details retrieveDetails(String url) {

        // Perform the actual request / processing here.

        return null;
    }
}
```

---

# 13. The Caller Itself May Not Be Spring-Managed

You might correctly define:

```java
@Service
public class DetailsService {
    ...
}
```

but then have:

```java
public class DataProcessor {

    @Autowired
    private DetailsService detailsService;
}
```

If another class does:

```java
DataProcessor processor = new DataProcessor();
```

Spring never processes that `DataProcessor`.

Therefore:

```java
detailsService == null
```

The problem simply moved one level higher.

## Fix

```java
import org.springframework.stereotype.Component;

@Component
public class DataProcessor {

    private final DetailsService detailsService;

    public DataProcessor(DetailsService detailsService) {
        this.detailsService = detailsService;
    }

    public void process() throws Exception {

        detailsService.getDetails();
    }
}
```

---

# 14. Multiple `ConfigService` Beans

Another possible problem is multiple beans of the same type.

For example:

```java
@Bean
public ConfigService configService() {
    return new ConfigService("URL-1");
}
```

and:

```java
@Bean
public ConfigService alternateConfigService() {
    return new ConfigService("URL-2");
}
```

Spring now has two `ConfigService` candidates.

Normally, this causes an application startup error rather than silently injecting `null`.

If multiple beans are intentional, specify the desired one.

```java
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
public class DetailsService {

    private final ConfigService configService;

    public DetailsService(
            @Qualifier("configService")
            ConfigService configService) {

        this.configService = configService;
    }
}
```

Another option is to mark one bean as primary:

```java
@Bean
@Primary
public ConfigService configService() {
    return new ConfigService("URL-1");
}
```

---

# 15. Avoid `@Autowired(required = false)` for Required Dependencies

Check for this:

```java
@Autowired(required = false)
private ConfigService configService;
```

This tells Spring that the dependency is optional.

If Spring cannot find the bean, the field may remain unset.

If the dependency is required, use constructor injection instead.

```java
@Service
public class DetailsService {

    private final ConfigService configService;

    public DetailsService(ConfigService configService) {
        this.configService = configService;
    }
}
```

This is useful because the application will fail during startup if `ConfigService` cannot be supplied.

That is much better than finding the problem later through a:

```text
NullPointerException
```

---

# 16. Unit Tests Can Create the Same Problem

Production code may work correctly while a unit test fails.

## Problematic test

```java
@Test
void testGetDetails() throws Exception {

    /*
     * Spring is not involved here.
     */
    DetailsService service = new DetailsService();

    service.getDetails();
}
```

With constructor injection, dependencies become explicit.

```java
@Test
void testGetDetails() throws Exception {

    /*
     * Create the dependency needed by the unit test.
     */
    ConfigService configService =
            new ConfigService("http://test-url");

    /*
     * Supply that dependency directly.
     */
    DetailsService service =
            new DetailsService(configService);

    service.getDetails();
}
```

---

# 17. Spring Integration Test

If you specifically want to verify Spring wiring, use the Spring test context.

```java
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DetailsServiceIntegrationTest {

    @Autowired
    private DetailsService detailsService;

    @Test
    void shouldWireDetailsService() {

        /*
         * If Spring successfully created the service,
         * this should not be null.
         */
        assertNotNull(detailsService);
    }
}
```

You can also verify the `ConfigService` directly:

```java
@SpringBootTest
class ConfigServiceIntegrationTest {

    @Autowired
    private ConfigService configService;

    @Test
    void shouldCreateConfigServiceBean() {

        assertNotNull(configService);
    }
}
```

---

# 18. Recommended Final Architecture

A clean design would look like the following.

## `BaseConfig.java`

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BaseConfig {

    @Bean
    public ConfigService configService(
            @Value("${config.service.url}") String url) {

        /*
         * Spring obtains the property value and creates
         * one ConfigService bean.
         */
        return new ConfigService(url);
    }
}
```

---

## `ConfigService.java`

```java
public class ConfigService {

    private final String url;

    public ConfigService(String url) {

        /*
         * Save the configured URL.
         */
        this.url = url;
    }

    public String getUrl() {
        return url;
    }
}
```

---

## `DetailsService.java`

```java
import org.springframework.stereotype.Service;

@Service
public class DetailsService {

    private final ConfigService configService;

    /*
     * Constructor injection makes ConfigService
     * an explicit dependency of DetailsService.
     */
    public DetailsService(ConfigService configService) {
        this.configService = configService;
    }

    public Details getDetails() throws Exception {

        /*
         * Since Spring created this object,
         * ConfigService should already be available.
         */
        String url = configService.getUrl();

        if (url == null || url.isBlank()) {
            throw new IllegalStateException(
                    "config.service.url is not configured"
            );
        }

        return retrieveDetails(url);
    }

    private Details retrieveDetails(String url) {

        /*
         * Actual implementation for retrieving
         * the details would go here.
         */
        return null;
    }
}
```

---

## `SomeBusinessService.java`

```java
import org.springframework.stereotype.Service;

@Service
public class SomeBusinessService {

    private final DetailsService detailsService;

    public SomeBusinessService(DetailsService detailsService) {

        /*
         * Spring supplies its managed DetailsService.
         */
        this.detailsService = detailsService;
    }

    public void execute() throws Exception {

        /*
         * Never create DetailsService with "new" here.
         */
        Details details = detailsService.getDetails();

        // Continue processing...
    }
}
```

---

# 19. Diagnostic Logging Technique

A useful technique is to print the instance identity during debugging.

```java
@Service
public class DetailsService {

    private final ConfigService configService;

    public DetailsService(ConfigService configService) {

        System.out.println(
                "DetailsService constructor. this = "
                        + System.identityHashCode(this)
        );

        System.out.println(
                "Injected ConfigService = " + configService
        );

        this.configService = configService;
    }

    public Details getDetails() throws Exception {

        System.out.println(
                "getDetails(). this = "
                        + System.identityHashCode(this)
        );

        System.out.println(
                "configService = " + configService
        );

        return null;
    }
}
```

If Spring creates one object but the method is called on another object, you may see different identity values.

For example:

```text
DetailsService constructor. this = 18327192
Injected ConfigService = ConfigService@61af

getDetails(). this = 79582661
configService = null
```

That strongly suggests two different `DetailsService` instances exist.

One may have been created by Spring:

```text
Spring
   |
   +---- DetailsService instance A
            |
            +---- ConfigService injected
```

while another was manually created:

```text
Application code
   |
   +---- new DetailsService(...)
            |
            +---- not Spring-managed
```

---

# 20. Use `@PostConstruct` to Verify Injection

You can also temporarily add:

```java
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

@Service
public class DetailsService {

    private final ConfigService configService;

    public DetailsService(ConfigService configService) {
        this.configService = configService;
    }

    @PostConstruct
    public void verifyInjection() {

        /*
         * This method runs after Spring creates
         * and initializes the bean.
         */
        System.out.println(
                "ConfigService after Spring initialization: "
                        + configService
        );
    }
}
```

If this prints a valid object but `getDetails()` later sees `null`, investigate whether another non-Spring instance is calling the method.

---

# 21. Better Than Field Injection

Field injection:

```java
@Autowired
private ConfigService configService;
```

works when Spring manages the object, but constructor injection is generally easier to reason about.

Constructor injection:

```java
private final ConfigService configService;

public DetailsService(ConfigService configService) {
    this.configService = configService;
}
```

has several advantages:

- The dependency is explicit.
- The field can be `final`.
- The object cannot be validly created without the required dependency.
- Unit testing is easier.
- Missing beans are usually caught during startup.
- Dependency relationships are easier to follow.
- It reduces hidden framework behavior.

---

# 22. Useful Search Terms Across the Project

Search the entire codebase for the following.

### Manual creation

```text
new DetailsService(
```

### Manual configuration creation

```text
new BaseConfig(
```

### Static usage

```text
static DetailsService
```

```text
static ConfigService
```

```text
static getDetails
```

### Optional autowiring

```text
@Autowired(required = false)
```

### Duplicate bean definitions

```text
ConfigService
```

Then inspect every:

```java
@Bean
```

```java
@Service
```

```java
@Component
```

definition involving that type.

---

# 23. Troubleshooting Decision Tree

Use this sequence.

```text
configService is null?
        |
        +---- YES
        |      |
        |      +---- Is DetailsService created with "new"?
        |      |       |
        |      |       +---- YES -> Remove "new" and inject it.
        |      |
        |      +---- Is DetailsService a Spring bean?
        |      |       |
        |      |       +---- NO -> Add @Service/@Component or @Bean.
        |      |
        |      +---- Is its caller Spring-managed?
        |      |       |
        |      |       +---- NO -> Make caller a bean/inject dependency.
        |      |
        |      +---- Is BaseConfig loaded?
        |      |       |
        |      |       +---- NO -> Fix component scan or @Import it.
        |      |
        |      +---- Is static injection involved?
        |              |
        |              +---- YES -> Convert to instance-based DI.
        |
        +---- NO
               |
               +---- Is configService.getUrl() null?
                       |
                       +---- YES
                               |
                               +---- Check properties.
                               +---- Check active Spring profile.
                               +---- Check environment variables.
                               +---- Check @Value key.
                               +---- Check bean constructor.
```

---

# 24. Recommended Investigation Order

Check these in this order:

1. Search for:

   ```text
   new DetailsService(
   ```

2. Confirm the class containing `getDetails()` has:

   ```java
   @Service
   ```

   or another Spring bean registration mechanism.

3. Replace field injection with constructor injection.

4. Check every class that calls `getDetails()`.

5. Make sure those callers also receive `DetailsService` through dependency injection.

6. Determine whether:

   ```java
   configService == null
   ```

   or:

   ```java
   configService.getUrl() == null
   ```

7. Verify `BaseConfig` is loaded.

8. Verify the application contains only the intended `ConfigService` bean(s).

9. Check for static fields/methods.

10. Check whether the failure only happens inside tests.

11. Check active profiles and property files.

---

# 25. Most Likely Explanation for This Scenario

Based on the described symptoms:

- `ConfigService` already has a bean in `BaseConfig`.
- `configService` should not be null.
- The issue appears when `getDetails()` is called.
- The class may be instantiated differently depending on the caller.

The strongest initial hypothesis is:

> The class containing `getDetails()` is being instantiated somewhere with `new`, or one of its callers is outside Spring's managed dependency chain.

Search for:

```java
new YourClassName(...)
```

before changing the bean configuration.

If this exists, replacing manual construction with Spring dependency injection is usually the correct fix.

---

# 26. Example of the Problem

## Spring-managed object

```text
Spring ApplicationContext
        |
        v
DetailsService #1
        |
        +---- ConfigService = valid
```

Spring performs the injection.

## Manually-created object

```text
Application Code
        |
        | new DetailsService(...)
        v
DetailsService #2
        |
        +---- ConfigService = null
```

Calling:

```java
detailsService2.getDetails();
```

would therefore encounter a null dependency even though Spring has a perfectly valid `DetailsService #1`.

---

# 27. Final Recommendation

Prefer this pattern throughout the application:

```java
@Service
public class DetailsService {

    private final ConfigService configService;

    public DetailsService(ConfigService configService) {
        this.configService = configService;
    }
}
```

and inject `DetailsService` into callers:

```java
@Service
public class CallerService {

    private final DetailsService detailsService;

    public CallerService(DetailsService detailsService) {
        this.detailsService = detailsService;
    }
}
```

Avoid:

```java
new DetailsService(...)
```

inside application business code when that class depends on Spring-managed services.

The key rule is:

> If an object expects Spring to inject its dependencies, Spring should normally be responsible for creating that object.
