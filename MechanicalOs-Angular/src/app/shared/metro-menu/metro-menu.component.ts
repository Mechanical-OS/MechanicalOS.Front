import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface MetroButton {
  id: string;
  label: string;
  iconClass: string;
  colorClass: string;
  visible: boolean;
  enabled: boolean;
}

@Component({
  selector: 'app-metro-menu',
  templateUrl: './metro-menu.component.html',
  styleUrls: ['./metro-menu.component.scss']
})
export class MetroMenuComponent {
  @Input() buttons: MetroButton[] = [];
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  @Output() buttonClick = new EventEmitter<string>();

  onButtonClick(id: string) {
    this.buttonClick.emit(id);
  }
}
