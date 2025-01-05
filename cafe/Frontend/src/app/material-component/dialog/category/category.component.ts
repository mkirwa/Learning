import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from 'src/app/services/category.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})

// This component is used to add and edit category 
export class CategoryComponent implements OnInit {
  // Event emitter to emit the event when category is added
  onAddCategory = new EventEmitter();
  // Event emitter to emit the event when category is edited
  onEditCategory = new EventEmitter();
  // Form group for category form
  categoryForm: any = FormGroup;
  // Dialog action to check if dialog is for add or edit
  dialogAction: any = 'Add';
  // Action to check if action is add or update 
  action: any = 'Update';

  responseMessage: any;
  constructor(
    // Injecting MAT_DIALOG_DATA to get data from dialog and formBuilder to create form 
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    public dialogRef: MatDialogRef<CategoryComponent>,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.formBuilder.group({
      name: [null, [Validators.required]],
    });
    if (this.dialogData.action === 'Edit') {
      this.dialogAction = "Edit";
      this.action = "Update";
      this.categoryForm.patchValue(this.dialogData.data);
    }
  }

  handleSubmit() {
    // if (this.categoryForm.valid) {
      if (this.dialogAction === 'Edit') {
        this.edit();
      } else {
        this.add();
      }
    // }
  }

  add() {
    var formData = this.categoryForm.value;
    var data = {
      name: formData.name,
    };
    this.categoryService.add(data).subscribe(
      (response: any) => {
        this.dialogRef.close();
        this.onAddCategory.emit();
        this.responseMessage = response.message;
        alert("Successfully Added Category");
        this.snackbarService.openSnackBar(
          this.responseMessage.message,
          'Success'
        );
      },
      (error) => {
        this.dialogRef.close();
        console.log(error);
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = GlobalConstants.genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
      }
    );
  }

  edit() {
    var formData = this.categoryForm.value;
    var data = {
      id: this.dialogData.data.id,
      name: formData.name
    };
    this.categoryService.update(data).subscribe(
      (response: any) => {
        this.dialogRef.close();
        this.onEditCategory.emit();
        this.responseMessage = response.message;
        this.onAddCategory.emit();
        this.snackbarService.openSnackBar(
          this.responseMessage.message,
          'Success'
        );
      },
      (error) => {
        this.dialogRef.close();
        console.log(error);
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = GlobalConstants.genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
      }
    );
  }
}
