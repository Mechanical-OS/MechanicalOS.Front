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
}

export interface ServiceOrderDraft {
  orderNumber: string;
  vehicle: VehicleData | null;
  owner: OwnerData | null;
  address: AddressData | null;
  services: ServiceItem[];
  subtotal: number;
  discount: number;
  taxes: number;
  total: number;
  observations: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceOrderDraftService {
  private draftSubject = new BehaviorSubject<ServiceOrderDraft>(this.getInitialDraft());
  public draft$ = this.draftSubject.asObservable();

  constructor() { }

  private getInitialDraft(): ServiceOrderDraft {
    return {
      orderNumber: this.generateOrderNumber(),
      vehicle: null,
      owner: null,
      address: null,
      services: [],
      subtotal: 0,
      discount: 0,
      taxes: 0,
      total: 0,
      observations: ''
    };
  }

  private generateOrderNumber(): string {
    // Gera um número de ordem único (simulado)
    const timestamp = Date.now();
    return `#${timestamp.toString().slice(-6).padStart(6, '0')}`;
  }

  getCurrentDraft(): ServiceOrderDraft {
    return this.draftSubject.value;
  }

  updateVehicleData(vehicleData: VehicleData): void {
    const currentDraft = this.getCurrentDraft();
    this.draftSubject.next({
      ...currentDraft,
      vehicle: vehicleData
    });
  }

  updateOwnerData(ownerData: OwnerData): void {
    const currentDraft = this.getCurrentDraft();
    this.draftSubject.next({
      ...currentDraft,
      owner: ownerData
    });
  }

  updateAddressData(addressData: AddressData): void {
    const currentDraft = this.getCurrentDraft();
    this.draftSubject.next({
      ...currentDraft,
      address: addressData
    });
  }

  updateServices(services: ServiceItem[]): void {
    const currentDraft = this.getCurrentDraft();
    const subtotal = services.reduce((sum, service) => sum + service.total, 0);
    const total = subtotal - currentDraft.discount + currentDraft.taxes;
    
    this.draftSubject.next({
      ...currentDraft,
      services,
      subtotal,
      total
    });
  }

  updateDiscount(discount: number): void {
    const currentDraft = this.getCurrentDraft();
    const total = currentDraft.subtotal - discount + currentDraft.taxes;
    
    this.draftSubject.next({
      ...currentDraft,
      discount,
      total
    });
  }

  updateObservations(observations: string): void {
    const currentDraft = this.getCurrentDraft();
    this.draftSubject.next({
      ...currentDraft,
      observations
    });
  }

  saveCurrentStep(): void {
    const currentDraft = this.getCurrentDraft();
    console.log('Dados salvos da etapa atual:', currentDraft);
    
    // Força uma nova emissão do observable
    this.draftSubject.next(currentDraft);
  }

  finalizeOrder(): void {
    const currentDraft = this.getCurrentDraft();
    console.log('Ordem de serviço finalizada:', currentDraft);
    
    // Aqui seria feita a chamada para a API
    // this.serviceOrderService.create(currentDraft).subscribe(...)
  }

  resetDraft(): void {
    this.draftSubject.next(this.getInitialDraft());
  }
}
