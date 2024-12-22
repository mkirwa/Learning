import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { SnackbarService } from './snackbar.service';
import * as exp from 'constants';
import { jwtDecode } from 'jwt-decode';
import { GlobalConstants } from '../shared/global-constants';

@Injectable({
  providedIn: 'root'
})
// Few urls will only be accessible by admin or user. This service will be used to guard the routes
// Checks if the user are authorized or not to access the urls
export class RouteGuardService {

  constructor(
    public auth:AuthService,
    public router:Router,
    public snackbarService:SnackbarService) { }

    canActivate(route: ActivatedRouteSnapshot):boolean{
      let expectedRoleArray = route.data;
      expectedRoleArray = expectedRoleArray.expectedRole;

      const token:any = localStorage.getItem('token');

      var tokenPayload:any;
      try{
        tokenPayload = jwtDecode(token);
      }
      catch(error){
        localStorage.clear();
        this.router.navigate(['/']);
      }

      let expectedRole = '';

      for(let i = 0; i < expectedRoleArray.length; i++){
        if(tokenPayload.role === expectedRoleArray[i]){
          expectedRole = tokenPayload.role;
        }
      }

      if(tokenPayload.role === 'user' || tokenPayload.role === 'admin'){
        if(this.auth.isAuthenticated() && tokenPayload.role === expectedRole){
          return true;
        } else {
          this.snackbarService.openSnackBar(GlobalConstants.unauthorized, GlobalConstants.error);
          this.router.navigate(['/cafe/dashboard']);
          return false;
        }
      } else {
        this.router.navigate(['/']);
        localStorage.clear();
        return false;
      }
    } 
}
