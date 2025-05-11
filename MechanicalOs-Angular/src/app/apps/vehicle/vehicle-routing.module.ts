import { RouterModule, Routes } from "@angular/router";
import { VehicleComponent } from "./vehicle.component";
import { NgModule } from "@angular/core";

const routes: Routes = [{ path: '', component: VehicleComponent },
// { path: 'new', component: CustomerFormComponent },
// { path: ':id/edit', component: CustomerFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleRoutingModule { }