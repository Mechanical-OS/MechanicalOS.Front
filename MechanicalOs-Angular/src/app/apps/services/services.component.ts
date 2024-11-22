import { Component, ViewChild } from '@angular/core';
import { PageTitleModule } from "../../shared/page-title/page-title.module";
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Column } from 'src/app/shared/advanced-table/advanced-table.component';
import { Service } from './shared/service.model';
import { SERVICELIST } from './shared/data';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent {
  pageTitle: BreadcrumbItem[] = [];
  serviceList: Service[] = [];
  selectAll: boolean = false;
  ServiceStatusGroup: string = "All";
  loading: boolean = false;
  columns: Column[] = [];

  @ViewChild("advancedTable") advancedTable: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}
  ngOnInit(): void {
    this.pageTitle = [
      { label: "Service", path: "/" },
      { label: "Service", path: "/", active: true },
    ];

    // get order list
    this._fetchData();

    // initialize advance table
    this.initAdvancedTableData();
  }

  /**
   *  fetches order list
   */
  _fetchData(): void {
    this.serviceList = SERVICELIST;
  }

  ngAfterViewInit(): void {}

  // initialize advance table columns
  initAdvancedTableData(): void {
    this.columns = [
      {
        name: "code",
        label: "CÓDIGO",
        formatter: this.serviceIDFormatter.bind(this),
      },
      {
        name: "description",
        label: "DESCRIÇÃO",
        formatter: (service: Service) => service.description,
      },
      {
        name: "price",
        label: "PREÇO",
        formatter: (service: Service) => service.price
      },
      {
        name: "status",
        label: "STATUS",
        formatter: this.serviceStatusFormatter.bind(this),
      },
      {
        name: "Action",
        label: "Action",
        sort: false,
        formatter: this.serviceActionFormatter.bind(this),
      },
    ];
  }

  /**
   *  handles operations that need to be performed after loading table
   */
  handleTableLoad(event: any): void {
    // product cell
    document.querySelectorAll(".service").forEach((e) => {
      e.addEventListener("click", () => {
        this.router.navigate(["../order/details"], {
          relativeTo: this.route,
          queryParams: { id: e.id },
        });
      });
    });
  }

  // formats order ID cell
  serviceIDFormatter(service: Service): any {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<a href="javascript:void(0)" class="order text-body fw-bold" id="${service.code}">#${service.code}</a> `
    );
  }

  //formats image cell
  // imageFormatter(service: Service): any {
  //   let products: string = ``;
  //   for (let i = 0; i < service.images.length; i++) {
  //     products += `<a href="javascript:void(0)"><img src="${service.images[i]}" alt="product-img" height="32" /></a>`;
  //   }
  //   return this.sanitizer.bypassSecurityTrustHtml(products);
  // }

  // formats payment status cell
  serviceStatusFormatter(service: Service): any {
    if (service.status == "available") {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<h5><span class="badge bg-soft-success text-success"><i class="mdi mdi-bitcoin"></i> Disponível</span></h5>`
      );
    } else if (service.status == "unavailable") {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<h5><span class="badge bg-soft-warning text-warning"><i class="mdi mdi-timer-sand"></i> Indisponível</span></h5>`
      );
    } else if (service.status == "pending") {
      return this.sanitizer.bypassSecurityTrustHtml(
        ` <h5><span class="badge bg-soft-danger text-danger"><i class="mdi mdi-cancel"></i> Pendente</span></h5>`
      );
    } else {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<h5><span class="badge bg-soft-info text-info"><i class="mdi mdi-cash"></i> ---</span></h5>`
      );
    }
  }

  // action cell formatter
  serviceActionFormatter(order: Service): any {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<a href="javascript:void(0);" class="action-icon"> <i class="mdi mdi-eye"></i></a>
           <a href="javascript:void(0);" class="action-icon"> <i class="mdi mdi-square-edit-outline"></i></a>
           <a href="javascript:void(0);" class="action-icon"> <i class="mdi mdi-delete"></i></a>`
    );
  }

  /**
   * Match table data with search input
   * @param row Table row
   * @param term Search the value
   */
  matches(row: Service, term: string) {
    return (
      row.id?.toString().includes(term) ||
      row.code?.toLowerCase().includes(term) ||
      row.description?.toLowerCase().includes(term) ||
      row.status?.toLowerCase().includes(term)
    );
  }

  /**
   * Search Method
   */
  searchData(searchTerm: string): void {
    if (searchTerm === "") {
      this._fetchData();
    } else {
      let updatedData = SERVICELIST;
      //  filter
      updatedData = updatedData.filter((service) =>
        this.matches(service, searchTerm)
      );
      this.serviceList = updatedData;
    }
  }

  /**
   * change service status group
   * @param ServiceStatusGroup order status
   */
  changeServiceStatusGroup(ServiceStatusGroup: string): void {
    this.loading = true;
    let updatedData = SERVICELIST;
    //  filter
    updatedData =
      ServiceStatusGroup === "All"
        ? SERVICELIST
        : [...SERVICELIST].filter((o) =>
            o.status?.includes(ServiceStatusGroup)
          );
    this.serviceList = updatedData;
    setTimeout(() => {
      this.loading = false;
    }, 400);
  }
}
