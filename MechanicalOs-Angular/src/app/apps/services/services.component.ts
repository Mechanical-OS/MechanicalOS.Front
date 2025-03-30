import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationService } from 'src/app/shared/services/form-validation.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { Result } from 'src/app/Http/models/operation-result.model';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  serviceList: ServiceModel[] = [];
  selectAll: boolean = false;
  ServiceStatusGroup: string = "All";
  loading: boolean = false;
  columns: Column[] = [];

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
    private notificationService: NotificationService
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

  ngAfterViewInit(): void {
    document.addEventListener('click', (event: any) => this.handleActionClick(event));
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
  deleteService(id: number) {
    Swal.fire({
      title: 'Excluir Registro!!!',
      text: "Tem certeza que deseja excluir o serviço? Ação não poderá ser desfeita!!!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'SIM',
      cancelButtonText: 'NÃO',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.delete(id).subscribe((ret: Result<string>)=>{
          if(ret.statusCode === 200){
            this.notificationService.showMessage(ret.message, 'Sucesso');
          }else{
            this.notificationService.showAlert(ret);
          }
        });
      }
    })

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

    this.modalService.open(this.serviceModal, { centered: true, size: 'xl', backdrop: 'static' });
  }

  save(modalRef: any): void {
    if (this.serviceForm.valid) {
      const data = this.serviceForm.getRawValue();
      if (data.id != null && data.id > 0) {
        this.service.updateService(data).subscribe((ret: any) => {
          console.log(ret);
          if (ret.statusCode === 200) {
            this.notificationService.showSuccess(ret);

            const index = this.serviceList.findIndex(s => s.id === ret.content.id);
            if (index !== -1) {
              this.serviceList[index] = ret.content;
            }

            modalRef.close();
          }
        });
      } else {
        this.service.saveNewService(data).subscribe((ret: any) => {
          if (ret.statusCode === 200) {
            this.notificationService.showSuccess(ret);
            this.serviceList.push(ret.content);
            modalRef.close();
          }
        });
      }


    }
  }
}
