import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { PartnersComponent } from "./partners.component";
import { PartnerRegistrationComponent } from "./partner-registration/partner-registration.component";
import { PartnersProductsComponent } from "./partners-products/partners-products.component";

const routes: Routes = [
    { path: '', component: PartnersComponent },
    { path: ':id/edit', component: PartnerRegistrationComponent },
    { path: 'new', component: PartnerRegistrationComponent },
    { path: 'products', component: PartnersProductsComponent } 
]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PartnersRoutingModule { }