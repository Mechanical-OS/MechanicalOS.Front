import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceSearchComponent } from './service-search.component';
import { SharedModule } from '../shared.module';
@NgModule({
  declarations: [
    ServiceSearchComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule
  ],
  exports: [
    ServiceSearchComponent
  ]
})
export class ServiceSearchModule { }

