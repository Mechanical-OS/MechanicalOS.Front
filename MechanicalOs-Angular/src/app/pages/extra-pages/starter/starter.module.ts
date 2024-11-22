import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleModule } from 'src/app/shared/page-title/page-title.module';
import { StarterRoutingModule } from './starter-routing.module';
import { StarterComponent } from './starter.component';


@NgModule({
  declarations: [
    StarterComponent
  ],
  imports: [
    CommonModule,
    PageTitleModule,
    StarterRoutingModule
  ]
})
export class StarterModule { }
