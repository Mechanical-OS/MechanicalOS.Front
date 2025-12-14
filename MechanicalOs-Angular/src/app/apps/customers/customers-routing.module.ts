
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersComponent } from './customers.component';
import { CustomerFormComponent } from './customer-create/customer-form.component';

const routes: Routes = [{ path: '', component: CustomersComponent },
{ path: 'new', component: CustomerFormComponent },
{ path: ':id/edit', component: CustomerFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }
