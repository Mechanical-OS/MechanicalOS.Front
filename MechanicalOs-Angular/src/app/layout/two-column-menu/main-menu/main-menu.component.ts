import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbCollapse } from "@ng-bootstrap/ng-bootstrap";
import { MenuItem } from "../../shared/models/menu.model";

@Component({
  selector: "app-main-menu",
  templateUrl: "./main-menu.component.html",
  styleUrls: ["./main-menu.component.scss"],
})
export class MainMenuComponent implements OnInit {
  @Input() menuItems: MenuItem[] = [];
  @Input() activeMenuItems: string[] = [];
  @Input() openMenuItems: string[] = [];
  @Input() sidebarType: string = "";

  @Output() toggleMenu = new EventEmitter<{
    menuItem: MenuItem;
    collapse: NgbCollapse;
  }>();

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasSubmenu(menu: MenuItem): boolean {
    return menu.children && menu.children.length > 0;
  }

  /**
   * toggles open menu
   * @param menuItem clicked menuitem
   * @param collapse collpase instance
   */
  toggleMenuItem(menuItem: MenuItem, collapse: NgbCollapse): void {
    this.toggleMenu.emit({ menuItem: menuItem, collapse: collapse });
  }
}
