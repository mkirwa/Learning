
# Car Controller with JPA Integration for Color Retrieval

This project demonstrates a Spring Boot application that retrieves car data from a database and includes additional color information for each car based on its VIN. The implementation leverages JPA for database interactions, making it clean and maintainable.

## Key Features
- **Car Type and Sold Count**: Fetches car type and sold count from the database.
- **Color Integration**: Retrieves the color for each VIN using a JPA-backed repository.
- **JSON Response**: Returns a detailed JSON response including "Car Type", "Sold Count", and "Color".

## Implementation

### Entity Class: `CarColor`
The `CarColor` class maps to the `car_colors` table in the database.

```java
@Entity
@Table(name = "car_colors")
public class CarColor {

    @Id
    @Column(name = "vin", nullable = false)
    private String vin;

    @Column(name = "color", nullable = false)
    private String color;

    // Getters and Setters
    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
```

### Repository Interface: `CarColorRepository`
The `CarColorRepository` provides methods to interact with the `car_colors` table.

```java
@Repository
public interface CarColorRepository extends JpaRepository<CarColor, String> {
    // Finds the CarColor entity by VIN
    CarColor findByVin(String vin);
}
```

### Service Class: `ColorService`
The `ColorService` fetches the color for a given VIN using the `CarColorRepository`.

```java
@Service
public class ColorService {

    @Autowired
    private CarColorRepository carColorRepository;

    public String getColorByVin(String vin) {
        // Fetch the CarColor entity from the database
        CarColor carColor = carColorRepository.findByVin(vin);

        // Return the color if found, otherwise return "Unknown"
        return (carColor != null) ? carColor.getColor() : "Unknown";
    }
}
```

### Controller Class: `CarController`
The `CarController` fetches car data and includes color information in the JSON response.

```java
@RestController
@RequestMapping("/gettingCars")
public class CarController {

    @Autowired
    private CarQueryService carQueryService;

    @Autowired
    private ColorService colorService;

    @GetMapping("/query")
    public List<Map<String, Object>> getCars(@RequestParam String query, @RequestParam String car) {
        List<CarModule> returnResult = carQueryService.queryAnalyticsReq(query, car);
        List<Map<String, Object>> resultJson = new ArrayList<>();

        for (CarModule carModule : returnResult) {
            for (String vin : carModule.getVinList()) {
                String color = colorService.getColorByVin(vin);
                Map<String, Object> carData = Map.of(
                    "Car Type", carModule.getCarType(),
                    "Sold Count", carModule.getSoldCount(),
                    "Color", color
                );
                resultJson.add(carData);
            }
        }

        return resultJson;
    }
}
```

## Database Setup

1. Create the `car_colors` table:
   ```sql
   CREATE TABLE car_colors (
       vin VARCHAR(50) PRIMARY KEY,
       color VARCHAR(50) NOT NULL
   );
   ```

2. Insert sample data:
   ```sql
   INSERT INTO car_colors (vin, color) VALUES
   ('1HGCM82633A123456', 'Red'),
   ('1HGCM82633A654321', 'Blue'),
   ('2HGCM82633A123456', 'White');
   ```

3. Configure the database connection in `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/cars_database
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   ```

## Sample Output

For a request like:
```
GET /gettingCars/query?query=some_query&car=Toyota
```

The output would be:
```json
[
    {
        "Car Type": "Toyota",
        "Sold Count": 2,
        "Color": "Red"
    },
    {
        "Car Type": "Toyota",
        "Sold Count": 2,
        "Color": "Blue"
    }
]
```

## Benefits of Using JPA
1. **Clean and Maintainable Code**: Eliminates boilerplate SQL queries.
2. **Flexibility**: Allows easy integration with other database operations, such as saving or updating records.
3. **Readability**: The `CarColor` entity and `CarColorRepository` make the database interactions intuitive.

## How to Use
1. Add the provided classes to your Spring Boot project.
2. Set up the database and configure `application.properties`.
3. Start the Spring Boot application and access the `/gettingCars/query` endpoint.

## Notes
- Ensure that the database connection is properly configured in your environment.
- Replace sample data with real data from your database.
