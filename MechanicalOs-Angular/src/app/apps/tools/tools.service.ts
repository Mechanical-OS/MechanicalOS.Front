import { BaseService } from "src/app/Http/base-service";
import { HttpClient } from "@angular/common/http";
import { ToolsModel } from "./tools.model";
import { Injectable } from "@angular/core";
import { TOOLS_URL } from "src/app/Http/Config/config";
import { NotificationService } from "src/app/shared/services/notification.service";

@Injectable({
    providedIn: 'root'
})

export class ToolsService extends BaseService<ToolsModel> {
    constructor(http: HttpClient, notificationService: NotificationService) {
        super(http, notificationService, TOOLS_URL);
    }
}