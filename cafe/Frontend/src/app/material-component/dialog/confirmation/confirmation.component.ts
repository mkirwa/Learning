import { Component, Inject, OnInit, EventEmitter} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss'
})
export class ConfirmationComponent implements OnInit {

  onEmitStatusChange = new EventEmitter();
  details: any = {};

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: any) {  }

  // ngOnInit() is a lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
  // dialogData is a property of the ConfirmationComponent class that is used to store the data passed to the dialog component.
  // The ngOnInit() method is called when the ConfirmationComponent class is initialized. 
  // It sets the details property of the class to the details passed to the dialog component.
  ngOnInit(): void {
    if (this.dialogData && this.dialogData.confirmation) {
      this.details = this.dialogData.details;
    }
  }

  handleChangeAction() {
    this.onEmitStatusChange.emit();
  }

}
