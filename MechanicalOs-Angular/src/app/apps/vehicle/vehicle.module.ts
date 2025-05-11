import { NgModule } from "@angular/core";
import { VehicleComponent } from "./vehicle.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MetroMenuModule } from "src/app/shared/metro-menu/metro-menu.module";
import { AdvancedTableModule } from "src/app/shared/advanced-table/advanced-table.module";
import { WidgetModule } from "src/app/shared/widget/widget.module";
import { PageTitleModule } from "src/app/shared/page-title/page-title.module";
import { VehicleRoutingModule } from "./vehicle-routing.module";

@NgModule({
    declarations: [VehicleComponent],
    imports:
        [
            CommonModule,
            FormsModule,
            MetroMenuModule,
            ReactiveFormsModule,
            AdvancedTableModule,
            WidgetModule,
            PageTitleModule,
            VehicleRoutingModule
        ]
})
export class VehicleModule { }