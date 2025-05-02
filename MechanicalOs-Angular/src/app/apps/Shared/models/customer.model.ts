// export class Customer{
//     id: number = 0;
//     name: string = '';
//     email: string = '';
//     whatsApp: string = '';
//     socialNumber: number = 0;
// }

export interface Customer {
    id: number;
    name: string;
    email: string;
    whatsApp: string;
    phone: string;
    socialNumber: string; // CPF
    nationalId: string;   // RG
    dateOfBith: string;  // Formato ISO: yyyy-mm-dd
    address: Address;
  }
  
  export interface Address {
    country: string;
    state: string;
    city: string;
    street: string;
    number: string;
    complement: string;
    reference: string;
    zipcode: string;
    addressType: AddressType;
  }
  
  export enum AddressType {
    Residential = 1,
    Commercial = 2,
    Others = 3
  }
  