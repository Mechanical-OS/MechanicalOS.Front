import { Component, OnInit } from "@angular/core";
import { BreadcrumbItem } from "src/app/shared/page-title/page-title.model";
import { TOOLS } from "./data";
import { ToolsModel } from "./tools.model";

@Component({
  selector: "app-tools",
  templateUrl: "./tools.component.html",
  styleUrl: "./tools.component.scss",
})
export class ToolsComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  tools: ToolsModel[] = [];

  constructor() {}

  ngOnInit(): void {
    this.pageTitle = [{ label: "Home", path: "/", active: true }];
    this.tools = TOOLS;
  }
}
