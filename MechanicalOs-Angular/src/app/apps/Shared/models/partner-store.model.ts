export interface PartnerStoreAddress {
  cep: string;
  uf: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento?: string;
}

export interface PartnerStore {
  id?: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  address: PartnerStoreAddress;
}