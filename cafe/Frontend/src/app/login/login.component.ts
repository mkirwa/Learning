import { Component } from '@angular/core';
import {FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from '../services/snackbar.service';
import { GlobalConstants } from '../shared/global-constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  hide = true;

  // Let's add the form that we are going to use here
  loginForm: any = FormGroup

  responseMessage: any;

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    public dialogRef: MatDialogRef<LoginComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackbarService){

  }

  ngOnInit(): void {
    // Wrting code for the form 
    this.loginForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.pattern(GlobalConstants.emailRegex)]],
      password: [null, [Validators.required]]
    })
  }

  // Write code for handleSubmit that calls in the login api!! 
  handleSubmit(){
    this.ngxService.start();
    var formData = this.loginForm.value;
    var data = {
      email: formData.email,
      password: formData.password
    }
    this.userService.login(data).subscribe((response: any) => {
      // stop whenever we get the response if the response is 200
      this.ngxService.stop();
      // then close. 
      this.dialogRef.close()
      // Whenever we login, we are expecting a json token from the back end
      // We need to store that. Look at how to access that value from readme file. It will be in the dev tools. 
      localStorage.setItem('token',response.token)
      this.router.navigate(['/cafe/dashboard']);
    }, (error)=>{
      this.ngxService.stop();
      if(error.error?.message){
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      // 
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error)
    })
  }

}
