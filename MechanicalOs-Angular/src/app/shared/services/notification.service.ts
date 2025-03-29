import { Injectable } from '@angular/core';
import { OperationResult, Result } from 'src/app/Http/models/operation-result.model';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private isLoading = false; // Variável de controle para o estado do loading

  constructor() { }

  // Exibe um alerta de sucesso baseado no ServiceResult<T>
  showSuccess<T>(response: Result<T>, title: string = 'Sucesso') {
    this.hideLoading();
    Swal.fire({
      title,
      text: response.message || 'Operação realizada com sucesso!',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  showAlert<T>(response: Result<T>, title: string = 'Info') {
    this.hideLoading();
    setTimeout(() => { // Pequeno delay para evitar que a modal de erro feche antes de abrir
      Swal.fire({
        title: 'Info',
        text: response.message,
        icon: 'info',
        confirmButtonText: 'Fechar'
      });
    }, 200);
  }

  // Exibe um alerta de erro formatado com base no ServiceResult<T>
  showError(errorResponse: any) {
    this.hideLoading();

    let errorMessage = '';
    console.log(errorMessage);
    if (errorResponse?.error) {
      const serviceResult = errorResponse.error as Result<any>;

      if (serviceResult.message && serviceResult.message.length > 0) {
        errorMessage = serviceResult.message; 
      } else if (serviceResult.message) {
        errorMessage = serviceResult.message; 
      }
    }

    setTimeout(() => { 
      Swal.fire({
        title: 'Erro',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Fechar'
      });
    }, 200);
  }

  // Exibe um alerta de carregamento
  showLoading(message: string = 'Carregando dados...') {
    this.isLoading = true;
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  // Fecha o alerta de carregamento
  hideLoading() {
    if (this.isLoading) {
      this.isLoading = false;
      Swal.close();
    }
  }

  showMessage(message: string, title: string = 'Sucesso') {
    this.hideLoading(); // Garante que o loading seja fechado antes
    Swal.fire({
      title,
      text: message,
      icon: title == 'Sucesso' ? 'success' : 'info',
      confirmButtonText: 'OK'
    });
  }
}
