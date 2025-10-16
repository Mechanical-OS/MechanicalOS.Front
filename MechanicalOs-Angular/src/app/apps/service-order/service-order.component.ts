import { Component, OnInit, ViewChild } from '@angular/core';
import { Column } from 'src/app/shared/advanced-table/advanced-table.component';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvancedTableServices } from 'src/app/shared/advanced-table/advanced-table-service.service';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { GetAllRequest } from 'src/app/Http/models/Input/get-all-request.model';
import { ServiceOrderService } from './service-order.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ServiceOrder, ServiceOrderStatus, ServiceOrderStatusInfo } from '../Shared/models/service-order.model';

@Component({
  selector: 'app-service-order',
  templateUrl: './service-order.component.html',
  styleUrl: './service-order.component.scss'
})
export class ServiceOrderComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  columns: Column[] = [];

  @ViewChild("advancedTable") advancedTable: any;

  list: ServiceOrder[] = [];
  isDisabled: boolean = false;
  selectedRowId: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private service: ServiceOrderService,
    private tableService: AdvancedTableServices,
    private metroMenuService: MetroMenuService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.pageTitle = [
      { label: "Ordem de Serviço", path: "/" },
      { label: "Ordem de Serviço", path: "/", active: true },
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
        label: "OS",
        formatter: this.IDFormatter.bind(this),
      },
      {
        name: "entryDate",
        label: "Data da entrada",
        formatter: this.dateFormatter.bind(this),
      },
      {
        name: "status",
        label: "Status",
        formatter: this.statusFormatter.bind(this),
      },
      {
        name: "customer",
        label: "Cliente",
        formatter: this.customerFormatter.bind(this),
      },
      {
        name: "vehicle",
        label: "Veículo",
        formatter: this.vehicleFormatter.bind(this),
      },
      {
        name: "plate",
        label: "Placa",
        formatter: this.plateFormatter.bind(this),
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
   * Carrega os dados da tabela
   */
  async _fetchData(): Promise<void> {
    this.loadOrdersFromAPI();
    
    // Comentado para usar mock - descomente quando a API estiver pronta
    /*
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
          
          console.log('Lista de ordens de serviço carregada:', this.list);
          console.log('Total de registros:', this.tableService.totalRecords);
        } else {
          console.error('Estrutura de dados inválida:', ret);
          this.list = [];
          this.tableService.totalRecords = 0;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar ordens de serviço:', error);
        this.notificationService.showMessage('Erro ao carregar lista de ordens de serviço.', 'error');
        this.list = [];
        this.tableService.totalRecords = 0;
      }
    });
    */
  }

  /**
   * Carrega ordens de serviço da API real
   */
  private loadOrdersFromAPI(): void {
    const request = {
      pageSize: this.tableService.pageSize || 100,
      pageIndex: this.tableService.page || 1,
      sort: '',
      direction: 'desc'
    };

    console.log('📡 Buscando ordens de serviço na API:', request);

    this.service.getAllOrders(request).subscribe({
      next: (ret: any) => {
        console.log('✅ Dados recebidos da API:', ret);
        
        if (ret && ret.statusCode === 200 && ret.content && ret.content.resultList) {
          // Mapeia os dados para o formato esperado
          this.list = ret.content.resultList.map((order: any) => ({
            id: order.id,
            orderNumber: `#${String(order.id).padStart(5, '0')}`,
            entryDate: order.dateCreated,
            status: this.mapStatusFromAPI(order.status),
            customer: order.customer?.name || 'N/A',
            vehicle: this.getVehicleDescription(order),
            plate: this.getVehiclePlate(order),
            totalValue: order.totalOrder / 100, // Converte centavos para reais
            description: order.description || '',
            observations: '',
            rawData: order // Mantém dados brutos para referência
          }));

          this.tableService.totalRecords = ret.content.totalRecords;
          this.tableService.startIndex = ((ret.content.pageIndex - 1) * ret.content.pageSize) + 1;
          this.tableService.endIndex = this.tableService.startIndex + ret.content.resultList.length - 1;
          
          console.log('📋 Lista de ordens de serviço:', this.list);
          console.log('📊 Total de registros:', this.tableService.totalRecords);
        } else {
          console.error('❌ Estrutura de dados inválida:', ret);
          this.list = [];
          this.tableService.totalRecords = 0;
        }
      },
      error: (error) => {
        console.error('❌ Erro ao carregar ordens de serviço:', error);
        this.notificationService.showMessage('Erro ao carregar lista de ordens de serviço.', 'error');
        this.list = [];
        this.tableService.totalRecords = 0;
      }
    });
  }

  /**
   * Mapeia o status da API para o enum interno
   */
  private mapStatusFromAPI(statusString: string): ServiceOrderStatus {
    const statusMap: { [key: string]: ServiceOrderStatus } = {
      'Desconhecido': ServiceOrderStatus.ORCAMENTO,
      'Aguardando': ServiceOrderStatus.ORCAMENTO,
      'Orçamento': ServiceOrderStatus.ORCAMENTO,
      'ORCAMENTO': ServiceOrderStatus.ORCAMENTO,
      'Em Andamento': ServiceOrderStatus.EM_ANDAMENTO,
      'EM_ANDAMENTO': ServiceOrderStatus.EM_ANDAMENTO,
      'Concluído': ServiceOrderStatus.CONCLUIDO,
      'CONCLUIDO': ServiceOrderStatus.CONCLUIDO,
      'Cancelado': ServiceOrderStatus.CANCELADO,
      'CANCELADO': ServiceOrderStatus.CANCELADO
    };

    return statusMap[statusString] || ServiceOrderStatus.ORCAMENTO;
  }

  /**
   * Extrai descrição do veículo dos dados da ordem
   */
  private getVehicleDescription(order: any): string {
    // Tenta extrair informações do veículo
    if (order.vehicle) {
      return `${order.vehicle.brand || ''} ${order.vehicle.model || ''}`.trim();
    }
    return 'N/A';
  }

  /**
   * Extrai placa do veículo dos dados da ordem
   */
  private getVehiclePlate(order: any): string {
    return order.vehicle?.plate || 'N/A';
  }

  /**
   * Carrega dados mock para demonstração
   */
  private loadMockData(): void {
    this.list = [
      {
        id: 1,
        entryDate: new Date('2023-01-01T12:00:00'),
        status: ServiceOrderStatus.ORCAMENTO,
        customer: {
          id: 1,
          name: 'Kleiton Freitas',
          email: 'kleiton@email.com',
          phone: '(11) 99999-9999',
          document: '123.456.789-00'
        },
        vehicle: {
          id: 1,
          brand: 'Hyundai',
          model: 'HB20',
          version: '1.6 Sedan',
          year: 2020,
          color: 'Branco'
        },
        plate: 'ABA3344',
        totalValue: 0,
        description: 'Revisão completa do veículo',
        observations: 'Cliente relatou ruído no motor'
      },
      {
        id: 2,
        entryDate: new Date('2023-01-01T12:00:00'),
        status: ServiceOrderStatus.EM_ANDAMENTO,
        customer: {
          id: 2,
          name: 'Rafael Vieira',
          email: 'rafael@email.com',
          phone: '(11) 88888-8888',
          document: '987.654.321-00'
        },
        vehicle: {
          id: 2,
          brand: 'Honda',
          model: 'Civic',
          version: '2.0',
          year: 2019,
          color: 'Prata'
        },
        plate: 'ABA3344',
        totalValue: 850.00,
        description: 'Troca de óleo e filtros',
        observations: 'Veículo em manutenção'
      },
      {
        id: 3,
        entryDate: new Date('2023-01-01T12:00:00'),
        status: ServiceOrderStatus.CONCLUIDO,
        customer: {
          id: 3,
          name: 'Augusto de Souza',
          email: 'augusto@email.com',
          phone: '(11) 77777-7777',
          document: '456.789.123-00'
        },
        vehicle: {
          id: 3,
          brand: 'Hyundai',
          model: 'Grand Santa Fé',
          version: '2021',
          year: 2021,
          color: 'Preto'
        },
        plate: 'ABA3344',
        totalValue: 1250.00,
        description: 'Reparo no sistema de freios',
        observations: 'Serviço concluído com sucesso'
      }
    ];

    this.tableService.totalRecords = 3;
    this.tableService.startIndex = 1;
    this.tableService.endIndex = 3;
    
    console.log('Dados mock carregados:', this.list);
  }

  /**
   * Adiciona event listeners para botões de ação
   */
  handleTableLoad(event: any): void {
    setTimeout(() => {
      document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const orderId = btn.getAttribute('data-id');
          if (orderId) {
            this.router.navigate([`apps/service-orders/${orderId}/edit`]);
          }
        });
      });

      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const orderId = btn.getAttribute('data-id');
          if (orderId && !this.isDisabled) {
            this.deleteServiceOrder(parseInt(orderId));
          }
        });
      });
    }, 100);
  }

  /**
   * Busca dados
   */
  searchData(value: string) {
    console.log('Busca:', value);
    if (value && value.trim()) {
      // TODO: Implementar busca na API quando disponível
    } else {
      this._fetchData();
    }
  }

  /**
   * Seleciona uma linha da tabela
   */
  onRowSelected(row: any): void {
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
          this.router.navigate([`/apps/service-orders/${this.selectedRowId}/edit`]);
        }
        break;
      case 'delete':
        if (this.selectedRowId) {
          this.deleteServiceOrder(this.selectedRowId);
        }
        break;
      case 'exit':
        this.router.navigate(['/']);
        break;
      case 'new':
        this.router.navigate(['apps/service-orders/new']);
        break;
    }
  }
  //#endregion

  //#region CRUD OPERATIONS
  /**
   * Exclui uma ordem de serviço
   */
  deleteServiceOrder(orderId: number): void {
    if (confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      this.service.delete(orderId).subscribe({
        next: (result) => {
          if (result.statusCode === 200) {
            this.notificationService.showMessage('Ordem de serviço excluída com sucesso.', 'success');
            this._fetchData();
            this.selectedRowId = 0;
            this.metroMenuService.disableButton('edit');
            this.metroMenuService.disableButton('delete');
          } else {
            this.notificationService.showMessage('Erro ao excluir ordem de serviço.', 'error');
          }
        },
        error: (error) => {
          console.error('Erro ao excluir ordem de serviço:', error);
          this.notificationService.showMessage('Erro ao excluir ordem de serviço.', 'error');
        }
      });
    }
  }
  //#endregion

  //#region HELPER METHODS
  /**
   * Formatter para o ID da OS
   */
  IDFormatter(order: ServiceOrder): any {
    const paddedId = order.id.toString().padStart(5, '0');
    return this.sanitizer.bypassSecurityTrustHtml(
      `<a href="javascript:void(0)" class="order text-body fw-bold" id="${order.id}">#${paddedId}</a>`
    );
  }

  /**
   * Formatter para data de entrada
   */
  dateFormatter(order: ServiceOrder): any {
    const date = new Date(order.entryDate);
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return this.sanitizer.bypassSecurityTrustHtml(
      `<span>${formattedDate} : ${formattedTime}</span>`
    );
  }

  /**
   * Formatter para o status
   */
  statusFormatter(order: ServiceOrder): any {
    const statusInfo = this.getStatusInfo(order.status);
    return this.sanitizer.bypassSecurityTrustHtml(
      `<span class="badge ${statusInfo.badgeClass}">${statusInfo.label}</span>`
    );
  }

  /**
   * Formatter para cliente
   */
  customerFormatter(order: ServiceOrder): any {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<span>${order.customer?.name || 'N/A'}</span>`
    );
  }

  /**
   * Formatter para veículo
   */
  vehicleFormatter(order: ServiceOrder): any {
    const vehicleInfo = order.vehicle;
    if (!vehicleInfo) return this.sanitizer.bypassSecurityTrustHtml('<span>N/A</span>');
    
    const vehicleText = `${vehicleInfo.brand} ${vehicleInfo.model} ${vehicleInfo.version || ''}`.trim();
    return this.sanitizer.bypassSecurityTrustHtml(`<span>${vehicleText}</span>`);
  }

  /**
   * Formatter para placa
   */
  plateFormatter(order: ServiceOrder): any {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<span>${order.plate || 'N/A'}</span>`
    );
  }

  /**
   * Formatter para ações
   */
  actionFormatter(order: ServiceOrder): any {
    return this.sanitizer.bypassSecurityTrustHtml(`
      <a href="javascript:void(0);" class="action-icon edit-btn" data-id="${order.id}" title="Editar">
        <i class="mdi mdi-pencil" style="color: #28a745;"></i>
      </a>
      <a href="javascript:void(0);" class="action-icon delete-btn ${this.isDisabled ? 'disabled' : ''}" 
       data-id="${order.id}"
       title="Excluir"
       style="${this.isDisabled ? 'pointer-events: none; opacity: 0.5;' : ''}">
        <i class="mdi mdi-delete" style="color: #dc3545;"></i>
      </a>
    `);
  }

  /**
   * Obtém informações do status
   */
  getStatusInfo(status: ServiceOrderStatus): ServiceOrderStatusInfo {
    const statusMap: Record<ServiceOrderStatus, ServiceOrderStatusInfo> = {
      [ServiceOrderStatus.ORCAMENTO]: {
        status: ServiceOrderStatus.ORCAMENTO,
        label: 'ORÇAMENTO',
        badgeClass: 'bg-warning text-dark'
      },
      [ServiceOrderStatus.EM_ANDAMENTO]: {
        status: ServiceOrderStatus.EM_ANDAMENTO,
        label: 'EM ANDAMENTO',
        badgeClass: 'bg-secondary text-white'
      },
      [ServiceOrderStatus.CONCLUIDO]: {
        status: ServiceOrderStatus.CONCLUIDO,
        label: 'CONCLUÍDO',
        badgeClass: 'bg-success text-white'
      },
      [ServiceOrderStatus.CANCELADO]: {
        status: ServiceOrderStatus.CANCELADO,
        label: 'CANCELADO',
        badgeClass: 'bg-danger text-white'
      }
    };

    return statusMap[status] || {
      status: status,
      label: 'DESCONHECIDO',
      badgeClass: 'bg-light text-dark'
    };
  }
  //#endregion
}

