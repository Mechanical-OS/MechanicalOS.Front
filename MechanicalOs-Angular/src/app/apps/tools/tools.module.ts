import { NgModule } from "@angular/core";
import { ToolsComponent } from "./tools.component";
import { ToolsRoutingModule } from "./tools-routing.module";
import { PageTitleModule } from "../../shared/page-title/page-title.module";
import { CardComponent } from "./card/card.component";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [ToolsComponent,CardComponent],
  imports: [CommonModule, ToolsRoutingModule, PageTitleModule],
})
export class ToolsModule {}
