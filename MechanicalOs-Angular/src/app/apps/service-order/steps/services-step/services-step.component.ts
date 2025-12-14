import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceOrderDraftService, ServiceItem } from '../../shared/service-order-draft.service';
import { ServiceOrderService } from '../../service-order.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ServiceService } from '../../../services/service.services';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-services-step',
  templateUrl: './services-step.component.html',
  styleUrl: './services-step.component.scss'
})
export class ServicesStepComponent implements OnInit {
  services: ServiceItem[] = [];
  searchValue: string = '';
  discountCoupon: string = '';
  discount: number = 0;
  subtotal: number = 0;
  total: number = 0;
  description: string = '';
  
  // Resumo dos dados
  draftSummary: { customer: string; vehicle: string; address: string; itemsCount: number } | null = null;
  isReadyToFinalize: boolean = false;
  isFinalizingshowing: boolean = false;

  // Lista de serviços disponíveis (carregados da API)
  availableServices: ServiceItem[] = [];
  isLoadingServices: boolean = false;
  
  // Subject para debounce da busca
  private searchSubject = new Subject<string>();

  constructor(
    private draftService: ServiceOrderDraftService,
    private serviceOrderService: ServiceOrderService,
    private serviceService: ServiceService,
    private notificationService: NotificationService,
    private router: Router
  ) { }


  ngOnInit(): void {
    // Carrega dados existentes se houver
    const currentDraft = this.draftService.getCurrentDraft();
    if (currentDraft.services && currentDraft.services.length > 0) {
      this.services = [...currentDraft.services];
      this.discount = currentDraft.discount;
      this.description = currentDraft.description;
      this.calculateTotals();
    }

    // Carrega resumo dos dados
    this.loadDraftSummary();

    // Verifica se está pronto para finalizar
    this.checkIfReadyToFinalize();
    
    // Configura o debounce para busca
    this.setupSearchDebounce();
  }

  private loadDraftSummary(): void {
    this.draftSummary = this.draftService.getDraftSummary();
  }

  private checkIfReadyToFinalize(): void {
    this.isReadyToFinalize = this.draftService.isReadyToFinalize();
  }

  getCustomerStatusIcon(): string {
    const draft = this.draftService.getCurrentDraft();
    return draft.customer?.exists ? '🔵' : '🟢';
  }

  getCustomerStatusText(): string {
    const draft = this.draftService.getCurrentDraft();
    return draft.customer?.exists ? 'Cliente existente' : 'Novo cliente';
  }

  getVehicleStatusIcon(): string {
    const draft = this.draftService.getCurrentDraft();
    return draft.vehicle?.exists ? '🔵' : '🟢';
  }

  getVehicleStatusText(): string {
    const draft = this.draftService.getCurrentDraft();
    return draft.vehicle?.exists ? 'Veículo existente' : 'Novo veículo';
  }

  getAddressStatusIcon(): string {
    const draft = this.draftService.getCurrentDraft();
    return draft.address?.exists ? '🔵' : '🟢';
  }

  getAddressStatusText(): string {
    const draft = this.draftService.getCurrentDraft();
    return draft.address?.exists ? 'Endereço existente' : 'Novo endereço';
  }

