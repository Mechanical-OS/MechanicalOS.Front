import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";

@Injectable({ providedIn: 'root' })
export class FormValidationService {

  getErrorMessage(control: AbstractControl | null, fieldLabel: string): string | null {
    if (!control || !control.errors || !control.touched)  return null;
   
    if (control.errors["required"]) return `${fieldLabel} é obrigatório`;
    if (control.errors["minlength"]) return `${fieldLabel} deve ter no mínimo ${control.getError("minlength").requiredLength} caracteres`;
    if (control.errors["maxlength"]) return `${fieldLabel} deve ter no maximo ${control.getError("maxlength").requiredLength} caracteres`;
    if (control.errors["email"]) return 'E-mail inválido';

    return 'Campo inválido';
  }
}
