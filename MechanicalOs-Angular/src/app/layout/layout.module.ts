import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { DetachedModule } from "./detached/detached.module";
import { HorizontalModule } from "./horizontal/horizontal.module";
import { LayoutContainerComponent } from "./layout-container.component";
import { PublicLayoutComponent } from "./public-layout/public-layout.component";
import { SharedModule } from "./shared/shared.module";
import { TwoColumnMenuModule } from "./two-column-menu/two-column-menu.module";
import { VerticalModule } from "./vertical/vertical.module";
import { FeatherModule } from "angular-feather";
import { allIcons } from 'angular-feather/icons';

@NgModule({
  declarations: [LayoutContainerComponent, PublicLayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    VerticalModule,
    HorizontalModule,
    DetachedModule,
    TwoColumnMenuModule,
    FeatherModule.pick(allIcons)
  ],
  exports: [LayoutContainerComponent, PublicLayoutComponent],
})
export class LayoutModule {}
