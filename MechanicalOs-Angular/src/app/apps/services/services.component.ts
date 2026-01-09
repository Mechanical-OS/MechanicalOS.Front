import { Component, OnInit, OnDestroy, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { UiInteractionService } from 'src/app/shared/services/ui-interaction.service';
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationService } from 'src/app/shared/services/form-validation.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { Result } from 'src/app/Http/models/operation-result.model';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit, AfterViewInit, OnDestroy {
  pageTitle: BreadcrumbItem[] = [];
  serviceList: ServiceModel[] = [];
  totalRecords: number = 0;
  selectAll: boolean = false;
  ServiceStatusGroup: string = "All";
  loading: boolean = false;
  isTableLoading: boolean = false;
  columns: Column[] = [];

  selectedItemRowId: number = 0;

  isDisabled: boolean = false;
  statusList = [
    { id: StatusEnum.Active, descricao: 'Ativo' },
    { id: StatusEnum.Inactive, descricao: 'Inativo' }
  ];

  @ViewChild('serviceModal') serviceModal!: TemplateRef<any>;
  serviceForm!: FormGroup;

  @ViewChild("advancedTable") advancedTable: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private service: ServiceService,
    private modalService: NgbModal,
    public formValidationMessage: FormValidationService,
    private notificationService: NotificationService,
    private metroMenuService: MetroMenuService,
    private uiInteractionService: UiInteractionService
  ) { }

  ngOnInit(): void {
    this.pageTitle = [
      { label: "Service", path: "/" },
      { label: "Service", path: "/", active: true },
    ];

    this.serviceForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      code: ['', [Validators.required, Validators.minLength(3)]],
      shortDescription: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      price: ['', [Validators.required]],
      status: [StatusEnum.Active]
    });

    // get service list
    this._fetchData();

    // initialize advance table
    this.initAdvancedTableData();
  }

  ngAfterViewInit(): void {
    document.addEventListener('click', (event: any) => this.handleActionClick(event));
    setTimeout(() => {
      this.metroMenuService.setButtons(this.menuButtons);
    }, 0);
  }

  ngOnDestroy(): void {
    this.metroMenuService.setButtons([]);
  }
  /**
   *  fetches services list
   */

  async _fetchData(pageIndex: number = 1, pageSize: number = 10): Promise<void> {
    this.isTableLoading = true;
    const request: GetAllRequest = { pageSize, pageIndex, sort: '', direction: '' };
    try {
      const result = await firstValueFrom(this.service.getAll(request));
      if (result.statusCode === 200) {
        this.serviceList = result.content.resultList;
        this.totalRecords = result.content.totalRecords;
      } else {
        await this.uiInteractionService.showSweetAlert({
          icon: 'error', title: 'Erro na Requisição',
          text: result.message || 'Algo deu errado ao buscar os dados.'
        }, this.menuButtons);
      }
    } catch (error) {
      console.error('Erro na API:', error);
      await this.uiInteractionService.showSweetAlert({
        icon: 'error', title: 'Erro na API',
        text: 'Não foi possível carregar os dados. Tente novamente mais tarde.'
      }, this.menuButtons);
    } finally {
      this.isTableLoading = false;
    }
  }

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

  handleActionClick(event: any): void {
    const target = event.target.closest('.action-icon');
    if (!target) return;

    const id = target.getAttribute('data-id');
    if (!id) return;

    if (target.classList.contains('edit-btn')) {
      let service = this.serviceList.find(x => x.id == id);
      if (service)
        this.openModal(service || null);
    } else if (target.classList.contains('delete-btn')) {
      this.deleteService(id);
    } else if (target.classList.contains('view-btn')) {
      //this.visualizarItem(id);
    }
  }

  serviceActionFormatter(item: ServiceModel): any {
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

  onRowSelected(item: ServiceModel): void {
    if (item) {
      this.selectedItemRowId = item.id;
      this.metroMenuService.enableButton('edit');
      this.metroMenuService.enableButton('delete');
    } else {
      this.metroMenuService.disableButton('edit');
      this.metroMenuService.disableButton('delete');
    }
  }

  /**
   * Método chamado quando a página é alterada
   * @param page Número da página (1-indexed)
   */
  onPageChange(page: number): void {
    console.log('Mudança de página detectada:', page);
    const currentPageSize = this.advancedTable?.service?.pageSize || 10;
    this._fetchData(page, currentPageSize);
  }

  /**
   * Método chamado quando o tamanho da página é alterado
   * @param pageSize Novo tamanho da página
   */
  onPageSizeChange(pageSize: number): void {
    console.log('Mudança de tamanho de página detectada:', pageSize);
    // Volta para a primeira página ao mudar o tamanho
    this._fetchData(1, pageSize);
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

  //#region SERVICES HTTP
  async deleteService(id: number): Promise<void> {
    const result = await this.uiInteractionService.showSweetAlert({
      title: 'Excluir Registro!',
      text: "Tem certeza que deseja excluir o serviço?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'SIM',
      cancelButtonText: 'NÃO',
    }, this.menuButtons);

    if (result.isConfirmed) {
      try {
        const ret: Result<string> | undefined = await this.service.delete(id).toPromise();
        if (ret && ret.statusCode === 200) {
          await this.uiInteractionService.showSweetAlert({ title: 'Sucesso', text: ret.message, icon: 'success' }, this.menuButtons);
          this.serviceList = this.serviceList.filter(item => item.id != id);
        } else {
          await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: (ret as any)?.message || 'Não foi possível excluir.', icon: 'error' }, this.menuButtons);
        }
      } catch (err) {
        await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro de comunicação ao excluir.', icon: 'error' }, this.menuButtons);
      }
    }
  }

  //#endregion

  /**
   * MODAL CADASTRO DE SERVIÇO
   */
  openModal(item: ServiceModel | null): void {
    this.serviceForm.reset();

    if (item) {
      this.serviceForm.patchValue({
        id: item.id,
        name: item.name,
        code: item.code,
        shortDescription: item.shortDescription,
        description: item.description,
        price: item.price,
        status: item.status
      });
      this.serviceForm.controls['code'].disable();
    } else {
      this.serviceForm.controls['code'].enable();
    }
    
    this.uiInteractionService.openNgbModal(this.serviceModal, { size: 'xl' }, this.menuButtons);
  }

  save(modalRef: any): void {
    if (!this.serviceForm.valid) {
        this.uiInteractionService.showSweetAlert({ title: 'Atenção', text: 'Formulário inválido.', icon: 'warning'}, this.menuButtons);
        return;
    }
    const data = this.serviceForm.getRawValue();
    const serviceCall = data.id != null && data.id > 0
      ? this.service.updateService(data)
      : this.service.saveNewService(data);

    serviceCall.subscribe({
      next: (ret: any) => {
        if (ret.statusCode === 200) {
          this.notificationService.showToast('Salvo com sucesso!', 'success');
          // Atualiza a lista localmente
          if (data.id) {
            const index = this.serviceList.findIndex(s => s.id === ret.content.id);
            if (index !== -1) this.serviceList[index] = ret.content;
          } else {
            this.serviceList.push(ret.content);
          }
          modalRef.close();
        } else {
          this.uiInteractionService.showSweetAlert({ title: 'Erro', text: ret.message, icon: 'error'}, this.menuButtons);
        }
      },
      error: (err) => {
          this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro de comunicação ao salvar.', icon: 'error'}, this.menuButtons);
      }
    });
  }

  //#region MENU
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
      id: 'delete',
      label: 'Excluir',
      iconClass: 'fas fa-trash',
      colorClass: 'delete',
      visible: true,
      enabled: false
    },
    {
      id: 'import',
      label: 'Importar',
      iconClass: 'fas fa-upload',
      colorClass: 'upload',
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
    }
  ];

  handleMenuAction(action: string) {
    switch (action) {
      case 'save':
        console.log('Save acionado');
      break;
      case 'edit':
        let service = this.serviceList.find(x => x.id == this.selectedItemRowId) ?? null;
        this.openModal(service);
      break;
      case 'exit':
        this.router.navigate([`apps/tools`]);
        break;
      case 'photos':
        // lógica para fotos
        console.log('Fotos acionado');
      break;
      case 'delete':
        if (this.selectedItemRowId) {
            this.deleteService(this.selectedItemRowId);
        } else {
            this.uiInteractionService.showSweetAlert({ title: 'Atenção', text: 'Nenhum serviço selecionado.', icon: 'warning' }, this.menuButtons);
        }
      break;
      case 'new':
        // lógica para novo
        this.openModal(null);
      break;
    }
  }
  //#endregion
}
