import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MetroMenuModule } from "src/app/shared/metro-menu/metro-menu.module";
import { WidgetModule } from "src/app/shared/widget/widget.module";
import { PageTitleModule } from "src/app/shared/page-title/page-title.module";
import { SharedModule } from "src/app/shared/shared.module";
import { UiModule } from 'src/app/shared/ui/ui.module';
import { PartnersComponent } from "./partners.component";
import { PartnersRoutingModule } from "./partners-routing.module";

@NgModule({
    declarations: [PartnersComponent],
    imports:
        [
            CommonModule,
            MetroMenuModule,
            SharedModule,
            WidgetModule,
            PageTitleModule,
            UiModule,
            PartnersRoutingModule
        ]
})
export class PartnersModule { }