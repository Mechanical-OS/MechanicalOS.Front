import { RouterModule, Routes } from "@angular/router";
import { ServiceOrderComponent } from "./service-order.component";
import { NgModule } from "@angular/core";
import { ServiceOrderWizardComponent } from "./service-order-wizard/service-order-wizard.component";
import { VehicleStepComponent } from "./steps/vehicle-step/vehicle-step.component";
import { OwnerStepComponent } from "./steps/owner-step/owner-step.component";
import { AddressStepComponent } from "./steps/address-step/address-step.component";
import { ServicesStepComponent } from "./steps/services-step/services-step.component";
import { ServiceOrderEditComponent } from "./service-order-edit/service-order-edit.component";

const routes: Routes = [
    { path: '', component: ServiceOrderComponent },
    {
        path: 'new',
        component: ServiceOrderWizardComponent,
        children: [
            { path: '', redirectTo: 'vehicle', pathMatch: 'full' },
            { path: 'vehicle', component: VehicleStepComponent },
            { path: 'owner', component: OwnerStepComponent },
            { path: 'address', component: AddressStepComponent },
            { path: 'services', component: ServicesStepComponent }
        ]
    },
    { path: ':id/edit', component: ServiceOrderEditComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ServiceOrderRoutingModule { }

