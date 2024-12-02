import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SignupComponent } from '../signup/signup.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { LoginComponent } from '../login/login.component';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private dialog:MatDialog) { }

  ngOnInit(): void {
  }
  // Method to open the signup dialog. Added this method. -> Created by Mahlon Kirwa
  // This method is called when the signup button is clicked at the home page
  handleSignupAction(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '550px';
    this.dialog.open(SignupComponent,dialogConfig);
  }

  // Method to open the forgot password dialog. Added this method. -> Created by Mahlon Kirwa
  // This method is called when the forgot password button is clicked at the home page
  handleForgotPasswordAction(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '550px';
    this.dialog.open(ForgotPasswordComponent,dialogConfig);
  }

  // Method to open login dialog. Added this method. -> Created by Mahlon Kirwa
  // This method is called when the login button is clicked at the home page
  handleLoginAction(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '550px';
    this.dialog.open(LoginComponent,dialogConfig);
  }

}
