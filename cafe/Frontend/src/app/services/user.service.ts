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
}
