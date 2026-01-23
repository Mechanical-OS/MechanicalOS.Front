import { NgModule } from "@angular/core";
import { ServiceOrderComponent } from "./service-order.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MetroMenuModule } from "src/app/shared/metro-menu/metro-menu.module";
import { AdvancedTableModule } from "src/app/shared/advanced-table/advanced-table.module";
import { WidgetModule } from "src/app/shared/widget/widget.module";
import { PageTitleModule } from "src/app/shared/page-title/page-title.module";
import { ServiceOrderRoutingModule } from "./service-order-routing.module";
import { SharedModule } from "src/app/shared/shared.module";
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UiModule } from 'src/app/shared/ui/ui.module';
import { ServiceSearchModule } from 'src/app/shared/service-search/service-search.module';

// Wizard Components
import { ServiceOrderWizardComponent } from "./service-order-wizard/service-order-wizard.component";

// Step Components
import { VehicleStepComponent } from "./steps/vehicle-step/vehicle-step.component";
import { OwnerStepComponent } from "./steps/owner-step/owner-step.component";
import { AddressStepComponent } from "./steps/address-step/address-step.component";
import { ServicesStepComponent } from "./steps/services-step/services-step.component";

// Edit Component
import { ServiceOrderEditComponent } from "./service-order-edit/service-order-edit.component";

@NgModule({
    declarations: [
        ServiceOrderComponent,
        ServiceOrderWizardComponent,
        VehicleStepComponent,
        OwnerStepComponent,
        AddressStepComponent,
        ServicesStepComponent,
        ServiceOrderEditComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        MetroMenuModule,
        ReactiveFormsModule,
        NgbModalModule,
        NgbModule,
        SharedModule,
        AdvancedTableModule,
        WidgetModule,
        PageTitleModule,
        UiModule,
        ServiceOrderRoutingModule,
        ServiceSearchModule
    ]
})
export class ServiceOrderModule { }

