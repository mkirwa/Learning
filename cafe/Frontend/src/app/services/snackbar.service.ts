import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// TODO: Review and add comments -> Created by Mahlon Kirwa
// Used to display messages

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  openShackBar(message: string, action: string) {
    if (action === 'error') {
      this.snackBar.open(message, '', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 2000,
        panelClass: ['black-snackbar'], //black-snackbar is a css class defined in styles.css from Frontend/src/styles.css
      });
    } else {
      this.snackBar.open(message, action, {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 2000,
        panelClass: ['green-snackbar'], //green-snackbar is a css class defined in styles.css from Frontend/src/styles.css
      });
    }
  }
}
