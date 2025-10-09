export interface ServiceOrder {
  id: number;
  entryDate: Date;
  status: ServiceOrderStatus;
  customer: Customer;
  vehicle: Vehicle;
  plate: string;
  totalValue?: number;
  description?: string;
  observations?: string;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
}

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  version?: string;
  year?: number;
  color?: string;
}

export enum ServiceOrderStatus {
  ORCAMENTO = 'ORCAMENTO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO'
}

export interface ServiceOrderStatusInfo {
  status: ServiceOrderStatus;
  label: string;
  badgeClass: string;
}
