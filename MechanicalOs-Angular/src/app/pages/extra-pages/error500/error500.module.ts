import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiModule } from 'src/app/shared/ui/ui.module';
import { Error500RoutingModule } from './error500-routing.module';
import { Error500Component } from './error500.component';


@NgModule({
  declarations: [
    Error500Component
  ],
  imports: [
    CommonModule,
    UiModule,
    Error500RoutingModule
  ]
})
export class Error500Module { }
