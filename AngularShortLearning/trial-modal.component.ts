import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

interface Option {
  value: string;
  label: string;
  checked: boolean;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  formGroup: FormGroup;
  options: Option[] = [];

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      selectedOptions: new FormControl([]),
    });
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    // Simulated data fetch
    this.options = [
      { value: '1', label: 'Option 1', checked: true },
      { value: '2', label: 'Option 2', checked: false },
      { value: '3', label: 'Option 3', checked: true },
      { value: '4', label: 'Option 4', checked: false },
    ];

    // Pre-select and disable checked items
    const preselectedValues = this.options
      .filter((option) => option.checked)
      .map((option) => option.value);

    this.formGroup.get('selectedOptions')?.patchValue(preselectedValues);
  }

  onSelectionChange(event: any): void {
    const selectedValues = event.value;
    this.formGroup.get('selectedOptions')?.setValue(selectedValues);
  }

  save(): void {
    console.log(this.formGroup.value);
  }
}
