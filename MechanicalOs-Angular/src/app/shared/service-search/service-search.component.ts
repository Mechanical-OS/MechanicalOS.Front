import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ServiceService } from 'src/app/apps/services/service.services';
import { ServiceModel } from 'src/app/apps/services/models/service.model';

export interface ServiceItem {
  id: number;
  code: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  total: number;
}

@Component({
  selector: 'app-service-search',
  templateUrl: './service-search.component.html',
  styleUrls: ['./service-search.component.scss']
})
export class ServiceSearchComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Pesquise por código ou descrição (mínimo 2 caracteres)';
  @Input() minCharacters: number = 2;
  @Input() debounceTime: number = 500;
  @Input() showPriceInList: boolean = true;
  @Input() showCodeBadge: boolean = true;
  @Input() autoFocus: boolean = false;
  @Input() clearOnSelect: boolean = true;
  @Input() resultLimit: number = 10;
  
  @Output() serviceSelected = new EventEmitter<ServiceItem>();
  @Output() searchError = new EventEmitter<any>();
  
  searchValue: string = '';
  availableServices: ServiceItem[] = [];
  loadingServices: boolean = false;
  showResults: boolean = false;
  
  private searchSubject = new Subject<string>();

  constructor(private serviceService: ServiceService) {}

  ngOnInit(): void {
    // Configura debounce para busca de serviços
    this.searchSubject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  /**
   * Dispara a busca com debounce
   */
  onSearch(): void {
    const searchTerm = this.searchValue?.trim() || '';
    this.showResults = searchTerm.length >= this.minCharacters;
    this.searchSubject.next(searchTerm);
  }

  /**
   * Executa a busca de serviços na API
   */
  private performSearch(searchTerm: string): void {
    if (!searchTerm || searchTerm.length < this.minCharacters) {
      this.availableServices = [];
      this.showResults = false;
      return;
    }
    
    this.loadingServices = true;
    this.availableServices = [];
    
    this.serviceService.findByFilter({ term: searchTerm }).subscribe({
      next: (result) => {
        this.loadingServices = false;
        
        if (result.statusCode === 200 && result.content) {
          
          //APLICA O LIMITE ANTES DE MAPEAR OS DADOS
          const limitedContent = result.content.slice(0, this.resultLimit);
          
          console.log(`✅ [ServiceSearch] ${result.content.length} serviços encontrados, exibindo ${limitedContent.length}`);
          
          this.availableServices = limitedContent.map((service: ServiceModel) => ({
            id: service.id,
            code: service.code,
            name: service.shortDescription || service.name,
            description: service.description,
            price: service.price / 100, // Converte centavos para reais
            quantity: 1,
            total: service.price / 100  // Converte centavos para reais
          }));
          
        } else {
          this.availableServices = [];
        }
      },
      error: (error) => {
        this.loadingServices = false;
        console.error('❌ [ServiceSearch] Erro ao buscar:', error);
        this.availableServices = [];
        this.searchError.emit(error);
      }
    });
  }

  /**
   * Seleciona um serviço da lista
   */
  selectService(service: ServiceItem): void {
    // Garante que a quantidade é válida
    if (!service.quantity || service.quantity < 1) {
      service.quantity = 1;
    }
    
    // Calcula o total baseado na quantidade
    service.total = service.price * service.quantity;
    
    console.log('✅ [ServiceSearch] Serviço selecionado:', service);
    this.serviceSelected.emit(service);
    
    if (this.clearOnSelect) {
      // Se 'clearOnSelect' for verdadeiro, limpa tudo
      this.clearSearch();
    } else {
      service.quantity = 1;
    }
  }

  /**
   * Limpa a busca
   */
  clearSearch(): void {
    this.searchValue = '';
    this.availableServices = [];
    this.showResults = false;
  }

  /**
   * Fecha os resultados
   */
  closeResults(): void {
    this.showResults = false;
  }
}

