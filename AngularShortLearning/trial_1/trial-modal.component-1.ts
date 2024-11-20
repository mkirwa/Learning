import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

interface Option {
  item_id: string;
  item_text: string;
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
  selectedValues: any[] = [];
  dropdownSettings = {};

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      selectedOptions: new FormControl([]),
    });
  }

  ngOnInit(): void {
    this.fetchData();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };
  }

  fetchData(): void {
    // Simulated data fetch
    this.options = [
      { item_id: '1', item_text: 'Option 1', checked: true },
      { item_id: '2', item_text: 'Option 2', checked: false },
      { item_id: '3', item_text: 'Option 3', checked: true },
      { item_id: '4', item_text: 'Option 4', checked: false },
    ];

    // Pre-select and disable checked items
    this.selectedValues = this.options
      .filter((option) => option.checked)
      .map((option) => ({ item_id: option.item_id, item_text: option.item_text }));

    this.formGroup.get('selectedOptions')?.patchValue(this.selectedValues);
  }

  onItemSelect(item: any): void {
    const selected = [...this.formGroup.get('selectedOptions')?.value, item];
    this.formGroup.get('selectedOptions')?.setValue(selected);
  }

  onItemDeselect(item: any): void {
    const selected = this.formGroup
      .get('selectedOptions')
      ?.value.filter((selectedItem: any) => selectedItem.item_id !== item.item_id);
    this.formGroup.get('selectedOptions')?.setValue(selected);
  }

  save(): void {
    console.log(this.formGroup.value);
  }
}
