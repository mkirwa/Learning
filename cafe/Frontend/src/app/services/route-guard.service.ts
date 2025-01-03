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
  // Injecting the services that we need in this service
  constructor(
    // AuthService is used to check if the user is authenticated or not
    public auth:AuthService,
    // Router is used to navigate to the urls
    public router:Router,
    // SnackbarService is used to show the snackbar messages to the user when the user is not authorized to access the urls
    public snackbarService:SnackbarService) { }

    // This function is used to check if the user is authorized to access the urls
    canActivate(route: ActivatedRouteSnapshot):boolean{
      // expectedRoleArray is the array of roles that are allowed to access the urls that are guarded by this service
      let expectedRoleArray = route.data;
      // expectedRoleArray is the array of roles that are allowed to access the urls that are guarded by this service
      expectedRoleArray = expectedRoleArray.expectedRole;
      // token is the json web token that is stored in the local storage of the browser when the user logs in
      const token:any = localStorage.getItem('token');
      // tokenPayload is the payload of the json web token
      var tokenPayload:any;
      // jwtDecode is used to decode the json web token
      try{
        tokenPayload = jwtDecode(token);
      }
      catch(error){
        localStorage.clear();
        this.router.navigate(['/']);
      }
      // 
      let expectedRole = '';
      // This loop is used to check if the role of the user is in the expectedRole
      for(let i = 0; i < expectedRoleArray.length; i++){
        if(tokenPayload.role === expectedRoleArray[i]){
          expectedRole = tokenPayload.role;
        }
      }

      // If the role of the user is user or admin and the user is authenticated and the role of the user is the expectedRole then return true
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
