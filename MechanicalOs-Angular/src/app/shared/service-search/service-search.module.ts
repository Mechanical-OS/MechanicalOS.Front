import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceSearchComponent } from './service-search.component';

@NgModule({
  declarations: [
    ServiceSearchComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    ServiceSearchComponent
  ]
})
export class ServiceSearchModule { }

