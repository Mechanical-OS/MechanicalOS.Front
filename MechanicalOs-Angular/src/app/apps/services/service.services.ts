import { BaseService } from "src/app/Http/base-service";
import { ServiceModel } from "./models/service.model";
import { HttpClient } from "@angular/common/http";
import { SERVICES_URL } from "src/app/Http/Config/config";
import { Injectable } from "@angular/core";
import { GetAllResponse } from "src/app/Http/models/Output/get-all-response.model";

@Injectable({
    providedIn: 'root'
})

export class ServiceService extends BaseService<ServiceModel> {
    constructor(http: HttpClient) {
        super(http, SERVICES_URL);
    }
}