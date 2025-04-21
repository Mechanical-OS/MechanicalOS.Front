
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersComponent } from './customers.component';
import { CustomerCreateComponent } from './customer-create/customer-create.component';

const routes: Routes = [{ path: '', component: CustomersComponent },
{ path: 'new', component: CustomerCreateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }
