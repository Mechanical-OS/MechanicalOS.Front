import { Component, ViewChild } from '@angular/core';
import { CustomersRoutingModule } from './customers-routing.module';
import { CommonModule } from '@angular/common';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { PageTitleModule } from 'src/app/shared/page-title/page-title.module';
import { Column } from 'src/app/shared/advanced-table/advanced-table.component';
import { Customer } from '../Shared/models/customer.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { GetAllRequest } from 'src/app/Http/models/Input/get-all-request.model';
import { CustomerService } from './customer.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { AdvancedTableServices } from 'src/app/shared/advanced-table/advanced-table-service.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent {
  pageTitle: BreadcrumbItem[] = [];
  columns: Column[] = [];

  @ViewChild("advancedTable") advancedTable: any;

  customerList: Customer[] = [];

  isDisabled: boolean = false;

  selectedCustomerId: number = 0;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private service: CustomerService,
    private tableService: AdvancedTableServices,
    private metroMenuService: MetroMenuService) {

  }

  ngOnInit(): void {
    this.pageTitle = [
      { label: "Customer", path: "/" },
      { label: "Customer", path: "/", active: true },
    ];

    const initialButtons = this.menuButtons;
    this.metroMenuService.setButtons(initialButtons);

    // get service list
    this._fetchData();

    // initialize advance table
    this.initAdvancedTableData();
  }

  async _fetchData(): Promise<void> {
    const request: GetAllRequest = {
      pageSize: this.tableService.pageSize,
      pageIndex: this.tableService.page,
      sort: '',
      direction: ''
    };

    this.service.getAll(request).subscribe((ret: any) => {
      this.customerList = ret.content.resultList;
      this.tableService.totalRecords = ret.content.totalRecords;
      this.tableService.startIndex = (ret.content.pageIndex * ret.content.pageSize) + 1;
      this.tableService.endIndex = this.tableService.startIndex + ret.content.resultList.length - 1;

      console.log('Amostra: ', ret);
    });
  }

  paginate(): void {
    this._fetchData();
  }

  initAdvancedTableData(): void {
    this.columns = [
      {
        name: "id",
        label: "CÓDIGO",
        formatter: this.IDFormatter.bind(this),
      },
      {
        name: "name",
        label: "Nome",
        formatter: (customer: Customer) => customer.name,
      },
      {
        name: "email",
        label: "E-mail",
        formatter: (customer: Customer) => customer.email,
      },
      {
        name: "Action",
        label: "Action",
        sort: false,
        formatter: this.serviceActionFormatter.bind(this),
      },
    ];
  }

  onRowSelected(item: Customer): void {
    if (item) {
      console.log(item);
      this.selectedCustomerId = item.id;
      this.metroMenuService.enableButton('edit');
      this.metroMenuService.enableButton('delete');
    } else {
      this.metroMenuService.disableButton('edit');
      this.metroMenuService.enableButton('delete');
    }
  }

  menuButtons: MetroButton[] = [
    {
      id: 'new',
      label: 'Novo',
      iconClass: 'fas fa-plus',
      colorClass: 'start',
      visible: true,
      enabled: true
    },
    {
      id: 'edit',
      label: 'Editar',
      iconClass: 'fas fa-edit',
      colorClass: 'edit',
      visible: true,
      enabled: false
    },
    {
      id: 'save',
      label: 'Salvar',
      iconClass: 'fas fa-save',
      colorClass: 'save',
      visible: true,
      enabled: false
    },
    {
      id: 'exit',
      label: 'Sair',
      iconClass: 'fas fa-sign-out-alt',
      colorClass: 'exit',
      visible: true,
      enabled: true
    },
    {
      id: 'delete',
      label: 'Excluir',
      iconClass: 'fas fa-trash',
      colorClass: 'delete',
      visible: true,
      enabled: false
    }
  ];

  handleMenuAction(action: any) {
    switch (action) {
      case 'save':
        console.log('Save acionado');
        break;
      case 'edit':
        this.router.navigate([`apps/customers/${this.selectedCustomerId}/edit`]);
        break;
      case 'delete':

        break;
      case 'exit':
        this.router.navigate([`apps/tools`]);
        break;
      case 'photos':
        // lógica para fotos
        console.log('Fotos acionado');
        break;
      case 'new':
        // lógica para novo
        this.router.navigate(['apps/customers/new']);
        break;
    }
  }

  handleTableLoad(event: any): void {
    // product cell
    document.querySelectorAll(".customer").forEach((e) => {
      e.addEventListener("click", () => {
        this.router.navigate(["../order/details"], {
          relativeTo: this.route,
          queryParams: { id: e.id },
        });
      });
    });
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
          this.customerList = result.content;
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


  // formats order ID cell
  IDFormatter(customer: Customer): any {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<a href="javascript:void(0)" class="order text-body fw-bold" id="${customer.id}">#${customer.id}</a> `
    );
  }

  // formats status cell
  StatusFormatter(customer: Customer): any {
    // if (service.status == StatusEnum.Active) {
    //   return this.sanitizer.bypassSecurityTrustHtml(
    //     `<h5><span class="badge bg-soft-success text-success"><i class="mdi mdi-bitcoin"></i> Disponível</span></h5>`
    //   );
    // } else if (service.status == StatusEnum.Inactive) {
    //   return this.sanitizer.bypassSecurityTrustHtml(
    //     `<h5><span class="badge bg-soft-warning text-warning"><i class="mdi mdi-timer-sand"></i> Indisponível</span></h5>`
    //   );
    // } else if (service.status == StatusEnum.Pending) {
    //   return this.sanitizer.bypassSecurityTrustHtml(
    //     ` <h5><span class="badge bg-soft-danger text-danger"><i class="mdi mdi-cancel"></i> Pendente</span></h5>`
    //   );
    // } else {
    //   return this.sanitizer.bypassSecurityTrustHtml(
    //     `<h5><span class="badge bg-soft-info text-info"><i class=""></i> ---</span></h5>`
    //   );
    // }
  }

  handleActionClick(event: any): void {
    const target = event.target.closest('.action-icon');
    if (!target) return;

    const id = target.getAttribute('data-id');
    if (!id) return;

    if (target.classList.contains('edit-btn')) {
      // let service = this.serviceList.find(x => x.id == id);
      // if (service)
      //   this.openModal(service || null);
    } else if (target.classList.contains('delete-btn')) {
      //this.deleteService(id);
    } else if (target.classList.contains('view-btn')) {
      //this.visualizarItem(id);
    }
  }

  serviceActionFormatter(item: Customer): any {
    return this.sanitizer.bypassSecurityTrustHtml(`
        <a href="javascript:void(0);" class="action-icon edit-btn" data-id="${item.id}">
          <i class="mdi mdi-square-edit-outline"></i>
        </a>
        <a href="javascript:void(0);" class="action-icon delete-btn ${this.isDisabled ? 'disabled' : ''}" 
         data-id="${item.id}"
         style="${this.isDisabled ? 'pointer-events: none; opacity: 0.5;' : ''}">
        <i class="mdi mdi-delete"></i>
      </a>
      `);
  }

}
