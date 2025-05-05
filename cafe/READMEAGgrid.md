Here is a **complete example** of how you can create a **master grid** with **nested rows**, **access the rows** (master and nested), and **export the data** to a CSV. I’ll also provide a **readme** for you to copy and use.

### **Example Setup:**

1. **Master Grid with Rows**: We’ll have a master grid with a row and two nested rows (child grid data).
2. **Export Functionality**: After selecting the rows, we’ll export the **selected rows** (including child rows) to a CSV.

### **AG Grid Setup with Master-Detail**

#### **HTML Code** (for embedding AG Grid):
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AG Grid Export Example</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css">
</head>
<body>
    <div style="height: 500px;" id="myGrid" class="ag-theme-alpine"></div>

    <button onclick="exportToCSV()">Export to CSV</button>

    <script src="https://cdn.jsdelivr.net/npm/ag-grid-community@latest/dist/ag-grid-community.min.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

#### **JavaScript Code (app.js)**:
```javascript
// Column Definitions for Master Grid (Parent Row)
const columnDefs = [
    { headerName: "ID", field: "id", checkboxSelection: true },
    { headerName: "Name", field: "name" },
    { headerName: "Age", field: "age" }
];

// Column Definitions for Child Grid (Nested Rows)
const childColumnDefs = [
    { headerName: "Product", field: "product" },
    { headerName: "Quantity", field: "quantity" }
];

// Master Grid Data (Parent Rows)
const rowData = [
    { id: 1, name: "John", age: 30, nestedRows: [
        { product: "Laptop", quantity: 10 },
        { product: "Phone", quantity: 20 }
    ]},
    { id: 2, name: "Jane", age: 28, nestedRows: [
        { product: "Tablet", quantity: 15 },
        { product: "Headphones", quantity: 25 }
    ]}
];

// Grid Options for Parent Grid
const gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    domLayout: 'autoHeight',
    rowSelection: 'multiple',
    masterDetail: true,
    getDetailRowData: function(params) {
        params.successCallback(params.node.data.nestedRows);
    }
};

// Setup for the Child Grid
const gridOptionsChild = {
    columnDefs: childColumnDefs,
    domLayout: 'autoHeight',
    rowSelection: 'multiple'
};

// Create the main grid
const gridDiv = document.querySelector('#myGrid');
new agGrid.Grid(gridDiv, gridOptions);

// Function to export the data to CSV
function exportToCSV() {
    const selectedNodes = gridOptions.api.getSelectedNodes(); // Get selected parent rows
    const exportData = [];

    selectedNodes.forEach(node => {
        // Add parent row to export data
        const parentRow = node.data;
        exportData.push([parentRow.id, parentRow.name, parentRow.age]);

        // Add child rows (nested rows) for this parent row
        if (parentRow.nestedRows) {
            parentRow.nestedRows.forEach(childRow => {
                exportData.push([parentRow.id, "", "", childRow.product, childRow.quantity]);
            });
        }
    });

    // Convert to CSV format and trigger download
    const csvContent = convertToCSV(exportData);
    downloadCSV(csvContent);
}

// Convert the array to CSV format
function convertToCSV(data) {
    const csvRows = [];
    data.forEach(row => {
        csvRows.push(row.join(','));
    });
    return csvRows.join('\n');
}

// Trigger CSV download
function downloadCSV(csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'exported_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
```

### **Explanation of the Code:**

1. **Master Grid Configuration**:
   - The master grid (`gridOptions`) has 3 columns: `ID`, `Name`, and `Age`, with an additional property `nestedRows` that contains the child grid data.
   - We use the `masterDetail: true` option in AG Grid to enable nested grids for each row. When a master row is expanded, the child grid appears below it.

2. **Child Grid Configuration**:
   - Each master row has a nested grid (child grid) with the columns `Product` and `Quantity`.
   - The child grid's data is accessed through the `getDetailRowData` callback, which provides the `nestedRows` data for each master row.

