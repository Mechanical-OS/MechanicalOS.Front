import { Injectable } from "@angular/core";
import { BaseService } from "src/app/Http/base-service";
import { User } from "../Shared/models/user.model";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "src/app/shared/services/notification.service";
import { USERS_URL } from "src/app/Http/Config/config";
import { Result } from "src/app/Http/models/operation-result.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserService extends BaseService<User> {
  constructor(
    protected override http: HttpClient,
    protected override notificationService: NotificationService
  ) {
    super(http, notificationService, USERS_URL);
  }

  // Novo método para salvar com imagem
  saveWithImage(formData: FormData): Observable<any> {
    return this.http.post(`${USERS_URL}`, formData);
  }

  // Novo método para atualizar com imagem
  updateWithImage(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${USERS_URL}/${id}`, formData);
  }

  // Buscar customer por CPF (socialNumber)
  getBySocialNumber(socialNumber: string): Observable<Result<User>> {
    // Remove formatação do CPF (pontos e traço)
    const cleanSocialNumber = socialNumber.replace(/\D/g, "");
    return this.http.get<Result<User>>(
      `${USERS_URL}/GetBySocialNumber/${cleanSocialNumber}`
    );
  }

  /**
   * Cria um novo customer
   */
  createCustomer(customerData: User): Observable<Result<User>> {
    return this.save(customerData);
  }

  /**
   * Atualiza um customer existente
   */
  updateCustomer(customerData: User): Observable<Result<User>> {
    return this.update(customerData);
  }

  /**
   * Atualiza o endereço de um customer
   */
  updateCustomerAddress(
    customerId: number,
    addressData: any
  ): Observable<Result<User>> {
    return this.http.put<Result<User>>(
      `${USERS_URL}/${customerId}/address`,
      addressData
    );
  }
}
