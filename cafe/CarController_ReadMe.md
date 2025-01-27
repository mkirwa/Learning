
# Car Controller with Color Integration for VIN

This project demonstrates a Spring Boot application that retrieves car data from a database and includes additional color information for each car based on its VIN. The result is returned as a JSON response, which includes "Car Type", "Sold Count", and "Color".

## Key Features
- **Car Type and Sold Count**: Fetches car type and sold count from the database.
- **Color Integration**: Adds a "Color" field to the response by retrieving the color based on the car's VIN.
- **JSON Response**: Returns a detailed JSON response including the additional color field.

## Implementation

### CarController.java
The `CarController` handles requests to `/gettingCars/query`. It fetches car data and color information to build the response.

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

### CarModule.java
The `CarModule` class models the car data fetched from the database.

```java
public class CarModule {
    private String carType;
    private int soldCount;
    private List<String> vinList;

    // Getters and Setters
    public String getCarType() { return carType; }
    public void setCarType(String carType) { this.carType = carType; }
    public int getSoldCount() { return soldCount; }
    public void setSoldCount(int soldCount) { this.soldCount = soldCount; }
    public List<String> getVinList() { return vinList; }
    public void setVinList(List<String> vinList) { this.vinList = vinList; }
}
```

### ColorService.java
The `ColorService` retrieves the color for a given VIN. This could query a database or external service in a real-world scenario.

```java
@Service
public class ColorService {
    public String getColorByVin(String vin) {
        Map<String, String> colorMap = Map.of(
            "1HGCM82633A123456", "Red",
            "1HGCM82633A654321", "Blue",
            "1HGCM82633A789012", "Black",
            "2HGCM82633A123456", "White",
            "2HGCM82633A654321", "Gray"
        );
        return colorMap.getOrDefault(vin, "Unknown");
    }
}
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
  },
  {
    "Car Type": "Toyota",
    "Sold Count": 2,
    "Color": "Black"
  }
]
```

## How to Use
1. Add the above classes to your Spring Boot project.
2. Ensure that the `carQueryService` connects to your database and fetches data as expected.
3. The `ColorService` is a placeholder for retrieving color information. In a production system, it would query a database or external API.
4. Start the Spring Boot application and access the `/gettingCars/query` endpoint.

## Notes
- The `getCars` function dynamically builds the JSON response to include color information for each car.
- The `ColorService` simulates fetching color details; replace this logic with your actual database or service integration.
