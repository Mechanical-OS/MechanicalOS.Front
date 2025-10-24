import { Component, OnInit, ViewChild } from '@angular/core';
import { Column } from 'src/app/shared/advanced-table/advanced-table.component';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { Vehicle } from '../Shared/models/vehicle.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvancedTableServices } from 'src/app/shared/advanced-table/advanced-table-service.service';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { GetAllRequest } from 'src/app/Http/models/Input/get-all-request.model';
import { VehicleService } from './vehicle.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { FilterConfig, FilterOption } from 'src/app/shared/ui/advanced-filter/advanced-filter.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.scss'
})
export class VehicleComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  columns: Column[] = [];
  isLoading: boolean = false;

  @ViewChild("advancedTable") advancedTable: any;

  list: Vehicle[] = [];
  isDisabled: boolean = false;
  selectedRowId: number = 0;
  
  // Configuração do filtro avançado
  filterConfig: FilterConfig = {
    title: 'Filtro de Veículos',
    searchPlaceholder: 'Digite para pesquisar veículos',
    showSearch: true,
    showRange: false,
    options: [
      {
        id: 'plate',
        label: 'Placa',
        type: 'checkbox'
      },
      {
        id: 'model',
        label: 'Modelo',
        type: 'checkbox'
      },
      {
        id: 'brand',
        label: 'Marca',
        type: 'checkbox'
      },
      {
        id: 'year',
        label: 'Ano',
        type: 'range',
        min: 1990,
        max: new Date().getFullYear() + 1,
        step: 1
      },
      {
        id: 'color',
        label: 'Cor',
        type: 'text'
      }
    ]
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private service: VehicleService,
    public tableService: AdvancedTableServices,
    private metroMenuService: MetroMenuService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.pageTitle = [
      { label: "Vehicle", path: "/" },
      { label: "Vehicle", path: "/", active: true },
    ];

    document.addEventListener('click', this.delegatedClickHandler);

    const initialButtons = this.menuButtons;
    this.metroMenuService.setButtons(initialButtons);

    this.initAdvancedTableData();
    this._fetchData();
  }

  ngOnDestroy(): void {
  document.removeEventListener('click', this.delegatedClickHandler);
}

  //#region ADVANCED TABLE

  initAdvancedTableData(): void {
    this.columns = [
      {
        name: "id",
        label: "CÓDIGO",
        formatter: this.IDFormatter.bind(this),
      },
      {
        name: "brand",
        label: "Marca",
        formatter: (vehicle: Vehicle) => vehicle.brand?.name || 'N/A',
      },
      {
        name: "vehicleModel",
        label: "Modelo",
        formatter: (vehicle: Vehicle) => vehicle.vehicleModel?.name || 'N/A',
      },
      {
        name: "version",
        label: "Versão",
        formatter: (vehicle: Vehicle) => vehicle.version || 'N/A',
      },
      {
        name: "year",
        label: "Ano",
        formatter: (vehicle: Vehicle) => vehicle.year || 'N/A',
      },
      {
        name: "color",
        label: "Cor",
        formatter: (vehicle: Vehicle) => vehicle.color?.name || 'N/A',
      },
      {
        name: "plate",
        label: "Placa",
        formatter: (vehicle: Vehicle) => vehicle.plate || 'N/A',
      },
      {
        name: "status",
        label: "Status",
        formatter: this.statusFormatter.bind(this),
      },
      {
        name: "action",
        label: "Ações",
        sort: false,
        formatter: this.actionFormatter.bind(this),
      },
    ];
  }

  /**
   * 
   * @param event 
   */

  /**
   * Load data
   */
  async _fetchData(pageIndex: number = 1, pageSize: number = 10): Promise<void> {
    this.isLoading = true;

    const request: GetAllRequest = {
      pageSize: pageSize,
      pageIndex: pageIndex,
      sort: '',
      direction: ''
    };

    this.service.getAll(request).subscribe({
      next: (ret: any) => {
        
        if (ret && ret.content && ret.content.resultList) {
          this.list = ret.content.resultList;
          this.tableService.totalRecords = ret.content.totalRecords;
          this.tableService.startIndex = (ret.content.pageIndex * ret.content.pageSize) + 1;
          this.tableService.endIndex = this.tableService.startIndex + ret.content.resultList.length - 1;
          
          console.log('Lista de veículos carregada:', this.list);
          console.log('Total de registros:', this.tableService.totalRecords);
        } else {
          console.error('Estrutura de dados inválida:', ret);
          this.list = [];
          this.tableService.totalRecords = 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar veículos:', error);
        this.notificationService.showMessage('Erro ao carregar lista de veículos.', 'error');
        this.list = [];
        this.tableService.totalRecords = 0;
        this.isLoading = false;
      }
    });
  }

  /**
   * 
   * @param value 
   */
  searchData(value: string) {
    console.log('Busca:', value);
    // TODO: Implementar busca na API quando disponível
    // Por enquanto, apenas filtra localmente
    if (value && value.trim()) {
      // Implementar filtro local se necessário
    } else {
      this._fetchData();
    }
  }

  /**
   * Aplica filtros avançados
   * @param filterData Dados dos filtros aplicados
   */
  onFilterApplied(filterData: any) {
    console.log('Filtros aplicados:', filterData);
    
    // Verifica se o filtro por placa está ativo e há texto de busca
    if (filterData.plate && filterData.search && filterData.search.trim()) {
      this.searchByPlate(filterData.search.trim());
    } else {
      // Se não há filtro específico, recarrega todos os dados
      this._fetchData();
    }
  }

  /**
   * Busca veículo por placa
   * @param plate Placa do veículo
   */
  private searchByPlate(plate: string) {
    this.service.getByPlate(plate).subscribe({
      next: (result: any) => {
        console.log('Resultado da busca por placa:', result);
        
        if (result && result.content) {
          // Se encontrou um veículo, cria uma lista com ele
          this.list = [result.content];
          this.tableService.totalRecords = 1;
          this.tableService.startIndex = 1;
          this.tableService.endIndex = 1;
          
        } else {
          // Se não encontrou, limpa a lista
          this.list = [];
          this.tableService.totalRecords = 0;
          this.tableService.startIndex = 0;
          this.tableService.endIndex = 0;
          
          this.notificationService.showMessage(`Nenhum veículo encontrado com a placa: ${plate}`, 'warning');
        }
      },
      error: (error) => {
        console.error('Erro ao buscar veículo por placa:', error);
        this.notificationService.showMessage('Erro ao buscar veículo por placa.', 'error');
        this.list = [];
        this.tableService.totalRecords = 0;
      }
    });
  }

  /**
   * Limpa todos os filtros
   */
  onFilterCleared() {
    console.log('Filtros limpos');
    this._fetchData(); // Recarrega dados sem filtros
  }

  /**
   * 
   * @param item 
   */
  onRowSelected(row: Vehicle): void {
    if (row) {
      this.selectedRowId = row.id;
      this.metroMenuService.enableButton('edit');
      this.metroMenuService.enableButton('delete');
    } else {
      this.metroMenuService.disableButton('edit');
      this.metroMenuService.disableButton('delete');
    }
  }
  //#endregion

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
    case 'edit':
        if (this.selectedRowId) {
          this.router.navigate([`apps/vehicles/${this.selectedRowId}/edit`]);
        }
    break;

    case 'delete':
      if (this.selectedRowId) {
        Swal.fire({
          title: 'Excluir veículo!',
          text: 'Tem certeza que deseja excluir este veículo? Esta ação não poderá ser desfeita!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim, excluir',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.deleteVehicle(this.selectedRowId);
          }
        });
      } else {
        Swal.fire({
          title: 'Nenhum veículo selecionado',
          text: 'Por favor, selecione um veículo antes de continuar.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
      }
      break;
    case 'exit':
      this.router.navigate(['apps/tools']); 
      break;
    case 'photos':
      // lógica para fotos 
      console.log('Fotos acionado'); 
      break;
    case 'new':
      this.router.navigate(['apps/vehicles/new']);
      break;
  }
}

