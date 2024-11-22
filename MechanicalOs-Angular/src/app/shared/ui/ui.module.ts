import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { DefaultLayoutComponent } from './default-layout/default-layout.component';
import { DefaultLayout2Component } from './default-layout2/default-layout2.component';
import { CountdownDirective } from './count-down/countdown.directive';
import { PortletCardComponent } from './portlet-card/portlet-card.component';



@NgModule({
  declarations: [
    DefaultLayoutComponent,
    DefaultLayout2Component,
    CountdownDirective,
    PortletCardComponent
  ],
  imports: [
    CommonModule,
    NgbCollapseModule,
  ],
  exports: [
    DefaultLayoutComponent,
    DefaultLayout2Component,
    CountdownDirective,
    PortletCardComponent
  ]
})
export class UiModule { }
