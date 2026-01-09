import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceOrderDraftService, ServiceItem } from '../../shared/service-order-draft.service';
import { ServiceOrderService } from '../../service-order.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ServiceService } from '../../../services/service.services';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { UiInteractionService } from 'src/app/shared/services/ui-interaction.service';

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
  
  // Subject para debounce da busca
  private searchSubject = new Subject<string>();

  constructor(
    private draftService: ServiceOrderDraftService,
    private serviceOrderService: ServiceOrderService,
    private serviceService: ServiceService,
    private notificationService: NotificationService,
    private router: Router,
    private uiInteractionService: UiInteractionService
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

      this.draftService.draft$.subscribe(draft => {
      this.draftSummary = this.draftService.getDraftSummary();
      this.isReadyToFinalize = this.draftService.isReadyToFinalize();
    });
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

  onSearchError(error: any): void {
    console.error('❌ Erro retornado pelo componente de busca:', error);
    this.notificationService.showToast('Erro ao buscar serviços. Tente novamente.', 'error');
  }

  /**
   * Método chamado quando o usuário digita no campo de busca
   * Dispara automaticamente a busca após 3 caracteres
   */
  onSearchServices(): void {
    console.log(`🔍 Termo de busca alterado: "${this.searchValue}"`);
    this.searchSubject.next(this.searchValue);
  }

  addService(service: ServiceItem): void {
    const existingServiceIndex = this.services.findIndex(s => s.id === service.id);
    
    if (existingServiceIndex >= 0) {
      this.services[existingServiceIndex].quantity += service.quantity;
      this.updateServiceTotal(existingServiceIndex);
      const updatedService = this.services.splice(existingServiceIndex, 1)[0];
      this.services.unshift(updatedService);
    } else {
      const newService = { ...service, total: service.price * service.quantity };
      this.services.unshift(newService);
    }
    
    this.calculateTotals();
    this.saveServices();
    this.notificationService.showToast(`${service.quantity}x ${service.name} adicionado(s)!`, 'success');
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
      this.saveServices();
      this.notificationService.showToast(`"${serviceToRemove.name}" foi removido.`, 'success');
    }
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
    if (!this.isReadyToFinalize) {
      await this.uiInteractionService.showSweetAlert({
        title: 'Atenção',
        text: 'Preencha todos os dados obrigatórios nas etapas anteriores antes de finalizar.',
        icon: 'warning'
      }, []);
      return;
    }

    if (this.services.length === 0) {
      await this.uiInteractionService.showSweetAlert({
        title: 'Atenção',
        text: 'Adicione pelo menos um serviço antes de finalizar.',
        icon: 'warning'
      }, []);
      return;
    }

    const result = await this.uiInteractionService.showSweetAlert({
      title: 'Finalizar Ordem de Serviço?',
      text: 'Todos os dados serão salvos e a O.S. será criada.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, finalizar!',
      cancelButtonText: 'Não'
    }, []);

    if (result.isConfirmed) {
      this.isFinalizingshowing = true;
      try {
        this.draftService.updateServices(this.services);
        this.draftService.updateDiscount(this.discount);
        this.draftService.updateDescription(this.description);
        const draft = this.draftService.getCurrentDraft();
        
        const apiResult: any = await this.serviceOrderService.createCompleteServiceOrder(draft);

        if (apiResult.statusCode === 200) {
          await this.uiInteractionService.showSweetAlert({ title: 'Sucesso!', text: 'Ordem de Serviço criada com sucesso.', icon: 'success' }, []);
          this.draftService.createNewDraft();
          this.router.navigate(['/apps/service-orders']);
        } else {
          throw new Error(apiResult.message || 'Erro ao criar ordem de serviço');
        }
      } catch (error: any) {
        console.error('Erro ao finalizar ordem:', error);
        await this.uiInteractionService.showSweetAlert({ title: 'Erro!', text: error.message || 'Não foi possível finalizar a ordem.', icon: 'error' }, []);
      } finally {
        this.isFinalizingshowing = false;
      }
    }
  }
}
