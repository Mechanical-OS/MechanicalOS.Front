import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCurrencyBr]'
})
export class CurrencyBrDirective {
  private el: HTMLInputElement;

  constructor(private elementRef: ElementRef, private control: NgControl) {
    this.el = this.elementRef.nativeElement;
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    let value = this.el.value;

    // Remove tudo que não é número
    value = value.replace(/\D/g, '');

    // Converte para número com duas casas
    const numericValue = (parseInt(value || '0', 10) / 100).toFixed(2);

    // Formata como moeda brasileira
    const formatted = this.formatToBR(numericValue);

    // Atualiza o valor do input
    this.el.value = formatted;

    // Atualiza o form control com valor numérico
    if (this.control && this.control.control) {
      this.control.control.setValue(formatted, { emitEvent: false });
    }
  }

  private formatToBR(value: string): string {
    const [intPart, decimalPart] = value.split('.');
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${intFormatted},${decimalPart}`;
  }
}
