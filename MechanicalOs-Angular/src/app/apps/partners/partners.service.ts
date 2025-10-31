import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Partner } from '../Shared/models/partners.model';

@Injectable({
  providedIn: 'root'
})
export class PartnersService {

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
    }
  ];

  constructor() { }

  getPartners(): Observable<Partner[]> {
    // Para uma API real, você usaria this.http.get<Partner[]>('/api/partners');
    return of(this.mockPartners);
  }
}