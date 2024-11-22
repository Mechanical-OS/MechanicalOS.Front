import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2,
} from "@angular/core";
import { AuthenticationService } from "src/app/core/service/auth.service";
import { EventService } from "src/app/core/service/event.service";
import {
  LAYOUT_COLOR_DARK,
  LAYOUT_COLOR_LIGHT,
  LEFT_SIDEBAR_TYPE_CONDENSED,
  LEFT_SIDEBAR_TYPE_DEFAULT,
  LEFT_SIDEBAR_TYPE_FULL,
} from "../config/layout.model";
import { BrandItem } from "../models/brands.model";
import { CreateNewMenuOption } from "../models/create-new.model";
import { Language } from "../models/language.model";
import { MegaMenuItem } from "../models/mega-menu.model";
import { NotificationItem } from "../models/notification.model";
import { ProfileOptionItem } from "../models/profileoption.model";
import { SearchResultItem, SearchUserItem } from "../models/search.model";
import { changeBodyAttribute, getLayoutConfig } from "../helper/utils";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.scss"],
})
export class TopbarComponent implements OnInit {
  @Input() layoutType: string = "";
  @Input() leftSidebarTheme: string = "light";
  createMenuOptions: CreateNewMenuOption[] = [];
  megaMenuItems: MegaMenuItem[] = [];
  notificationList: NotificationItem[] = [];
  languages: Language[] = [];
  brands: BrandItem[] = [];
  profileOptions: ProfileOptionItem[] = [];
  selectedLanguage?: Language;
  searchResults: SearchResultItem[] = [];
  searchUsers: SearchUserItem[] = [];

  loggedInUser: any = {};
  topnavCollapsed: boolean = true;
  leftSidebarType: string = "";
  // output events
  @Output() mobileMenuButtonClicked = new EventEmitter();
  @Output() settingsButtonClicked = new EventEmitter();

  constructor(
    private authService: AuthenticationService,
    private eventService: EventService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    let config = getLayoutConfig("detached");
    this._fetchMenus();
    this._fetchSearchData();
    this._fetchNotifications();
    this._fetchProfileOptions();
    this.leftSidebarType = config.leftSidebarType;

    this.loggedInUser = this.authService.currentUser();

    document.addEventListener("fullscreenchange", this.exitHandler);
    document.addEventListener("webkitfullscreenchange", this.exitHandler);
    document.addEventListener("mozfullscreenchange", this.exitHandler);
    this.onResize();
  }

  @HostListener("window:resize", ["$event"])
  onResize() {
    if (document.documentElement.clientWidth <= 1040) {
      this.eventService.broadcast(
        "changeLeftSidebarType",
        LEFT_SIDEBAR_TYPE_FULL
      );
    } else if (document.documentElement.clientWidth > 1040) {
      this.eventService.broadcast(
        "changeLeftSidebarType",
        LEFT_SIDEBAR_TYPE_DEFAULT
      );
    }
  }

  /**
   * fetches menu options
   */
  _fetchMenus(): void {
    this.createMenuOptions = [];

    this.megaMenuItems = [];
  }

  /**
   * Fetches notifications
   */
  _fetchNotifications(): void {
    this.notificationList = [];
  }

  /**
   * Fetches profile options
   */
  _fetchProfileOptions(): void {
    this.profileOptions = [
      {
        label: "Minha Conta",
        icon: "fe-user",
        redirectTo: "/apps/contacts/profile",
      },
      {
        label: "Configurações",
        icon: "fe-settings",
        redirectTo: "[]",
      },
      {
        label: "Bloquear",
        icon: "fe-lock",
        redirectTo: "/auth/lock-screen",
      },
      {
        label: "Sair",
        icon: "fe-log-out",
        redirectTo: "/auth/login",
      },
    ];
  }

  /**
   * Fetches search results
   */
  _fetchSearchData(): void {
    this.searchResults = [
      {
        id: 1,
        text: "Analytics Report",
        icon: "fe-home",
      },
      {
        id: 2,
        text: "How can I help you?",
        icon: "fe-aperture",
      },
      {
        id: 3,
        text: "User profile settings",
        icon: "fe-settings",
      },
    ];

    this.searchUsers = [
      {
        id: 1,
        name: "Erwin Brown",
        position: "UI Designer",
        profile: "assets/images/users/user-2.jpg",
      },
      {
        id: 2,
        name: "Jacob Deo",
        position: "Developer",
        profile: "assets/images/users/user-5.jpg",
      },
    ];
  }

  /**
   * changes left sidebar width
   */
  changeSidebarWidth(): void {
    const html = document.documentElement;
    if (
      document.documentElement.hasAttribute("data-sidenav-size") &&
      document.documentElement.getAttribute("data-sidenav-size") === "condensed"
    ) {
      this.eventService.broadcast(
        "changeLeftSidebarType",
        LEFT_SIDEBAR_TYPE_DEFAULT
      );
    } else {
      this.eventService.broadcast(
        "changeLeftSidebarType",
        LEFT_SIDEBAR_TYPE_CONDENSED
      );
    }
    // html.classList.toggle("sidebar-enable");
  }

  changeTheme(): void {
    if (
      document.documentElement.hasAttribute("data-bs-theme") &&
      document.documentElement.getAttribute("data-bs-theme") === "light"
    ) {
      this.eventService.broadcast("changeLayoutColor", LAYOUT_COLOR_DARK);
    } else {
      this.eventService.broadcast("changeLayoutColor", LAYOUT_COLOR_LIGHT);
    }
  }

  /**
   * exit handler for full screen mode
   */
  exitHandler(): void {
    let document: any = window.document;

    if (
      !document.webkitIsFullScreen &&
      !document.mozFullScreen &&
      !document.msFullscreenElement
    ) {
      document.body.classList.remove("fullscreen-enable");
    }
  }

  /**
   * toggles full screen mode
   */
  toggleFullScreen(): void {
    let document: any = window.document;

    document.body.classList.toggle("fullscreen-enable");

    if (
      !document.fullscreenElement &&
      /* alternative standard method */ !document.mozFullScreenElement &&
      !document.webkitFullscreenElement
    ) {
      // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }

  /**
   * Toggles the right sidebar
   */
  toggleRightSidebar(): void {
    this.settingsButtonClicked.emit();
  }
  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    this.topnavCollapsed = !this.topnavCollapsed;
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
    this.showBackdrop();
  }

  private showBackdrop(): void {
    const backdrop = this.renderer.createElement("div");
    this.renderer.setAttribute(backdrop, "id", "custom-backdrop");
    this.renderer.addClass(backdrop, "offcanvas-backdrop");
    this.renderer.addClass(backdrop, "fade");
    this.renderer.addClass(backdrop, "show");
    this.renderer.appendChild(document.body, backdrop);

    if (document.documentElement.getAttribute("dir") !== "rtl") {
      this.renderer.setStyle(document.body, "overflow", "hidden");
      if (window.innerWidth > 1140) {
        this.renderer.setStyle(document.body, "paddingRight", "15px");
      }
    }

    this.renderer.listen(backdrop, "click", () => {
      document.documentElement.classList.remove("sidebar-enable");
      this.hideBackdrop();
    });
  }

  private hideBackdrop(): void {
    const backdrop = document.getElementById("custom-backdrop");
    if (backdrop) {
      this.renderer.removeChild(document.body, backdrop);
      this.renderer.removeStyle(document.body, "overflow");
      this.renderer.removeStyle(document.body, "paddingRight");
    }
  }

  navigateTo(option: ProfileOptionItem): void {
    if (option.redirectTo) {
      window.location.href = option.redirectTo;
    }
  }
}
