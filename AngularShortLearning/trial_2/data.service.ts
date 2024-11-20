import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the interface for the service input and output
export interface InputModel {
  key1: string; // First string variable
  key2: string; // Second string variable
  key3: string; // Third string variable
  value: number; // Number variable
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly apiUrl = 'https://api.example.com/data'; // Constant URL for the API endpoint

  constructor(private http: HttpClient) {}

  /**
   * Sends a POST request to the API with the provided data.
   * @param key The input data of type InputModel.
   * @returns An observable of the response, also typed as InputModel.
   */
  postData(key: InputModel): Observable<InputModel> {
    return this.http.post<InputModel>(this.apiUrl, key);
  }
}
