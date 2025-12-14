import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChange,
  inject,
} from "@angular/core";
import { EventService } from "src/app/core/service/event.service";
import {
  changeBodyAttribute,
  getLayoutConfig,
} from "../../shared/helper/utils";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { RightSidebarComponent } from "../../shared/right-sidebar/right-sidebar.component";

@Component({
  selector: "app-detached-layout",
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.scss"],
})
export class DetachedLayoutComponent implements OnInit, OnDestroy {
  @Input() layoutWidth: string = "";
  @Input() layoutColor: string = "";
  menuPosition: string = "";
  leftSidebarTheme: string = "";
  leftSidebarType: string = "";
  topbarTheme: string = "";
  showSidebarUserInfo: boolean = false;
  reRender: boolean = true;
  private offcanvasService = inject(NgbOffcanvas);

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    let config = getLayoutConfig("detached");
    this.menuPosition = config.menuPosition;
    this.leftSidebarTheme = config.leftSidebarTheme;
    this.leftSidebarType = config.leftSidebarType;
    this.topbarTheme = config.topbarTheme;
    this.showSidebarUserInfo = config.showSidebarUserInfo;

    // listen to event and change the layout configuarations
    this.eventService.subscribe("changeMenuPosition", (position) => {
      this.menuPosition = position;
    });

    this.eventService.subscribe("changeLeftSidebarTheme", (theme) => {
      this.leftSidebarTheme = theme;
    });

    this.eventService.subscribe("changeLeftSidebarType", (type) => {
      this.leftSidebarType = type;
    });

    this.eventService.subscribe("changeTopbarTheme", (theme) => {
      this.topbarTheme = theme;
    });

    this.eventService.subscribe("toggleLeftSidebarUserInfo", (show) => {
      this.showSidebarUserInfo = show;
    });
    this.changeLayoutConfig();
  }

  /**
   * On view init - activating horizontal layout
   */
  ngAfterViewInit() {
    changeBodyAttribute("data-layout-mode", "detached");
  }

  /**
   * changes layout configurations
   */
  ngOnChanges(changes: SimpleChange) {
    this._setRerender();
    this.changeLayoutConfig();
  }

  ngDoCheck(): void {
    this.changeLayoutConfig();
  }

  ngOnDestroy(): void {
    changeBodyAttribute("data-layout", "remove");
  }

  /**
   * controls re-rendering
   */
  _setRerender = () => {
    this.reRender = false;
    setTimeout(() => {
      this.reRender = true;
    });
  };

  /**
   * changes layout related options
   */
  changeLayoutConfig(): void {
    // light vs dark mode
    changeBodyAttribute("data-bs-theme", this.layoutColor);

    // boxed vs fluid
    changeBodyAttribute("data-layout-width", this.layoutWidth);

    // scrollable menus
    changeBodyAttribute("data-menu-position", this.menuPosition);

    // left sidebar theme
    changeBodyAttribute("data-menu-color", this.leftSidebarTheme);

    // left sidebar type
    changeBodyAttribute("data-sidenav-size", this.leftSidebarType);

    // topbar theme
    changeBodyAttribute("data-topbar-color", this.topbarTheme);
  }

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked() {
    this.offcanvasService.open(RightSidebarComponent, {
      position: "end",
      panelClass: "right-bar",
    });
  }

  /**
   * On mobile toggle button clicked
   */
  onToggleMobileMenu() {
    document.documentElement.classList.toggle("sidebar-enable");
  }
}
