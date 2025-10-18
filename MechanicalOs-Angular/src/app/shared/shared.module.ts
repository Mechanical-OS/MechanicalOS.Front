import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetroMenuComponent } from './metro-menu/metro-menu.component';
import { SelectizeComponent } from './selectize/selectize.component';
import { ServiceSearchModule } from './service-search/service-search.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SelectizeComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ServiceSearchModule
  ],
  exports: [
    SelectizeComponent,
    ServiceSearchModule
  ]
})
export class SharedModule { }
