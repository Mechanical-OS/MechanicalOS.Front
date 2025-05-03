import { Injectable } from "@angular/core";
import { BaseService } from "src/app/Http/base-service";
import { Customer } from "../Shared/models/customer.model";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "src/app/shared/services/notification.service";
import { CUSTOMER_URL } from "src/app/Http/Config/config";

@Injectable({
    providedIn: 'root'
})
export class CustomerService extends BaseService<Customer> {
    constructor(http: HttpClient, notificationService: NotificationService) {
        super(http, notificationService, CUSTOMER_URL)
    }
}