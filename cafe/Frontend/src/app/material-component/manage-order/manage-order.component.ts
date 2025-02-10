import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@material-ui/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BillService } from 'src/app/services/bill.service';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-manage-order',
  templateUrl: './manage-order.component.html',
  styleUrl: './manage-order.component.scss'
})
export class ManageOrderComponent implements OnInit {

  displayedColumns: string[] = ['name', 'category', 'price', 'quantity','total','edit'];
  dataSource:any = [];
  manageOrderForm: any = FormGroup
  categories: any = [];
  products: any = [];
  price: any;
  totalAmount: number = 0;
  responseMessage: any;

  // constructor is used to initialize the component. Initializing the component helps to set up the component with any necessary dependencies or services.
  // Without a constructor, the component would not be able to function properly or interact with other parts of the application.
  constructor(private formBuilder:FormBuilder,
    private categoryService: CategoryService,
    private productService: ProductService,
    private snackbarService: SnackbarService,
    private billService: BillService,
    private ngxService: NgxUiLoaderService
  ) { }

  // ngOnInit is a lifecycle hook that is called after the component has been initialized. It is used to perform any necessary setup or initialization for the component.
  // In this case, the ngOnInit method is used to start the ngxService loader and get the categories from the categoryService.
  ngOnInit(): void {
    this.ngxService.start();
    this.getCategories();
    this.manageOrderForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.pattern(GlobalConstants.nameRegex)]],
      email: [null, [Validators.required, Validators.pattern(GlobalConstants.emailRegex)]],
      contactNumber: [null, [Validators.required, Validators.pattern(GlobalConstants.contactNumberRegex)]],
      product: [null, [Validators.required]],
      category: [null, [Validators.required]],
      quantity: [null, [Validators.required]],
      price: [null, [Validators.required]],
      total: [0, [Validators.required]]
    });
  }

  // getCategories is used to get the categories from the categoryService.
  // getFiltered has a subscribe method that is used to handle the response from the getFilteredCategories method.
  // The response is assigned to the categories variable which is used to display the categories in the template.
  getCategories() {
    this.categoryService.getFilteredCategories().subscribe((response: any) => {
      this.ngxService.stop();
      this.categories = response;
  }, (error: any) => {
      this.ngxService.stop();
      console.log(error.error?.message);
      if(error.error?.message) { 
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
  }
  );
  }
}
