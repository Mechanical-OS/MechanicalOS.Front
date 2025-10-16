import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";

@Injectable({ providedIn: 'root' })
export class FormValidationService {

  getErrorMessage(control: AbstractControl | null, fieldLabel: string): string | null {
    if (!control || !control.errors || !control.touched)  return null;
   
    if (control.errors["required"]) return `${fieldLabel} é obrigatório`;
    if (control.errors["minlength"]) return `${fieldLabel} deve ter no mínimo ${control.getError("minlength").requiredLength} caracteres`;
    if (control.errors["maxlength"]) return `${fieldLabel} deve ter no maximo ${control.getError("maxlength").requiredLength} caracteres`;
    if (control.errors["email"]) return 'Email inválido';

    if (control.errors["pattern"]) {
      switch (fieldLabel.toLowerCase()) {
        case 'cpf':
          return 'CPF deve ter 11 dígitos';
        case 'rg':
          return 'RG deve ter 9 dígitos';
        case 'telefone':
          return 'Telefone deve ter 10 ou 11 dígitos';
        case 'whatsapp':
          return 'WhatsApp deve ter 10 ou 11 dígitos';
        case 'cep':
          return 'CEP deve ter 8 dígitos';
        default:
          return `${fieldLabel} inválido`;
      }
    }

    return 'Campo inválido';
  }
}
