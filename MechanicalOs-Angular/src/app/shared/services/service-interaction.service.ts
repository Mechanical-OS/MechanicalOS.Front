import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ServiceItem } from '../service-search/service-search.component';

@Injectable({
  providedIn: 'root'
})
export class ServiceInteractionService {

  private priceUpdateSource = new Subject<ServiceItem>();
  public priceUpdate$ = this.priceUpdateSource.asObservable();

  constructor() { }

  /**
   * Chamado pelo ServiceSearchComponent quando um preço é salvo.
   * @param service O serviço com o preço atualizado.
   */
  notifyPriceUpdate(service: ServiceItem): void {
    this.priceUpdateSource.next(service);
  }
}