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

/**
 * Mapeamento de status de string para número (conforme API espera)
 */
export const ServiceOrderStatusMap: { [key: string]: number } = {
  'ORCAMENTO': 4,      // Pending
  'EM_ANDAMENTO': 6,   // Processing
  'CONCLUIDO': 5,      // Complete
  'CANCELADO': 8       // Canceled
};

/**
 * Converte status de string para número
 */
export function mapStatusToNumber(status: ServiceOrderStatus | string | number): number {
  // Se já é número, retorna direto
  if (typeof status === 'number') {
    return status;
  }
  
  // Converte para string e busca no mapa
  const statusStr = String(status);
  return ServiceOrderStatusMap[statusStr] || 4; // Default: Pending
}

export interface ServiceOrderStatusInfo {
  status: ServiceOrderStatus;
  label: string;
  badgeClass: string;
}
