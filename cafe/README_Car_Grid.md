
# Car Grid with Expandable Rows and Sold Count

This project demonstrates an Angular grid with expandable rows where each row represents a type of car. Each expandable row contains details about individual cars, including their VIN, color, model, and status (e.g., sold or on sale). Additionally, the grid dynamically calculates and displays a "Sold Count" column at the type-of-car level for Toyota.

## Features
- Expandable rows to display detailed information about cars.
- A dynamically calculated column for counting sold cars, specifically for the "Toyota" type.
- Master-detail grid structure using AG Grid.

## Implementation

### HTML Template
```html
<ag-grid-angular
  class="ag-theme-alpine"
  [rowData]="rowData"
  [columnDefs]="columnDefs"
  [detailCellRendererParams]="detailCellRendererParams"
  [masterDetail]="true"
  style="width: 100%; height: 500px;">
</ag-grid-angular>
```

### TypeScript Component
```typescript
import { Component } from '@angular/core';

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
        { field: 'color', headerName: 'Color' },
        { field: 'model', headerName: 'Model' },
        { field: 'status', headerName: 'Status' },
      ],
    },
    getDetailRowData: (params: any) => {
      params.successCallback(params.data.details);
    },
  };

  constructor() {
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
}
```

## Usage
1. Add the above code to your Angular project.
2. Install AG Grid by running:
   ```bash
   npm install ag-grid-angular --save
   ```
3. Include the required AG Grid CSS in your `angular.json`:
   ```json
   "styles": [
     "node_modules/ag-grid-community/styles/ag-grid.css",
     "node_modules/ag-grid-community/styles/ag-theme-alpine.css"
   ]
   ```
4. Run your Angular project and navigate to the component to see the grid in action.

## Output
The grid displays:
- Car types with expandable rows for detailed information.
- A "Sold Count" column at the type level, dynamically calculated for Toyota.
