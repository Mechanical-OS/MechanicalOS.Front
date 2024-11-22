import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarRoutingModule } from './calendar-routing.module';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { PageTitleModule } from 'src/app/shared/page-title/page-title.module';
import { CalendarComponent } from './calendar.component';
import { CalendarEventComponent } from './event/event.component';



@NgModule({
  declarations: [
    CalendarComponent,
    CalendarEventComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule,
    NgbModalModule,
    PageTitleModule,
    CalendarRoutingModule
  ]
})
export class CalendarModule { }
