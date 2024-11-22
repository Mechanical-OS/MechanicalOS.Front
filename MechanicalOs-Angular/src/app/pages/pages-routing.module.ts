import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard-1',
    pathMatch: "full"
  },
  { path: 'pages', loadChildren: () => import('./extra-pages/extra-pages.module').then(m => m.ExtraPagesModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
