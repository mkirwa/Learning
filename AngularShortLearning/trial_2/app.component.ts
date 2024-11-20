import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataService, InputModel } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  dataForm!: FormGroup; // Form group for the reactive form
  gridData: any[] = []; // Data to display in AG Grid
  columnDefs = [
    { field: 'key1', headerName: 'Key 1' },
    { field: 'key2', headerName: 'Key 2' },
    { field: 'key3', headerName: 'Key 3' },
    { field: 'value', headerName: 'Value' },
  ];
  defaultColDef = {
    sortable: true,
    filter: true,
    flex: 1,
  };

  constructor(private fb: FormBuilder, private dataService: DataService) {}

  ngOnInit(): void {
    // Initialize the reactive form
    this.dataForm = this.fb.group({
      key1: [''], // Key 1 control
      key2: [''], // Key 2 control
      key3: [''], // Key 3 control
      value: [0], // Value control
    });
  }

  /**
   * Handles form submission.
   */
  onSubmit(): void {
    // Map form values to InputModel
    const inputModel: InputModel = this.dataForm.value;

    // Call the service with the form data
    this.dataService.postData(inputModel).subscribe(
      (response) => {
        console.log('Data submitted successfully:', response);

        // Update AG Grid with the response
        this.gridData = [response];
      },
      (error) => {
        console.error('Error submitting data:', error);
      }
    );
  }
}