3. **Exporting Data**:
   - When the user selects one or more parent rows and clicks the "Export to CSV" button, the `exportToCSV()` function is called.
   - **Parent Data**: The parent data (ID, Name, and Age) is extracted and pushed into the `exportData` array.
   - **Child Data**: For each parent row that has nested child rows, those rows (product and quantity) are also added to `exportData`.
   - The data is then converted into a CSV format using the `convertToCSV()` function, which joins the rows with commas and adds line breaks.
   - The CSV file is triggered for download using a Blob and a temporary `<a>` tag.

### **README for This Example**

Here’s the **readme** you can copy and use to explain the example.

---

# Master-Detail Grid with AG Grid and CSV Export

## Description

This example demonstrates how to use **AG Grid** with **master-detail** functionality. The grid has **parent rows** with corresponding **nested child grids**. The example also shows how to **export the selected rows** (parent and child) into a **CSV file**.

### Features:
- **Master Grid**: Displays rows with parent data (e.g., ID, Name, Age).
- **Child Grid**: Displays nested rows beneath each parent row with child data (e.g., Product, Quantity).
- **CSV Export**: Select parent rows and export both parent and child rows into a CSV file.

---

## Setup

1. **HTML and CSS**:
   - The page includes the necessary CSS and JavaScript for AG Grid.
   - The grid is contained within a div with the `ag-theme-alpine` class for styling.
   - The "Export to CSV" button triggers the export functionality.

2. **JavaScript Code**:
   - **Master Grid**: The parent rows are displayed with columns for `ID`, `Name`, and `Age`.
   - **Child Grid**: Each master row has a nested grid with columns for `Product` and `Quantity`.

### AG Grid Configuration:

```javascript
const columnDefs = [
    { headerName: "ID", field: "id", checkboxSelection: true },
    { headerName: "Name", field: "name" },
    { headerName: "Age", field: "age" }
];
```

### Master Data:

```javascript
const rowData = [
    { id: 1, name: "John", age: 30, nestedRows: [
        { product: "Laptop", quantity: 10 },
        { product: "Phone", quantity: 20 }
    ]},
    { id: 2, name: "Jane", age: 28, nestedRows: [
        { product: "Tablet", quantity: 15 },
        { product: "Headphones", quantity: 25 }
    ]}
];
```

### **Exporting Data**:

The `exportToCSV()` function gathers data from the selected rows (parent and child), converts it to CSV format, and triggers the download.

```javascript
function exportToCSV() {
    const selectedNodes = gridOptions.api.getSelectedNodes();
    const exportData = [];

    selectedNodes.forEach(node => {
        const parentRow = node.data;
        exportData.push([parentRow.id, parentRow.name, parentRow.age]);

        if (parentRow.nestedRows) {
            parentRow.nestedRows.forEach(childRow => {
                exportData.push([parentRow.id, "", "", childRow.product, childRow.quantity]);
            });
        }
    });

    const csvContent = convertToCSV(exportData);
    downloadCSV(csvContent);
}
```

---

## How to Run

1. Create an **HTML file** and include the AG Grid styles and script.
2. Copy the **JavaScript code** to a separate file (e.g., `app.js`).
3. Open the **HTML file** in your browser, and the AG Grid should load.
4. Select rows in the grid and click **"Export to CSV"** to download the CSV.

---

## Conclusion

This example demonstrates how to implement a **master-detail grid** with **AG Grid** and export both parent and nested rows to **CSV**. It covers how to:
- Display master and child rows.
- Export selected rows to CSV, preserving the structure of master and nested grids.

--- 

This README provides a clear explanation and setup for implementing AG Grid with **master-detail** functionality and **CSV export**. You can use this as a template in your project or adapt it as needed.


```ts

// TODO: 
// Access the first element in the array
const firstObject = myArray[0];

// Now access the 'field' property correctly:
console.log(firstObject.field);  // Output: "field 1"

// TODO: 
const firstObject = JSON.parse(myArray[0]);

// Now you can access the 'field' property
console.log(firstObject.field);  // Output: "field 1"

// TODO: 
const fieldName = 'field';
console.log(firstObject[fieldName]);  // Output: "field 1"


```