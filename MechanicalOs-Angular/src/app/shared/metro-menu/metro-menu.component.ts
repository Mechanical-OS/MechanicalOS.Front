import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MetroMenuService } from './metro-menu.service';

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
export class MetroMenuComponent implements OnInit{
  @Input() buttons: MetroButton[] = [];
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  constructor(private menuService: MetroMenuService){}

  ngOnInit(): void {
    this.menuService.buttons$.subscribe(buttons => {
      this.buttons = buttons;
    });
  }

  @Output() buttonClick = new EventEmitter<string>();

  onButtonClick(id: string) {
    this.buttonClick.emit(id);
  }
}
