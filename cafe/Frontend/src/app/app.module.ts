import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './shared/material-module';
import { HomeComponent } from './home/home.component';
import { BestSellerComponent } from './best-seller/best-seller.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from './shared/shared.module';
import { FullComponent } from './layouts/full/full.component';
import { AppHeaderComponent } from './layouts/full/header/header.component';
import { AppSidebarComponent } from './layouts/full/sidebar/sidebar.component';

// Importing http client module for making http requests to the backend api
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { SignupComponent } from './signup/signup.component';
import { NgxUiLoaderConfig, NgxUiLoaderModule, SPINNER } from 'ngx-ui-loader';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { Http } from '@material-ui/icons';
import { tokenInterceptorInterceptor } from './services/token-interceptor.interceptor';
// import { ConfirmationComponent } from './material-component/dialog/confirmation/confirmation.component';
// import { ChangePasswordComponent } from './material-component/dialog/change-password/change-password.component';

import { MatIconModule } from '@angular/material/icon';
// import { ManageCategoryComponent } from './material-component/manage-category/manage-category.component';
// import { CategoryComponent } from './material-component/dialog/category/category.component';

// Created by Kirwa
const ngxUiLoaderConfig: NgxUiLoaderConfig = { 
  text: 'Loading...',
  textColor: '#FFFFFF',
  textPosition: 'center-center',
  bgsColor: '#7b1fa2',
  fgsColor: '#7b1fa2',
  fgsType: SPINNER.squareJellyBox,
  fgsSize: 100,
  hasProgressBar: false,
}

@NgModule({
  declarations: [  
    AppComponent,
    HomeComponent,
    BestSellerComponent,
    FullComponent,
    AppHeaderComponent,
    AppSidebarComponent,
    SignupComponent,
    ForgotPasswordComponent,
    LoginComponent,
    // ConfirmationComponent,
    // ChangePasswordComponent,
    // ConfirmationComponent,
    // ManageCategoryComponent,
   ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    SharedModule,
    HttpClientModule,
    MatIconModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig)
  ],
  providers: [
    HttpClientModule, {provide: HTTP_INTERCEPTORS, 
    useClass: tokenInterceptorInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
