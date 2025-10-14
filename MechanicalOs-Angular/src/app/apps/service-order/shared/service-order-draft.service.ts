import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ServiceOrder } from '../../Shared/models/service-order.model';

export interface VehicleData {
  brand: string;
  model: string;
  version: string;
  year: string;
  chassi: string;
  color: string;
  transmission: string;
  engine: string;
  plate: string;
}

export interface OwnerData {
  firstName: string;
  lastName: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  cellPhone: string;
  contact: string;
}

export interface AddressData {
  city: string;
  state: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string;
  zipCode: string;
}

export interface ServiceItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  code?: string;
  description?: string;
}

export interface ProductItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

// Estrutura que combina ID (se existe) com dados (se novo)
export interface CustomerInfo {
  id?: number;
  data?: OwnerData;
  exists?: boolean; // Flag para indicar se já existe no banco
}

export interface AddressInfo {
  id?: number;
  data?: AddressData;
  exists?: boolean;
}

export interface VehicleInfo {
  id?: number;
  data?: VehicleData;
  exists?: boolean;
}

export interface ServiceOrderDraft {
  orderNumber: string;
  customer: CustomerInfo | null;
  address: AddressInfo | null;
  vehicle: VehicleInfo | null;
  services: ServiceItem[];
  products: ProductItem[];
  subtotal: number;
  discount: number;
  fees: number;
  total: number;
  description: string;
  entryDate: string | null;
  departureDate: string | null;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceOrderDraftService {
  private readonly STORAGE_KEY = 'mechanical-os-service-order-draft';
  private draftSubject = new BehaviorSubject<ServiceOrderDraft>(this.loadDraftFromStorage());
  public draft$ = this.draftSubject.asObservable();

  constructor() {
    // Salva automaticamente quando houver mudanças
    this.draft$.subscribe(draft => {
      this.saveDraftToStorage(draft);
    });
  }

  private getInitialDraft(): ServiceOrderDraft {
    return {
      orderNumber: this.generateOrderNumber(),
      customer: null,
      address: null,
      vehicle: null,
      services: [],
      products: [],
      subtotal: 0,
      discount: 0,
      fees: 0,
      total: 0,
      description: '',
      entryDate: new Date().toISOString(),
      departureDate: null,
      status: 0
    };
  }

  private generateOrderNumber(): string {
    // Gera um número de ordem único (simulado)
    const timestamp = Date.now();
    return `OS-${timestamp.toString().slice(-8)}`;
  }

  /**
   * Salva o draft no localStorage
   */
  private saveDraftToStorage(draft: ServiceOrderDraft): void {
    try {
      const draftJson = JSON.stringify(draft);
      localStorage.setItem(this.STORAGE_KEY, draftJson);
      console.log('Draft salvo no localStorage:', draft.orderNumber);
    } catch (error) {
      console.error('Erro ao salvar draft no localStorage:', error);
    }
  }

  /**
   * Carrega o draft do localStorage ou retorna um novo
   */
  private loadDraftFromStorage(): ServiceOrderDraft {
    try {
      const draftJson = localStorage.getItem(this.STORAGE_KEY);
      if (draftJson) {
        const draft = JSON.parse(draftJson);
        console.log('Draft carregado do localStorage:', draft.orderNumber);
        return draft;
      }
    } catch (error) {
      console.error('Erro ao carregar draft do localStorage:', error);
    }
    return this.getInitialDraft();
  }

  /**
   * Limpa o draft do localStorage
   */
  private clearDraftFromStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Draft removido do localStorage');
    } catch (error) {
      console.error('Erro ao limpar draft do localStorage:', error);
    }
  }

  getCurrentDraft(): ServiceOrderDraft {
    return this.draftSubject.value;
  }

  /**
   * Atualiza dados do cliente (com ou sem ID)
   */
  updateCustomerData(ownerData: OwnerData, customerId?: number): void {
    const currentDraft = this.getCurrentDraft();
    this.draftSubject.next({
      ...currentDraft,
      customer: {
        id: customerId,
        data: ownerData,
        exists: !!customerId
      }
    });
  }

  /**
   * Define apenas o ID do cliente (quando encontrado)
   */
  setCustomerId(customerId: number): void {
    const currentDraft = this.getCurrentDraft();
    if (currentDraft.customer) {
      this.draftSubject.next({
        ...currentDraft,
        customer: {
          ...currentDraft.customer,
          id: customerId,
          exists: true
        }
      });
    }
  }

  /**
   * Atualiza dados do endereço (com ou sem ID)
   */
  updateAddressData(addressData: AddressData, addressId?: number): void {
    const currentDraft = this.getCurrentDraft();
    this.draftSubject.next({
      ...currentDraft,
      address: {
        id: addressId,
        data: addressData,
        exists: !!addressId
      }
    });
  }

  /**
   * Define apenas o ID do endereço (quando encontrado)
   */
  setAddressId(addressId: number): void {
    const currentDraft = this.getCurrentDraft();
    if (currentDraft.address) {
      this.draftSubject.next({
        ...currentDraft,
        address: {
          ...currentDraft.address,
          id: addressId,
          exists: true
        }
      });
    }
  }

  /**
   * Atualiza dados do veículo (com ou sem ID)
   */
  updateVehicleData(vehicleData: VehicleData, vehicleId?: number): void {
    const currentDraft = this.getCurrentDraft();
    this.draftSubject.next({
      ...currentDraft,
      vehicle: {
        id: vehicleId,
        data: vehicleData,
        exists: !!vehicleId
      }
    });
  }

  /**
   * Define apenas o ID do veículo (quando encontrado)
   */
  setVehicleId(vehicleId: number): void {
    const currentDraft = this.getCurrentDraft();
    if (currentDraft.vehicle) {
      this.draftSubject.next({
        ...currentDraft,
        vehicle: {
          ...currentDraft.vehicle,
          id: vehicleId,
          exists: true
        }
      });
    }
  }

  // Métodos de compatibilidade com código antigo
  updateOwnerData(ownerData: OwnerData): void {
    this.updateCustomerData(ownerData);
  }

  updateServices(services: ServiceItem[]): void {
    const currentDraft = this.getCurrentDraft();
    this.recalculateTotals(currentDraft, services, currentDraft.products);
  }

  updateProducts(products: ProductItem[]): void {
    const currentDraft = this.getCurrentDraft();
    this.recalculateTotals(currentDraft, currentDraft.services, products);
  }

  addService(service: ServiceItem): void {
    const currentDraft = this.getCurrentDraft();
    const services = [...currentDraft.services, service];
    this.recalculateTotals(currentDraft, services, currentDraft.products);
  }

  removeService(serviceId: number): void {
    const currentDraft = this.getCurrentDraft();
    const services = currentDraft.services.filter(s => s.id !== serviceId);
    this.recalculateTotals(currentDraft, services, currentDraft.products);
  }

  addProduct(product: ProductItem): void {
    const currentDraft = this.getCurrentDraft();
    const products = [...currentDraft.products, product];
    this.recalculateTotals(currentDraft, currentDraft.services, products);
  }

  removeProduct(productId: number): void {
    const currentDraft = this.getCurrentDraft();
    const products = currentDraft.products.filter(p => p.id !== productId);
    this.recalculateTotals(currentDraft, currentDraft.services, products);
  }

  updateDiscount(discount: number): void {
    const currentDraft = this.getCurrentDraft();
    const total = currentDraft.subtotal - discount + currentDraft.fees;
    
    this.draftSubject.next({
      ...currentDraft,
      discount,
      total
    });
  }

  updateFees(fees: number): void {
    const currentDraft = this.getCurrentDraft();
    const total = currentDraft.subtotal - currentDraft.discount + fees;
    
    this.draftSubject.next({
      ...currentDraft,
      fees,
      total
    });
  }

  updateDescription(description: string): void {
    const currentDraft = this.getCurrentDraft();
    this.draftSubject.next({
      ...currentDraft,
      description
    });
  }

  updateDates(entryDate: string, departureDate: string | null): void {
    const currentDraft = this.getCurrentDraft();
    this.draftSubject.next({
      ...currentDraft,
      entryDate,
      departureDate
    });
  }

  private recalculateTotals(
    currentDraft: ServiceOrderDraft, 
    services: ServiceItem[], 
    products: ProductItem[]
  ): void {
    const servicesTotal = services.reduce((sum, service) => sum + service.total, 0);
    const productsTotal = products.reduce((sum, product) => sum + product.total, 0);
    const subtotal = servicesTotal + productsTotal;
    const total = subtotal - currentDraft.discount + currentDraft.fees;
    
    this.draftSubject.next({
      ...currentDraft,
      services,
      products,
      subtotal,
      total
    });
  }

  saveCurrentStep(): void {
    const currentDraft = this.getCurrentDraft();
    console.log('Dados salvos da etapa atual:', currentDraft);
    
    // Força uma nova emissão do observable (que salva automaticamente no storage)
    this.draftSubject.next(currentDraft);
  }

  /**
   * Verifica se o draft tem os dados mínimos necessários
   */
  isReadyToFinalize(): boolean {
    const draft = this.getCurrentDraft();
    return !!(
      (draft.customer?.id || draft.customer?.data) &&
      (draft.vehicle?.id || draft.vehicle?.data) &&
      (draft.services.length > 0 || draft.products.length > 0)
    );
  }

  /**
   * Retorna resumo do draft para exibição
   */
  getDraftSummary(): { customer: string; vehicle: string; address: string; itemsCount: number } {
    const draft = this.getCurrentDraft();
    
    return {
      customer: draft.customer?.data 
        ? `${draft.customer.data.firstName} ${draft.customer.data.lastName} (${draft.customer.data.cpf})`
        : 'Não informado',
      vehicle: draft.vehicle?.data
        ? `${draft.vehicle.data.plate} - ${draft.vehicle.data.brand} ${draft.vehicle.data.model} ${draft.vehicle.data.year}`
        : 'Não informado',
      address: draft.address?.data
        ? `${draft.address.data.street}, ${draft.address.data.number} - ${draft.address.data.city}/${draft.address.data.state}`
        : 'Não informado',
      itemsCount: draft.services.length + draft.products.length
    };
  }

  /**
   * Reseta o draft e limpa o localStorage
   */
  resetDraft(): void {
    this.clearDraftFromStorage();
    this.draftSubject.next(this.getInitialDraft());
  }

  /**
   * Cria um novo draft (usado após finalizar com sucesso)
   */
  createNewDraft(): void {
    this.resetDraft();
  }
}
