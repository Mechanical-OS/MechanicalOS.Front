import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { AddressType, Customer } from "../../Shared/models/customer.model";

export class CustomerFactory {
    static fromForm(formValue: any): Customer {
        return {
            id: 0,
            name: `${formValue.firstName} ${formValue.lastName}`,
            email: formValue.email,
            whatsApp: formValue.whatsapp,
            phone: formValue.phone,
            socialNumber: formValue.cpf,
            nationalId: formValue.rg,
            dateOfBith: this.convertNgbDateStructToString(formValue.birthDate) ?? "",
            address: {
                country: 'Brasil',
                state: formValue.uf,
                city: formValue.city,
                street: formValue.street,
                number: formValue.number,
                complement: formValue.complement,
                reference: '', // 
                zipcode: formValue.zipcode,
                neighborhood: formValue.neighborhood,
                addressType: AddressType.Residential // default
            }
        };
    }

    static convertNgbDateStructToString(date: NgbDateStruct | null): string | null {
        if (!date) return null;
        return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
    }

    static fromApi(apiResponse: any): Customer {
        return {
            id: apiResponse.id,
            name: apiResponse.name,
            email: apiResponse.email,
            whatsApp: apiResponse.whatsApp,
            phone: apiResponse.phone,
            socialNumber: apiResponse.socialNumber,
            nationalId: apiResponse.nationalId,
            dateOfBith: apiResponse.dateOfBirth,
            address: {
                country: apiResponse.address?.country,
                state: apiResponse.address?.state,
                city: apiResponse.address?.city,
                street: apiResponse.address?.street,
                number: apiResponse.address?.number,
                complement: apiResponse.address?.complement,
                reference: apiResponse.address?.reference,
                zipcode: apiResponse.address?.zipcode,
                neighborhood: apiResponse.address.neighborhood,
                addressType: apiResponse.address?.addressType
            }
        };
    }

   
}
