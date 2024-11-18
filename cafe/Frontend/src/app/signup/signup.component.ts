// created by Kirwa
import { Component, OnInit } from '@angular/core';
import { ResponseMessage } from '../../../node_modules/piscina/src/common';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../services/snackbar.service';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Glob } from '../../../node_modules/webpack-dev-server/node_modules/glob/dist/esm/glob';
import { GlobalConstants } from '../shared/global-constants';
// import { data } from '../../../node_modules/@webassemblyjs/ast/esm/nodes';
// import { name } from '../../../node_modules/vite/dist/node/chunks/dep-cNe07EU9';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  password = true; // Flag to show/hide password
  confirmPassword = true; // Flag to show/hide confirm password

  signupForm: any; // Form group for signup form

  ResponseMessage: any; // Variable to store response messages

  constructor(
    private formBuilder: FormBuilder, // Form builder service
    private router: Router, // Router service
    private UserService: UserService, // User service
    private SnackbarService: SnackbarService, // Snackbar service
    public dialogRef: MatDialogRef<SignupComponent>, // Dialog reference
    private ngxService: NgxUiLoaderService // Loader service
  ) { }

  ngOnInit(): void {
    // Initialize the signup form with validation
    this.signupForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.pattern(GlobalConstants.nameRegex)]],
      email: [null, [Validators.required, Validators.pattern(GlobalConstants.emailRegex)]],
      contactNumber: [null, [Validators.required, Validators.pattern(GlobalConstants.contactNumberRegex)]],
      password: [null, [Validators.required]],
      confirmPassword: [null, [Validators.required]]
    });
  }

  // Method to validate if password and confirm password match
  validateSubmit() {
    if (this.signupForm.controls['password'].value != this.signupForm.controls['confirmPassword'].value) {
      // this.signupForm.controls['confirmPassword'].setErrors({'incorrect': true});
      return true;
    } else {
      return false;
    }
  }

  // Method to submit the signup form. Added this method. -> Created by Mahlon Kirwa
  // Calls the signup method in the user service to send the signup request to the backend api
  handleSubmit() {
    this.ngxService.start(); // Start the loader
    var formData = this.signupForm.value; // Get form data
    var data = {
      name: formData.name,
      email: formData.email,
      contactNumber: formData.contactNumber,
      password: formData.password
    }
    // Call the signup method in the user.service.ts 
    this.UserService.signup(data).subscribe((response: any) => {
      // if everything is successful it will execute
      this.ngxService.stop(); // Stop the loader
      this.dialogRef.close(); // Close the dialog
      this.ResponseMessage = response?.message; // Get response message
      this.SnackbarService.openShackBar(this.ResponseMessage, ""); // Show success message
      this.router.navigate(['/']); // Navigate to home page
    }, (error: any) => {
      // if there is an error it will execute this code below
      this.ngxService.stop(); // Stop the loader
      if (error.error.message) {
        this.ResponseMessage = error.error.message; // Get error message
      } else {
        this.ResponseMessage = GlobalConstants.genericError; // Get generic error message
      }
      this.SnackbarService.openShackBar(this.ResponseMessage, GlobalConstants.error); // Show error message
    });
  }
}
