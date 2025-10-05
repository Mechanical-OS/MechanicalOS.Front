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

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.scss'
})
export class VehicleComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  columns: Column[] = [];

  @ViewChild("advancedTable") advancedTable: any;

  list: Vehicle[] = [];
  isDisabled: boolean = false;
  selectedRowId: number = 0;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private service: VehicleService,
    private tableService: AdvancedTableServices,
    private metroMenuService: MetroMenuService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.pageTitle = [
      { label: "Vehicle", path: "/" },
      { label: "Vehicle", path: "/", active: true },
    ];

    const initialButtons = this.menuButtons;
    this.metroMenuService.setButtons(initialButtons);

    this.initAdvancedTableData();
    this._fetchData();
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
  handleTableLoad(event: any): void {
    // Adiciona event listeners para botões de ação
    setTimeout(() => {
      document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const vehicleId = btn.getAttribute('data-id');
          if (vehicleId) {
            this.router.navigate([`apps/vehicles/${vehicleId}/edit`]);
          }
        });
      });

      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const vehicleId = btn.getAttribute('data-id');
          if (vehicleId && !this.isDisabled) {
            this.deleteVehicle(parseInt(vehicleId));
          }
        });
      });
    }, 100);
  }

  /**
   * Load data
   */
  async _fetchData(): Promise<void> {
    const request: GetAllRequest = {
      pageSize: this.tableService.pageSize,
      pageIndex: this.tableService.page,
      sort: '',
      direction: ''
    };

    this.service.getAll(request).subscribe({
      next: (ret: any) => {
        console.log('Dados recebidos da API:', ret);
        
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
      },
      error: (error) => {
        console.error('Erro ao carregar veículos:', error);
        this.notificationService.showMessage('Erro ao carregar lista de veículos.', 'error');
        this.list = [];
        this.tableService.totalRecords = 0;
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
      this.metroMenuService.enableButton('delete');
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
          this.deleteVehicle(this.selectedRowId);
        }
        break;
      case 'exit':
        this.router.navigate(['/']);
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
  //#endregion

  //#region CRUD OPERATIONS
  /**
   * Exclui um veículo
   * @param vehicleId ID do veículo a ser excluído
   */
  deleteVehicle(vehicleId: number): void {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
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

}
