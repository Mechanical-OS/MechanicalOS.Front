import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdvancedTableModule } from 'src/app/shared/advanced-table/advanced-table.module';
import { PageTitleModule } from 'src/app/shared/page-title/page-title.module';
import { WidgetModule } from 'src/app/shared/widget/widget.module';
import { ServicesRoutingModule } from './services-routing.module';
import { ServicesComponent } from './services.component';
import { CurrencyBrDirective } from 'src/app/shared/directives/currency-br.directive';


@NgModule({
  declarations: [
    ServicesComponent,
    CurrencyBrDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdvancedTableModule,
    WidgetModule,
    PageTitleModule,
    ServicesRoutingModule
  ]
})
export class ServicesModule { }
