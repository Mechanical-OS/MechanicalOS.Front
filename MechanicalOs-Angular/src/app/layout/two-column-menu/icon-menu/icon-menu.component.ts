import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { MenuItem } from "../../shared/models/menu.model";

@Component({
  selector: "app-icon-menu",
  templateUrl: "./icon-menu.component.html",
  styleUrls: ["./icon-menu.component.scss"],
})
export class IconMenuComponent implements OnInit {
  @Input() menuItems: MenuItem[] = [];
  @Input() activeMenuItems: string[] = [];
  @Input() openMenuItems: string[] = [];

  @Output() toggleMenu = new EventEmitter<{ menuItem: MenuItem }>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    document.documentElement.setAttribute("data-two-column-color", "brand");
  }

  /**
   * toggles open menu
   * @param menuItem clicked menuitem
   * @param collapse collpase instance
   */
  toggleMenuItem(event: any, menuItem: MenuItem): void {
    event.preventDefault();
    if (!menuItem.children) {
      this.router.navigate([menuItem.link]);
    }
    this.toggleMenu.emit({ menuItem: menuItem });
  }
}
