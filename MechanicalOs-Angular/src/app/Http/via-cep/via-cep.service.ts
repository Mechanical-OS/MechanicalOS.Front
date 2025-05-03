import { Injectable } from "@angular/core";
import { BaseService } from "../base-service";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "src/app/shared/services/notification.service";
import { VIA_CEP_URL } from "../Config/config";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ViaCepService extends BaseService<any> {

    constructor(http: HttpClient, notificationService: NotificationService) {
        super(http, notificationService, VIA_CEP_URL)
    }

    getCep(cep: string): Observable<any> {
        return this.http.get<any>(`${VIA_CEP_URL}/${cep}/json`);
    }

}