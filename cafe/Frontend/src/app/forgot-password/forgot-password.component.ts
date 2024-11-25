import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../services/user.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from '../services/snackbar.service';
import { GlobalConstants } from '../shared/global-constants';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  // Accessing a form to be used to reset the password
  forgotPasswordForm: any = FormGroup;
  responseMessage: any;

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<ForgotPasswordComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    // Initialize the forgot password form with validation
    this.forgotPasswordForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.pattern(GlobalConstants.emailRegex)]]
    });
  }

  // handle the submit action that connects to the backend
  handleSubmt(){
    // Show the loader
    this.ngxService.start();
    var formData = this.forgotPasswordForm.value;
    var data = {
      email: formData.email
    }
    // Call the forgot password method in the user service to send the forgot password request to the backend api
    this.userService.forgotPassword(data).subscribe((response:any) => {
      // Hide the loader
      this.ngxService.stop();
      // Store the response message
      this.responseMessage = response?.message;
      // Show the snackbar with the response message
      this.snackbarService.openSnackBar(this.responseMessage.message, 'Close');
      // Close the dialog
      this.dialogRef.close();
    }, (error) => {
      // Hide the loader
      this.ngxService.stop();
      if(error.error?.message){
        // Store the response message
        this.responseMessage = error.error?.message;
      } else {
        // Store the response message
        this.responseMessage = error.error;
      }
      // Show the snackbar with the response message
      this.snackbarService.openSnackBar(this.responseMessage.message, 'Close');
    });
  }

}
