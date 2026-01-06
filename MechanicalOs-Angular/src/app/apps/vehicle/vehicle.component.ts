import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Column } from 'src/app/shared/advanced-table/advanced-table.component';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { Vehicle } from '../Shared/models/vehicle.model';
import { Router } from '@angular/router';
import { AdvancedTableServices } from 'src/app/shared/advanced-table/advanced-table-service.service';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { GetAllRequest } from 'src/app/Http/models/Input/get-all-request.model';
import { VehicleService } from './vehicle.service';
import { FilterConfig } from 'src/app/shared/ui/advanced-filter/advanced-filter.component';
import { UiInteractionService } from 'src/app/shared/services/ui-interaction.service';
@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.scss'
})
export class VehicleComponent implements OnInit, AfterViewInit, OnDestroy {
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
    private sanitizer: DomSanitizer,
    private service: VehicleService,
    public tableService: AdvancedTableServices,
    private metroMenuService: MetroMenuService,
    private uiInteractionService: UiInteractionService
  ) { }

  ngOnInit(): void {
    this.pageTitle = [
      { label: "Vehicle", path: "/" },
      { label: "Vehicle", path: "/", active: true },
    ];
    document.addEventListener('click', this.delegatedClickHandler);
    this.initAdvancedTableData();
    this._fetchData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.metroMenuService.setButtons(this.menuButtons);
    }, 0);
  }


  ngOnDestroy(): void {
    document.removeEventListener('click', this.delegatedClickHandler);
    this.metroMenuService.setButtons([]);
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
    try {
      const request: GetAllRequest = { pageSize, pageIndex, sort: '', direction: '' };
      const ret: any = await this.service.getAll(request).toPromise();
      if (ret && ret.content && ret.content.resultList) {
        this.list = ret.content.resultList;
        this.tableService.totalRecords = ret.content.totalRecords;
        this.tableService.startIndex = (ret.content.pageIndex * ret.content.pageSize) + 1;
        this.tableService.endIndex = this.tableService.startIndex + ret.content.resultList.length - 1;
          
        console.log('Lista de veículos carregada:', this.list);
        console.log('Total de registros:', this.tableService.totalRecords);
      } else {
        this.list = []; this.tableService.totalRecords = 0;
      }
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      this.list = []; this.tableService.totalRecords = 0;
      await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao carregar lista de veículos.', icon: 'error' }, this.menuButtons);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 
   * @param value 
   */
  async searchData(value: string): Promise<void> {
    console.log('Busca:', value);
    // TODO: Implementar busca na API quando disponível
    // Por enquanto, apenas filtra localmente
    if (value && value.trim()) {
      // Implementar filtro local se necessário
    } else {
      await this._fetchData();
    }
  }

  /**
   * Aplica filtros avançados
   * @param filterData Dados dos filtros aplicados
   */
  async onFilterApplied(filterData: any): Promise<void> {
    console.log('Filtros aplicados:', filterData);
    
    // Verifica se o filtro por placa está ativo e há texto de busca
    if (filterData.plate && filterData.search && filterData.search.trim()) {
      await this.searchByPlate(filterData.search.trim());
    } else {
      // Se não há filtro específico, recarrega todos os dados
      await this._fetchData();
    }
  }

  /**
   * Busca veículo por placa
   * @param plate Placa do veículo
   */

  private async searchByPlate(plate: string): Promise<void> {
    try {
      const result: any = await this.service.getByPlate(plate).toPromise();
      if (result && result.content) {
        this.list = [result.content];
        this.tableService.totalRecords = 1;
      } else {
        this.list = []; this.tableService.totalRecords = 0;
        await this.uiInteractionService.showSweetAlert({ title: 'Atenção', text: `Nenhum veículo encontrado com a placa: ${plate}`, icon: 'warning' }, this.menuButtons);
      }
    } catch (error) {
      console.error('Erro ao buscar veículo por placa:', error);
      this.list = []; this.tableService.totalRecords = 0;
      await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao buscar veículo por placa.', icon: 'error' }, this.menuButtons);
    }
  }

  /**
   * Limpa todos os filtros
   */

  async onFilterCleared(): Promise<void> {
    await this._fetchData();
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

  async handleMenuAction(action: any): Promise<void> {
    switch (action) {
      
      case 'edit':
          if (this.selectedRowId) {
            this.router.navigate([`apps/vehicles/${this.selectedRowId}/edit`]);
          }
      break;
      case 'delete':
        if (this.selectedRowId) {
          const result = await this.uiInteractionService.showSweetAlert({
            title: 'Excluir veículo!',
            text: 'Tem certeza que deseja excluir este veículo?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
          }, this.menuButtons);
          
          if (result.isConfirmed) {
            await this.deleteVehicle(this.selectedRowId);
          }
        } else {
          await this.uiInteractionService.showSweetAlert({
            title: 'Nenhum veículo selecionado',
            text: 'Por favor, selecione um veículo antes de continuar.',
            icon: 'warning',
            confirmButtonText: 'OK'
          }, this.menuButtons);
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

  private delegatedClickHandler = async (event: Event) => {
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
      if (vehicleId && !this.isDisabled) {
        const result = await this.uiInteractionService.showSweetAlert({
          title: 'Excluir Veículo!',
          text: 'Tem certeza que deseja excluir este veículo?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim, excluir!',
          cancelButtonText: 'Não'
        }, this.menuButtons);

        if (result.isConfirmed) {
          try {
            const ret: any = await this.service.delete(parseInt(vehicleId, 10)).toPromise();
            if (ret.statusCode === 200) {
              await this.uiInteractionService.showSweetAlert({ title: 'Sucesso', text: ret.message || 'Veículo excluído com sucesso.', icon: 'success' }, this.menuButtons);
              this.list = this.list.filter(v => v.id !== parseInt(vehicleId!, 10));
            } else {
              await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao excluir veículo.', icon: 'error' }, this.menuButtons);
            }
          } catch (err) {
            console.error(err);
            await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao excluir veículo.', icon: 'error' }, this.menuButtons);
          }
        }
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

  async deleteVehicle(vehicleId: number): Promise<void> {
    try {
      const result = await this.service.delete(vehicleId).toPromise();
      if (result && result.statusCode === 200) {
        await this.uiInteractionService.showSweetAlert({ title: 'Sucesso', text: 'Veículo excluído com sucesso.', icon: 'success' }, this.menuButtons);
        this._fetchData();
        this.selectedRowId = 0;
        this.metroMenuService.disableButton('edit');
        this.metroMenuService.disableButton('delete');
      } else {
        await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao excluir veículo.', icon: 'error' }, this.menuButtons);
      }
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao excluir veículo.', icon: 'error' }, this.menuButtons);
    }
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
    this._fetchData(pageNumber, currentPageSize);
  }

  onTablePageSizeChange(pageSize: number): void {
    console.log('Tamanho da página da tabela mudou para:', pageSize);
    this._fetchData(1, pageSize);
  }
}
