import { Injectable } from "@angular/core";
import { BaseService } from "src/app/Http/base-service";
import { Customer } from "../Shared/models/customer.model";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "src/app/shared/services/notification.service";
import { CUSTOMER_URL } from "src/app/Http/Config/config";
import { Result } from "src/app/Http/models/operation-result.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CustomerService extends BaseService<Customer> {
  constructor(
    protected override http: HttpClient,
    protected override notificationService: NotificationService
  ) {
    super(http, notificationService, CUSTOMER_URL);
  }

  // Novo método para salvar com imagem
  saveWithImage(formData: FormData): Observable<any> {
    return this.http.post(`${CUSTOMER_URL}`, formData);
  }

  // Novo método para atualizar com imagem
  updateWithImage(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${CUSTOMER_URL}/${id}`, formData);
  }

  // Buscar customer por CPF (socialNumber)
  getBySocialNumber(socialNumber: string): Observable<Result<Customer>> {
    // Remove formatação do CPF (pontos e traço)
    const cleanSocialNumber = socialNumber.replace(/\D/g, "");
    return this.http.get<Result<Customer>>(
      `${CUSTOMER_URL}/GetBySocialNumber/${cleanSocialNumber}`
    );
  }

  /**
   * Cria um novo customer
   */
  createCustomer(customerData: Customer): Observable<Result<Customer>> {
    return this.save(customerData);
  }

  /**
   * Atualiza um customer existente
   */
  updateCustomer(customerData: Customer): Observable<Result<Customer>> {
    return this.update(customerData);
  }

  /**
   * Atualiza o endereço de um customer
   */
  updateCustomerAddress(
    customerId: number,
    addressData: any
  ): Observable<Result<Customer>> {
    return this.http.put<Result<Customer>>(
      `${CUSTOMER_URL}/${customerId}/address`,
      addressData
    );
  }
}
