import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { DefaultLayoutComponent } from './default-layout/default-layout.component';
import { DefaultLayout2Component } from './default-layout2/default-layout2.component';
import { CountdownDirective } from './count-down/countdown.directive';
import { PortletCardComponent } from './portlet-card/portlet-card.component';
import { AdvancedFilterComponent } from './advanced-filter/advanced-filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    DefaultLayoutComponent,
    DefaultLayout2Component,
    CountdownDirective,
    PortletCardComponent,
    AdvancedFilterComponent
  ],
  imports: [
    CommonModule,
    NgbCollapseModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    DefaultLayoutComponent,
    DefaultLayout2Component,
    CountdownDirective,
    PortletCardComponent,
    AdvancedFilterComponent
  ]
})
export class UiModule { }
