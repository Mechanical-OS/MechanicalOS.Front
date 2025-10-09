import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceOrderDraftService, ServiceItem } from '../../shared/service-order-draft.service';

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
  observations: string = '';

  // Mock de serviços disponíveis
  availableServices: ServiceItem[] = [
    { id: 1, name: 'Troca de filtro de ar condicionado', price: 150.00, quantity: 1, total: 150.00 },
    { id: 2, name: 'Troca de óleo do motor', price: 230.00, quantity: 1, total: 230.00 },
    { id: 3, name: 'Limpeza de bicos injetores', price: 95.00, quantity: 1, total: 95.00 },
    { id: 4, name: 'Alinhamento e balanceamento', price: 120.00, quantity: 1, total: 120.00 },
    { id: 5, name: 'Revisão completa', price: 350.00, quantity: 1, total: 350.00 },
    { id: 6, name: 'Troca de pastilhas de freio', price: 180.00, quantity: 1, total: 180.00 },
    { id: 7, name: 'Troca de filtro de óleo', price: 45.00, quantity: 1, total: 45.00 },
    { id: 8, name: 'Troca de velas', price: 85.00, quantity: 1, total: 85.00 }
  ];

  constructor(
    private draftService: ServiceOrderDraftService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Carrega dados existentes se houver
    const currentDraft = this.draftService.getCurrentDraft();
    if (currentDraft.services && currentDraft.services.length > 0) {
      this.services = [...currentDraft.services];
      this.discount = currentDraft.discount;
      this.observations = currentDraft.observations;
      this.calculateTotals();
    }
  }

  onSearchServices(): void {
    if (this.searchValue && this.searchValue.trim()) {
      console.log(`Buscando serviços: ${this.searchValue}`);
      // Aqui seria feita a busca real nos serviços
    }
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

  updateObservations(): void {
    this.draftService.updateObservations(this.observations);
  }

  private saveServices(): void {
    this.draftService.updateServices(this.services);
    console.log('Serviços salvos:', this.services);
  }

  getFilteredServices(): ServiceItem[] {
    if (!this.searchValue || this.searchValue.trim() === '') {
      return this.availableServices;
    }
    
    const searchTerm = this.searchValue.toLowerCase();
    return this.availableServices.filter(service => 
      service.name.toLowerCase().includes(searchTerm) ||
      service.id.toString().includes(searchTerm)
    );
  }

  finalizeOrder(): void {
    // Salva os dados finais
    this.draftService.updateServices(this.services);
    this.draftService.updateDiscount(this.discount);
    this.draftService.updateObservations(this.observations);
    
    // Finaliza a ordem
    this.draftService.finalizeOrder();
    
    // Navega de volta para a listagem
    this.router.navigate(['/apps/service-orders']);
  }
}
