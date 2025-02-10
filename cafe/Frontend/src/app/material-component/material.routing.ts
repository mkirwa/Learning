import { Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ManageCategoryComponent } from './manage-category/manage-category.component';
import { RouteGuardService } from '../services/route-guard.service';
import { ManageProductComponent } from './manage-product/manage-product.component';
import { ManageOrderComponent } from './manage-order/manage-order.component';

// This is the route for the material component which is the admin panel
export const MaterialRoutes: Routes = [
    // This is the route for the dashboard
    {   
        // This is the path of the dashboard
        path:'category',
        // This is the component that will be rendered when the path is category 
        component: ManageCategoryComponent,
        // canActivate is used to check if the user is authorized to access the urls
        canActivate: [RouteGuardService],
        // data is the data that is passed to the route guard service to check if the user is authorized to access the urls
        data: {
            // expectedRole is the role that is allowed to access the urls that are guarded by this service
            expectedRole: ['admin']
        }
    },
    {   
        // This is the path of the dashboard
        path:'product',
        // This is the component that will be rendered when the path is category 
        component: ManageProductComponent,
        // canActivate is used to check if the user is authorized to access the urls
        canActivate: [RouteGuardService],
        // data is the data that is passed to the route guard service to check if the user is authorized to access the urls
        data: {
            // expectedRole is the role that is allowed to access the urls that are guarded by this service
            expectedRole: ['admin']
        }
    },
    {   
        // This is the path of the dashboard
        path:'order',
        // This is the component that will be rendered when the path is category 
        component: ManageOrderComponent,
        // canActivate is used to check if the user is authorized to access the urls
        canActivate: [RouteGuardService],
        // data is the data that is passed to the route guard service to check if the user is authorized to access the urls
        data: {
            // expectedRole is the role that is allowed to access the urls that are guarded by this service
            expectedRole: ['admin','user']
        }
    }
];
