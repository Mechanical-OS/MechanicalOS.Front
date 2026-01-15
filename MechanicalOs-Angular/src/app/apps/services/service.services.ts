import { BaseService } from "src/app/Http/base-service";
import { ServiceModel } from "./models/service.model";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { SERVICES_URL } from "src/app/Http/Config/config";
import { Injectable } from "@angular/core";
import { GetAllResponse } from "src/app/Http/models/Output/get-all-response.model";
import { catchError, finalize, map, Observable, throwError, Subject } from "rxjs";
import { OperationResult, Result } from "src/app/Http/models/operation-result.model";
import { NotificationService } from "src/app/shared/services/notification.service";
import { switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class ServiceService extends BaseService<ServiceModel> {

    private serviceUpdatedSource = new Subject<ServiceModel>();
    public serviceUpdated$ = this.serviceUpdatedSource.asObservable();
    
    constructor(http: HttpClient, notificationService: NotificationService) {
        super(http, notificationService, SERVICES_URL);
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

    updateService(data: ServiceModel): Observable<OperationResult<any>> {
        this.notificationService.showLoading();
        return this.update(data).pipe(
            map(response => {
                if (response.statusCode != 200) {
                    this.notificationService.showError(response);
                    throw new Error(response.message || 'Erro desconhecido');
                }
                if (response.content) {
                    this.serviceUpdatedSource.next(response.content);
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
        updatePrice(serviceId: number, newPrice: number): Observable<OperationResult<any>> {
        this.notificationService.showLoading('Atualizando preço...');

        return this.findById(serviceId).pipe(
            switchMap(findResult => {
                if (findResult.statusCode !== 200 || !findResult.content) {
                    throw new Error('Serviço não encontrado para atualização.');
                }
                
                const serviceToUpdate = findResult.content;
                
                serviceToUpdate.price = Math.round(newPrice * 100);
                this.notificationService.hideLoading();
                return this.updateService(serviceToUpdate);
            }),
            catchError((error: any) => {
                this.notificationService.hideLoading();
                this.notificationService.showError({ message: error.message || 'Erro ao buscar serviço para atualizar.' });
                return throwError(() => error);
            })
        );
    }
}