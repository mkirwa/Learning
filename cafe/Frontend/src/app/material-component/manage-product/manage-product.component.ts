import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { ProductComponent } from '../dialog/product/product.component';

@Component({
  selector: 'app-manage-product',
  templateUrl: './manage-product.component.html',
  styleUrl: './manage-product.component.scss'
})
export class ManageProductComponent implements OnInit {

  displayedColumns: string[] = ['name', 'categoryName', 'description', 'price', 'edit'];
  dataSource: any;
  // length: 1;
  responseMessage: any;

  constructor(
    private dialog: MatDialog,
    private productService: ProductService,
    private ngxService: NgxUiLoaderService,
    private snancbarService: SnackbarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }

  tableData() {
    this.productService.getProducts().subscribe((response: any) => {
      this.ngxService.stop();
      this.dataSource = new MatTableDataSource(response);
    }, (error: any) => {
      this.ngxService.stop();
      console.log(error.error?.message);

      if(error.error?.message) { 
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }

      this.snancbarService.openSnackBar(error.error.message, GlobalConstants.error);
  });
}

applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  this.dataSource.filter = filterValue.trim().toLowerCase();

}
handleAddAction() {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.data = {
    action: 'Add'
  };
  dialogConfig.width = '500px';
  const dialogRef = this.dialog.open(ProductComponent, dialogConfig);
  this.router.events.subscribe(() => {
    dialogRef.close();
  });
  const sub = dialogRef.componentInstance.onAddProduct.subscribe((response) => {
    this.tableData();
    sub.unsubscribe();
  });
}

handleEditAction(id: any) {

}

handleDeleteAction(id: any) {}

onChange(status: any, id: any) {}

}
