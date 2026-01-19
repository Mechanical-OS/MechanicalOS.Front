import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { UsersComponent } from "./users.component";
import { UserFormComponent } from "./user-form/user-form.component";

const routes: Routes = [
    { path: '', component: UsersComponent },
    { path: ':id/edit', component: UserFormComponent },
    { path: 'new', component: UserFormComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule { }