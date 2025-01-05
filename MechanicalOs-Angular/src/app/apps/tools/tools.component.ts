import { Component, OnInit } from "@angular/core";
import { BreadcrumbItem } from "src/app/shared/page-title/page-title.model";
import { TOOLS } from "./data";
import { ToolsModel } from "./tools.model";
import { ToolsService } from "./tools.service";
import { GetAllRequest } from "src/app/Http/models/Input/get-all-request.model";

@Component({
  selector: "app-tools",
  templateUrl: "./tools.component.html",
  styleUrl: "./tools.component.scss",
})
export class ToolsComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  tools: ToolsModel[] = [];

  constructor(private service: ToolsService) { }

  ngOnInit(): void {
    this.pageTitle = [{ label: "Home", path: "/", active: true }];
    //this.tools = TOOLS;
    //this.loadToolsCard();
  }

  loadToolsCard(): void {
    this.service.getModules().subscribe((result) => {
      if (result.statusCode == 200) {
        console.log(result);
        this.tools = result.content;
        console.log(this.tools);
      } else {
        console.error(result.message);
      }
    })
  }
}
