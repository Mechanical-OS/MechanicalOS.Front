import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutContainerComponent } from './layout/layout-container.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';

const routes: Routes = [

  {
    path: '',
    component: LayoutContainerComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
      },
      {
        path: 'apps',
        loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule),
      }
    ]
  },
  {
    path: 'home', 
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'auth',
    component: PublicLayoutComponent,
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'maintenance',
    component: PublicLayoutComponent,
    loadChildren: () => import('./pages/extra-pages/maintenance/maintenance.module').then(m => m.MaintenanceModule)
  },
  {
    path: 'error-404',
    component: PublicLayoutComponent,
    loadChildren: () => import('./pages/extra-pages/error404/error404.module').then(m => m.Error404Module)
  },
  
  {
    path: 'error-500',
    component: PublicLayoutComponent,
    loadChildren: () => import('./pages/extra-pages/error500/error500.module').then(m => m.Error500Module)
  },
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { anchorScrolling: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
