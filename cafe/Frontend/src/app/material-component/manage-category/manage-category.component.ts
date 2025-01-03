import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-manage-category',
  templateUrl: './manage-category.component.html',
  styleUrl: './manage-category.component.scss',
})
export class ManageCategoryComponent implements OnInit {
  displayedColumns: string[] = ['name', 'edit'];

  dataSource: any;
  responseMessage: any;

  constructor(
    private categoryService: CategoryService,
    private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }

  // Function to get the categories from the backend and display it in the table
  tableData(){
    this.categoryService.getCategories().subscribe((response: any) => {
      // Stop the loader when we get the response from the backend api call 
      this.ngxService.stop();
      // Assign the response to the dataSource variable to display it in the table
      // MatTableDataSource is used to display the data in the table
      this.dataSource = new MatTableDataSource(response);
    }, (error: any) => {
      // Stop the loader when we get the error from the backend api call 
      this.ngxService.stop();
      // Log the error to the console  
      console.log(error.error?.message)
      // If there is a message in the error, assign it to the responseMessage variable
      if(error.error?.message){
        this.responseMessage = error.error?.message;
      } else {
        // If there is no message in the error, assign the generic error message to the responseMessage variable
        this.responseMessage = GlobalConstants.genericError;
      }
      // Show the snackbar with the response message
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    })
  }

  // Filter the data in the table based on the input value
  // event: Event is the event that is triggered when the input value changes
  applyFilter(event: Event) {
    // Get the value of the input field and convert it to lowercase
    // event.target is the input field and we are typecasting it to HTMLInputElement to get the value of the input field
    const filterValue = (event.target as HTMLInputElement).value;
    // Filter the data in the table based on the input value and convert ithandleAddAction to lowercase 
    // The filter function is used to filter the data in the table based on the input value
    this.dataSource.filter = filterValue.trim().toLowerCase();
  } 

  handleAddAction(){}

  handleEditAction(data:any){}
}
