import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiModule } from 'src/app/shared/ui/ui.module';
import { MaintenanceRoutingModule } from './maintenance-routing.module';
import { MaintenanceComponent } from './maintenance.component';


@NgModule({
  declarations: [
    MaintenanceComponent
  ],
  imports: [
    CommonModule,
    UiModule,
    MaintenanceRoutingModule
  ]
})
export class MaintenanceModule { }
