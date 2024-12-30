import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http } from '@material-ui/icons';
import { environment } from 'src/environments/environment';

// The @Injectable decorator is used to define a service class in Angular
// that can be injected as a dependency into other classes, such as components or other services.
// Purpose: It tells Angular's dependency injection system that the class can be instantiated and injected wherever needed.
// providedIn: 'root': This specifies that the service is provided at the root level, meaning it's a singleton
// throughout the application lifecycle. This avoids multiple instances of the service being created.

@Injectable({
  providedIn: 'root',
})
// The CategoryService acts as a bridge between the frontend and the backend,
// encapsulating all HTTP calls related to "category" operations.
export class CategoryService {
  // The url variable stores the base URL of the backend server.
  // It centralizes the configuration of the API base URL, making it easier to
  // change between environments (e.g., development, staging, production) without modifying the code.
  url = environment.apiUrl;
  // The constructor initializes the service with the HttpClient, enabling it to send HTTP requests to a backend server.
  constructor(private httpClient: HttpClient) {}

  // The add method sends an HTTP POST request to the backend server to add a new category.
  add(data: any) {
    // The HttpHeaders object is used to configure custom HTTP headers for a request.
    // In this case, it sets the Content-Type header to application
    // which informs the server that the request body contains JSON data.
    return this.httpClient.post(this.url + '/category/add', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json'),
    });
  }

  // The update method sends an HTTP POST request to the backend server to update an existing category.
  update(data: any) {
    return this.httpClient.post(this.url + '/category/update', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json'),
    });
  }

  // get categories sends an HTTP GET request to the backend server to retrieve all categories.
  getCategories() {
    return this.httpClient.get(this.url + '/category/get');
  }
}
