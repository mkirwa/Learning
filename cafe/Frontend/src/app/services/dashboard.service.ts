import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  url = environment.apiUrl;

  constructor(private httpClient:HttpClient) { }

  getDetails(){
    //call this api to get the details of the dashboard
    return this.httpClient.get(this.url+"/dashboard/details");
  }
}
