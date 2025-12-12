import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BaseService } from 'src/app/Http/base-service';
import { PARTNERS_URL } from 'src/app/Http/Config/config';
import { Result } from 'src/app/Http/models/operation-result.model';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { Partner } from '../Shared/models/partners.model';
import { PartnerStore } from '../Shared/models/partner-store.model';

@Injectable({
  providedIn: 'root'
})
export class PartnersService extends BaseService<Partner> {

  private mockPartners: Partner[] = [
    {
    "id": 1,
    "name": "Auto Center Premium",
    "description": "Serviços de alinhamento, balanceamento e troca de óleo para todas as marcas.",
    "address": "Av. das Oficinas, 123 - São Paulo/SP",
    "phone": "(11) 99876-5432",
    "email": "contato@autocenterpremium.com.br",
    "website": "https://autocenterpremium.com.br"
    },
    {
    "id": 2,
    "name": "Pneus & Cia",
    "description": "Venda e montagem de pneus, vulcanização e reparos rápidos.",
    "address": "Rua do Borracheiro, 45 - Campinas/SP",
    "phone": "(19) 98765-4321",
    "email": "vendas@pneuscia.com.br",
    "website": "https://pneuscia.com.br"
    },
    {
    "id": 3,
    "name": "Funilaria Express",
    "description": "Reparos de funilaria e pintura com agilidade e qualidade.",
    "address": "Estrada Velha, 789 - Rio de Janeiro/RJ",
    "phone": "(21) 97654-3210",
    "email": "atendimento@funilariaexpress.com.br",
    "website": ""
    },
    {
    "id": 4,
    "name": "Eletro Auto Solutions",
    "description": "Diagnóstico e reparo de sistemas elétricos automotivos.",
    "address": "Travessa da Luz, 10 - Belo Horizonte/MG",
    "phone": "(31) 96543-2109",
    "email": "contato@eletroautosolutions.com",
    "website": "https://eletroautosolutions.com"
    },
    {
    "id": 5,
    "name": "Eletro Auto Solutions",
    "description": "Diagnóstico e reparo de sistemas elétricos automotivos.",
    "address": "Travessa da Luz, 10 - Belo Horizonte/MG",
    "phone": "(31) 96543-2109",
    "email": "contato@eletroautosolutions.com",
    "website": "https://eletroautosolutions.com"
    },
    {
    "id": 6,
    "name": "Auto Center Premium",
    "description": "Serviços de alinhamento, balanceamento e troca de óleo para todas as marcas.",
    "address": "Av. das Oficinas, 123 - São Paulo/SP",
    "phone": "(11) 99876-5432",
    "email": "contato@autocenterpremium.com.br",
    "website": "https://autocenterpremium.com.br"
    },
  ];

  constructor(
    protected override http: HttpClient,
    protected override notificationService: NotificationService
  ) {
    super(http, notificationService, PARTNERS_URL);
  }

  getPartners(): Observable<Result<Partner[]>> {
    // return this.getAll(); 

    const mockResult: Result<Partner[]> = {
      statusCode: 200,
      content: this.mockPartners,
      message: 'Consulta realizada com sucesso.'
    };
    return of(mockResult).pipe(delay(500));
  }

  savePartnerStore(storeData: PartnerStore, stockFile: File): Observable<Result<PartnerStore>> {
    const formData = new FormData();
    formData.append('storeData', JSON.stringify(storeData));
    formData.append('stockFile', stockFile, stockFile.name);

    // return this.http.post<Result<PartnerStore>>(this.url, formData);
    
    console.log('--- SIMULANDO CHAMADA DE API ---');
    console.log('Dados enviados seriam:', { storeData, stockFile });
    
    const mockResponse: Result<PartnerStore> = {
      statusCode: 200,
      content: { ...storeData, id: new Date().getTime() },
      message: 'Loja Parceira salva com sucesso (simulado).'
    };
    return of(mockResponse).pipe(delay(1000));
  }

  submitOrder(orderData: any): Observable<any> {
    const orderUrl = `${PARTNERS_URL}/orders`;
    console.log(`Simulando POST para: ${orderUrl}`);
    console.log('Payload do Pedido:', orderData);
    
    return of({ success: true, orderId: new Date().getTime() }).pipe(delay(1000));
  }
}
