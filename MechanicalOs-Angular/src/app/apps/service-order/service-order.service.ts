import { Injectable } from "@angular/core";
import { BaseService } from "src/app/Http/base-service";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "src/app/shared/services/notification.service";
import { SERVICE_ORDER_URL } from "src/app/Http/Config/config";
import { Observable } from "rxjs";
import { Result } from "src/app/Http/models/operation-result.model";
import { ServiceOrder } from "../Shared/models/service-order.model";

@Injectable({
    providedIn: 'root'
})
export class ServiceOrderService extends BaseService<ServiceOrder> {
    private serviceOrderUrl: string;

    constructor(http: HttpClient, notificationService: NotificationService) {
        super(http, notificationService, SERVICE_ORDER_URL);
        this.serviceOrderUrl = SERVICE_ORDER_URL;
    }

    /**
     * Exclui uma ordem de serviço
     * @param id ID da ordem de serviço a ser excluída
     * @returns Observable<Result<any>>
     */
    delete(id: number): Observable<Result<any>> {
        return this.http.delete<Result<any>>(`${this.serviceOrderUrl}/${id}`);
    }
}