private delegatedClickHandler = (event: Event) => {
  const target = event.target as HTMLElement;

  // Editar
  const editBtn = target.closest('.edit-btn') as HTMLElement | null;
  if (editBtn) {
    event.preventDefault();
    const vehicleId = editBtn.getAttribute('data-id');
    console.log('Delegated click edit ->', vehicleId);
    if (vehicleId) {
      this.router.navigate([`apps/vehicles/${vehicleId}/edit`]);
    }
    return;
  }

  // Excluir
  const deleteBtn = target.closest('.delete-btn') as HTMLElement | null;
  if (deleteBtn) {
    event.preventDefault();
    const vehicleId = deleteBtn.getAttribute('data-id');
    console.log('Delegated click delete ->', vehicleId);
    if (vehicleId && !this.isDisabled) {
      // Substituindo o confirm() pelo SweetAlert2
      import('sweetalert2').then(Swal => {
        Swal.default.fire({
          title: 'Excluir Veículo!',
          text: 'Tem certeza que deseja excluir este veículo? Ação não poderá ser desfeita!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim, excluir!',
          cancelButtonText: 'Não'
        }).then((result) => {
          if (result.isConfirmed) {
            this.service.delete(parseInt(vehicleId, 10)).subscribe({
              next: (ret: any) => {
                if (ret.statusCode === 200) {
                  this.notificationService.showMessage(ret.message, 'success');
                  // Atualiza a lista de veículos após exclusão
                  this.list = this.list.filter(v => v.id !== parseInt(vehicleId!, 10));
                } else {
                  this.notificationService.showMessage('Erro ao excluir veículo.', 'error');
                }
              },
              error: (err) => {
                console.error(err);
                this.notificationService.showMessage('Erro ao excluir veículo.', 'error');
              }
            });
          }
        });
      });
    }
    return;
  }
};
  //#endregion

  //#region CRUD OPERATIONS
  /**
   * Exclui um veículo
   * @param vehicleId ID do veículo a ser excluído
   */
  deleteVehicle(vehicleId: number): void {
      this.service.delete(vehicleId).subscribe({
        next: (result) => {
          if (result.statusCode === 200) {
            this.notificationService.showMessage('Veículo excluído com sucesso.', 'success');
            this._fetchData(); // Recarrega a lista
            this.selectedRowId = 0;
            this.metroMenuService.disableButton('edit');
            this.metroMenuService.disableButton('delete');
          } else {
            this.notificationService.showMessage('Erro ao excluir veículo.', 'error');
          }
        },
        error: (error) => {
          console.error('Erro ao excluir veículo:', error);
          this.notificationService.showMessage('Erro ao excluir veículo.', 'error');
        }
      });
  }
  //#endregion

  //#region HELPER METHODS
  /**
   * 
   * @param vehicle 
   * @returns 
   */
  IDFormatter(vehicle: Vehicle): any {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<a href="javascript:void(0)" class="order text-body fw-bold" id="${vehicle.id}">#${vehicle.id}</a> `
    );
  }

  /**
   * 
   * @param vehicle 
   * @returns 
   */
  statusFormatter(vehicle: Vehicle): any {
    const status = vehicle.status;
    const statusText = status === 1 ? 'Ativo' : status === 0 ? 'Inativo' : 'Desconhecido';
    const statusClass = status === 1 ? 'badge bg-success' : status === 0 ? 'badge bg-secondary' : 'badge bg-warning';
    
    return this.sanitizer.bypassSecurityTrustHtml(
      `<span class="${statusClass}">${statusText}</span>`
    );
  }

  /**
   * 
   * @param vehicle 
   * @returns 
   */
  actionFormatter(vehicle: Vehicle): any {
    return this.sanitizer.bypassSecurityTrustHtml(`
          <a href="javascript:void(0);" class="action-icon edit-btn" data-id="${vehicle.id}">
            <i class="mdi mdi-square-edit-outline"></i>
          </a>
          <a href="javascript:void(0);" class="action-icon delete-btn ${this.isDisabled ? 'disabled' : ''}" 
           data-id="${vehicle.id}"
           style="${this.isDisabled ? 'pointer-events: none; opacity: 0.5;' : ''}">
          <i class="mdi mdi-delete"></i>
        </a>
        `);
  }

  onTablePageChange(pageNumber: number): void {
    console.log('Página da tabela mudou para:', pageNumber);
    const currentPageSize = this.advancedTable?.service?.pageSize || 10;
    this._fetchData(pageNumber, currentPageSize); // Recarrega os dados com a nova página
  }

  onTablePageSizeChange(pageSize: number): void {
    console.log('Tamanho da página da tabela mudou para:', pageSize);
    this._fetchData(1, pageSize); // Recarrega os dados com o novo pageSize (e página 1)
  }
}
