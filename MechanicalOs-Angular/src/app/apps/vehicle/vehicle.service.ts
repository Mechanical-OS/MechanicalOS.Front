import { Injectable } from "@angular/core";
import { BaseService } from "src/app/Http/base-service";
import { Vehicle, Color, Brand, VehicleModel } from "../Shared/models/vehicle.model";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "src/app/shared/services/notification.service";
import { VEHICLE_URL, COLOR_URL, BRAND_URL, VEHICLE_MODEL_URL } from "src/app/Http/Config/config";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Result } from "src/app/Http/models/operation-result.model";
import { PlateConsultationResponse } from "../Shared/models/plate-consultation.model";

// Interface para o modelo de dados enviado para a API
interface VehicleApiModel {
  id: number;
  customerId: number;
  plate: string;
  chassi: string;
  brandId: number;
  vehicleModelId: number;
  version: string;
  year: string;
  colorId: number;
  transmission: string;
  engine: string;
  status: number;
}

@Injectable({
    providedIn: 'root'
})
export class VehicleService extends BaseService<Vehicle> {
    private vehicleUrl: string;

    constructor(http: HttpClient, notificationService: NotificationService) {
        super(http, notificationService, VEHICLE_URL);
        this.vehicleUrl = VEHICLE_URL;
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

    /**
     * Busca todas as marcas disponíveis
     * @returns Observable<Brand[]> Lista de marcas
     */
    getAllBrands(): Observable<Brand[]> {
        return this.http.get<any>(BRAND_URL).pipe(
            map(response => {
                if (response.content && Array.isArray(response.content)) {
                    return response.content.map((brandData: any) => new Brand(brandData));
                }
                return [];
            })
        );
    }

    /**
     * Busca todos os modelos de veículos disponíveis
     * @returns Observable<VehicleModel[]> Lista de modelos de veículos
     */
    getAllVehicleModels(): Observable<VehicleModel[]> {
        return this.http.get<any>(VEHICLE_MODEL_URL).pipe(
            map(response => {
                if (response.content && Array.isArray(response.content)) {
                    return response.content.map((modelData: any) => new VehicleModel(modelData));
                }
                return [];
            })
        );
    }

    /**
     * Salva um veículo usando o formato específico da API
     * @param vehicleApiData Dados do veículo no formato da API
     * @returns Observable<Result<Vehicle>>
     */
    saveVehicle(vehicleApiData: VehicleApiModel): Observable<Result<Vehicle>> {
        return this.http.post<Result<Vehicle>>(`${this.vehicleUrl}`, vehicleApiData);
    }

    /**
     * Atualiza um veículo usando o formato específico da API
     * @param vehicleApiData Dados do veículo no formato da API
     * @returns Observable<Result<Vehicle>>
     */
    updateVehicle(vehicleApiData: VehicleApiModel): Observable<Result<Vehicle>> {
        return this.http.put<Result<Vehicle>>(`${this.vehicleUrl}`, vehicleApiData);
    }

    /**
     * Salva uma nova marca
     * @param brandData Dados da marca (name e description)
     * @returns Observable<Result<Brand>>
     */
    saveBrand(brandData: { name: string; description: string }): Observable<Result<Brand>> {
        return this.http.post<Result<Brand>>(BRAND_URL, brandData);
    }

    /**
     * Salva um novo modelo de veículo
     * @param modelData Dados do modelo (brandId, name e description)
     * @returns Observable<Result<VehicleModel>>
     */
    saveVehicleModel(modelData: { brandId: number; name: string; description: string }): Observable<Result<VehicleModel>> {
        return this.http.post<Result<VehicleModel>>(VEHICLE_MODEL_URL, modelData);
    }

    /**
     * Salva uma nova cor
     * @param colorData Dados da cor (name e description)
     * @returns Observable<Result<Color>>
     */
    saveColor(colorData: { name: string; description: string }): Observable<Result<Color>> {
        return this.http.post<Result<Color>>(COLOR_URL, colorData);
    }

    /**
     * Exclui um veículo
     * @param id ID do veículo a ser excluído
     * @returns Observable<Result<any>>
     */
    delete(id: number): Observable<Result<any>> {
        return this.http.delete<Result<any>>(`${this.vehicleUrl}/${id}`);
    }

    /**
     * Busca um veículo pela placa
     * @param plate Placa do veículo
     * @returns Observable<Result<Vehicle>>
     */
    getByPlate(plate: string): Observable<Result<Vehicle>> {
        console.log(plate);
        return this.http.get<Result<Vehicle>>(`${this.vehicleUrl}/GetByPlate/${plate}`);
    }

    /**
     * Consulta dados da placa via API interna .NET
     * @param plate Placa do veículo
     * @returns Observable<PlateConsultationResponse>
     */
    consultPlateExternal(plate: string): Observable<PlateConsultationResponse> {
        console.log('Consultando placa via API interna:', plate);
        const url = `${VEHICLE_URL}/ConsultPlateApi/${plate}`;
        console.log('URL da consulta:', url);
        return this.http.get<PlateConsultationResponse>(url);
    }
}