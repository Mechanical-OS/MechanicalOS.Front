import { Injectable } from "@angular/core";
import { BaseService } from "src/app/Http/base-service";
import { Customer } from "../Shared/models/customer.model";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "src/app/shared/services/notification.service";
import { CUSTOMER_URL } from "src/app/Http/Config/config";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
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
}