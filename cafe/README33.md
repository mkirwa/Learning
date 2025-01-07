
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
