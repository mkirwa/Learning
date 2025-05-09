
# README

## Overview
This project demonstrates how to implement a dropdown (`ng-select`) that dynamically updates based on user input. It consists of two components:

1. **NgSelectComponent**: Defines the `ng-select` dropdown and logic to filter and display user groups.
2. **ChildComponent**: Contains an input field and uses the `NgSelectComponent`. Updates the dropdown selection based on input field changes.

---

## File Structure

### 1. `ng-select.html`
Defines the dropdown using the `ng-select` module.
```html
<ng-select
  [items]="groups"
  [(ngModel)]="selectedGroup"
  placeholder="Select a group"
>
</ng-select>
```

### 2. `ng-select.component.ts`
Implements logic to filter and display groups in the dropdown.
```typescript
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ng-select',
  templateUrl: './ng-select.html',
  styleUrls: ['./ng-select.component.css']
})
export class NgSelectComponent implements OnInit {
  @Input() userGroups: string[] = []; // Groups to display in the dropdown
  groups: string[] = []; // Filtered groups to display
  selectedGroup: string | null = null;

  ngOnInit(): void {
    // Logic to filter groups based on user's permissions
    this.groups = this.userGroups.filter(group => this.isUserInGroup(group));
  }

  isUserInGroup(group: string): boolean {
    // Replace with your logic to determine if the user belongs to a group
    const userEligibleGroups = ['Admin', 'Editor', 'Viewer'];
    return userEligibleGroups.includes(group);
  }
}
```

### 3. `child.html`
Contains an input field that controls the selection in the dropdown.
```html
<div>
  <input
    type="text"
    placeholder="Enter group"
    [(ngModel)]="inputValue"
    (input)="updateDropdown()"
  />
  <app-ng-select [userGroups]="userGroups"></app-ng-select>
</div>
```

### 4. `child.component.ts`
Implements logic to update the dropdown based on input field changes.
```typescript
import { Component, ViewChild } from '@angular/core';
import { NgSelectComponent } from './ng-select.component';

@Component({
  selector: 'app-child',
  templateUrl: './child.html',
  styleUrls: ['./child.component.css']
})
export class ChildComponent {
  @ViewChild(NgSelectComponent) ngSelectComponent!: NgSelectComponent;

  userGroups: string[] = ['Admin', 'Editor', 'Viewer', 'Guest']; // All available groups
  inputValue: string = ''; // Value from the input field

  updateDropdown(): void {
    if (this.ngSelectComponent) {
      const matchingGroup = this.userGroups.find(
        group => group.toLowerCase() === this.inputValue.toLowerCase()
      );
      if (matchingGroup) {
        this.ngSelectComponent.selectedGroup = matchingGroup;
      }
    }
  }
}
```

---

## Interaction

1. **NgSelectComponent**:
   - Displays a dropdown with groups the user belongs to.
   - Filters groups based on logic in the `isUserInGroup()` function.

2. **ChildComponent**:
   - Contains an input field and uses the `NgSelectComponent` as a child.
   - Updates the dropdown selection whenever a valid group name is entered into the input field.

---

## Dependencies

1. Install `ng-select`:
   ```bash
   npm install @ng-select/ng-select
   ```

2. Add `FormsModule` and `NgSelectModule` to your Angular module:
   ```typescript
   import { NgModule } from '@angular/core';
   import { FormsModule } from '@angular/forms';
   import { NgSelectModule } from '@ng-select/ng-select';

   @NgModule({
     declarations: [NgSelectComponent, ChildComponent],
     imports: [FormsModule, NgSelectModule],
   })
   export class AppModule {}
   ```

---

## How to Run

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Run the Angular application using `ng serve`.
4. Navigate to `http://localhost:4200` in your browser.
5. Enter a group name in the input field to dynamically update the dropdown selection.

---

## Example

- Available groups: `['Admin', 'Editor', 'Viewer', 'Guest']`
- User-eligible groups: `['Admin', 'Editor', 'Viewer']`
- If the input field contains `Editor`, the dropdown will automatically select `Editor`.

---

## Notes
- Replace the logic in `isUserInGroup()` with your specific requirements to filter groups.
- Ensure `NgModel` is correctly imported and configured in your Angular module.

For any issues or improvements, feel free to raise an issue in the repository!

