import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { NotificationService } from 'src/app/shared/services/notification.service';

interface Product {
  id: number; 
  name: string; 
  description: string; 
  price: number; 
  imageUrl: string;
  brand: string; 
  model: string; 
  year: number;
  quantityToAdd: number;
}

interface CartItem extends Product {
  quantity: number;
}
@Component({
  selector: 'app-products',
  templateUrl: './partners-products.component.html',
  styleUrls: ['./partners-products.component.scss']
})
export class PartnersProductsComponent implements OnInit, AfterViewInit  {

  partnerId: number | null = null;
  partnerName: string | null = null;
  isLoading: boolean = true;
  private allProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  totalRecords: number = 0;
  page: number = 1;
  pageSize: number = 8;
  availablePageSizes: number[] = [4, 8, 12, 16, 20];
  startIndex: number = 0;
  endIndex: number = 0;
  availableBrands: string[] = [];
  availableModels: string[] = [];
  availableYears: number[] = [];
  filters = { 
    brand: '', 
    model: '', 
    year: '' 
  };
  cart: CartItem[] = [];
  subTotal: number = 0;
  total: number = 0;
  searchTerm: string = '';
  totalCartItems: number = 0;

  @ViewChild('confirmationModal', { static: false }) confirmationModal!: TemplateRef<any>;
  @ViewChild('deleteConfirmationModal', { static: false }) deleteConfirmationModal!: TemplateRef<any>;
  itemToDelete: CartItem | null = null;
  itemToDeleteIndex: number = -1;

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private metroMenuService: MetroMenuService,
    private modalService: NgbModal, 
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.partnerId = params['partnerId'] ? +params['partnerId'] : null;
      this.partnerName = params['partnerName'] || 'Parceiro não identificado';
      if (this.partnerId) { this.loadInitialMockData(); } else { this.isLoading = false; }
    });
  }

  ngAfterViewInit(): void {
    this.metroMenuService.setButtons(this.menuButtons);
  }
  
  loadInitialMockData(): void {
    this.allProducts = [
        { id: 101, name: 'Caixa de direção', description: 'para Honda civic 2017', price: 1900.00, imageUrl: 'assets/images/Foto-de-perfil.jpg', brand: 'HONDA', model: 'CIVIC', year: 2017, quantityToAdd: 1 },
        { id: 102, name: 'Filtro de Ar', description: 'para Fiat Uno 2015', price: 75.50, imageUrl: 'assets/images/bg-auth_old.jpg', brand: 'FIAT', model: 'UNO', year: 2015, quantityToAdd: 1 },
        { id: 103, name: 'Vela de Ignição', description: 'para VW Gol G5', price: 120.00, imageUrl: 'assets/images/bg-auth.jpg', brand: 'VW', model: 'GOL', year: 2010, quantityToAdd: 1 },
        { id: 104, name: 'Amortecedor Dianteiro', description: 'para Honda civic 2018', price: 800.00, imageUrl: 'assets/images/logo-sm-light.png', brand: 'HONDA', model: 'CIVIC', year: 2018, quantityToAdd: 1 },
        { id: 105, name: 'Bomba de Combustível', description: 'para VW Gol G5', price: 250.00, imageUrl: 'assets/images/Foto-de-perfil.jpg', brand: 'VW', model: 'GOL', year: 2010, quantityToAdd: 1 },
        { id: 106, name: 'Correia Dentada', description: 'para Fiat Uno 2016', price: 95.00, imageUrl: 'assets/images/bg-auth_old.jpg', brand: 'FIAT', model: 'UNO', year: 2016, quantityToAdd: 1 },
        { id: 107, name: 'Pastilha de Freio', description: 'para Honda Fit 2019', price: 180.00, imageUrl: 'assets/images/bg-auth.jpg', brand: 'HONDA', model: 'FIT', year: 2019, quantityToAdd: 1 },
        { id: 108, name: 'Óleo de Motor 5W30', description: 'Sintético', price: 55.00, imageUrl: 'assets/images/logo-sm-light.png', brand: 'MOBIL', model: 'GERAL', year: 2023, quantityToAdd: 1 },
        { id: 109, name: 'Pneu Aro 15', description: '195/65R15', price: 400.00, imageUrl: 'assets/images/Foto-de-perfil.jpg', brand: 'PIRELLI', model: 'GERAL', year: 2023, quantityToAdd: 1 },
        { id: 110, name: 'Bateria 60Ah', description: '12V', price: 350.00, imageUrl: 'assets/images/bg-auth_old.jpg', brand: 'MOURA', model: 'GERAL', year: 2023, quantityToAdd: 1 },
    ];
    this.populateFilterOptions();
    this.fetchProducts();
  }
  
  fetchProducts(): void {
    this.isLoading = true;
    setTimeout(() => {
      let processedData = [...this.allProducts];

      if (this.searchTerm && this.searchTerm.trim() !== '') {
        const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
        processedData = processedData.filter(p => 
          p.name.toLowerCase().includes(lowerCaseSearchTerm) || 
          p.description.toLowerCase().includes(lowerCaseSearchTerm)
        );
      }

      const filters = this.filters;
      if (filters.brand) { processedData = processedData.filter(p => p.brand === filters.brand); }
      if (filters.model) { processedData = processedData.filter(p => p.model === filters.model); }
      if (filters.year) { processedData = processedData.filter(p => p.year === +filters.year); }

      this.totalRecords = processedData.length;

      const startIndex = (this.page - 1) * this.pageSize;
      this.paginatedProducts = processedData.slice(startIndex, startIndex + this.pageSize);

      this.startIndex = this.totalRecords === 0 ? 0 : startIndex + 1;
      this.endIndex = Math.min(startIndex + this.pageSize, this.totalRecords);

      this.isLoading = false;
    }, 500);
  }

  onSearchTermChange(): void {
    this.page = 1;
    this.fetchProducts();
  }

  onFilterChange(): void {
    this.page = 1;
    this.fetchProducts();
  }

  onPageChange(): void {
    this.fetchProducts();
  }

  onPageSizeChange(): void {
    this.page = 1;
    this.fetchProducts();
  }
  
  populateFilterOptions(): void {
    this.availableBrands = [...new Set(this.allProducts.map(p => p.brand))];
    this.availableModels = [...new Set(this.allProducts.map(p => p.model))];
    this.availableYears = [...new Set(this.allProducts.map(p => p.year))].sort((a, b) => b - a);
  }

  addToCart(product: Product): void {
    const existingItem = this.cart.find(item => item.id === product.id);
    const quantityToAdd = product.quantityToAdd > 0 ? product.quantityToAdd : 1;

    if (existingItem) {
      existingItem.quantity += quantityToAdd;
      const itemIndex = this.cart.indexOf(existingItem);
      if (itemIndex > -1) {
        const [item] = this.cart.splice(itemIndex, 1);
        this.cart.unshift(item);
      }
    } else {
      this.cart.unshift({ ...product, quantity: quantityToAdd });
    }

    product.quantityToAdd = 1;
    this.calculateSummary();
    
    this.notificationService.showToast(
      `${quantityToAdd}x ${product.name} adicionado(s) ao orçamento!`, 
      'success'
    );
  }

  openDeleteConfirmation(index: number, item: CartItem): void {
    this.itemToDelete = item;
    this.itemToDeleteIndex = index;
    this.metroMenuService.setButtons([]); 
    const modalRef = this.modalService.open(this.deleteConfirmationModal, { centered: true });
    modalRef.result.then(
      () => {
        this.confirmRemoveItem();
      },
      () => {
        this.metroMenuService.setButtons(this.menuButtons);
      }
    );
  }

  async confirmRemoveItem(): Promise<void> {
    if (this.itemToDeleteIndex > -1) {
      const removedItemName = this.itemToDelete?.name;
      this.cart.splice(this.itemToDeleteIndex, 1);
      this.calculateSummary();
      this.itemToDelete = null;
      this.itemToDeleteIndex = -1;
      await this.notificationService.showMessage(`"${removedItemName}" foi removido.`, 'Sucesso');
      this.metroMenuService.setButtons(this.menuButtons);
    } else {
      this.metroMenuService.setButtons(this.menuButtons);
    }
  }

  updateQuantity(index: number, newQuantity: string): void {
    const quantity = parseInt(newQuantity, 10);
    if (quantity > 0) {
      this.cart[index].quantity = quantity;
    } else {
      this.cart.splice(index, 1);
    }
    this.calculateSummary();
  }

  calculateSummary(): void {
    this.subTotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subTotal;
    this.totalCartItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }
  
  openConfirmationModal(): void {
    if (this.cart.length === 0) {
      this.notificationService.showMessage('Seu orçamento está vazio.', 'warning');
      return;
    }
    this.metroMenuService.setButtons([]);
    const modalRef = this.modalService.open(this.confirmationModal, { centered: true });
    
    modalRef.result.then(
      () => {
        this.confirmOrder();
      },
      () => {
        console.log('Modal de pedido descartado:');
        this.metroMenuService.setButtons(this.menuButtons);
      }
    );
  }

  async confirmOrder(): Promise<void> {
    this.notificationService.showMessage('Enviando pedido...', 'Info');

    console.log('--- ENVIANDO PEDIDO PARA A API (SIMULADO) ---');
    console.log('ID do Parceiro:', this.partnerId);
    console.log('Itens do Pedido:', this.cart);
    console.log('Valor Total:', this.total);

    setTimeout(async () => {
      await this.notificationService.showMessage('Pedido enviado com sucesso!', 'success');
      this.resetOrder();
      this.metroMenuService.setButtons(this.menuButtons);
    }, 1500);
  }

  private resetOrder(): void {
    this.cart = [];
    this.calculateSummary();
  }
  
  menuButtons: MetroButton[] = [
    { id: 'exit_to_home', label: 'Sair', iconClass: 'fas fa-sign-out-alt', colorClass: 'exit', visible: true, enabled: true }
  ];
  handleMenuAction(action: string): void { if (action === 'exit_to_home') { this.router.navigate(['/apps/partners']); } }
}