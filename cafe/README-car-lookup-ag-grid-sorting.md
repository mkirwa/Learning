# Car Lookup Grid: AG Grid Sorting Troubleshooting Guide

## Overview

This guide explains the Angular/TypeScript code used to create the **Car ID**, **Car Name**, and **Car Code** columns in AG Grid. It also covers the most common reasons why one column may refuse to sort—or may appear to sort incorrectly—while the other columns work normally.

The original code strongly suggests that the immediate problem is the field value used for the Car Code column:

```ts
columns.push(this.nonEditableCol('car code ', 'Code', 90));
```

Notice the trailing space after `code`:

```text
'car code '
          ^
```

AG Grid's `field` must match a property in the row data exactly. JavaScript property names are case-sensitive, and whitespace is significant.

If a row returned by the backend looks like this:

```ts
{
  id: 1,
  name: 'Toyota',
  carCode: 'CAR-10'
}
```

the column should normally use:

```ts
field: 'carCode'
```

It should not use:

```ts
field: 'car code '
```

However, a mismatched field is not the only possible cause. Sorting can also fail because of renderers, getters, mixed data types, custom comparators, server-side row models, custom headers, state resets, Oracle data, and several other configuration issues.

---

## Table of Contents

1. [Corrected Column Model](#corrected-column-model)
2. [Type-Safe Version](#type-safe-version)
3. [Detailed Code Explanation](#detailed-code-explanation)
4. [How AG Grid Decides What to Sort](#how-ag-grid-decides-what-to-sort)
5. [Possible Causes and Solutions](#possible-causes-and-solutions)
6. [Client-Side Versus Server-Side Sorting](#client-side-versus-server-side-sorting)
7. [Spring Backend Example](#spring-backend-example)
8. [Oracle-Specific Considerations](#oracle-specific-considerations)
9. [Recommended Diagnostic Procedure](#recommended-diagnostic-procedure)
10. [Testing the Column Definitions](#testing-the-column-definitions)
11. [Final Recommended Implementation](#final-recommended-implementation)
12. [Official References](#official-references)

---

# Corrected Column Model

The following version fixes the syntax errors and assumes that the backend property is named `carCode`.

```ts
import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root'
})
export class CarLookupModel {
  public getCarLookupColumns(): ColDef[] {
    const columns: ColDef[] = [];

    columns.push(
      this.nonEditableCol('id', 'Car ID', 150)
    );

    columns.push(
      this.nonEditableCol('name', 'Car Name', 120)
    );

    columns.push(
      this.nonEditableCol('carCode', 'Code', 90)
    );

    return columns;
  }

  private nonEditableCol(
    property: string,
    title: string,
    width: number,
    filter: ColDef['filter'] = 'agTextColumnFilter'
  ): ColDef {
    return {
      headerName: title,
      field: property,
      width,
      editable: false,
      sortable: true,
      filter
    };
  }
}
```

A shorter equivalent is:

```ts
import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root'
})
export class CarLookupModel {
  public getCarLookupColumns(): ColDef[] {
    return [
      this.nonEditableCol('id', 'Car ID', 150),
      this.nonEditableCol('name', 'Car Name', 120),
      this.nonEditableCol('carCode', 'Code', 90)
    ];
  }

  private nonEditableCol(
    property: string,
    title: string,
    width: number
  ): ColDef {
    return {
      headerName: title,
      field: property,
      width,
      editable: false,
      sortable: true,
      filter: 'agTextColumnFilter'
    };
  }
}
```

---

# Type-Safe Version

Using `string` for the field name allows misspellings such as `'carcode'`, `'car code'`, or `'carCode '` to compile. A stronger approach is to define the row-data interface and restrict the field to its keys.

```ts
import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';

export interface CarLookupRow {
  id: number;
  name: string;
  carCode: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CarLookupModel {
  public getCarLookupColumns(): ColDef<CarLookupRow>[] {
    return [
      this.nonEditableCol('id', 'Car ID', 150, 'agNumberColumnFilter'),
      this.nonEditableCol('name', 'Car Name', 120),
      this.nonEditableCol('carCode', 'Code', 90)
    ];
  }

  private nonEditableCol(
    property: keyof CarLookupRow & string,
    title: string,
    width: number,
    filter: ColDef<CarLookupRow>['filter'] = 'agTextColumnFilter'
  ): ColDef<CarLookupRow> {
    return {
      colId: property,
      headerName: title,
      field: property,
      width,
      editable: false,
      sortable: true,
      filter
    };
  }
}
```

This version gives TypeScript an opportunity to reject an invalid property:

```ts
this.nonEditableCol('car code ', 'Code', 90);
```

The compiler should report that `'car code '` is not a key of `CarLookupRow`.

---

# Detailed Code Explanation

## Imports

```ts
import { Injectable } from '@angular/core';
```

`Injectable` is an Angular decorator. It tells Angular that the class can participate in Angular dependency injection.

```ts
import { ColDef } from 'ag-grid-community';
```

`ColDef` is AG Grid's column-definition type. It describes a grid column, including:

- the displayed header;
- the row-data property;
- width;
- editability;
- sorting;
- filtering;
- renderers;
- formatters;
- comparators;
- value getters.

The correct type name is normally `ColDef`, not `coldDef`.

TypeScript is case-sensitive.

---

## `@Injectable`

```ts
@Injectable({
  providedIn: 'root'
})
```

`providedIn: 'root'` registers the service at the application's root injector. Angular normally creates one shared instance for the application.

A component can then inject it:

```ts
constructor(private readonly carLookupModel: CarLookupModel) {}
```

and retrieve the definitions:

```ts
this.columnDefs = this.carLookupModel.getCarLookupColumns();
```

If the class is never injected and is only used as a plain utility class, `@Injectable` may not be necessary. It is appropriate when Angular creates and supplies the class.

---

## Class Declaration

```ts
export class CarLookupModel {
```

- `export` allows other files to import the class.
- `class` defines a TypeScript class.
- `CarLookupModel` uses PascalCase, the conventional naming style for classes.

---

## Public Method

```ts
public getCarLookupColumns(): ColDef<CarLookupRow>[] {
```

- `public` means code outside the class can call the method.
- `getCarLookupColumns` is the method name.
- `()` means it accepts no arguments.
- `ColDef<CarLookupRow>[]` means it returns an array of column definitions for `CarLookupRow`.

---

## Building the Array

```ts
const columns: ColDef[] = [];
```

This creates an empty array.

`const` prevents reassignment of the variable:

```ts
columns = []; // Not allowed
```

It does not prevent mutation of the existing array:

```ts
columns.push(...); // Allowed
```

---

## Adding a Column

```ts
columns.push(
  this.nonEditableCol('id', 'Car ID', 150)
);
```

This performs two operations:

1. Calls `nonEditableCol(...)`.
2. Adds the returned `ColDef` object to `columns`.

The arguments mean:

```text
'id'       -> property read from each row
'Car ID'   -> header shown to the user
150        -> initial width in pixels
```

---

## Helper Method

```ts
private nonEditableCol(
  property: string,
  title: string,
  width: number,
  filter: ColDef['filter'] = 'agTextColumnFilter'
): ColDef {
```

- `private` means only this class can call the method.
- `property` is the row-data key.
- `title` is the displayed header.
- `width` is the initial width.
- `filter` is the AG Grid filter configuration.
- `= 'agTextColumnFilter'` supplies a default value.
- `: ColDef` specifies the return type.

---

## Returned Object

```ts
return {
  headerName: title,
  field: property,
  width,
  editable: false,
  sortable: true,
  filter
};
```

### `headerName`

Controls the text displayed in the column header.

```ts
headerName: 'Code'
```

### `field`

Controls which property AG Grid reads from each row.

```ts
field: 'carCode'
```

AG Grid will normally retrieve:

```ts
rowData.carCode
```

### `width`

Uses shorthand property syntax.

This:

```ts
width
```

means the same as:

```ts
width: width
```

### `editable`

```ts
editable: false
```

Prevents direct editing inside the grid cell.

### `sortable`

```ts
sortable: true
```

Allows the user to request sorting from the column header. Recent AG Grid versions enable sorting by default, but setting it explicitly makes the intention clear and protects the column from a `defaultColDef` that disables sorting.

### `filter`

Uses the supplied filter value.

```ts
filter: 'agTextColumnFilter'
```

The original code accepted a filter argument but did not return it in the object, so the parameter would have had no effect.

---

# How AG Grid Decides What to Sort

For a normal client-side column, AG Grid generally sorts the **underlying cell value**, not merely the text or HTML visible to the user.

The value can come from:

1. `field`;
2. `valueGetter`;
3. AG Grid's cell-data-type processing;
4. a custom `comparator`.

A `valueFormatter` changes how a value is displayed, but it does not automatically mean that the displayed string is the sort value.

A `cellRenderer` can display almost anything, but the grid still needs a meaningful underlying value for sorting.

This distinction explains many cases where a column displays correctly but sorts incorrectly.

---

# Possible Causes and Solutions

## 1. Field Name Does Not Match the Row Data

### Example problem

```ts
field: 'car code '
```

Actual JSON:

```ts
{
  carCode: 'CAR-10'
}
```

AG Grid looks for:

```ts
row['car code ']
```

That property is undefined.

### Solution

Use the exact key:

```ts
field: 'carCode'
```

Inspect an actual object:

```ts
console.log(this.rowData[0]);
console.log(Object.keys(this.rowData[0] ?? {}));
```

Also check exact casing:

```text
carCode
carcode
CarCode
car_code
code
```

These are different property names.

---

## 2. Invisible Whitespace in the Column Definition

The value may contain a trailing or leading space:

```ts
field: 'carCode '
```

or:

```ts
field: ' carCode'
```

### Solution

Remove the whitespace and use a row interface so TypeScript catches invalid names.

```ts
field: 'carCode'
```

---

## 3. The Backend JSON Property Has a Different Name

The Java entity may use:

```java
private String carCode;
```

but Jackson or a DTO may return:

```json
{
  "car_code": "CAR-10"
}
```

or:

```json
{
  "code": "CAR-10"
}
```

### Solution A: Match the returned JSON

```ts
field: 'car_code'
```

### Solution B: Standardise the API property

Java DTO:

```java
public record CarLookupResponse(
    Long id,
    String name,
    String carCode
) {}
```

### Solution C: Use `@JsonProperty` intentionally

```java
@JsonProperty("carCode")
private String code;
```

The important point is that the Angular `field` must match the JSON property, not necessarily the Oracle column name.

---

## 4. The Value Is Nested

Actual row:

```ts
{
  id: 1,
  name: 'Toyota',
  car: {
    code: 'CAR-10'
  }
}
```

This does not work:

```ts
field: 'carCode'
```

### Solution A: Dot notation

```ts
field: 'car.code'
```

### Solution B: Value getter

```ts
{
  headerName: 'Code',
  colId: 'carCode',
  valueGetter: params => params.data?.car?.code ?? '',
  sortable: true
}
```

When using a `valueGetter` without a field, provide a stable `colId`.

---

## 5. Every Sort Value Is `undefined`

A renderer might make the values appear valid while the field itself is undefined.

```ts
{
  field: 'carCode',
  cellRenderer: params => params.data.car.code
}
```

The displayed value comes from:

```ts
params.data.car.code
```

The normal field value comes from:

```ts
params.data.carCode
```

If `carCode` is undefined for every row, all rows compare as equal.

### Solution

Use a matching `valueGetter`:

```ts
{
  headerName: 'Code',
  colId: 'carCode',
  valueGetter: params => params.data?.car?.code ?? '',
  cellRenderer: params => params.value,
  sortable: true
}
```

---

## 6. `cellRenderer` Displays a Different Value

A custom renderer may display a label, badge, icon, or HTML derived from another property.

```ts
{
  field: 'carCodeId',
  cellRenderer: params => params.data.carCodeDescription
}
```

The grid may sort by `carCodeId` while users expect it to sort by `carCodeDescription`.

### Solution A: Make the field represent the expected sort value

```ts
field: 'carCodeDescription'
```

### Solution B: Use `valueGetter`

```ts
valueGetter: params => params.data?.carCodeDescription ?? ''
```

### Solution C: Use a comparator that reads the desired data

```ts
comparator: (_valueA, _valueB, nodeA, nodeB) => {
  const a = nodeA.data?.carCodeDescription ?? '';
  const b = nodeB.data?.carCodeDescription ?? '';
  return a.localeCompare(b);
}
```

Prefer a proper value getter when possible because filtering, export, and aggregation may also need the same value.

---

## 7. `valueFormatter` Makes the Value Look Different

Example:

```ts
{
  field: 'carCode',
  valueFormatter: params => `Code: ${params.value}`
}
```

The displayed value is:

```text
Code: CAR-10
```

The raw sort value remains:

```text
CAR-10
```

This is usually correct, but it can surprise users if the formatter substantially changes the meaning or order.

### Solution

Use a comparator when the formatted representation defines the expected order.

```ts
{
  field: 'carCode',
  valueFormatter: params => formatCarCode(params.value),
  comparator: (a, b) =>
    formatCarCode(a).localeCompare(formatCarCode(b))
}
```

Avoid expensive formatting logic inside the comparator when sorting many rows.

---

## 8. Values Are Alphanumeric and Sort Lexicographically

Text sorting may produce:

```text
CAR-1
CAR-10
CAR-11
CAR-2
```

That is valid string ordering, but users often expect natural numeric ordering:

```text
CAR-1
CAR-2
CAR-10
CAR-11
```

### Solution: Natural comparator

```ts
const naturalTextComparator = (
  valueA: unknown,
  valueB: unknown
): number => {
  const a = String(valueA ?? '').trim();
  const b = String(valueB ?? '').trim();

  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: 'base'
  });
};
```

Column:

```ts
{
  field: 'carCode',
  headerName: 'Code',
  comparator: naturalTextComparator
}
```

---

## 9. Values Contain Leading or Trailing Spaces

Data may look identical in the grid while containing whitespace:

```text
"CAR-2"
" CAR-10"
"CAR-1 "
```

A renderer or CSS may make the spaces hard to notice.

### Diagnostic

```ts
this.rowData.forEach(row => {
  console.log(JSON.stringify(row.carCode));
});
```

`JSON.stringify` makes surrounding spaces visible.

### Solution A: Clean data when received

```ts
this.rowData = response.map(row => ({
  ...row,
  carCode: row.carCode?.trim() ?? null
}));
```

### Solution B: Normalise in a value getter

```ts
valueGetter: params => params.data?.carCode?.trim() ?? ''
```

### Solution C: Normalise in the backend

```java
String cleanedCode = car.getCarCode() == null
    ? null
    : car.getCarCode().trim();
```

Backend normalisation is usually preferable when whitespace is invalid business data.

---

## 10. Values Contain Non-Breaking Spaces or Other Invisible Characters

The value may contain:

- non-breaking spaces;
- zero-width spaces;
- tabs;
- carriage returns;
- line feeds;
- Unicode look-alike characters.

### Diagnostic

```ts
function showCodePoints(value: string): string {
  return [...value]
    .map(character => `${character}[U+${character.codePointAt(0)!
      .toString(16)
      .toUpperCase()
      .padStart(4, '0')}]`)
    .join(' ');
}

console.log(showCodePoints(row.carCode));
```

### Solution

Normalise before display and sorting:

```ts
function normaliseCode(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}
```

Use it in `valueGetter` or clean the data at the API boundary.

---

## 11. Mixed Data Types

The same column may contain:

```ts
[
  '10',
  2,
  null,
  { code: '5' },
  undefined
]
```

Mixed types can produce inconsistent or unexpected ordering.

### Diagnostic

```ts
this.rowData.forEach(row => {
  console.log(row.carCode, typeof row.carCode);
});
```

### Solution

Define and enforce a consistent data type.

```ts
interface CarLookupRow {
  carCode: string | null;
}
```

Normalise incoming data:

```ts
carCode: row.carCode == null ? null : String(row.carCode)
```

For object values, extract a primitive value with `valueGetter`.

---

## 12. The Cell Value Is an Object

Example:

```ts
{
  carCode: {
    value: 'CAR-10',
    description: 'Toyota code'
  }
}
```

JavaScript object comparisons do not provide a useful business sort order.

### Solution

Return a primitive sort value:

```ts
{
  headerName: 'Code',
  colId: 'carCode',
  valueGetter: params => params.data?.carCode?.value ?? '',
  sortable: true
}
```

Or supply a comparator:

```ts
comparator: (a, b) =>
  String(a?.value ?? '').localeCompare(String(b?.value ?? ''))
```

---

## 13. Null, Empty, and Missing Values Dominate the Column

These values are different in JavaScript:

```ts
null
undefined
''
' '
```

A large number of blank values can make a sort appear to do nothing, especially when the visible rows are mostly blank.

### Solution

Define a predictable null policy:

```ts
function compareNullableText(
  valueA: unknown,
  valueB: unknown
): number {
  const aMissing = valueA == null || String(valueA).trim() === '';
  const bMissing = valueB == null || String(valueB).trim() === '';

  if (aMissing && bMissing) {
    return 0;
  }

  if (aMissing) {
    return 1;
  }

  if (bMissing) {
    return -1;
  }

  return String(valueA).localeCompare(String(valueB), undefined, {
    numeric: true,
    sensitivity: 'base'
  });
}
```

Do not invert the result inside the comparator for descending order. AG Grid applies the requested direction.

---

## 14. Sorting Is Disabled on That Column

A column can explicitly disable sorting:

```ts
{
  field: 'carCode',
  sortable: false
}
```

A default definition can also disable all columns:

```ts
defaultColDef = {
  sortable: false
};
```

A specific column can override it:

```ts
{
  field: 'carCode',
  sortable: true
}
```

### Solution

Inspect both the column and the defaults:

```ts
defaultColDef: ColDef = {
  sortable: true
};
```

```ts
{
  field: 'carCode',
  sortable: true
}
```

Also inspect definitions that are merged or spread:

```ts
{
  sortable: true,
  ...sharedColumnConfig
}
```

If `sharedColumnConfig` contains `sortable: false`, it overrides the earlier value.

Prefer:

```ts
{
  ...sharedColumnConfig,
  sortable: true
}
```

when the column must override the shared setting.

---

## 15. A Custom `sortingOrder` Excludes a Direction

A column can customise its sort cycle:

```ts
sortingOrder: ['asc', null]
```

It will never enter descending order.

A mistaken configuration might be:

```ts
sortingOrder: [null]
```

### Solution

Use the standard cycle:

```ts
sortingOrder: ['asc', 'desc', null]
```

---

## 16. A Custom Comparator Is Incorrect

AG Grid expects the comparator to return:

- a negative number when A should come before B;
- zero when they are equal;
- a positive number when A should come after B.

### Incorrect: returns a boolean

```ts
comparator: (a, b) => a > b
```

This returns only `true` or `false`, not a complete three-way comparison.

### Correct

```ts
comparator: (a, b) => {
  if (a === b) {
    return 0;
  }

  return a > b ? 1 : -1;
}
```

### Incorrect: reverses descending itself

```ts
comparator: (a, b, _nodeA, _nodeB, isDescending) => {
  const result = String(a).localeCompare(String(b));
  return isDescending ? -result : result;
}
```

AG Grid already reverses the order for descending sorts.

### Correct

```ts
comparator: (a, b) =>
  String(a ?? '').localeCompare(String(b ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
```

---

## 17. Comparator Throws an Exception for Null Values

This can fail:

```ts
comparator: (a, b) => a.localeCompare(b)
```

when either value is null or undefined.

### Solution

```ts
comparator: (a, b) =>
  String(a ?? '').localeCompare(String(b ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
```

Check the browser console for exceptions raised immediately after clicking the header.

---

## 18. Comparator Always Returns Zero

This causes every row to be treated as equal:

```ts
comparator: () => 0
```

It may also happen accidentally:

```ts
comparator: (a, b) => Number(a) - Number(b)
```

when codes such as `CAR-1` convert to `NaN`.

### Diagnostic

```ts
comparator: (a, b) => {
  const result = naturalTextComparator(a, b);
  console.log({ a, b, result });
  return result;
}
```

### Solution

Use a comparator suitable for the actual data format.

---

## 19. Case Sensitivity Produces Unexpected Results

Default string sorting may place uppercase and lowercase values in an order users do not expect.

Example:

```text
CAR-1
Car-2
car-3
```

### Solution

```ts
comparator: (a, b) =>
  String(a ?? '').localeCompare(String(b ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
```

`sensitivity: 'base'` reduces case and accent distinctions for comparison.

---

## 20. Locale or Accented Characters Affect the Order

Values such as these may not follow the user's expected linguistic order:

```text
A
À
B
```

AG Grid supports locale-aware sorting through `accentedSort`, although locale-aware comparisons may be slower on large datasets.

### Solution A

```ts
gridOptions = {
  accentedSort: true
};
```

### Solution B

Use an explicit `Intl.Collator`:

```ts
const codeCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base'
});

const comparator = (a: unknown, b: unknown): number =>
  codeCollator.compare(String(a ?? ''), String(b ?? ''));
```

Creating the collator once is generally better than creating it on every comparison.

---

## 21. The `valueGetter` Is Incorrect

Example:

```ts
valueGetter: params => params.data?.code
```

when the property is actually:

```ts
params.data?.carCode
```

### Solution

Log the returned value:

```ts
valueGetter: params => {
  const value = params.data?.carCode ?? '';
  console.log('carCode valueGetter:', value);
  return value;
}
```

Remove the logging after diagnosis.

---

## 22. The `valueGetter` Is Not Pure

AG Grid expects a value getter to return the same result for the same data state.

This is problematic:

```ts
valueGetter: () => Math.random()
```

So is a getter based on changing external state that the grid has not refreshed.

### Solution

Base it only on stable row data:

```ts
valueGetter: params => params.data?.carCode?.trim() ?? ''
```

When external state legitimately changes, update the data or refresh the affected cells and sorting appropriately.

---

## 23. Value Cache Contains Stale Derived Values

If value caching is enabled and the underlying data is mutated outside the expected update flow, a cached getter value may be stale.

### Solution

Prefer immutable updates:

```ts
this.rowData = this.rowData.map(row =>
  row.id === updated.id
    ? { ...row, carCode: updated.carCode }
    : row
);
```

Use the AG Grid transaction or update APIs rather than silently mutating an object property.

If necessary, expire the value cache and refresh:

```ts
this.gridApi.expireValueCache();
this.gridApi.refreshCells({ force: true });
this.gridApi.refreshClientSideRowModel('sort');
```

Only use API calls that exist in the AG Grid version installed by the project.

---

## 24. A Custom Header Does Not Trigger Sorting

AG Grid's default header handles sorting. A fully custom header component becomes responsible for processing the click and changing the sort state.

A custom header that only renders text may display normally but never request sorting.

### Solution

Call one of the provided header callbacks:

```ts
onHeaderClick(event: MouseEvent): void {
  this.params.progressSort(event.shiftKey);
}
```

or:

```ts
this.params.setSort('asc', event.shiftKey);
```

An inner header component is often preferable when only the displayed header content needs customisation because it retains the default sorting behaviour.

---

## 25. A Child Element Stops the Header Click

A button, icon, menu, or wrapper inside the header can stop event propagation:

```ts
event.stopPropagation();
```

The grid may never receive the click.

### Solution

Only stop propagation where necessary. For the sortable label, explicitly invoke:

```ts
this.params.progressSort(event.shiftKey);
```

Also check CSS such as:

```css
pointer-events: none;
```

or an overlay element that intercepts clicks.

---

## 26. Sort State Is Being Reset After the Click

The user clicks the header, the grid briefly sorts, and application code immediately reapplies column state or definitions.

Common causes include:

```ts
this.columnDefs = this.carLookupModel.getCarLookupColumns();
```

being called repeatedly, or:

```ts
this.gridApi.applyColumnState({
  state: savedState,
  defaultState: { sort: null }
});
```

running after each update.

### Solution

- Initialise column definitions once when possible.
- Do not recreate them during every Angular change-detection cycle.
- Do not reapply stale saved state after every sort.
- Apply persisted state only at the intended lifecycle point.
- Use stable `field` or `colId` values so AG Grid can match columns.

Example:

```ts
public readonly columnDefs =
  this.carLookupModel.getCarLookupColumns();
```

Avoid template expressions that create a new array repeatedly:

```html
<!-- Avoid -->
<ag-grid-angular
  [columnDefs]="carLookupModel.getCarLookupColumns()">
</ag-grid-angular>
```

Prefer:

```html
<ag-grid-angular
  [columnDefs]="columnDefs">
</ag-grid-angular>
```

---

## 27. Duplicate or Unstable Column IDs

Two columns may use the same field or column ID:

```ts
{ colId: 'code', field: 'carCode' }
{ colId: 'code', field: 'manufacturerCode' }
```

State restoration may affect the wrong column.

A column using only a `valueGetter` and no stable `colId` can also be treated as a new column when definitions are recreated.

### Solution

Use a unique, stable ID:

```ts
{
  colId: 'carCode',
  field: 'carCode'
}
```

For a calculated column:

```ts
{
  colId: 'normalisedCarCode',
  valueGetter: params => normaliseCode(params.data?.carCode)
}
```

---

## 28. Another Column Is Still the Primary Sort

With multi-column sorting, Car Code may be the second or third sort. The primary column can dominate the visible order, making Car Code appear unsorted.

### Diagnostic

```ts
console.log(this.gridApi.getColumnState());
```

Look for:

```ts
[
  { colId: 'name', sort: 'asc', sortIndex: 0 },
  { colId: 'carCode', sort: 'asc', sortIndex: 1 }
]
```

### Solution

Clear existing sorts before testing:

```ts
this.gridApi.applyColumnState({
  defaultState: { sort: null }
});
```

Then sort only Car Code.

You can also inspect whether `alwaysMultiSort` is enabled or whether users are holding Shift/Ctrl/Command.

---

## 29. A `postSortRows` Callback Reorders the Results

AG Grid can run `postSortRows` after its normal sort.

Example:

```ts
postSortRows: params => {
  // Custom code moves some rows after the normal sort.
}
```

A bug in this callback can undo or obscure Car Code sorting.

### Solution

Temporarily remove `postSortRows` and retest.

Ensure the callback preserves the requested sort order unless intentionally overriding it.

---

## 30. Pinned Row Data Does Not Participate in Normal Sorting

Rows supplied directly through:

```ts
pinnedTopRowData
pinnedBottomRowData
```

remain pinned. They do not move through the normal row set when the user sorts.

### Solution

Do not use pinned row data for ordinary records that should move during sorting.

Use pinned rows only for totals, summaries, special actions, or fixed records.

---

## 31. Row Grouping Makes the Result Look Unsorted

When rows are grouped, sorting a leaf column may sort records inside each group rather than rearranging the group hierarchy in the way the user expects.

Options such as `groupMaintainOrder` can preserve structural group order.

### Solution

Determine whether the desired operation is:

- sorting leaf rows within each group;
- sorting the group rows;
- sorting by an aggregate value;
- removing grouping before sorting.

Configure the grouped column, auto-group column, or aggregation comparator accordingly.

---

## 32. Tree Data Preserves Hierarchy

With tree data, sorting generally respects parent-child structure. A global flat order is not expected because children remain under their parents.

### Solution

Decide whether the data should remain hierarchical. If a global Car Code sort is required, present a flat dataset or implement an appropriate tree/group sorting rule.

---

## 33. Client-Side Data Is Replaced After Sorting

An HTTP response, observable subscription, polling cycle, or component state update may replace the rows with data in the original backend order.

Example:

```ts
this.service.getCars().subscribe(cars => {
  this.rowData = cars;
});
```

If this runs again immediately after sorting, the visual result may appear to revert.

### Solution

Find the repeated data assignment and determine why it runs.

Log it:

```ts
console.log('Replacing rowData', new Date().toISOString());
```

Use AG Grid's data-update APIs and preserve the grid's sort state where appropriate.

---

## 34. External Sorting Is Enabled but Not Implemented Correctly

Some applications listen to sort changes and sort data themselves.

Example pattern:

```ts
onSortChanged(): void {
  // Application replaces rowData.
}
```

If the custom code ignores `carCode`, sorts the wrong key, or always restores the original list, the column will not work.

### Solution

Either:

- let AG Grid handle client-side sorting; or
- implement the external sort consistently for every allowed column.

Do not mix both approaches unintentionally.

---

## 35. Infinite Row Model Requires Server-Side Sorting

With the Infinite Row Model, the browser does not hold the complete dataset. AG Grid cannot correctly sort the entire dataset by itself.

The grid sends sort information to the datasource, and the server must return the rows in the requested order.

### Diagnostic

Inspect the datasource request:

```ts
getRows(params): void {
  console.log(params.sortModel);
}
```

A request may contain:

```ts
[
  {
    colId: 'carCode',
    sort: 'asc'
  }
]
```

### Solution

Pass the sort model to the Spring endpoint and apply it in the database query.

If the server ignores the requested field or direction, the header icon may change while the rows remain unchanged.

---

## 36. Server-Side Row Model Requires Backend Sorting

With AG Grid's Server-Side Row Model, the actual sort is normally performed by the server.

The request contains sort metadata such as:

```ts
{
  sortModel: [
    {
      colId: 'carCode',
      sort: 'asc'
    }
  ]
}
```

### Solution

The backend must:

1. read the sort model;
2. validate the column ID;
3. map the UI column ID to a Java/JPA property;
4. apply ascending or descending order;
5. execute the query;
6. return the sorted page.

---

## 37. Frontend and Backend Use Different Sort Names

The frontend sends:

```text
carCode
```

The backend expects:

```text
code
```

or:

```text
CAR_CODE
```

The backend may ignore the sort or fall back to a default.

### Solution

Use a whitelist mapping:

```java
private static final Map<String, String> SORT_FIELDS = Map.of(
    "id", "id",
    "name", "name",
    "carCode", "carCode"
);
```

The frontend name maps to the JPA entity property. Do not send raw Oracle column names unless the API is intentionally designed that way.

---

## 38. Spring `Sort` Uses the Wrong Property

Spring Data sorting generally uses entity/domain property names, not database column names.

Entity:

```java
@Column(name = "CAR_CODE")
private String carCode;
```

Correct Spring property:

```java
Sort.by("carCode")
```

Potentially incorrect:

```java
Sort.by("CAR_CODE")
```

### Solution

Sort using the Java entity path that Spring Data can resolve:

```java
Sort sort = Sort.by(direction, "carCode");
```

For a nested association, use a valid property path supported by the query:

```java
Sort.by("car.code")
```

---

## 39. A Custom Repository Query Ignores `Pageable` or `Sort`

A service may construct a `Pageable`, but the repository method or custom implementation may not use it.

### Problem pattern

```java
Pageable pageable = PageRequest.of(page, size, sort);
return customRepository.findCars(); // pageable never passed
```

### Solution

Pass it:

```java
return repository.findAll(pageable);
```

or define a compatible query method:

```java
Page<Car> findByActiveTrue(Pageable pageable);
```

For custom Criteria or Querydsl code, explicitly apply the sort orders.

---

## 40. Native SQL Has a Fixed `ORDER BY`

A native query may always use:

```sql
ORDER BY NAME
```

even when Car Code is selected.

A fixed clause can override or prevent the expected dynamic order.

### Solution

- Use Spring Data pageable sorting where supported.
- Build a validated dynamic query in repository code.
- Map allowed UI fields to fixed SQL fragments.
- Never concatenate arbitrary client input into SQL.

Example whitelist concept:

```java
String orderBy = switch (requestedField) {
    case "id" -> "c.ID";
    case "name" -> "c.NAME";
    case "carCode" -> "c.CAR_CODE";
    default -> "c.ID";
};
```

Only validated values should influence SQL text.

---

## 41. The Backend Applies a Default Sort After the Requested Sort

Example:

```java
Sort sort = requestedSort.and(Sort.by("name").ascending());
```

This is normally a valid tie-breaker, but reversing the order can make the default sort primary:

```java
Sort sort = Sort.by("name").ascending().and(requestedSort);
```

### Solution

Make the requested field the primary sort and add a stable unique tie-breaker afterward:

```java
Sort sort = Sort.by(direction, property)
    .and(Sort.by("id").ascending());
```

A unique tie-breaker is useful for stable pagination.

---

## 42. Pagination Is Sorted Only Inside the Current Page

Incorrect backend logic:

1. fetch one page without ordering;
2. sort the page in Java;
3. return it.

This sorts only the records in that page, not the complete dataset.

### Solution

Apply `ORDER BY` before pagination in the database query.

Correct conceptual order:

```text
filter -> database sort -> database pagination -> return page
```

Not:

```text
database pagination -> Java sort current page
```

---

## 43. Oracle `CHAR` Padding or Stored Whitespace Affects Ordering

If `CAR_CODE` is defined as fixed-length `CHAR`, values may be blank-padded. Data may also contain deliberate or accidental leading/trailing spaces.

### Diagnostic SQL

```sql
SELECT
    '[' || CAR_CODE || ']' AS DISPLAY_CODE,
    LENGTH(CAR_CODE) AS CODE_LENGTH
FROM CAR
ORDER BY CAR_CODE;
```

### Solution A: Prefer suitable schema types

Use `VARCHAR2` for variable-length codes when appropriate.

### Solution B: Normalise in the query

```sql
ORDER BY TRIM(CAR_CODE) ASC
```

### Solution C: Clean stored data

Update invalid values and enforce validation at write time.

Using functions in `ORDER BY` can affect index usage, so performance should be reviewed for large tables.

---

## 44. Oracle Case Ordering Differs From User Expectations

Values may contain different casing:

```text
ABC-1
Abc-2
abc-3
```

### Solution

Case-insensitive database sort:

```sql
ORDER BY UPPER(TRIM(CAR_CODE)) ASC
```

For frequently queried large datasets, consider the performance implications and whether a function-based index is appropriate.

The frontend and backend should use the same comparison rule so that client-side and server-side results are consistent.

---

## 45. Oracle Null Ordering Looks Like a Failed Sort

Oracle places nulls differently depending on sort direction unless `NULLS FIRST` or `NULLS LAST` is specified.

A large block of null values at the top can make descending sorting look incorrect.

### Solution

Choose an explicit policy:

```sql
ORDER BY CAR_CODE ASC NULLS LAST
```

and:

```sql
ORDER BY CAR_CODE DESC NULLS LAST
```

Use the same intended null policy in the frontend comparator if both client-side and server-side sorting are used.

---

## 46. The Database Sort Is Not Stable for Duplicate Codes

Many rows may share the same Car Code. SQL is not required to return tied rows in a predictable order unless another key is included.

The rows may seem to jump around between requests.

### Solution

Add a unique tie-breaker:

```sql
ORDER BY CAR_CODE ASC, ID ASC
```

Spring:

```java
Sort sort = Sort.by(direction, "carCode")
    .and(Sort.by("id").ascending());
```

---

## 47. The Response Is Sorted, but the Frontend Reorders It

The backend may return correctly sorted data, but frontend logic may subsequently call:

```ts
cars.sort(...)
```

or group, map, merge, or append results in a different order.

### Solution

Inspect the Network tab response and compare it with `rowData` immediately before passing it to the grid:

```ts
console.log('API response', response);
console.log('Grid rowData', this.rowData);
```

If the Network response is correct but `rowData` is wrong, the issue is in frontend transformation logic.

---

## 48. The API Returns an Already-Formatted Code

The backend might return:

```text
CAR-001
CAR-010
CAR-002
```

while the UI strips zeros:

```text
CAR-1
CAR-10
CAR-2
```

The raw server order and displayed order can seem inconsistent.

### Solution

Define one canonical representation for sorting.

Either:

- sort by the raw code and display the raw code;
- return a separate numeric sort key;
- calculate a consistent comparator.

Example:

```ts
interface CarLookupRow {
  carCode: string;
  carCodeSortNumber: number;
}
```

```ts
{
  field: 'carCode',
  comparator: (_a, _b, nodeA, nodeB) =>
    nodeA.data.carCodeSortNumber - nodeB.data.carCodeSortNumber
}
```

---

## 49. The Sort Event Is Cancelled or Followed by an Error

Application code may listen to `sortChanged` and throw an exception:

```ts
onSortChanged(): void {
  this.loadCars(); // fails or resets state
}
```

### Solution

Check the browser console and network requests immediately after clicking the column.

Temporarily remove event handlers and retest.

---

## 50. CSS Hides the Sort Indicator Even Though Sorting Works

The rows may actually be sorted, but a custom theme hides the ascending or descending icon.

### Diagnostic

Listen for the event:

```ts
onSortChanged(): void {
  console.log(this.gridApi.getColumnState());
}
```

### Solution

Inspect theme overrides affecting:

```text
.ag-sort-ascending-icon
.ag-sort-descending-icon
.ag-sort-none-icon
```

Do not rely only on the icon; inspect the row order and column state.

---

# Client-Side Versus Server-Side Sorting

Before debugging the comparator, determine which row model is in use.

## Client-Side Row Model

Typical configuration:

```ts
rowModelType: 'clientSide'
```

or no explicit row model, because client-side is the normal default.

AG Grid holds the rows in the browser and performs sorting locally.

Focus on:

- field names;
- value getters;
- value formatters;
- renderers;
- custom comparators;
- data types;
- column state;
- custom headers;
- `postSortRows`.

---

## Infinite Row Model

```ts
rowModelType: 'infinite'
```

The grid does not hold the complete dataset. Sorting must be implemented through the datasource/backend.

Focus on:

- `params.sortModel`;
- request construction;
- Spring controller parameters;
- allowed sort-field mappings;
- database `ORDER BY`;
- sorting before pagination.

---

## Server-Side Row Model

```ts
rowModelType: 'serverSide'
```

The server normally performs the sorting.

Focus on:

- `params.request.sortModel`;
- datasource requests;
- backend field mapping;
- JPA property names;
- Oracle ordering;
- cache refresh;
- server-side grouping rules.

---

# Spring Backend Example

The exact implementation depends on the API design. The following example demonstrates a safe field mapping rather than accepting arbitrary property names.

## Request Model

```java
public record GridSort(
    String colId,
    String sort
) {}
```

```java
public record CarSearchRequest(
    int page,
    int size,
    List<GridSort> sortModel
) {}
```

---

## Service Mapping

```java
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class CarLookupService {

    private static final Map<String, String> SORT_FIELDS = Map.of(
        "id", "id",
        "name", "name",
        "carCode", "carCode"
    );

    private final CarRepository carRepository;

    public CarLookupService(CarRepository carRepository) {
        this.carRepository = carRepository;
    }

    public Page<Car> search(CarSearchRequest request) {
        Sort sort = buildSort(request.sortModel());

        PageRequest pageable = PageRequest.of(
            request.page(),
            request.size(),
            sort
        );

        return carRepository.findAll(pageable);
    }

    private Sort buildSort(List<GridSort> sortModel) {
        if (sortModel == null || sortModel.isEmpty()) {
            return Sort.by("id").ascending();
        }

        Sort result = Sort.unsorted();

        for (GridSort gridSort : sortModel) {
            String property = SORT_FIELDS.get(gridSort.colId());

            if (property == null) {
                throw new IllegalArgumentException(
                    "Unsupported sort column: " + gridSort.colId()
                );
            }

            Sort.Direction direction =
                "desc".equalsIgnoreCase(gridSort.sort())
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;

            Sort next = Sort.by(direction, property);
            result = result.isUnsorted() ? next : result.and(next);
        }

        return result.and(Sort.by("id").ascending());
    }
}
```

## Repository

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarRepository extends JpaRepository<Car, Long> {
}
```

## Entity Mapping

```java
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "CAR")
public class Car {

    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "NAME")
    private String name;

    @Column(name = "CAR_CODE")
    private String carCode;

    // Getters and setters
}
```

The frontend sends `carCode`, Spring sorts by the entity property `carCode`, and JPA maps that property to Oracle column `CAR_CODE`.

---

# Oracle-Specific Considerations

## Explicit Null Policy

```sql
ORDER BY CAR_CODE ASC NULLS LAST
```

```sql
ORDER BY CAR_CODE DESC NULLS LAST
```

## Trim Invalid Whitespace

```sql
ORDER BY TRIM(CAR_CODE)
```

## Case-Insensitive Sort

```sql
ORDER BY UPPER(TRIM(CAR_CODE))
```

## Natural Numeric Sorting

If codes have a fixed prefix and numeric suffix, a database query may extract the numeric section. This must be tailored to the exact format and safely handle invalid values.

Example for codes that always follow `CAR-<number>`:

```sql
ORDER BY TO_NUMBER(SUBSTR(CAR_CODE, 5))
```

This will fail if values do not follow the expected pattern. Validate or use a safer conditional expression for real production data.

A simpler and often safer design is to store the numeric sequence in a separate numeric column:

```text
CAR_CODE        VARCHAR2
CAR_CODE_NUMBER NUMBER
```

Then sort by:

```sql
ORDER BY CAR_CODE_NUMBER
```

---

# Recommended Diagnostic Procedure

Follow these steps in order. They move from the most likely and inexpensive checks to deeper architectural checks.

## Step 1: Inspect the Exact Row Data

```ts
console.table(this.rowData);
console.log(this.rowData[0]);
console.log(Object.keys(this.rowData[0] ?? {}));
```

Confirm the exact property name.

---

## Step 2: Inspect the Exact Values

```ts
this.rowData.forEach(row => {
  console.log({
    raw: row.carCode,
    json: JSON.stringify(row.carCode),
    type: typeof row.carCode
  });
});
```

Look for:

- undefined values;
- nulls;
- objects;
- numbers mixed with strings;
- leading or trailing spaces;
- empty strings.

---

## Step 3: Use the Simplest Column Definition

Temporarily remove renderers, formatters, getters, and comparators:

```ts
{
  headerName: 'Code',
  field: 'carCode',
  sortable: true
}
```

If this works, reintroduce custom features one at a time.

---

## Step 4: Check Column State

```ts
onSortChanged(): void {
  console.log(this.gridApi.getColumnState());
}
```

Verify that `carCode` receives:

```ts
sort: 'asc'
```

or:

```ts
sort: 'desc'
```

---

## Step 5: Check for Multiple Active Sorts

Look for multiple columns with `sort` and `sortIndex`.

Clear all sorts and test Car Code alone.

---

## Step 6: Check the Row Model

```ts
console.log(this.gridApi.getGridOption('rowModelType'));
```

Depending on the installed AG Grid version, inspect the grid configuration directly if this API is unavailable.

Determine whether sorting belongs in the browser or on the server.

---

## Step 7: Inspect Network Requests

For server-side or infinite sorting:

1. Open browser developer tools.
2. Select the Network tab.
3. Click the Car Code header.
4. Inspect the request payload or query parameters.
5. Confirm it contains `carCode` and `asc`/`desc`.
6. Inspect the response order.

---

## Step 8: Compare API Response With Grid Data

```ts
console.log('response:', response);
console.log('rowData before grid:', this.rowData);
```

This identifies whether the backend or frontend transformation changed the order.

---

## Step 9: Inspect Spring Logs

Log only validated values:

```java
log.debug(
    "Grid sorting requested: field={}, direction={}",
    property,
    direction
);
```

Confirm the requested property becomes `carCode`.

---

## Step 10: Inspect Generated SQL

Enable appropriate development-only SQL logging and confirm the query contains an `ORDER BY` for `CAR_CODE`.

Do not leave excessively verbose SQL or parameter logging enabled in production without reviewing security and performance implications.

---

## Step 11: Query Oracle Directly

```sql
SELECT ID, NAME, CAR_CODE
FROM CAR
ORDER BY CAR_CODE ASC;
```

Then compare with:

```sql
SELECT ID, NAME, CAR_CODE
FROM CAR
ORDER BY TRIM(UPPER(CAR_CODE)) ASC NULLS LAST;
```

If these produce different practical results, the stored values contain case, whitespace, or null characteristics that should be addressed.

---

# Testing the Column Definitions

## Jasmine Test: Correct Field and Sorting

```ts
import { TestBed } from '@angular/core/testing';

import { CarLookupModel } from './car-lookup.model';

describe('CarLookupModel', () => {
  let model: CarLookupModel;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    model = TestBed.inject(CarLookupModel);
  });

  it('should create the car-code column with the correct field', () => {
    const columns = model.getCarLookupColumns();

    const codeColumn = columns.find(
      column => column.colId === 'carCode'
        || column.field === 'carCode'
    );

    expect(codeColumn).toBeDefined();
    expect(codeColumn?.field).toBe('carCode');
    expect(codeColumn?.sortable).toBeTrue();
  });

  it('should not contain whitespace in field names', () => {
    const columns = model.getCarLookupColumns();

    for (const column of columns) {
      if (typeof column.field === 'string') {
        expect(column.field).toBe(column.field.trim());
      }
    }
  });
});
```

---

## Jasmine Test: Natural Comparator

First export the comparator:

```ts
export const naturalTextComparator = (
  valueA: unknown,
  valueB: unknown
): number => {
  const a = String(valueA ?? '').trim();
  const b = String(valueB ?? '').trim();

  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: 'base'
  });
};
```

Test:

```ts
import { naturalTextComparator } from './car-lookup.model';

describe('naturalTextComparator', () => {
  it('should sort numeric code suffixes naturally', () => {
    const values = ['CAR-10', 'CAR-2', 'CAR-1'];

    const sorted = [...values].sort(naturalTextComparator);

    expect(sorted).toEqual([
      'CAR-1',
      'CAR-2',
      'CAR-10'
    ]);
  });

  it('should handle null and undefined values', () => {
    expect(() => {
      [null, 'CAR-1', undefined].sort(naturalTextComparator);
    }).not.toThrow();
  });

  it('should ignore case for comparison', () => {
    expect(
      naturalTextComparator('car-1', 'CAR-1')
    ).toBe(0);
  });
});
```

---

# Final Recommended Implementation

This version:

- uses the exact `carCode` field;
- uses strong row typing;
- provides stable column IDs;
- trims code values;
- handles nulls;
- applies natural alphanumeric sorting;
- avoids putting descending logic inside the comparator.

```ts
import { Injectable } from '@angular/core';
import {
  ColDef,
  ValueGetterParams
} from 'ag-grid-community';

export interface CarLookupRow {
  id: number;
  name: string;
  carCode: string | null;
}

const carCodeCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base'
});

export function normaliseCarCode(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

export function carCodeComparator(
  valueA: unknown,
  valueB: unknown
): number {
  const a = normaliseCarCode(valueA);
  const b = normaliseCarCode(valueB);

  const aMissing = a.length === 0;
  const bMissing = b.length === 0;

  if (aMissing && bMissing) {
    return 0;
  }

  if (aMissing) {
    return 1;
  }

  if (bMissing) {
    return -1;
  }

  return carCodeCollator.compare(a, b);
}

@Injectable({
  providedIn: 'root'
})
export class CarLookupModel {
  public getCarLookupColumns(): ColDef<CarLookupRow>[] {
    return [
      this.nonEditableCol(
        'id',
        'Car ID',
        150,
        'agNumberColumnFilter'
      ),
      this.nonEditableCol(
        'name',
        'Car Name',
        120
      ),
      {
        colId: 'carCode',
        headerName: 'Code',
        width: 90,
        editable: false,
        sortable: true,
        filter: 'agTextColumnFilter',

        valueGetter: (
          params: ValueGetterParams<CarLookupRow>
        ): string => normaliseCarCode(
          params.data?.carCode
        ),

        comparator: carCodeComparator
      }
    ];
  }

  private nonEditableCol(
    property: keyof CarLookupRow & string,
    title: string,
    width: number,
    filter: ColDef<CarLookupRow>['filter']
      = 'agTextColumnFilter'
  ): ColDef<CarLookupRow> {
    return {
      colId: property,
      headerName: title,
      field: property,
      width,
      editable: false,
      sortable: true,
      filter
    };
  }
}
```

## When the Simple Version Is Better

Do not add a custom comparator merely because it is available.

Use the simple column when:

```ts
{
  field: 'carCode',
  sortable: true
}
```

already produces the desired result.

Add the normalisation and comparator only when the data contains:

- alphanumeric numeric suffixes;
- inconsistent casing;
- surrounding whitespace;
- invisible Unicode characters;
- explicit null-placement requirements.

The simplest correct configuration is usually the easiest to maintain.

---

# Quick Troubleshooting Checklist

- [ ] The field is exactly `carCode`, with no extra spaces.
- [ ] The backend JSON actually contains `carCode`.
- [ ] The value is not nested under another object.
- [ ] The values are primitives, not objects.
- [ ] The column is explicitly sortable.
- [ ] A shared column definition is not overriding `sortable`.
- [ ] The custom renderer and underlying value represent the same thing.
- [ ] The value getter returns the expected value.
- [ ] The value getter is pure.
- [ ] The comparator returns negative, zero, or positive numbers.
- [ ] The comparator handles null and undefined values.
- [ ] The comparator does not manually reverse descending order.
- [ ] Natural sorting is used when codes include numbers.
- [ ] Existing multi-column sorts have been cleared.
- [ ] A custom header calls `progressSort` or `setSort`.
- [ ] Column definitions are not recreated repeatedly.
- [ ] Column state is not reapplied immediately after sorting.
- [ ] `postSortRows` is not undoing the normal sort.
- [ ] Pinned rows are not being mistaken for normal sortable rows.
- [ ] Grouping or tree hierarchy is not constraining the order.
- [ ] The correct row model has been identified.
- [ ] Server-side sort metadata reaches Spring.
- [ ] Spring maps `carCode` to the entity property `carCode`.
- [ ] Sorting is applied before pagination.
- [ ] The generated SQL contains the expected `ORDER BY`.
- [ ] Oracle whitespace, case, nulls, and duplicate values are handled intentionally.
- [ ] A stable secondary sort such as `id` is used for paged duplicate values.

---

# Official References

- AG Grid Row Sorting:  
  https://www.ag-grid.com/angular-data-grid/row-sorting/

- AG Grid Value Getters:  
  https://www.ag-grid.com/angular-data-grid/value-getters/

- AG Grid Value Formatters:  
  https://www.ag-grid.com/angular-data-grid/value-formatters/

- AG Grid Custom Header Components:  
  https://www.ag-grid.com/angular-data-grid/column-headers-components/

- AG Grid Updating Column Definitions:  
  https://www.ag-grid.com/angular-data-grid/column-updating-definitions/

- AG Grid Column State:  
  https://www.ag-grid.com/angular-data-grid/column-state/

- AG Grid Infinite Row Model:  
  https://www.ag-grid.com/angular-data-grid/infinite-scrolling/

- AG Grid Server-Side Sorting:  
  https://www.ag-grid.com/angular-data-grid/server-side-model-sorting/

- AG Grid Row Pinning:  
  https://www.ag-grid.com/angular-data-grid/row-pinning/

- Spring Data JPA Query Methods and Sorting:  
  https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html

- Spring Data Repository Definitions:  
  https://docs.spring.io/spring-data/jpa/reference/repositories/definition.html

- Oracle `SELECT` and `ORDER BY`:  
  https://docs.oracle.com/en/database/oracle/oracle-database/26/sqlrf/SELECT.html

---

## Conclusion

The original trailing space in `'car code '` remains the first issue to correct. After changing it to the exact JSON property—most likely `'carCode'`—test the simplest possible column definition.

If sorting still fails, determine whether the application uses the client-side, infinite, or server-side row model. A header that changes state without changing row order often indicates that the backend is not applying the received sort model. A column that displays the right text but sorts incorrectly usually indicates a mismatch between the rendered value and the underlying field, or a data-type/comparator problem.
