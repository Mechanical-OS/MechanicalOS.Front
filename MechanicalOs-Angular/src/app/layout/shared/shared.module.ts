import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LeftSidebarComponent } from "./left-sidebar/left-sidebar.component";
import { RightSidebarComponent } from "./right-sidebar/right-sidebar.component";
import { TopbarComponent } from "./topbar/topbar.component";
import { FooterComponent } from "./footer/footer.component";
import { SimplebarAngularModule } from "simplebar-angular";
import {
  NgbAlertModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbProgressbarModule,
} from "@ng-bootstrap/ng-bootstrap";
import { RouterModule } from "@angular/router";
import { ClickOutsideModule } from "ng-click-outside";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { WidgetModule } from "src/app/shared/widget/widget.module";

@NgModule({
  declarations: [
    LeftSidebarComponent,
    RightSidebarComponent,
    TopbarComponent,
    FooterComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbAlertModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbProgressbarModule,
    NgbNavModule,
    SimplebarAngularModule,
    ClickOutsideModule,
    WidgetModule,
  ],
  exports: [
    LeftSidebarComponent,
    RightSidebarComponent,
    TopbarComponent,
    FooterComponent,
  ],
})
export class SharedModule {}
