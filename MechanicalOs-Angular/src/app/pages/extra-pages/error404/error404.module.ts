import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiModule } from 'src/app/shared/ui/ui.module';
import { Error404RoutingModule } from './error404-routing.module';
import { Error404Component } from './error404.component';


@NgModule({
  declarations: [
    Error404Component
  ],
  imports: [
    CommonModule,
    UiModule,
    Error404RoutingModule
  ]
})
export class Error404Module { }
