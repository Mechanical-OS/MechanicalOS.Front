import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetroMenuComponent } from './metro-menu/metro-menu.component';
import { SelectizeComponent } from './selectize/selectize.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SelectizeComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [SelectizeComponent]
})
export class SharedModule { }
