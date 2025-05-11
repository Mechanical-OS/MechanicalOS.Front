import { Injectable } from "@angular/core";
import { BaseService } from "src/app/Http/base-service";
import { Vehicle } from "../Shared/models/vehicle.model";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "src/app/shared/services/notification.service";
import { VEHICLE_URL } from "src/app/Http/Config/config";

@Injectable({
    providedIn: 'root'
})
export class VehicleService extends BaseService<Vehicle> {
    constructor(http: HttpClient, notificationService: NotificationService) {
        super(http, notificationService, VEHICLE_URL)
    }
}