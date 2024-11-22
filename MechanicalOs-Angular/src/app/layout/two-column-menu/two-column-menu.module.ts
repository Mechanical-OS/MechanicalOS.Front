import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwoColumnMenuLayoutComponent } from './layout/layout.component';
import { IconMenuComponent } from './icon-menu/icon-menu.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { ClickOutsideModule } from 'ng-click-outside';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';



@NgModule({
  declarations: [
    TwoColumnMenuLayoutComponent,
    LeftSidebarComponent,
    IconMenuComponent,
    MainMenuComponent
],
  imports: [
    CommonModule,
    NgbCollapseModule,
    ClickOutsideModule,
    SimplebarAngularModule,
    RouterModule,
    SharedModule,
    FeatherModule.pick(allIcons)
  ],
  exports: [
    TwoColumnMenuLayoutComponent
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class TwoColumnMenuModule { }
