import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  
  // api url from environment file that points to the backend
  url = environment.apiUrl;

  // constructor to initialize the http client. Http client needs to be initialized so that we can make http calls to the backend
  // to get the data from the backend
  constructor(private httpClient:HttpClient) { }

  generateReport(data: any) {
    return this.httpClient.post(this.url + '/bill/generatedReport', data ,{
      headers: {'Content-Type': 'application/json'}
    });
  }

  // function to get the pdf of the bill. We use Observable<Blob> to get the pdf file as a blob
  // and then we can use this blob to create a pdf file and download it
  // blob is a binary large object that can store a large amount of data and is used to store the pdf file
  getPdf(data: any): Observable<Blob> {
    return this.httpClient.post(this.url + '/bill/getPdf', data ,{
      responseType: 'blob'});
  }

  geBills() {
    return this.httpClient.get(this.url + '/bill/getBills');
  }
}
