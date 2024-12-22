import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
// TODO: Review and add comments -> Created by Mahlon Kirwa
@Injectable({
  providedIn: 'root'
})
export class UserService {
  url = environment.apiUrl
  constructor(private httpClient:HttpClient) { }

  // Create method for signup
  signUp(data:any){
    return this.httpClient.post(`${this.url}/user/signup`,data,{
      headers: new HttpHeaders().set('Content-Type','application/json')
    })
  }

  // Create method for forgot password
  forgotPassword(data:any){
    return this.httpClient.post(`${this.url}/user/forgotPassword`,data,{
      headers: new HttpHeaders().set('Content-Type','application/json')
    })
  }

  // Create method for login page
  login(data:any){
    return this.httpClient.post(`${this.url}/user/login`,data,{
      headers: new HttpHeaders().set('Content-Type','application/json')
    })
  }

  // Implement a service that checks if a token exists and if it's valid
  // if a token exists and is valid, the user is redirected to the dashboard
  // other clear the local storage and redirect to the login page
  // This function uses the jwt-decode library to decode the token and check if it's valid
  // This library was installed using the command: npm install jwt-decode
  // It extracts the token from the local storage and decodes it. It will pick any token that is stored in the local storage
  checkToken(){
    return this.httpClient.get(this.url+"/user/checkToken");
  }

  // Create method for login page
  changePassword(data:any){
    return this.httpClient.post(`${this.url}/user/changePassword`,data,{
      headers: new HttpHeaders().set('Content-Type','application/json')
    })
  }
}
