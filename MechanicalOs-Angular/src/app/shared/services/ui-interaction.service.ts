// No arquivo: src/app/shared/services/ui-interaction.service.ts

import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class UiInteractionService {
  
  constructor(
    private modalService: NgbModal,
    private metroMenuService: MetroMenuService
  ) {}

  /**
   * Abre um modal NgbModal e gerencia o menu.
   * @param content O template do modal.
   * @param options As opções do NgbModal (ex: { size: 'xl' }).
   * @param menuButtons Os botões a serem restaurados.
   */
  openNgbModal(content: any, options: NgbModalOptions, menuButtons: any[]): NgbModalRef {
    this.metroMenuService.setButtons([]);
    const finalOptions: NgbModalOptions = {
      centered: true,
      backdrop: 'static'
    };

    if (options) {
      Object.assign(finalOptions, options);
    }

    const modalRef = this.modalService.open(content, finalOptions);
    
    modalRef.result.then(
      () => { this.metroMenuService.setButtons(menuButtons); },
      () => { this.metroMenuService.setButtons(menuButtons); }
    );
    
    return modalRef;
  }

  /**
   * Mostra um alerta do SweetAlert e gerencia o menu.
   * @param options As opções do SweetAlert.
   * @param menuButtons Os botões a serem restaurados.
   */
  async showSweetAlert(options: any, menuButtons: any[]): Promise<any> {
    this.metroMenuService.setButtons([]);
    const result = await Swal.fire(options);
    this.metroMenuService.setButtons(menuButtons);
    return result;
  }
}