```typescript
import { Component } from '@angular/core';
import { ColorService } from './color.service'; // Assume this is the color service

@Component({
  selector: 'app-car-grid',
  templateUrl: './car-grid.component.html',
  styleUrls: ['./car-grid.component.css']
})
export class CarGridComponent {
  rowData: any[] = [];
  columnDefs = [
    { field: 'type', headerName: 'Car Type' },
    { field: 'soldCount', headerName: 'Sold Count', valueGetter: this.calculateSoldCount },
  ];

  detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        { field: 'vin', headerName: 'VIN' },
        {
          field: 'model',
          headerName: 'Model',
          valueGetter: (params: any) => this.getColorFromAllInformation(params.data.vin),
        },
        { field: 'status', headerName: 'Status' },
      ],
    },
    getDetailRowData: (params: any) => {
      params.successCallback(params.data.details);
    },
  };

  constructor(private colorService: ColorService) {
    this.rowData = [
      {
        type: 'Toyota',
        details: [
          { vin: '1HGCM82633A123456', color: 'Red', model: 'Camry', status: 'sold' },
          { vin: '1HGCM82633A654321', color: 'Blue', model: 'Corolla', status: 'on sale' },
          { vin: '1HGCM82633A789012', color: 'Black', model: 'Rav4', status: 'sold' },
        ],
      },
      {
        type: 'Honda',
        details: [
          { vin: '2HGCM82633A123456', color: 'White', model: 'Civic', status: 'on sale' },
          { vin: '2HGCM82633A654321', color: 'Gray', model: 'Accord', status: 'sold' },
        ],
      },
    ];
  }

  calculateSoldCount(params: any) {
    if (params.data.type === 'Toyota') {
      return params.data.details.filter((car: any) => car.status === 'sold').length;
    }
    return null;
  }

  getColorFromAllInformation(vin: string): string {
    // Call the color service to fetch all color information
    const allColorInformation = this.colorService.getAllColorInformation(vin, true);

    // Extract and return the `color` field
    return allColorInformation.color || 'Unknown';
  }
}
```

```java
    // Get the last modified timestamp of the file    
    // Retrieve the previously recorded modification time from the event list
    // Check if the previous modification time exists and if the file has not been modified since last check
    // Get the current system time in milliseconds
    // If the file has been inactive (unchanged) for more than 5 minutes (300,000 milliseconds), handle error

```

# Batch Lookup Optimization

## Overview

This project optimizes database performance by reducing the number of individual queries executed when retrieving Select entities associated with car details. Instead of making a separate database call for each car, we batch fetch the data in a single query, significantly improving efficiency.

## Problem Statement

Previously, the system performed an individual DAO lookup for each `CarDetailModel`, resulting in **N queries for N car details**, leading to poor performance. The goal is to refactor this to use a batch query.

## Solution

The solution involves modifying the DAO to support batch fetching using a `WHERE IN` clause, retrieving all required `SelectEntity` records in a single query, and storing them in a map for fast lookup.

## Implementation Details

### 1. Modify the DAO for Batch Lookup

Modify the DAO to fetch multiple `SelectEntity` records at once.

#### **JPA (Hibernate) Implementation**

```java
@Repository
public class SelectDaoImpl implements SelectDao {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Override
    public Map<String, SelectEntity> lookupBatch(List<String> carIds) {
        if (carIds == null || carIds.isEmpty()) {
            return Collections.emptyMap();
        }

        String query = "SELECT t FROM SelectEntity t WHERE t.carID IN :carIds";
        List<SelectEntity> Selects = entityManager.createQuery(query, SelectEntity.class)
                .setParameter("carIds", carIds)
                .getResultList();

        return Selects.stream().collect(Collectors.toMap(SelectEntity::getCarID, Function.identity()));
    }
}
```

#### **Spring Data JPA Implementation**

```java
@Repository
public interface SelectDao extends JpaRepository<SelectEntity, String> {
    @Query("SELECT t FROM SelectEntity t WHERE t.carID IN :carIds")
    List<SelectEntity> lookupBatch(@Param("carIds") List<String> carIds);
}
```

### 2. Update the Business Logic

Update the service to retrieve all `SelectEntity` records at once and use a map for efficient lookup.

```java
List<String> carIds = reval.getCarDetails().stream()
    .map(CarDetailModel::getCarID)
    .collect(Collectors.toList());

// Fetch all SelectEntities at once
Map<String, SelectEntity> SelectMap = SelectDao.lookupBatch(carIds)
    .stream()
    .collect(Collectors.toMap(SelectEntity::getCarID, Function.identity()));

for (CarDetailModel carDetailModel : reval.getCarDetails()) {
    if (StringUtils.startsWith(carDetailModel.getCarTypes(), "G")) {
        SelectEntity SelectCar = SelectMap.get(carDetailModel.getCarID());
        carDetailModel.setCarCode3(SelectCar != null ? SelectCar.getCarCode3() : "");
    }
}
```

## Benefits

✅ **Before:** **N** queries for **N** `CarDetailModel` records\
✅ **After:** **1** query for all `SelectEntity` records\
✅ **Significant reduction in database load and improved response time**

## Conclusion

This batch lookup approach enhances database efficiency and ensures that the application performs optimally, especially when handling a large number of car details.