  /**
   * Configura o debounce para busca em tempo real
   */
  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(500), // Aguarda 500ms após o usuário parar de digitar
        distinctUntilChanged() // Só busca se o valor mudou
      )
      .subscribe(searchTerm => {
        // Remove espaços em branco
        const trimmedTerm = searchTerm.trim();
        
        // Se estiver vazio, limpa a lista e não busca
        if (trimmedTerm.length === 0) {
          this.availableServices = [];
          this.isLoadingServices = false;
          console.log('🔍 Campo vazio - lista limpa');
          return;
        }
        
        // Só busca se tiver 3 ou mais caracteres
        if (trimmedTerm.length >= 3) {
          this.searchServicesInAPI(trimmedTerm);
        } else {
          // Se tiver menos de 3 caracteres, limpa a lista
          this.availableServices = [];
          console.log('⚠️ Digite pelo menos 3 caracteres para buscar');
        }
      });
  }

  /**
   * Método chamado quando o usuário digita no campo de busca
   * Dispara automaticamente a busca após 3 caracteres
   */
  onSearchServices(): void {
    console.log(`🔍 Termo de busca alterado: "${this.searchValue}"`);
    this.searchSubject.next(this.searchValue);
  }

  /**
   * Busca serviços na API usando o método findByFilter
   */
  private searchServicesInAPI(searchTerm: string): void {
    this.isLoadingServices = true;
    console.log(`📡 Buscando serviços na API com termo: "${searchTerm}"`);
    
    this.serviceService.findByFilter({ term: searchTerm }).subscribe({
      next: (result) => {
        this.isLoadingServices = false;
        
        if (result.statusCode === 200 && result.content) {
          console.log(`✅ ${result.content.length} serviços encontrados`);
          
          // Mapeia os serviços da API para o formato ServiceItem
          this.availableServices = result.content.map(service => ({
            id: service.id,
            name: service.name,
            price: service.price / 100, // Converte centavos para reais
            quantity: 1,
            total: service.price / 100,
            code: service.code,
            description: service.description
          }));
          
          console.log('Serviços mapeados:', this.availableServices);
        } else {
          console.warn('⚠️ Nenhum serviço encontrado');
          this.availableServices = [];
        }
      },
      error: (error) => {
        this.isLoadingServices = false;
        console.error('❌ Erro ao buscar serviços:', error);
        this.notificationService.showToast('Erro ao buscar serviços. Tente novamente.', 'error');
        this.availableServices = [];
      }
    });
  }

  addService(service: ServiceItem): void {
    const existingServiceIndex = this.services.findIndex(s => s.id === service.id);
    
    if (existingServiceIndex >= 0) {
      // Se o serviço já existe, incrementa a quantidade
      this.services[existingServiceIndex].quantity += 1;
      this.updateServiceTotal(existingServiceIndex);
      
      // Move o serviço para o topo da lista
      const updatedService = this.services.splice(existingServiceIndex, 1)[0];
      this.services.unshift(updatedService);
    } else {
      // Se é um novo serviço, adiciona no início da lista
      const newService = { ...service, quantity: 1, total: service.price };
      this.services.unshift(newService);
    }
    
    this.calculateTotals();
    this.saveServices();
  }

  updateServiceQuantity(index: number, quantity: number): void {
    if (quantity > 0) {
      this.services[index].quantity = quantity;
      this.updateServiceTotal(index);
      this.calculateTotals();
      this.saveServices();
    }
  }

  private updateServiceTotal(index: number): void {
    this.services[index].total = this.services[index].price * this.services[index].quantity;
  }

  removeService(index: number): void {
    this.services.splice(index, 1);
    this.calculateTotals();
    this.saveServices();
  }

  private calculateTotals(): void {
    this.subtotal = this.services.reduce((sum, service) => sum + service.total, 0);
    this.total = this.subtotal - this.discount;
  }

  applyDiscountCoupon(): void {
    if (this.discountCoupon && this.discountCoupon.trim()) {
      // Simula aplicação de cupom de desconto
      if (this.discountCoupon.toUpperCase() === 'DESCONTO10') {
        this.discount = this.subtotal * 0.1; // 10% de desconto
      } else if (this.discountCoupon.toUpperCase() === 'DESCONTO20') {
        this.discount = this.subtotal * 0.2; // 20% de desconto
      } else {
        this.discount = 150.00; // Desconto fixo para outros cupons
      }
      
      this.calculateTotals();
      this.draftService.updateDiscount(this.discount);
      console.log(`Cupom aplicado: ${this.discountCoupon} - Desconto: R$ ${this.discount.toFixed(2)}`);
    }
  }

  updateDescription(): void {
    this.draftService.updateDescription(this.description);
  }

  private saveServices(): void {
    this.draftService.updateServices(this.services);
    console.log('Serviços salvos:', this.services);
  }


  async finalizeOrder(): Promise<void> {
    // Verifica se tem os dados mínimos
    if (!this.isReadyToFinalize) {
      this.notificationService.showToast('Preencha todos os dados obrigatórios antes de finalizar', 'warning');
      return;
    }

    if (this.services.length === 0) {
      this.notificationService.showToast('Adicione pelo menos um serviço antes de finalizar', 'warning');
      return;
    }

    // Confirma a finalização
    if (!confirm('Deseja finalizar a ordem de serviço? Todos os dados serão salvos.')) {
      return;
    }

    try {
      this.isFinalizingshowing = true;

      // Salva os dados finais no draft
      this.draftService.updateServices(this.services);
      this.draftService.updateDiscount(this.discount);
      this.draftService.updateDescription(this.description);

      // Obtém o draft atualizado
      const draft = this.draftService.getCurrentDraft();

      // Cria a ordem de serviço completa (Customer → Address → Vehicle → Order)
      const result = await this.serviceOrderService.createCompleteServiceOrder(draft);

      if (result.statusCode === 200) {
        this.notificationService.showSuccess(result);
        
        // Limpa o draft
        this.draftService.createNewDraft();
        
        // Navega de volta para a listagem
        this.router.navigate(['/apps/service-orders']);
      } else {
        throw new Error(result.message || 'Erro ao criar ordem de serviço');
      }

    } catch (error: any) {
      console.error('Erro ao finalizar ordem:', error);
      this.notificationService.showError(error);
    } finally {
      this.isFinalizingshowing = false;
    }
  }
}
