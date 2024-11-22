import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'calendar', loadChildren: () => import('./calendar/calendar.module').then(m => m.CalendarModule) },
  { path: 'tools', loadChildren: () => import('./tools/tools.module').then(m => m.ToolsModule) },
  { path: 'services', loadChildren: () => import('./services/services.module').then(m => m.ServicesModule) },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppsRoutingModule { }
