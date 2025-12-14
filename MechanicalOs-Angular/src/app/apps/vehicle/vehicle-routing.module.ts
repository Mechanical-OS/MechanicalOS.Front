import { RouterModule, Routes } from "@angular/router";
import { VehicleComponent } from "./vehicle.component";
import { NgModule } from "@angular/core";
import { VehicleFormComponent } from "./vehicle-form/vehicle-form.component";

const routes: Routes = [
    { path: '', component: VehicleComponent },
    { path: ':id/edit', component: VehicleFormComponent },
    { path: 'new', component: VehicleFormComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VehicleRoutingModule { }