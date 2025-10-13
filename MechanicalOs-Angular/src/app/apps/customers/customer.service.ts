import { Injectable } from "@angular/core";
import { BaseService } from "src/app/Http/base-service";
import { Customer } from "../Shared/models/customer.model";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "src/app/shared/services/notification.service";
import { CUSTOMER_URL } from "src/app/Http/Config/config";
import { Observable } from "rxjs";
import { Result } from "src/app/Http/models/operation-result.model";

@Injectable({
    providedIn: 'root'
})
export class CustomerService extends BaseService<Customer> {
    constructor(http: HttpClient, notificationService: NotificationService) {
        super(http, notificationService, CUSTOMER_URL)
    }

    // Buscar customer por CPF (socialNumber)
    getBySocialNumber(socialNumber: string): Observable<Result<Customer>> {
        // Remove formatação do CPF (pontos e traço)
        const cleanSocialNumber = socialNumber.replace(/\D/g, '');
        return this.http.get<Result<Customer>>(`${CUSTOMER_URL}/GetBySocialNumber/${cleanSocialNumber}`);
    }
}