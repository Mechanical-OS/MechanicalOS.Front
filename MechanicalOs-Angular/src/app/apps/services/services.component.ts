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
        label: "Código",
        formatter: this.serviceIDFormatter.bind(this),
        
      },
      {
        name: "description",
        label: "Descrição",
        formatter: (service: Service) => service.description,
      },
      {
        name: "price",
        label: "Preço",
        formatter: this.priceFormatter.bind(this),
      },
      {
        name: "status",
        label: "Status",
        formatter: this.serviceStatusFormatter.bind(this),
        width:200
      },
      {
        name: "Action",
        label: "Ações",
        sort: false,
        formatter: this.serviceActionFormatter.bind(this),
        width: 10
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
  // format price currency
  priceFormatter(service: Service): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price);
  }
  
  // formats order ID cell
  serviceIDFormatter(service: Service): any {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<a href="javascript:void(0)" class="order text-body fw-bold" id="${service.code}">#${service.code}</a> `
    );
  }

  // formats payment status cell
  serviceStatusFormatter(service: Service): any {
    if (service.status == "Available") {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<h5><span class="badge bg-soft-success text-success">Disponível</span></h5>`
      );
    } else if (service.status == "Unavailable") {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<h5><span class="badge bg-soft-warning text-warning"> Indisponível</span></h5>`
      );
    } else if (service.status == "Pending") {
      return this.sanitizer.bypassSecurityTrustHtml(
        ` <h5><span class="badge bg-soft-danger text-danger"> Pendente</span></h5>`
      );
    } else {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<h5><span class="badge bg-soft-info text-info"></i> ---</span></h5>`
      );
    }
  }

  // action cell formatter
  serviceActionFormatter(order: Service): any {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<a href="javascript:void(0);" class="action-icon edit-icon" style="color: #58B99D;"> 
          <i class="mdi mdi-square-edit-outline"></i>
       </a>
       <a href="javascript:void(0);" class="action-icon delete-icon" style="color: #FF5353;"> 
          <i class="mdi mdi-delete"></i>
       </a>`
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
