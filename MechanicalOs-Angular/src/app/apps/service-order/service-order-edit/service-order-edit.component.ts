import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { ServiceOrderService } from '../service-order.service';
import { ServiceOrderDraftService, ServiceItem } from '../shared/service-order-draft.service';
import { ServiceOrder } from '../../Shared/models/service-order.model';

@Component({
  selector: 'app-service-order-edit',
  templateUrl: './service-order-edit.component.html',
  styleUrl: './service-order-edit.component.scss'
})
export class ServiceOrderEditComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  serviceOrder: ServiceOrder | null = null;
  orderId: number = 0;
  
  // Dados para exibição (somente leitura)
  customerData: any = null;
  vehicleData: any = null;
  addressData: any = null;
  
  // Dados editáveis
  services: ServiceItem[] = [];
  searchValue: string = '';
  discountCoupon: string = '';
  discount: number = 0;
  subtotal: number = 0;
  total: number = 0;
  observations: string = '';

  // Mock de serviços disponíveis (mesmo do componente de criação)
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
    private route: ActivatedRoute,
    private router: Router,
    private serviceOrderService: ServiceOrderService,
    private draftService: ServiceOrderDraftService
  ) { }

  ngOnInit(): void {
    this.pageTitle = [
      { label: "Ordens de Serviços", path: "/apps/service-orders" },
      { label: "Editar Ordem de Serviço", path: "/", active: true },
    ];

    // Obtém o ID da ordem da rota
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      if (this.orderId) {
        this.loadServiceOrder();
      }
    });
  }

  private loadServiceOrder(): void {
    // Mock data para demonstração - em produção seria uma chamada real à API
    this.loadMockServiceOrder();
  }

  private loadMockServiceOrder(): void {
    // Mock de uma ordem de serviço existente
    this.serviceOrder = {
      id: this.orderId,
      entryDate: new Date('2023-01-15T14:30:00'),
      status: 'EM_ANDAMENTO' as any,
      customer: {
        id: 1,
        name: 'Kleiton Freitas',
        email: 'kleitonsfreitas@gmail.com',
        phone: '(11) 3456-7890',
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
      plate: 'ABC1234',
      totalValue: 1250.00,
      description: 'Revisão completa do veículo',
      observations: 'Cliente relatou ruído no motor'
    };

    // Carrega os dados para exibição
    this.customerData = {
      name: this.serviceOrder.customer.name,
      email: this.serviceOrder.customer.email,
      phone: this.serviceOrder.customer.phone,
      document: this.serviceOrder.customer.document
    };

    this.vehicleData = {
      brand: this.serviceOrder.vehicle.brand,
      model: this.serviceOrder.vehicle.model,
      version: this.serviceOrder.vehicle.version,
      year: this.serviceOrder.vehicle.year,
      color: this.serviceOrder.vehicle.color,
      plate: this.serviceOrder.plate
    };

    this.addressData = {
      city: 'Indaiatuba',
      state: 'SP',
      neighborhood: 'Jardim Bela Vista',
      street: 'Av Ary Barnabé',
      number: '251',
      complement: 'Sem complemento',
      zipCode: '13332-550'
    };

    // Mock de serviços existentes
    this.services = [
      { id: 1, name: 'Troca de filtro de ar condicionado', price: 150.00, quantity: 1, total: 150.00 },
      { id: 2, name: 'Troca de óleo do motor', price: 230.00, quantity: 1, total: 230.00 },
      { id: 3, name: 'Limpeza de bicos injetores', price: 95.00, quantity: 1, total: 95.00 }
    ];

    this.observations = this.serviceOrder.observations || '';
    this.calculateTotals();
    
    console.log('Ordem de serviço carregada para edição:', this.serviceOrder);
  }

  onSearchServices(): void {
    if (this.searchValue && this.searchValue.trim()) {
      console.log(`Buscando serviços: ${this.searchValue}`);
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
  }

  updateServiceQuantity(index: number, quantity: number): void {
    if (quantity > 0) {
      this.services[index].quantity = quantity;
      this.updateServiceTotal(index);
      this.calculateTotals();
    }
  }

  private updateServiceTotal(index: number): void {
    this.services[index].total = this.services[index].price * this.services[index].quantity;
  }

  removeService(index: number): void {
    this.services.splice(index, 1);
    this.calculateTotals();
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
      console.log(`Cupom aplicado: ${this.discountCoupon} - Desconto: R$ ${this.discount.toFixed(2)}`);
    }
  }

  updateObservations(): void {
    // Salva as observações
    console.log('Observações atualizadas:', this.observations);
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

  saveChanges(): void {
    // Salva as alterações
    console.log('Salvando alterações da ordem:', this.orderId);
    console.log('Serviços:', this.services);
    console.log('Desconto:', this.discount);
    console.log('Observações:', this.observations);
    
    // Aqui seria feita a chamada para a API para salvar as alterações
    // this.serviceOrderService.update(this.orderId, updatedData).subscribe(...)
    
    // Navega de volta para a listagem
    this.router.navigate(['/apps/service-orders']);
  }

  cancel(): void {
    if (confirm('Tem certeza que deseja cancelar? As alterações serão perdidas.')) {
      this.router.navigate(['/apps/service-orders']);
    }
  }
}
