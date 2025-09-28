import { Injectable } from "@angular/core";
import { BaseService } from "src/app/Http/base-service";
import { Vehicle, Color } from "../Shared/models/vehicle.model";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "src/app/shared/services/notification.service";
import { VEHICLE_URL, COLOR_URL } from "src/app/Http/Config/config";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class VehicleService extends BaseService<Vehicle> {
    constructor(http: HttpClient, notificationService: NotificationService) {
        super(http, notificationService, VEHICLE_URL)
    }

    /**
     * Busca todas as cores disponíveis
     * @returns Observable<Color[]> Lista de cores
     */
    getAllColors(): Observable<Color[]> {
        return this.http.get<any>(COLOR_URL).pipe(
            map(response => {
                if (response.content && Array.isArray(response.content)) {
                    return response.content.map((colorData: any) => new Color(colorData));
                }
                return [];
            })
        );
    }
}