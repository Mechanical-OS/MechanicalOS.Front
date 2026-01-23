import { AbstractControl, ValidationErrors } from '@angular/forms';

export function dateValidator(control: AbstractControl): ValidationErrors | null {
  const dateStr = control.value;
  if (!dateStr || dateStr.length !== 10) {
    return null;
  }

  const parts = dateStr.split('/');
  if (parts.length !== 3) {
    return { invalidDate: true };
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
    return null;
  }

  return { invalidDate: true };
}