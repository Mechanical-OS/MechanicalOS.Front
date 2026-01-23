import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BreadcrumbItem } from "src/app/shared/page-title/page-title.model";
import { ServiceOrderService } from "../service-order.service";
import { ServiceOrderDraftService } from "../shared/service-order-draft.service";
import {
  ServiceOrder,
  ServiceOrderStatus,
  mapStatusToNumber,
} from "../../Shared/models/service-order.model";
import { NotificationService } from "src/app/shared/services/notification.service";
import { ServiceItem } from "src/app/shared/service-search";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { UiInteractionService } from 'src/app/shared/services/ui-interaction.service';
import { AlignLeft } from "angular-feather/icons";

// Configura as fontes do pdfMake
(pdfMake as any).vfs = pdfFonts;

@Component({
  selector: "app-service-order-edit",
  templateUrl: "./service-order-edit.component.html",
  styleUrl: "./service-order-edit.component.scss",
})
export class ServiceOrderEditComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  serviceOrder: ServiceOrder | null = null;
  orderId: number = 0;

  // Dados para exibição (somente leitura)
  customerData: any = null;
  vehicleData: any = null;
  addressData: any = null;
  isReadOnly: boolean = false;
  hasChanges: boolean = false;
  private initialState: any = {};

  // Dados editáveis
  services: ServiceItem[] = [];
  discountCoupon: string = "";
  discount: number = 0;
  subtotal: number = 0;
  total: number = 0;
  observations: string = "";
  currentStatus: string = "";

  // Lista de status disponíveis
  statusList = [
    { value: ServiceOrderStatus.ORCAMENTO, label: "Orçamento" },
    { value: ServiceOrderStatus.EM_ANDAMENTO, label: "Em Andamento" },
    { value: ServiceOrderStatus.CONCLUIDO, label: "Concluído" },
    { value: ServiceOrderStatus.CANCELADO, label: "Cancelado" },
  ];

  private readonly editableStatuses = [
    ServiceOrderStatus.ORCAMENTO,
    ServiceOrderStatus.EM_ANDAMENTO
  ];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceOrderService: ServiceOrderService,
    private draftService: ServiceOrderDraftService,
    private notificationService: NotificationService,
    private uiInteractionService: UiInteractionService
  ) {}

  ngOnInit(): void {
    this.pageTitle = [
      { label: "Ordens de Serviços", path: "/apps/service-orders" },
      { label: "Editar Ordem de Serviço", path: "/", active: true },
    ];

    // Obtém o ID da ordem da rota
    this.route.params.subscribe((params) => {
      this.orderId = +params["id"];
      if (this.orderId) {
        this.loadServiceOrder();
      }
    });
  }

  async loadServiceOrder(): Promise<void> {
    console.log("🔍 Buscando ordem de serviço ID:", this.orderId);
    this.notificationService.showLoading("Carregando ordem de serviço...");

    try {
      const response = await this.serviceOrderService.getOrderById(this.orderId).toPromise();
      this.notificationService.hideLoading();
      
      if (response && response.statusCode === 200 && response.content) {
        // response.content.status = 5; // Força o status para CONCLUÍDO
        // response.content.status = 8; // Força o status para CANCELADO
        this.populateForm(response.content);
      } else {
        await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao carregar ordem de serviço. Dados não encontrados.', icon: 'error' }, []);
        this.router.navigate(["/apps/service-orders"]);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar ordem de serviço:", error);
      this.notificationService.hideLoading();
      await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro de comunicação ao carregar a ordem.', icon: 'error' }, []);
      this.router.navigate(["/apps/service-orders"]);
    }
  }

  /**
   * Popula o formulário com os dados da ordem de serviço
   */
  private populateForm(orderData: any): void {
    console.log("📝 Populando formulário com dados:", orderData);

    // Dados do serviço
    this.serviceOrder = {
      id: orderData.id,
      entryDate: new Date(orderData.dateCreated || orderData.entryDate),
      status: orderData.status,
      customer: orderData.customer,
      vehicle: orderData.vehicle,
      plate: orderData.vehicle?.plate || "N/A",
      totalValue: orderData.totalOrder ? orderData.totalOrder / 100 : 0,
      description: orderData.description || "",
      observations: orderData.observations || "",
    };

    // Define o status atual baseado no status da ordem
    this.currentStatus = this.mapNumberToStatus(orderData.status);

    // Dados do cliente
    if (orderData.customer) {
      this.customerData = {
        name: orderData.customer.name || "N/A",
        email: orderData.customer.email || "N/A",
        phone: orderData.customer.whatsApp || orderData.customer.phone || "N/A",
        document: orderData.customer.socialNumber || "N/A",
      };
    }

    // Dados do veículo
    if (orderData.vehicle) {
      this.vehicleData = {
        brand: orderData.vehicle.brand?.name || "N/A",
        model:
          orderData.vehicle.vehicleModel?.name ||
          orderData.vehicle.model ||
          "N/A",
        version: orderData.vehicle.version || "N/A",
        year: orderData.vehicle.year || "N/A",
        color: orderData.vehicle.color?.name || "N/A",
        plate: orderData.vehicle.plate || "N/A",
      };
    }

    // Dados do endereço (se disponível)
    if (orderData.customer && orderData.customer.address) {
      this.addressData = {
        city: orderData.customer.address.city || "N/A",
        state: orderData.customer.address.state || "N/A",
        neighborhood: orderData.customer.address.neighborhood || "N/A",
        street: orderData.customer.address.street || "N/A",
        number: orderData.customer.address.number || "N/A",
        complement: orderData.customer.address.complement || "Sem complemento",
        zipCode: orderData.customer.address.zipcode || "N/A",
      };
    } else {
      this.addressData = {
        city: "N/A",
        state: "N/A",
        neighborhood: "N/A",
        street: "N/A",
        number: "N/A",
        complement: "N/A",
        zipCode: "N/A",
      };
    }

    this.currentStatus = this.mapNumberToStatus(orderData.status);
    
    if (!this.editableStatuses.includes(this.currentStatus as ServiceOrderStatus)) {
      this.isReadOnly = true;
      console.warn(`🔒 A Ordem de Serviço está em modo de SOMENTE LEITURA. Status: ${this.currentStatus}`);
    } else {
      this.isReadOnly = false;
    }

    // Carrega os serviços da ordem
    if (orderData.orderServices && Array.isArray(orderData.orderServices)) {
      this.services = orderData.orderServices.map((service: any) => ({
        id: service.serviceId || service.id,
        code: service.serviceCode,
        name:
          service.serviceShortDescription || service.name || "Serviço sem nome",
        price: service.servicePrice ? service.servicePrice / 100 : 0,
        quantity: service.serviceQuantity || 1,
        total: service.servicePrice
          ? (service.servicePrice / 100) * (service.serviceQuantity || 1)
          : 0,
      }));
    }

    // Observações
    this.observations = orderData.description || "";

    // Desconto (se disponível)
    if (orderData.discount) {
      this.discount = orderData.discount / 100; // Converte centavos para reais
    }

    // Calcula totais
    this.calculateTotals();

    this.captureInitialState();

    console.log("✅ Formulário populado com sucesso");
    console.log("Cliente:", this.customerData);
    console.log("Veículo:", this.vehicleData);
    console.log("Endereço:", this.addressData);
    console.log("Serviços:", this.services);
  }

  private captureInitialState(): void {
    this.initialState = {
      services: JSON.stringify(this.services),
      observations: this.observations,
      discount: this.discount,
      status: this.currentStatus
    };
    this.hasChanges = false;
    console.log("📸 Estado inicial capturado:", this.initialState);
  }

  private checkForChanges(): void {
    const servicesChanged = JSON.stringify(this.services) !== this.initialState.services;
    const observationsChanged = this.observations !== this.initialState.observations;
    const discountChanged = this.discount !== this.initialState.discount;
    const statusChanged = this.currentStatus !== this.initialState.status;

    this.hasChanges = servicesChanged || observationsChanged || discountChanged || statusChanged;
    console.log("🔄 Verificando mudanças:", { hasChanges: this.hasChanges, servicesChanged, observationsChanged, discountChanged, statusChanged });
  }

  private loadMockServiceOrder(): void {
    // Mock de uma ordem de serviço existente
    this.serviceOrder = {
      id: this.orderId,
      entryDate: new Date("2023-01-15T14:30:00"),
      status: "EM_ANDAMENTO" as any,
      customer: {
        id: 1,
        name: "Kleiton Freitas",
        email: "kleitonsfreitas@gmail.com",
        phone: "(11) 3456-7890",
        document: "123.456.789-00",
      },
      vehicle: {
        id: 1,
        brand: "Hyundai",
        model: "HB20",
        version: "1.6 Sedan",
        year: 2020,
        color: "Branco",
      },
      plate: "ABC1234",
      totalValue: 1250.0,
      description: "Revisão completa do veículo",
      observations: "Cliente relatou ruído no motor",
    };

    // Carrega os dados para exibição
    this.customerData = {
      name: this.serviceOrder.customer.name,
      email: this.serviceOrder.customer.email,
      phone: this.serviceOrder.customer.phone,
      document: this.serviceOrder.customer.document,
    };

    this.vehicleData = {
      brand: this.serviceOrder.vehicle.brand,
      model: this.serviceOrder.vehicle.model,
      version: this.serviceOrder.vehicle.version,
      year: this.serviceOrder.vehicle.year,
      color: this.serviceOrder.vehicle.color,
      plate: this.serviceOrder.plate,
    };

    this.addressData = {
      city: "Indaiatuba",
      state: "SP",
      neighborhood: "Jardim Bela Vista",
      street: "Av Ary Barnabé",
      number: "251",
      complement: "Sem complemento",
      zipCode: "13332-550",
    };

    // Mock de serviços existentes
    this.services = [
      {
        id: 1,
        code: "MOCK001",
        name: "Troca de filtro de ar condicionado",
        price: 150.0,
        quantity: 1,
        total: 150.0,
      },
      {
        id: 2,
        code: "MOCK002",
        name: "Troca de óleo do motor",
        price: 230.0,
        quantity: 1,
        total: 230.0,
      },
      {
        id: 3,
        code: "MOCK003",
        name: "Limpeza de bicos injetores",
        price: 95.0,
        quantity: 1,
        total: 95.0,
      },
    ];

    this.observations = this.serviceOrder.observations || "";
    this.calculateTotals();

    console.log("Ordem de serviço carregada para edição:", this.serviceOrder);
  }

  /**
   * Handler chamado quando um serviço é selecionado no componente de busca
   */
  onServiceSelected(service: ServiceItem): void {
    console.log("✅ Serviço selecionado:", service);
    this.addService(service);
    this.calculateTotals();
    this.checkForChanges();
  }

  /**
   * Handler chamado quando ocorre erro na busca de serviços
   */
  onSearchError(error: any): void {
    console.error("❌ Erro ao buscar serviços:", error);
    this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao buscar serviços. Tente novamente.', icon: 'error' }, []);
  }

  /**
   * Adiciona um serviço à lista
   */
  private addService(service: ServiceItem): void {
    const existingServiceIndex = this.services.findIndex(
      (s) => s.id === service.id
    );

    if (existingServiceIndex >= 0) {
      // Se o serviço já existe, incrementa a quantidade escolhida
      this.services[existingServiceIndex].quantity += service.quantity;
      this.updateServiceTotal(existingServiceIndex);

      // Move o serviço para o topo da lista
      const updatedService = this.services.splice(existingServiceIndex, 1)[0];
      this.services.unshift(updatedService);

      console.log("📈 Quantidade incrementada:", this.services[0]);
    } else {
      // Se é um novo serviço, adiciona no início da lista com a quantidade escolhida
      const newService = {
        ...service,
        quantity: service.quantity || 1,
        total: service.price * (service.quantity || 1),
      };
      this.services.unshift(newService);
      console.log("➕ Serviço adicionado:", newService);
    }

    this.calculateTotals();
    this.notificationService.showToast(`${service.quantity}x ${service.name} adicionado(s)!`, 'success');
  }

  updateServiceQuantity(index: number, newQuantityAsString: string): void {
    const quantity = parseInt(newQuantityAsString, 10);
    if (!isNaN(quantity) && quantity > 0) {
      this.services[index].quantity = quantity; 
      this.updateServiceTotal(index);
      this.calculateTotals();
      this.checkForChanges();
    } else if (this.services[index]) {
      this.services[index].quantity = 1;
      this.updateServiceTotal(index);
      this.calculateTotals();
      this.checkForChanges();
    }
  }

  private updateServiceTotal(index: number): void {
    this.services[index].total =
      this.services[index].price * this.services[index].quantity;
  }

  async removeService(index: number): Promise<void> {
    const serviceToRemove = this.services[index];
    const result = await this.uiInteractionService.showSweetAlert({
      title: 'Remover Serviço?',
      text: `Tem certeza que deseja remover "${serviceToRemove.name}" da ordem de serviço?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar'
    }, []);

    if (result.isConfirmed) {
      this.services.splice(index, 1);
      this.calculateTotals();
      this.notificationService.showToast(`"${serviceToRemove.name}" foi removido.`, 'success');
      this.checkForChanges();
    }
  }

  private calculateTotals(): void {
    this.subtotal = this.services.reduce(
      (sum, service) => sum + service.total,
      0
    );
    this.total = this.subtotal - this.discount;
  }

  applyDiscountCoupon(): void {
    if (this.discountCoupon && this.discountCoupon.trim()) {
      // Simula aplicação de cupom de desconto
      if (this.discountCoupon.toUpperCase() === "DESCONTO10") {
        this.discount = this.subtotal * 0.1; // 10% de desconto
      } else if (this.discountCoupon.toUpperCase() === "DESCONTO20") {
        this.discount = this.subtotal * 0.2; // 20% de desconto
      } else {
        this.discount = 150.0; // Desconto fixo para outros cupons
      }

      this.calculateTotals();
      console.log(
        `Cupom aplicado: ${
          this.discountCoupon
        } - Desconto: R$ ${this.discount.toFixed(2)}`
      );
      this.checkForChanges();
    }
  }

  updateObservations(): void {
    // Salva as observações
    console.log("Observações atualizadas:", this.observations);
    this.checkForChanges();
  }

  /**
   * Converte número do status (da API) para string do enum
   */
  private mapNumberToStatus(statusNumber: number): string {
    const statusMap: { [key: number]: string } = {
      4: ServiceOrderStatus.ORCAMENTO, // Pending
      6: ServiceOrderStatus.EM_ANDAMENTO, // Processing
      5: ServiceOrderStatus.CONCLUIDO, // Complete
      8: ServiceOrderStatus.CANCELADO, // Canceled
    };
    return statusMap[statusNumber] || ServiceOrderStatus.ORCAMENTO;
  }

  /**
   * Handler chamado quando o status é alterado
   */
  onStatusChange(): void {
    const statusNumber = mapStatusToNumber(this.currentStatus);
    console.log("📝 Status alterado:", {
      statusString: this.currentStatus,
      statusNumber: statusNumber,
      label: this.statusList.find((s) => s.value === this.currentStatus)?.label,
    });

    // Atualiza o status no objeto serviceOrder
    if (this.serviceOrder) {
      this.serviceOrder.status = this.currentStatus as any;
    }
    this.checkForChanges();
  }

  /**
   * Retorna a classe CSS baseada no status
   */
  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      [ServiceOrderStatus.ORCAMENTO]: "status-orcamento",
      [ServiceOrderStatus.EM_ANDAMENTO]: "status-em-andamento",
      [ServiceOrderStatus.CONCLUIDO]: "status-concluido",
      [ServiceOrderStatus.CANCELADO]: "status-cancelado",
    };
    return classMap[status] || "";
  }

  async saveChanges(): Promise<void> {
    if (this.isReadOnly) {
      await this.uiInteractionService.showSweetAlert({
        title: 'Ação não permitida',
        text: 'Esta Ordem de Serviço não pode ser alterada pois seu status é "' + this.getStatusLabel(this.currentStatus) + '".',
        icon: 'info'
      }, []);
      return;
    }
    if (!this.serviceOrder) {
      this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Ordem de serviço não carregada.', icon: 'error' }, []);
      return;
    }
    if (!this.services || this.services.length === 0) {
      this.uiInteractionService.showSweetAlert({ title: 'Atenção', text: 'Adicione pelo menos um serviço à ordem de serviço.', icon: 'warning' }, []);
      return;
    }

    // Converte o status atual para número
    const statusNumber = mapStatusToNumber(this.currentStatus);

    console.log("🔄 Status a ser enviado:", {
      statusString: this.currentStatus,
      statusNumber: statusNumber,
      statusLabel: this.statusList.find((s) => s.value === this.currentStatus)
        ?.label,
    });

    // Prepara o payload para a API
    const updatePayload = {
      id: this.serviceOrder.id,
      customerId: this.serviceOrder.customer?.id || 0,
      vehicleId: this.serviceOrder.vehicle?.id || 0,
      totalOrder: Math.round(this.total * 100), // Converte para centavos
      discount: Math.round(this.discount * 100), // Converte para centavos
      fees: 0, // Pode ser adicionado se necessário
      description: this.observations || "",
      entryDate:
        this.serviceOrder.entryDate?.toISOString() || new Date().toISOString(),
      departureDate: null, // Pode ser adicionado se necessário
      status: statusNumber, // Status convertido de string para número
      orderProducts: [], // Vazio por enquanto, pode ser implementado depois
      orderServices: this.services.map((service) => ({
        serviceId: service.id,
        serviceCode: service.code || String(service.id),
        serviceShortDescription: service.name,
        servicePrice: Math.round(service.price * 100), // Converte para centavos
        serviceDiscount: 0,
        serviceQuantity: service.quantity,
      })),
    };

    console.log('%c--- ANTES DE ENVIAR PARA A API ---', 'color: blue; font-weight: bold;');
    console.log('Status selecionado na UI (this.currentStatus):', this.currentStatus);
    console.log('Status convertido para número (statusNumber):', statusNumber);
    console.log('Payload completo enviado:', updatePayload);

    console.log(
      "📤 Payload da atualização:",
      JSON.stringify(updatePayload, null, 2)
    );

  this.notificationService.showLoading("Salvando alterações...");
  try {
    const response = await this.serviceOrderService.updateOrder(updatePayload).toPromise();
    this.notificationService.hideLoading();

    console.log('%c--- RESPOSTA DA API ---', 'color: green; font-weight: bold;');
    console.log('Objeto completo retornado pela API:', response);
    if (response && response.statusCode === 200) {
      const successMessage = response.message || 'Alterações salvas com sucesso!';
      await this.uiInteractionService.showSweetAlert({ title: 'Sucesso', text: successMessage, icon: 'success' }, []);
      this.loadServiceOrder();
    //  this.router.navigate(["/apps/service-orders"]);
    } else {
      const errorMessage = response?.message || "Erro ao atualizar ordem de serviço.";
      await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: errorMessage, icon: 'error' }, []);
    }
  } catch (error) {
      console.error("❌ Erro ao atualizar ordem de serviço:", error);
      this.notificationService.hideLoading();
      await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro de comunicação ao salvar.', icon: 'error' }, []);
    }
  }

async revertChanges(): Promise<void> {
    const result = await this.uiInteractionService.showSweetAlert({
      title: 'Descartar Alterações?',
      text: 'Tem certeza que deseja cancelar? Todas as alterações feitas serão perdidas.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, descartar',
      cancelButtonText: 'Não'
    }, []);

    if (result.isConfirmed) {
      console.log('🚮 Revertendo alterações...');

      this.services = JSON.parse(this.initialState.services);
      this.observations = this.initialState.observations;
      this.discount = this.initialState.discount;
      this.currentStatus = this.initialState.status;

      this.calculateTotals();
      this.checkForChanges();
      
      this.notificationService.showToast('Alterações descartadas.', 'info');
    }
  }

  async cancelAndExit(): Promise<void> {
  if (this.hasChanges) {
    const result = await this.uiInteractionService.showSweetAlert({
      title: 'Sair sem Salvar?',
      text: 'Você tem alterações não salvas. Deseja sair mesmo assim?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Não'
    }, []);
    if (!result.isConfirmed) {
      return;
    }
  }
  this.router.navigate(["/apps/service-orders"]);
}

  /**
   * Gera um PDF da ordem de serviço com layout moderno e profissional
   */
  // generatePdfOrder(): void {
  //   if (!this.serviceOrder) {
  //     this.notificationService.showMessage('Nenhuma ordem de serviço carregada', 'error');
  //     return;
  //   }

  //   console.log('📄 Gerando PDF da ordem de serviço:', this.orderId);

  //   const docDefinition: any = {
  //     pageSize: 'A4',
  //     pageMargins: [40, 40, 40, 40],

  //     content: [
  //       // Cabeçalho - Logo e Data
  //       {
  //         columns: [
  //           // Logo e nome da empresa (esquerda)
  //           {
  //             width: 'auto',
  //             stack: [
  //               {
  //                 columns: [
  //                   {
  //                     width: 'auto',
  //                     canvas: [
  //                       {
  //                         type: 'rect',
  //                         x: 0,
  //                         y: 0,
  //                         w: 25,
  //                         h: 25,
  //                         r: 12.5,
  //                         color: '#000000'
  //                       }
  //                     ],
  //                     margin: [0, 0, 10, 0]
  //                   },
  //                   {
  //                     width: '*',
  //                     stack: [
  //                       {
  //                         text: 'Jackson Mecanico',
  //                         style: 'companyName'
  //                       },
  //                       {
  //                         text: 'excelencia em serviços automecanicos',
  //                         style: 'companyTagline',
  //                         margin: [0, 2, 0, 0]
  //                       }
  //                     ]
  //                   }
  //                 ]
  //               }
  //             ]
  //           },
  //           // Data (direita)
  //           {
  //             width: '*',
  //             text: `Data: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
  //             style: 'dateText',
  //             alignment: 'right'
  //           }
  //         ],
  //         margin: [0, 0, 0, 30]
  //       },

  //       // Título e Número da OS
  //       {
  //         columns: [
  //           // Título
  //           {
  //             width: 'auto',
  //             text: 'Ordem de Serviço',
  //             style: 'documentTitle'
  //           },
  //           // Espaço vazio para empurrar o bloco para a direita
  //           { width: '*', text: '' },
  //           // Bloco do número da OS alinhado à direita
  //           {
  //             width: 'auto',
  //             stack: [
  //               {
  //                 text: 'Orçamento N.',
  //                 style: 'orderLabel',
  //                 alignment: 'right'
  //               },
  //               {
  //                 text: `#${this.orderId.toString().padStart(8, '0')}`,
  //                 style: 'orderNumber',
  //                 alignment: 'center'
  //               }
  //             ],
  //             background: '#F5F5F5',
  //             margin: [0, 0, 0, 0]
  //           }
  //         ],
  //         margin: [0, 0, 0, 40]
  //       },

  //       // Informações do Cliente
  //       {
  //         stack: [
  //           {
  //             text: 'Orçamento para:',
  //             style: 'clientSectionTitle',
  //             margin: [0, 0, 0, 10]
  //           },
  //           {
  //             text: this.customerData?.name || 'N/A',
  //             style: 'clientName',
  //             margin: [0, 0, 0, 15]
  //           },
  //           {
  //             text: `Tel:${this.customerData?.phone || 'N/A'} - Email: ${this.customerData?.email || 'N/A'}`,
  //             style: 'clientContact',
  //             margin: [0, 0, 0, 30]
  //           }
  //         ]
  //       },

  //       // Tabela de Serviços
  //       {
  //         table: {
  //           widths: ['*', '15%', '10%', '15%'],
  //           headerRows: 1,
  //           body: [
  //             [
  //               { text: 'Descrição do serviço', style: 'tableHeader', border: [false, false, false, false] },
  //               { text: 'Valor', style: 'tableHeader', alignment: 'right', border: [false, false, false, false] },
  //               { text: 'Quant.', style: 'tableHeader', alignment: 'center', border: [false, false, false, false] },
  //               { text: 'Sub. Total', style: 'tableHeader', alignment: 'right', border: [false, false, false, false] }
  //             ],
  //             ...this.services.map((service, index) => [
  //               { text: service.name, style: 'tableCell', border: [false, false, false, false] },
  //               { text: this.formatCurrency(service.price), style: 'tableCell', alignment: 'right', border: [false, false, false, false] },
  //               { text: service.quantity.toString(), style: 'tableCell', alignment: 'center', border: [false, false, false, false] },
  //               { text: this.formatCurrency(service.total), style: 'tableCell', alignment: 'right', border: [false, false, false, false] }
  //             ])
  //           ]
  //         },
  //         layout: {
  //           fillColor: (rowIndex: number) => (rowIndex === 0 ? '#E0E0E0' : '#FFFFFF'),
  //           hLineWidth: () => 0,
  //           vLineWidth: () => 0,
  //           paddingLeft: () => 15,
  //           paddingRight: () => 15,
  //           paddingTop: () => 12,
  //           paddingBottom: () => 12
  //         },
  //         margin: [0, 0, 0, 30]
  //       },

  //       // Resumo dos Valores
  //       {
  //         columns: [
  //           { width: '*', text: '' },
  //           {
  //             width: 200,
  //             stack: [
  //               {
  //                 columns: [
  //                   { text: 'Subtotal', style: 'summaryLabel', alignment: 'left', width: '*' },
  //                   { text: this.formatCurrency(this.subtotal), style: 'summaryValue', alignment: 'right', width: 'auto' }
  //                 ],
  //                 margin: [0, 0, 0, 8]
  //               },
  //               {
  //                 columns: [
  //                   { text: 'Desconto (10%)', style: 'summaryLabel', alignment: 'left', width: '*' },
  //                   { text: this.formatCurrency(this.discount), style: 'summaryValue', alignment: 'right', width: 'auto' }
  //                 ],
  //                 margin: [0, 0, 0, 8]
  //               },
  //               {
  //                 columns: [
  //                   { text: 'TOTAL', style: 'summaryLabelFinal', alignment: 'left', width: '*' },
  //                   { text: this.formatCurrency(this.total), style: 'summaryValueFinal', alignment: 'right', width: 'auto' }
  //                 ]
  //               }
  //             ]
  //           }
  //         ],
  //         margin: [0, 0, 0, 40]
  //       },

  //       // Rodapé com informações completas
  //       {
  //         stack: [
  //           // Barra cinza do rodapé
  //           {
  //             columns: [
  //               // Método de pagamento (esquerda)
  //               {
  //                 width: '25%',
  //                 stack: [
  //                   {
  //                     text: 'Metodo de pagamento',
  //                     style: 'footerTitle',
  //                     margin: [0, 0, 0, 8]
  //                   },
  //                   {
  //                     text: 'Cartão de credito',
  //                     style: 'footerText',
  //                     margin: [0, 0, 0, 2]
  //                   },
  //                   {
  //                     text: 'Parcelado 3x',
  //                     style: 'footerText'
  //                   }
  //                 ]
  //               },
  //               // Agradecimento e site (centro-esquerda)
  //               {
  //                 width: '35%',
  //                 stack: [
  //                   {
  //                     text: 'Obrigado por utilizar os nossos serviços',
  //                     style: 'thankYouMessage',
  //                     margin: [0, 0, 0, 8]
  //                   },
  //                   {
  //                     text: 'www.oficinadojackson.com.br',
  //                     style: 'websiteText'
  //                   }
  //                 ]
  //               },
  //               // Termos e condições (centro-direita)
  //               {
  //                 width: '25%',
  //                 stack: [
  //                   {
  //                     text: 'Termos & Condições',
  //                     style: 'footerTitle',
  //                     margin: [0, 0, 0, 8]
  //                   },
  //                   {
  //                     text: 'Serviços executados conforme especificação técnica.',
  //                     style: 'footerText',
  //                     margin: [0, 0, 0, 2]
  //                   },
  //                   {
  //                     text: 'Garantia de 90 dias para peças e serviços',
  //                     style: 'footerText'
  //                   }
  //                 ]
  //               },
  //               // Endereço (direita)
  //               {
  //                 width: '15%',
  //                 stack: [
  //                   {
  //                     canvas: [
  //                       {
  //                         type: 'rect',
  //                         x: 0,
  //                         y: 0,
  //                         w: 120,
  //                         h: 60,
  //                         r: 5,
  //                         color: '#666666'
  //                       },
  //                       {
  //                         type: 'text',
  //                         text: '📍',
  //                         x: 8,
  //                         y: 8,
  //                         fontSize: 12,
  //                         color: '#ffffff'
  //                       },
  //                       {
  //                         type: 'text',
  //                         text: 'Rua das Oficinas, 123',
  //                         x: 25,
  //                         y: 8,
  //                         fontSize: 9,
  //                         color: '#ffffff'
  //                       },
  //                       {
  //                         type: 'text',
  //                         text: 'Centro, São Paulo - SP',
  //                         x: 25,
  //                         y: 20,
  //                         fontSize: 9,
  //                         color: '#ffffff'
  //                       },
  //                       {
  //                         type: 'text',
  //                         text: '01234-567',
  //                         x: 25,
  //                         y: 32,
  //                         fontSize: 9,
  //                         color: '#ffffff'
  //                       },
  //                       {
  //                         type: 'text',
  //                         text: 'Brasil',
  //                         x: 25,
  //                         y: 44,
  //                         fontSize: 9,
  //                         color: '#ffffff'
  //                       }
  //                     ]
  //                   }
  //                 ]
  //               }
  //             ],
  //             background: '#E0E0E0',
  //             margin: [0, 0, 0, 0]
  //           }
  //         ]
  //       }
  //     ],

  //     // Estilos exatos da imagem
  //     styles: {
  //       companyName: {
  //         fontSize: 14,
  //         bold: true,
  //         color: '#333333'
  //       },
  //       companyTagline: {
  //         fontSize: 9,
  //         color: '#666666'
  //       },
  //       dateText: {
  //         fontSize: 10,
  //         color: '#333333'
  //       },
  //       documentTitle: {
  //         fontSize: 28,
  //         bold: true,
  //         color: '#333333',
  //         margin: [0, 20, 0, 0]
  //       },
  //       orderLabel: {
  //         fontSize: 9,
  //         color: '#333333',
  //         margin: [15, 8, 15, 0]
  //       },
  //       orderNumber: {
  //         fontSize: 28,
  //         bold: true,
  //         color: '#333333',
  //         margin: [15, 0, 15, 8]
  //       },
  //       clientSectionTitle: {
  //         fontSize: 10,
  //         color: '#333333'
  //       },
  //       clientName: {
  //         fontSize: 24,
  //         bold: true,
  //         color: '#333333'
  //       },
  //       clientContact: {
  //         fontSize: 10,
  //         color: '#333333'
  //       },
  //       tableHeader: {
  //         fontSize: 10,
  //         bold: true,
  //         color: '#333333'
  //       },
  //       tableCell: {
  //         fontSize: 10,
  //         color: '#333333'
  //       },
  //       summaryLabel: {
  //         fontSize: 10,
  //         color: '#333333'
  //       },
  //       summaryValue: {
  //         fontSize: 10,
  //         color: '#333333'
  //       },
  //       summaryLabelFinal: {
  //         fontSize: 10,
  //         bold: true,
  //         color: '#333333'
  //       },
  //       summaryValueFinal: {
  //         fontSize: 10,
  //         bold: true,
  //         color: '#333333'
  //       },
  //       footerTitle: {
  //         fontSize: 10,
  //         bold: true,
  //         color: '#333333'
  //       },
  //       footerText: {
  //         fontSize: 10,
  //         color: '#333333'
  //       },
  //       thankYouMessage: {
  //         fontSize: 20,
  //         bold: true,
  //         color: '#333333'
  //       },
  //       websiteText: {
  //         fontSize: 10,
  //         color: '#333333'
  //       }
  //     }
  //   };

  //   // Gera e faz download do PDF
  //   const fileName = `OS_${this.orderId.toString().padStart(6, '0')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;

  //   pdfMake.createPdf(docDefinition).download(fileName);

  // }

  generatePdfOrder(): void {
    if (!this.serviceOrder) {
      this.notificationService.showMessage(
        "Nenhuma ordem de serviço carregada",
        "error"
      );
      return;
    }

    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [50, 50, 50, 50],
      content: [
        this.buildHeaderSection(),
        this.buildTitleSection(),
        this.buildCustomerSection(),
        this.buildServiceTable(),
        this.buildTotalsSection(),
        this.buildFooterSection1(),
        this.buildFooterSection2(),
      ],
      styles: this.buildStyles(),
    };

    const fileName = `OS_${this.orderId
      .toString()
      .padStart(6, "0")}_${new Date()
      .toLocaleDateString("pt-BR")
      .replace(/\//g, "-")}.pdf`;
    pdfMake.createPdf(docDefinition).download(fileName);
  }

  private buildHeaderSection() {
    return {
      columns: [
        {
          stack: [
            { text: "Jackson Mecanico", style: "companyName" },
            {
              text: "excelência em serviços automecânicos",
              style: "companyTagline",
            },
          ],
        },
        {
          text: `Data: ${new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}`,
          alignment: "right",
          style: "dateText",
        },
      ],
      margin: [0, 0, 0, 25],
    };
  }

  private buildTitleSection() {
    return {
      columns: [
        { text: "Ordem de Serviço", style: "documentTitle", width: "*" },
        {
          width: "auto",
          stack: [
            { text: "Orçamento N.", style: "orderLabel", alignment: "right" },
            {
              text: `#${this.orderId.toString().padStart(8, "0")}`,
              style: "orderNumber",
              alignment: "center",
            },
          ],
        },
      ],
      margin: [0, 0, 0, 35],
    };
  }

  private buildCustomerSection() {
    return {
      stack: [
        { text: "Orçamento para:", style: "clientSectionTitle" },
        {
          text: this.customerData?.name || "N/A",
          style: "clientName",
          margin: [0, 5, 0, 10],
        },
        {
          text: `Tel: ${this.customerData?.phone || "N/A"}   -   Email: ${
            this.customerData?.email || "N/A"
          }`,
          style: "clientContact",
        },
      ],
      margin: [0, 0, 0, 30],
    };
  }

  private buildServiceTable(): any {
    return {
      table: {
        headerRows: 1,
        widths: ["*", "15%", "10%", "20%"],
        body: [
          [
            { text: "Descrição do serviço", style: "tableHeader" },
            { text: "Valor", style: "tableHeader", alignment: "right" },
            { text: "Quant.", style: "tableHeader", alignment: "center" },
            { text: "Sub. Total", style: "tableHeader", alignment: "right" },
          ],
          ...this.services.map((service) => [
            { text: service.name, style: "tableCell" },
            {
              text: this.formatCurrency(service.price),
              style: "tableCell",
              alignment: "right",
            },
            {
              text: service.quantity.toString(),
              style: "tableCell",
              alignment: "center",
            },
            {
              text: this.formatCurrency(service.total),
              style: "tableCell",
              alignment: "right",
            },
          ]),
        ],
      },
      layout: {
        fillColor: (i: number) => (i === 0 ? "#eaeaea" : null),
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 8,
        paddingBottom: () => 8,
      },
      margin: [0, 0, 0, 25],
    };
  }

  private buildTotalsSection(): any {
    return {
      columns: [
        { width: "*", text: "" }, // espaço à esquerda
        {
          width: 200,
          stack: [
            {
              columns: [
                { text: "Subtotal", style: "summaryLabel" },
                {
                  text: this.formatCurrency(this.subtotal),
                  style: "summaryValue",
                  alignment: "right",
                },
              ],
              margin: [0, 0, 0, 8],
            },
            {
              columns: [
                { text: "Desconto (10%)", style: "summaryLabel" },
                {
                  text: this.formatCurrency(this.discount),
                  style: "summaryValue",
                  alignment: "right",
                },
              ],
              margin: [0, 0, 0, 8],
            },
            {
              columns: [
                { text: "TOTAL", style: "summaryLabelFinal" },
                {
                  text: this.formatCurrency(this.total),
                  style: "summaryValueFinal",
                  alignment: "right",
                },
              ],
            },
          ],
        },
      ],
      margin: [0, 0, 0, 40],
    };
  }

  private buildFooterSection1(): any {
    return {
      table: {
        widths: ["50%", "50%"],
        body: [
          [
            {
              stack: [
                { text: "Método de pagamento", style: "footerTitle" },
                { text: "Cartão de crédito", style: "footerText" },
                { text: "Parcelado 3x", style: "footerText" },
              ],
            },
            {
              stack: [
                { text: "Termos & Condições", style: "footerTitle" },
                {
                  text: "Serviços executados conforme especificação técnica.",
                  style: "footerText",
                },
                {
                  text: "Garantia de 90 dias para peças e serviços",
                  style: "footerText",
                },
              ],
            },
          ],
        ],
      },
      layout: {
        fillColor: () => "#E0E0E0",
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 20,
        paddingRight: () => 20,
        paddingTop: () => 10,
        paddingBottom: () => 10,
      },
      margin: [0, 20, 0, 0],
      unbreakable: true,
    };
  }

  private buildFooterSection2(): any {
    return {
      table: {
        widths: ["60%", "40%"],
        body: [
          [
            {
              stack: [
                {
                  text: "Obrigado por utilizar\nos nossos serviços",
                  style: "thankYouMessageLeft",
                },
                {
                  text: "www.oficinadojackson.com.br",
                  style: "websiteTextLeft",
                  margin: [0, 5, 0, 0],
                },
              ],
            },
            {
              stack: [
                { text: "📍 Rua das Oficinas, 123", style: "footerTextWhite" },
                {
                  text: "Centro, São Paulo - SP 01234-567",
                  style: "footerTextWhite",
                },
                { text: "Brasil", style: "footerTextWhite" },
              ],
            },
          ],
        ],
      },
      layout: {
        fillColor: () => "#4D4D4D",
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 20,
        paddingRight: () => 20,
        paddingTop: () => 15,
        paddingBottom: () => 15,
      },
      margin: [0, 0, 0, 0],
      unbreakable: true,
    };
  }
  

  private buildStyles(): any {
    return {
      // Cabeçalho
      companyName: {
        fontSize: 14,
        bold: true,
        color: "#000000",
      },
      companyTagline: {
        fontSize: 9,
        color: "#555555",
      },
      dateText: {
        fontSize: 10,
        color: "#333333",
      },

      // Título da OS
      documentTitle: {
        fontSize: 26,
        bold: true,
        color: "#000000",
      },
      orderLabel: {
        fontSize: 9,
        color: "#333333",
        margin: [0, 0, 0, 3],
      },
      orderNumber: {
        fontSize: 22,
        bold: true,
        color: "#000000",
      },

      // Cliente
      clientSectionTitle: {
        fontSize: 10,
        color: "#333333",
      },
      clientName: {
        fontSize: 22,
        bold: true,
        color: "#000000",
      },
      clientContact: {
        fontSize: 10,
        color: "#333333",
      },

      // Tabela de serviços
      tableHeader: {
        fontSize: 10,
        bold: true,
        color: "#000000",
      },
      tableCell: {
        fontSize: 10,
        color: "#000000",
      },

      // Totais
      summaryLabel: {
        fontSize: 10,
        color: "#000000",
        margin: [0, 2, 0, 2],
      },
      summaryValue: {
        fontSize: 10,
        color: "#000000",
        margin: [0, 2, 0, 2],
      },
      summaryLabelFinal: {
        fontSize: 11,
        bold: true,
        color: "#000000",
        margin: [0, 3, 0, 0],
      },
      summaryValueFinal: {
        fontSize: 11,
        bold: true,
        color: "#000000",
        margin: [0, 3, 0, 0],
      },

      // Rodapé
      footerTitle: {
        fontSize: 10,
        bold: true,
        color: "#000000",
        margin: [0, 0, 0, 4],
      },
      footerText: {
        fontSize: 9,
        color: "#000000",
      },
      footerTextWhite: {
        fontSize: 9,
        color: "#ffffff",
      },
      thankYouMessage: {
        fontSize: 16,
        bold: true,
        color: "#ffffff",
        alignment: "center",
      },
      websiteText: {
        fontSize: 10,
        color: "#ffffff",
        alignment: "center",
      },
      thankYouMessageLeft: {
        fontSize: 16,
        bold: true,
        color: '#ffffff',
        alignment: 'left'
      },
      websiteTextLeft: {
        fontSize: 10,
        color: '#ffffff',
        alignment: 'left'
      }      
    };
  }

  /**
   * Retorna o label do status
   */
  public getStatusLabel(status: string): string {
    const statusItem = this.statusList.find((s) => s.value === status);
    return statusItem ? statusItem.label : "Desconhecido";
  }

  /**
   * Retorna a cor de fundo baseada no status
   */
  private getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      [ServiceOrderStatus.ORCAMENTO]: "#f39c12",
      [ServiceOrderStatus.EM_ANDAMENTO]: "#3498db",
      [ServiceOrderStatus.CONCLUIDO]: "#27ae60",
      [ServiceOrderStatus.CANCELADO]: "#e74c3c",
    };
    return colorMap[status] || "#95a5a6";
  }

  /**
   * Formata valor para moeda brasileira
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }
}
