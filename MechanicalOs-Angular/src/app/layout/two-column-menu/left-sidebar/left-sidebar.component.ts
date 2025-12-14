import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { NgbCollapse } from "@ng-bootstrap/ng-bootstrap";
import { NavigationEnd, Router } from "@angular/router";
import { EventService } from "src/app/core/service/event.service";
import { TWO_COl_MENU_ITEMS } from "../../shared/config/menu-meta";
import { MenuItem } from "../../shared/models/menu.model";
import { findAllParent, findMenuItem } from "../../shared/helper/utils";
import {
  LEFT_SIDEBAR_TYPE_CONDENSED,
  LEFT_SIDEBAR_TYPE_DEFAULT,
} from "../../shared/config/layout.model";

@Component({
  selector: "app-two-column-left-sidebar",
  templateUrl: "./left-sidebar.component.html",
  styleUrls: ["./left-sidebar.component.scss"],
})
export class LeftSidebarComponent implements OnInit {
  twoColumnMenuItems: MenuItem[] = [];
  activeMenuItems: string[] = [];
  openMenuItems: string[] = [];
  
  @Input() sidebarType!: string;
  @Input() showMobileMenu: boolean = true;

  constructor(private router: Router, private eventService: EventService) {
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this._activateMenu();
        this.hideMenu();
      }
    });
  }

  ngOnInit(): void {
    this.initMenu();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._activateMenu();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      this.changeSidebarWidth();
    }, 0);
  }

  /**
   * initialize menuitems
   */
  initMenu(): void {
    this.twoColumnMenuItems = TWO_COl_MENU_ITEMS;
  }

  /**
   * Hides the menubar
   */
  hideMenu() {
    document.body.classList.remove("sidebar-enable");
  }

  /**
   * manage sidebar width
   */
  changeSidebarWidth(): void {
    if (this.activeMenuItems.length === 1) {
      const activeMt = findMenuItem(
        this.twoColumnMenuItems,
        this.activeMenuItems[0]
      );

      if (!activeMt.children) {
        this.eventService.broadcast(
          "changeLeftSidebarType",
          LEFT_SIDEBAR_TYPE_CONDENSED
        );
        this.showMobileMenu = false;
      } else {
        this.eventService.broadcast(
          "changeLeftSidebarType",
          LEFT_SIDEBAR_TYPE_DEFAULT
        );
      }
    }
  }

  /**
   * activates menu
   */
  _activateMenu(): void {
    const div = document.getElementById("two-column-menu");
    let matchingMenuItem = null;

    if (div) {
      let items: any = div.getElementsByClassName("two-column-nav-link-ref");
      for (let i = 0; i < items.length; ++i) {
        if (window.location.pathname === items[i].pathname) {
          matchingMenuItem = items[i];
          break;
        }
      }

      if (matchingMenuItem) {
        const mid = matchingMenuItem.getAttribute("data-menu-key");

        const activeMt = findMenuItem(this.twoColumnMenuItems, mid);

        if (activeMt) {
          const matchingObjs = [
            activeMt["key"],
            ...findAllParent(this.twoColumnMenuItems, activeMt),
          ];

          this.activeMenuItems = matchingObjs;

          this.twoColumnMenuItems.forEach((menu: MenuItem) => {
            menu.children?.forEach((subMenu: MenuItem) => {
              if (subMenu.children) {
                subMenu.collapsed = !matchingObjs.includes(subMenu.key);
              }
            });
          });
        }
      }
    }
    // set active menu items as open menu items
    this.openMenuItems = this.activeMenuItems;
    this.changeSidebarWidth();
  }

  /**
   * toggles open menu
   * @param menuItem clicked menuitem
   * @param collapse collpase instance
   */
  toggleMenuItem(event: { menuItem: MenuItem; collapse?: NgbCollapse }): void {
    // if event is called from icon menu
    if (!event.collapse) {
      if (!event.menuItem.children && event.menuItem.link) {
        this.eventService.broadcast(
          "changeLeftSidebarType",
          LEFT_SIDEBAR_TYPE_CONDENSED
        );
        this.activeMenuItems = this.findActiveMenusItems(event.menuItem.key!);
        this.openMenuItems = this.activeMenuItems;
        this.showMobileMenu = false;
      } else {
        this.eventService.broadcast(
          "changeLeftSidebarType",
          LEFT_SIDEBAR_TYPE_DEFAULT
        );
        this.openMenuItems = this.findActiveMenusItems(event.menuItem.key!);
        this.activeMenuItems = [
          ...new Set(
            this.activeMenuItems.concat(
              this.findActiveMenusItems(event.menuItem.key!)
            )
          ),
        ];
        this.showMobileMenu = true;
      }
    }
    // if event is called from main menu
    else {
      event.collapse?.toggle();
      let openMenuItems: string[];
      if (!event.menuItem.collapsed) {
        openMenuItems = [
          event.menuItem["key"],
          ...findAllParent(this.twoColumnMenuItems, event.menuItem),
        ];
        this.twoColumnMenuItems.forEach((menu: MenuItem) => {
          menu.children?.forEach((subMenu: MenuItem) => {
            subMenu.collapsed = !openMenuItems.includes(subMenu.key!);
          });
        });
      }
    }
  }

  /**
   * find active menu
   */
  findActiveMenusItems(key: string): string[] {
    const activeMt = findMenuItem(this.twoColumnMenuItems, key);
    if (activeMt) {
      const matchingObjs = [
        activeMt["key"],
        ...findAllParent(this.twoColumnMenuItems, activeMt),
      ];
      return matchingObjs;
    }
    return [];
  }
}
