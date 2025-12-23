import { Injectable } from '@angular/core';
import { Result } from 'src/app/Http/models/operation-result.model';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';

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
  showError(errorInput: any) {
    this.hideLoading();

    let errorMessage = 'Ocorreu um erro inesperado.'; // Mensagem padrão para fallback

    let rawErrorMessage: any;

    // 1. Tentar extrair a mensagem de erro do HttpErrorResponse
    if (errorInput instanceof HttpErrorResponse) {
        if (errorInput.error && typeof errorInput.error === 'object') {
            const apiError = errorInput.error as Result<any>; // Tenta mapear para Result
            if (apiError.message) {
                rawErrorMessage = apiError.message;
            } else {
                rawErrorMessage = errorInput.error; // Se não tem 'message', talvez 'errorInput.error' seja o próprio array
            }
        } else if (typeof errorInput.error === 'string') {
            rawErrorMessage = errorInput.error;
        } else {
            rawErrorMessage = errorInput.message || errorMessage;
        }
    }
    // 2. Se já for um objeto Result (retorno 200 com erro interno)
    else if (errorInput && typeof errorInput === 'object' && 'message' in errorInput) {
        const serviceResult = errorInput as Result<any>;
        rawErrorMessage = serviceResult.message;
    }
    // 3. Se for o array de objetos diretamente
    else if (Array.isArray(errorInput)) {
        rawErrorMessage = errorInput;
    }
    // 4. Se for uma string que pode ser um JSON de array
    else if (typeof errorInput === 'string') {
        rawErrorMessage = errorInput;
    }
    // Agora, rawErrorMessage pode ser uma string JSON, um array de objetos, ou uma string simples.
    if (rawErrorMessage) {
        try {
            // Tenta fazer JSON.parse, se rawErrorMessage for uma string
            let parsedMessages: any = typeof rawErrorMessage === 'string' ? JSON.parse(rawErrorMessage) : rawErrorMessage;

            if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
                errorMessage = parsedMessages.map(errObj => {
                    const key = Object.keys(errObj)[0];
                    return `• ${errObj[key]}`;
                }).join('<br>');
            } else if (typeof parsedMessages === 'string') {
                 errorMessage = parsedMessages;
            }
        } catch (e) {
            errorMessage = typeof rawErrorMessage === 'string' ? rawErrorMessage : JSON.stringify(rawErrorMessage);
            if (errorMessage.includes('[object Object]')) {
                errorMessage = 'Ocorreu um erro na API. Verifique o console para mais detalhes.';
            }
        }
    }


    setTimeout(() => {
      Swal.fire({
        title: 'Erro',
        html: errorMessage,
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

  showMessage(message: string, title: string = 'Sucesso'): Promise<any> {
    this.hideLoading();
    return Swal.fire({
      title,
      text: message,
      icon: title == 'Sucesso' ? 'success' : 'info',
      confirmButtonText: 'OK'
    });
  }

  showToast(message: string, title: string = 'Sucesso') {
    this.hideLoading();
    Swal.fire({
      title,
      text: message,
      icon: title == 'Sucesso' ? 'success' : 'info',
      confirmButtonText: 'OK',
      toast: true,
      position: 'top-right',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      backdrop: false,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
  }
}