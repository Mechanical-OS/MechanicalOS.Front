import { BaseService } from "src/app/Http/base-service";
import { ServiceModel } from "./models/service.model";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { SERVICES_URL } from "src/app/Http/Config/config";
import { Injectable } from "@angular/core";
import { GetAllResponse } from "src/app/Http/models/Output/get-all-response.model";
import { catchError, finalize, map, Observable, throwError } from "rxjs";
import { OperationResult } from "src/app/Http/models/operation-result.model";
import { NotificationService } from "src/app/shared/services/notification.service";

@Injectable({
    providedIn: 'root'
})

export class ServiceService extends BaseService<ServiceModel> {
    constructor(http: HttpClient, private notificationService: NotificationService) {
        super(http, SERVICES_URL);
    }

    saveNewService(data: ServiceModel): Observable<OperationResult<any>> {
        this.notificationService.showLoading();
        return this.save(data).pipe(
            map(response => {
                if (response.statusCode != 200) {
                    this.notificationService.showError(response);
                    throw new Error(response.message || 'Erro desconhecido');
                }
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                this.notificationService.showError(error);
                return throwError(() => error);
            }),
            finalize(() => this.notificationService.hideLoading())
        );
    }
}