import { NgModule } from "@angular/core";
import { MetroMenuComponent } from "./metro-menu.component";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [
    MetroMenuComponent,
  ],
  imports: [
    CommonModule
  ],
    exports: [MetroMenuComponent]
})
export class MetroMenuModule { }