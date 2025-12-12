import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PartnersService } from '../partners.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  brand: string;   
  model: string;   
  year: number; 
}

@Component({
  selector: 'app-products',
  templateUrl: './partners-products.component.html',
  styleUrls: ['./partners-products.component.scss']
})
export class PartnersProductsComponent implements OnInit, AfterViewInit  {

  partnerId: number | null = null;
  partnerName: string | null = null;
  
  loading: boolean = true;
  products: Product[] = [];
  allProducts: Product[] = [];
  filteredProducts: Product[] = []; 
  
  availableBrands: string[] = [];
  availableModels: string[] = [];
  availableYears: number[] = [];

  filters = {
    brand: '',
    model: '',
    year: ''
  }

  cart: Product[] = [];
  subTotal: number = 0;
  discount: number = 0;
  taxes: number = 0;
  total: number = 0;

  menuButtons: MetroButton[] = [
    {
      id: 'exit_to_home',
      label: 'Sair',
      iconClass: 'fas fa-sign-out-alt',
      colorClass: 'exit',
      visible: true,
      enabled: true
    }
  ];

  @ViewChild('confirmationModal', { static: false }) confirmationModal!: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private metroMenuService: MetroMenuService,
    private modalService: NgbModal, 
    private notificationService: NotificationService, 
    private partnersService: PartnersService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.partnerId = params['partnerId'] ? +params['partnerId'] : null;
      this.partnerName = params['partnerName'] || 'Parceiro não identificado';

      if (this.partnerId) {
        this.loadProducts(this.partnerId);
      } else {
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.metroMenuService.setButtons(this.menuButtons);
  }

  handleMenuAction(action: string): void {
    if (action === 'exit_to_home') {
      this.router.navigate(['/apps/partners']);
    }
  }

  loadProducts(partnerId: number): void {
    this.loading = true;
    console.log(`Buscando produtos para o parceiro com ID: ${partnerId}`);
    
    setTimeout(() => {
      this.allProducts = [
        { id: 101, name: 'Caixa de direção', description: 'para Honda civic 2017 modelo 2020', price: 1900.00, imageUrl: 'assets/images/Foto-de-perfil.jpg', brand: 'HONDA', model: 'CIVIC', year: 2017 },
        { id: 102, name: 'Filtro de Ar', description: 'para Fiat Uno 2015', price: 75.50, imageUrl: 'assets/images/bg-auth_old.jpg', brand: 'FIAT', model: 'UNO', year: 2015 },
        { id: 103, name: 'Vela de Ignição', description: 'para VW Gol G5', price: 120.00, imageUrl: 'assets/images/bg-auth.jpg', brand: 'VW', model: 'GOL', year: 2010 },
        { id: 104, name: 'Amortecedor Dianteiro', description: 'para Honda civic 2018', price: 800.00, imageUrl: 'assets/images/logo-sm-light.png', brand: 'HONDA', model: 'CIVIC', year: 2018 },
        { id: 101, name: 'Caixa de direção', description: 'para Honda civic 2017 modelo 2020', price: 1900.00, imageUrl: 'assets/images/Foto-de-perfil.jpg', brand: 'HONDA', model: 'CIVIC', year: 2017 },
        { id: 102, name: 'Filtro de Ar', description: 'para Fiat Uno 2015', price: 75.50, imageUrl: 'assets/images/bg-auth_old.jpg', brand: 'FIAT', model: 'UNO', year: 2015 },
        { id: 103, name: 'Vela de Ignição', description: 'para VW Gol G5', price: 120.00, imageUrl: 'assets/images/bg-auth.jpg', brand: 'VW', model: 'GOL', year: 2010 },
        { id: 104, name: 'Amortecedor Dianteiro', description: 'para Honda civic 2018', price: 800.00, imageUrl: 'assets/images/logo-sm-light.png', brand: 'HONDA', model: 'CIVIC', year: 2018 }
      ];
      
      this.filteredProducts = this.allProducts;
      
      this.populateFilterOptions();
      
      this.loading = false;
    }, 1000);
  }

  populateFilterOptions(): void {
    this.availableBrands = [...new Set(this.allProducts.map(p => p.brand))];
    this.availableModels = [...new Set(this.allProducts.map(p => p.model))];
    this.availableYears = [...new Set(this.allProducts.map(p => p.year))].sort((a, b) => b - a);
  }

    onFilterChange(): void {
    let tempProducts = [...this.allProducts];

    if (this.filters.brand) {
      tempProducts = tempProducts.filter(p => p.brand === this.filters.brand);
    }

    if (this.filters.model) {
      tempProducts = tempProducts.filter(p => p.model === this.filters.model);
    }

    if (this.filters.year) {
      tempProducts = tempProducts.filter(p => p.year === +this.filters.year);
    }

    this.filteredProducts = tempProducts;
  }

  addToCart(product: Product): void {
    this.cart.push(product);
    this.calculateSummary();
  }

  removeFromCart(index: number): void {
    if (index > -1) {
      this.cart.splice(index, 1);
      this.calculateSummary();
    }
  }

  calculateSummary(): void {
    this.subTotal = this.cart.reduce((sum, item) => sum + item.price, 0);    
    this.total = this.subTotal - this.discount + this.taxes;
  }

    openConfirmationModal(): void {
    if (this.cart.length === 0) {
      this.notificationService.showMessage('Seu orçamento está vazio.', 'warning');
      return;
    }
    this.modalService.open(this.confirmationModal, { centered: true });
  }

  confirmOrder(modal: any): void {
    modal.close();
    this.notificationService.showMessage('Enviando pedido...', 'info');

    console.log('--- ENVIANDO PEDIDO PARA A API (SIMULADO) ---');
    console.log('ID do Parceiro:', this.partnerId);
    console.log('Itens do Pedido:', this.cart);
    console.log('Valor Total:', this.total);
    setTimeout(() => {
      this.notificationService.showMessage('Pedido enviado com sucesso!', 'success');
      this.resetOrder();
    }, 1500);
  }

  private resetOrder(): void {
    this.cart = [];
    this.calculateSummary();
  }
}