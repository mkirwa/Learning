import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {Router} from '@angular/router';
import { 
  HttpInterceptorFn, 
  HttpRequest, 
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse} from '@angular/common/http';

@Injectable()
export class tokenInterceptorInterceptor implements HttpInterceptor{
  
  constructor(private router:Router) { }
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    if(token){
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request).pipe(
      catchError((err) => {
        if(err instanceof HttpErrorResponse){ 
          console.log(err.url);
          if(err.status === 401 || err.status === 403){
            if(this.router.url === '/'){

            }else{
              localStorage.clear();
              this.router.navigate(['/']);
            }
          }
        }
        return throwError(err);
      })
    )
  }
}
