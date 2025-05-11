import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

export interface SelectizeModel {
  id: number | string;
  label: string;
}

@Component({
  selector: 'app-selectize',
  templateUrl: './selectize.component.html',
  styleUrl: './selectize.component.scss'
})
export class SelectizeComponent {
  @Input() label: string = '';
  @Input() items: SelectizeModel[] = [];
  @Input() placeholder: string = 'Selecione uma opção';
  @Input() control!: FormControl;

  @Output() selectionChange = new EventEmitter<any>();

  onSelectionChange(event: any): void {
    this.selectionChange.emit(event.target.value);
  }
}
