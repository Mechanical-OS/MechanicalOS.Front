import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleModule } from 'src/app/shared/page-title/page-title.module';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceComponent } from './invoice.component';


@NgModule({
  declarations: [
    InvoiceComponent
  ],
  imports: [
    CommonModule,
    PageTitleModule,
    InvoiceRoutingModule
  ]
})
export class InvoiceModule { }
