import { RouterModule, Routes } from "@angular/router";
import { VehicleComponent } from "./vehicle.component";
import { NgModule } from "@angular/core";
import { VehicleFormComponent } from "./vehicle-form/vehicle-form.component";

const routes: Routes = [{ path: '', component: VehicleComponent },
{ path: 'new', component: VehicleFormComponent },
    // { path: ':id/edit', component: CustomerFormComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VehicleRoutingModule { }