import { Component, ViewChild } from '@angular/core';
import { PageTitleModule } from "../../shared/page-title/page-title.module";
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Column } from 'src/app/shared/advanced-table/advanced-table.component';
import { ServiceModel } from './models/service.model';
import { SERVICELIST } from './models/data';
import { ServiceService } from './service.services';
import { GetAllRequest } from 'src/app/Http/models/Input/get-all-request.model';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { StatusEnum } from '../Shared/Enum/EnumStatusCard';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent {
  pageTitle: BreadcrumbItem[] = [];
  serviceList: ServiceModel[] = [];
  selectAll: boolean = false;
  ServiceStatusGroup: string = "All";
  loading: boolean = false;
  columns: Column[] = [];

  @ViewChild("advancedTable") advancedTable: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private service: ServiceService
  ) { }
  ngOnInit(): void {
    this.pageTitle = [
      { label: "Service", path: "/" },
      { label: "Service", path: "/", active: true },
    ];

    // get service list
    this._fetchData();

    // initialize advance table
    this.initAdvancedTableData();
  }

  /**
   *  fetches services list
   */

  async _fetchData(): Promise<void> {
    const request: GetAllRequest = {
      pageSize: 25,
      pageIndex: 1,
      sort: '',
      direction: ''
    };

    try {
      // Converte o Observable em uma Promise usando firstValueFrom
      const result = await firstValueFrom(this.service.getAll(request));
      if (result.statusCode === 200) {
        this.serviceList = result.content.resultList;
      } else {
        // Exibe o erro com SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Erro na Requisição',
          text: result.message || 'Algo deu errado ao buscar os dados.',
          confirmButtonText: 'Entendi',
        });
      }
    } catch (error) {
      console.error('Erro na API:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro na API',
        text: 'Não foi possível carregar os dados. Tente novamente mais tarde.',
        confirmButtonText: 'Entendi',
      });
    }
  }



  ngAfterViewInit(): void { }

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
        formatter: (service: ServiceModel) => service.description,
      },
      {
        name: "price",
        label: "PREÇO",
        formatter: (service: ServiceModel) =>
          new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(service.price),
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
  serviceIDFormatter(service: ServiceModel): any {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<a href="javascript:void(0)" class="order text-body fw-bold" id="${service.code}">#${service.code}</a> `
    );
  }

  // formats status cell
  serviceStatusFormatter(service: ServiceModel): any {
    if (service.status == StatusEnum.Active) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<h5><span class="badge bg-soft-success text-success"><i class="mdi mdi-bitcoin"></i> Disponível</span></h5>`
      );
    } else if (service.status == StatusEnum.Inactive) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<h5><span class="badge bg-soft-warning text-warning"><i class="mdi mdi-timer-sand"></i> Indisponível</span></h5>`
      );
    } else if (service.status == StatusEnum.Pending) {
      return this.sanitizer.bypassSecurityTrustHtml(
        ` <h5><span class="badge bg-soft-danger text-danger"><i class="mdi mdi-cancel"></i> Pendente</span></h5>`
      );
    } else {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<h5><span class="badge bg-soft-info text-info"><i class=""></i> ---</span></h5>`
      );
    }
  }

  // action cell formatter
  serviceActionFormatter(order: ServiceModel): any {
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
  matches(row: ServiceModel, term: string) {
    return (
      row.id?.toString().includes(term) ||
      row.code?.toLowerCase().includes(term) ||
      row.description?.toLowerCase().includes(term)

    );
  }

  /**
   * Search Method
   */
  searchData(searchTerm: string): void {

    // Se o termo estiver vazio, carrega os dados iniciais
    if (searchTerm === '') {
      this._fetchData();
      return;
    }

    // Requisição à API usando o método findByFilter do BaseService
    this.service.findByFilter({ term: searchTerm }).subscribe({
      next: (result) => {
        if (result.statusCode === 200) {
          this.serviceList = result.content;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erro na Pesquisa',
            text: result.message || 'Não foi possível realizar a pesquisa.',
            confirmButtonText: 'Entendi',
          });
        }
      },
      error: (error) => {
        console.error('Erro na API:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erro na API',
          text: 'Houve um problema ao buscar os dados. Tente novamente mais tarde.',
          confirmButtonText: 'Entendi',
        });
      },
    });
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
          o.status.toString()?.includes(ServiceStatusGroup)
        );
    this.serviceList = updatedData;
    setTimeout(() => {
      this.loading = false;
    }, 400);
  }
}
