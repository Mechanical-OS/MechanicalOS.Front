import { NgModule } from "@angular/core";
import { CustomersComponent } from "./customers.component";
import { CommonModule } from "@angular/common";
import { AdvancedTableModule } from "src/app/shared/advanced-table/advanced-table.module";
import { PageTitleModule } from "src/app/shared/page-title/page-title.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { WidgetModule } from "src/app/shared/widget/widget.module";
import { CustomersRoutingModule } from "./customers-routing.module";
import { SharedModule } from "../calendar/shared/shared.module";
import { MetroMenuModule } from "src/app/shared/metro-menu/metro-menu.module";
import { CustomerFormComponent } from "./customer-create/customer-form.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CpfPipe, RgPipe, PhonePipe, CepPipe } from 'src/app/shared/directives/mask-pipes.directive';

@NgModule({
    declarations: [CustomersComponent, CustomerFormComponent, CpfPipe, RgPipe, PhonePipe, CepPipe],
    imports: [
        CommonModule,
        FormsModule,
        MetroMenuModule,
        ReactiveFormsModule,
        AdvancedTableModule,
        WidgetModule,
        PageTitleModule,
        CustomersRoutingModule,
        NgbModule,
    ],
    exports: [
        CpfPipe, 
        RgPipe, 
        PhonePipe, 
        CepPipe
    ]
})
export class CustomerModule { }