import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, TemplateRef, NgZone  } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ServiceService } from 'src/app/apps/services/service.services';
import { ServiceModel } from 'src/app/apps/services/models/service.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 

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
  styleUrls: ['./service-search.component.scss'],
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
  showAddNewButton: boolean = false; 

  @ViewChild('editPriceModal') editPriceModal!: TemplateRef<any>;
  serviceToEdit: ServiceItem | null = null;
  newPrice: number | null = null;
  
  private serviceUpdateSubscription!: Subscription;
  private searchSubject = new Subject<string>();

  private servicePriceUpdateSource = new Subject<ServiceItem>();
  public servicePriceUpdate$ = this.servicePriceUpdateSource.asObservable();

  @ViewChild('newServiceModal') newServiceModal!: TemplateRef<any>;
  newServiceForm!: FormGroup;
  isSavingNewService: boolean = false;

  constructor(
    private serviceService: ServiceService, 
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
    this.newServiceForm = this.fb.group({
      name: ['', Validators.required],
      code: [''],
      price: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
    if (this.serviceUpdateSubscription) {
        this.serviceUpdateSubscription.unsubscribe();
    }
  }

  /**
   * Dispara a busca com debounce
   */
  onSearch(): void {
    const searchTerm = this.searchValue?.trim() || '';
    if (searchTerm.length >= this.minCharacters) {
      this.loadingServices = true;
      this.showAddNewButton = false;
    }
    
    this.searchSubject.next(searchTerm);
  }

  /**
   * Executa a busca de serviços na API
   */
  private performSearch(searchTerm: string): void {
    if (!searchTerm || searchTerm.length < this.minCharacters) {
      this.availableServices = [];
      this.loadingServices = false;
      this.showAddNewButton = false;
      return;
    }
    
    this.loadingServices = true;
    this.showAddNewButton = false;
    this.availableServices = [];
    
    this.serviceService.findByFilter({ term: searchTerm }).subscribe({
      next: (result) => {
        this.loadingServices = false;
        
        if (result.statusCode === 200 && result.content) {
          const limitedContent = result.content.slice(0, this.resultLimit);
          this.availableServices = limitedContent.map((service: ServiceModel) => ({
            id: service.id,
            code: service.code,
            name: service.shortDescription || service.name,
            description: service.description,
            price: service.price / 100, // Converte centavos para reais
            quantity: 1,
            total: service.price / 100  // Converte centavos para reais
          }));
          this.showAddNewButton = this.availableServices.length === 0;
        } else {
          this.availableServices = [];
          this.showAddNewButton = true;
        }
      },
      error: (error) => {
        this.loadingServices = false;
        this.availableServices = [];
        this.showAddNewButton = true;
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

  openEditPriceModal(service: ServiceItem): void {
    this.serviceToEdit = service;
    this.newPrice = null;
    this.modalService.open(this.editPriceModal, { centered: true, backdrop: 'static' });
  }

  saveNewPrice(modal: any): void {
    if (this.serviceToEdit && this.newPrice !== null && this.newPrice >= 0) {
      this.serviceToEdit.price = this.newPrice;
      
      console.log('%c[FILHO] Emitindo evento via Subject...', 'color: blue; font-weight: bold;', this.serviceToEdit);
      this.servicePriceUpdateSource.next(this.serviceToEdit);
      
      modal.close();
      this.serviceToEdit = null;
    }
  }

  private updateServiceInList(updatedService: ServiceModel): void {
    const index = this.availableServices.findIndex(s => s.id === updatedService.id);
    if (index > -1) {
        this.availableServices[index].price = updatedService.price / 100;
        console.log(`[ServiceSearch] Preço atualizado na UI para o serviço ID ${updatedService.id}`);
    }
  }

  openNewServiceModal(): void {
    this.newServiceForm.reset({ name: this.searchValue, price: null, code: '' });
    this.isSavingNewService = false;
    this.modalService.open(this.newServiceModal, { centered: true, backdrop: 'static' });
  }
  
  saveNewService(modal: any): void {
    if (!this.newServiceForm.valid) {
      this.newServiceForm.markAllAsTouched();
      return;
    }
    
    this.isSavingNewService = true;
    const formData = this.newServiceForm.value;

    const newServiceData: ServiceModel = {
      id: 0,
      name: formData.name,
      shortDescription: formData.name,
      description: formData.name,
      code: formData.code,
      price: Math.round(formData.price * 100),
      status: 1
    };

    this.serviceService.saveNewService(newServiceData).subscribe({
      next: (response) => {
        this.isSavingNewService = false;
        if (response.statusCode === 200 && response.content) {
          modal.close();
          const newServiceItem: ServiceItem = {
            id: response.content.id,
            code: response.content.code,
            name: response.content.shortDescription || response.content.name,
            price: response.content.price / 100,
            quantity: 1,
            total: response.content.price / 100,
            description: response.content.description
          };
          this.selectService(newServiceItem);
        } else {
          console.error("Erro ao salvar novo serviço:", response.message);
        }
      },
      error: (err) => {
        this.isSavingNewService = false;
        console.error("Erro de comunicação ao salvar novo serviço:", err);
      }
    });
  }

  /**
   * Limpa a busca
   */
  clearSearch(): void {
    this.searchValue = '';
    this.availableServices = [];
    this.loadingServices = false;
    this.showAddNewButton = false;
  }
  
  closeResults(): void {
    this.clearSearch();
  }
}

