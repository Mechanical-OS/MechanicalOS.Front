// No arquivo: apps/users/users.module.ts

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from "src/app/shared/shared.module";
import { UsersComponent } from "./users.component";
import { UserFormComponent } from './user-form/user-form.component';
import { UsersRoutingModule } from "./users-routing.module";
import { AdvancedTableModule } from "src/app/shared/advanced-table/advanced-table.module";
import { MetroMenuModule } from "src/app/shared/metro-menu/metro-menu.module";
import { PageTitleModule } from "src/app/shared/page-title/page-title.module";

@NgModule({
    declarations: [UsersComponent, UserFormComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SharedModule,
        UsersRoutingModule,
        AdvancedTableModule,
        MetroMenuModule,
        PageTitleModule
    ]
})
export class UsersModule { }