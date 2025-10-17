import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Column } from 'src/app/shared/advanced-table/advanced-table.component';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvancedTableServices } from 'src/app/shared/advanced-table/advanced-table-service.service';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
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
export class ServiceOrderComponent implements OnInit, AfterViewInit {
  pageTitle: BreadcrumbItem[] = [];
  columns: Column[] = [];

  @ViewChild("advancedTable") advancedTable: any;

  list: ServiceOrder[] = [];
  isDisabled: boolean = false;
  selectedRowId: number = 0;

  // Propriedades para paginação
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: ServiceOrderService,
    public tableService: AdvancedTableServices,
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
    this.loadPixData();
  }

  ngAfterViewInit(): void {
    // Sincroniza o pageSize após a view ser inicializada
    setTimeout(() => {
      this.syncAdvancedTablePageSize();
    }, 100);
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
   * Carrega os dados PIX com paginação
   */
  loadPixData(page: number = 1): void {
    const request = {
      pageSize: this.pageSize,
      pageIndex: page,
      sort: '',
      direction: 'desc'
    };

    console.log(`🔍 loadPixData - Página: ${page}, PageSize: ${this.pageSize}`);
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
            observations: ''
          }));

          // Atualiza informações de paginação
          this.currentPage = ret.content.pageIndex;
          this.totalItems = ret.content.totalRecords;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.hasNextPage = this.currentPage < this.totalPages;
          this.hasPreviousPage = this.currentPage > 1;

          // Sincronizar o pageSize do advanced-table
          this.syncAdvancedTablePageSize();
          
          console.log(`📋 Dados carregados: ${this.list.length} registros de ${this.totalItems} total, página ${this.currentPage} de ${this.totalPages}`);
          console.log(`📊 Cálculo de páginas:`, {
            totalItems: this.totalItems,
            pageSize: this.pageSize,
            totalPages: this.totalPages,
            calculation: `Math.ceil(${this.totalItems} / ${this.pageSize}) = ${Math.ceil(this.totalItems / this.pageSize)}`,
            hasNextPage: this.hasNextPage,
            hasPreviousPage: this.hasPreviousPage,
            pageNumbers: this.getPageNumbers()
          });
        } else {
          console.error('❌ Estrutura de dados inválida:', ret);
          this.list = [];
          this.totalItems = 0;
        }
      },
      error: (error) => {
        console.error('❌ Erro ao carregar ordens de serviço:', error);
        this.notificationService.showMessage('Erro ao carregar lista de ordens de serviço.', 'error');
        this.list = [];
        this.totalItems = 0;
      }
    });
  }

  /**
   * Sincroniza o pageSize do advanced-table com o número de registros recebidos
   */
  private syncAdvancedTablePageSize(): void {
    if (this.advancedTable && this.advancedTable.service && this.list.length > 0) {
      const newPageSize = Math.max(this.list.length, 1);
      this.advancedTable.service.pageSize = newPageSize;
      this.advancedTable.service.page = 1;
      this.advancedTable.paginate();
      console.log(`Advanced-table pageSize sincronizado para: ${newPageSize}`);
    }
  }

  /**
   * Navega para a próxima página
   */
  nextPage(): void {
    if (this.hasNextPage) {
      console.log(`Navegando para próxima página: ${this.currentPage + 1}`);
      this.loadPixData(this.currentPage + 1);
    }
  }

  /**
   * Navega para a página anterior
   */
  previousPage(): void {
    if (this.hasPreviousPage) {
      console.log(`Navegando para página anterior: ${this.currentPage - 1}`);
      this.loadPixData(this.currentPage - 1);
    }
  }

  /**
   * Navega para uma página específica
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      console.log(`Navegando para página: ${page}`);
      this.loadPixData(page);
    }
  }

  /**
   * Altera o tamanho da página
   */
  changePageSize(newPageSize: number): void {
    console.log(`Alterando o tamanho da página de ${this.pageSize} para: ${newPageSize}`);
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.loadPixData(1);
  }

  /**
   * Gera um array com os números das páginas para exibição
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  // Propriedade para acessar Math no template
  Math = Math;

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
      this.loadPixData(1);
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
            this.loadPixData(this.currentPage);
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
  IDFormatter(order: ServiceOrder): string {
    const paddedId = order.id.toString().padStart(5, '0');
    return `<a href="#" class="order text-body fw-bold" id="${order.id}">#${paddedId}</a>`;
  }

  /**
   * Formatter para data de entrada
   */
  dateFormatter(order: ServiceOrder): string {
    const date = new Date(order.entryDate);
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `<span>${formattedDate} : ${formattedTime}</span>`;
  }

  /**
   * Formatter para o status
   */
  statusFormatter(order: ServiceOrder): string {
    const statusInfo = this.getStatusInfo(order.status);
    return `<span class="badge ${statusInfo.badgeClass}">${statusInfo.label}</span>`;
  }

  /**
   * Formatter para cliente
   */
  customerFormatter(order: ServiceOrder): string {
    return `<span>${order.customer || 'N/A'}</span>`;
  }

  /**
   * Formatter para veículo
   */
  vehicleFormatter(order: ServiceOrder): string {
    const vehicleInfo = order.vehicle;
    if (!vehicleInfo) return '<span>N/A</span>';
    
    const vehicleText = `${vehicleInfo.brand} ${vehicleInfo.model} ${vehicleInfo.version || ''}`.trim();
    return `<span>${vehicleText}</span>`;
  }

  /**
   * Formatter para placa
   */
  plateFormatter(order: ServiceOrder): string {
    return `<span>${order.plate || 'N/A'}</span>`;
  }

  /**
   * Formatter para ações
   */
  actionFormatter(order: ServiceOrder): string {
    return `
      <a href="#" class="action-icon edit-btn" data-id="${order.id}" title="Editar">
        <i class="mdi mdi-pencil" style="color: #28a745;"></i>
      </a>
      <a href="#" class="action-icon delete-btn ${this.isDisabled ? 'disabled' : ''}" 
       data-id="${order.id}"
       title="Excluir"
       style="${this.isDisabled ? 'pointer-events: none; opacity: 0.5;' : ''}">
        <i class="mdi mdi-delete" style="color: #dc3545;"></i>
      </a>
    `;
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

