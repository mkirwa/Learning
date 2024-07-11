# CAFE MANAGEMENT SYSTEM #

## Accessing the Database ##

Update the HTML file to include a new dropdown option.
Update the TypeScript file to manage the new dropdown option and fetch/display users.
Step 1: Update the HTML File
Assume you have an existing dropdown in your HTML file. Add a new option to it:
```
<!-- existing-dropdown.component.html -->
<select (change)="onDropdownChange($event.target.value)">
  <!-- Existing options -->
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
  <!-- New option for displaying users -->
  <option value="displayUsers">Display Users</option>
</select>

<!-- Container to display the list of users -->
<div *ngIf="selectedOption === 'displayUsers'">
  <ul>
    <li *ngFor="let user of users">{{ user.name }}</li>
  </ul>
</div>

```
Step 2: Update the TypeScript File
Update your TypeScript file to handle the new dropdown option and fetch the users.

```dockerfile
// existing-dropdown.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-existing-dropdown',
  templateUrl: './existing-dropdown.component.html',
  styleUrls: ['./existing-dropdown.component.css']
})
export class ExistingDropdownComponent implements OnInit {
  selectedOption: string = '';
  users: { name: string }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  onDropdownChange(value: string): void {
    this.selectedOption = value;
    if (value === 'displayUsers') {
      this.fetchUsers();
    }
  }

  fetchUsers(): void {
    this.http.get<{ name: string }[]>('your-backend-api-endpoint/users')
      .subscribe((data) => {
        this.users = data;
      }, (error) => {
        console.error('Failed to fetch users', error);
      });
  }
}

```
Explanation
HTML File:

Added a new option Display Users to the dropdown menu.
Added a conditional <div> to display the users only when the displayUsers option is selected.
Used *ngFor to loop through the users array and display each user's name.
TypeScript File:

Imported HttpClient to make HTTP requests.
Defined a public variable selectedOption to keep track of the currently selected dropdown option.
Defined a public variable users to store the list of users.
Implemented the onDropdownChange method to handle dropdown changes.
Implemented the fetchUsers method to fetch users from the backend when the displayUsers option is selected.
Backend Endpoint
Ensure that your backend API endpoint your-backend-api-endpoint/users is set up to return a list of users in the format:

```dockerfile
[
  { "name": "User 1" },
  { "name": "User 2" },
  // More users
]
```

Replace your-backend-api-endpoint with the actual URL of your backend API.

This approach should help you integrate a new dropdown option to display users in your Angular application.
