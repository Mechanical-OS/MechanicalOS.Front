import { Directive, HostListener, ElementRef, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCurrencyBr]'
})
export class CurrencyBrDirective implements OnInit {

  constructor(private elementRef: ElementRef, private ngControl: NgControl) {}

  ngOnInit() {
    this.formatValue(this.ngControl.value);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.formatValue(inputElement.value);
  }

  private formatValue(value: string | number | null) {
    if (value === null || value === undefined) {
      this.elementRef.nativeElement.value = '';
      return;
    }

    let cleanValue = String(value).replace(/\D/g, '');
    if (cleanValue === '') {
      this.ngControl.control?.setValue(null, { emitEvent: false });
      this.elementRef.nativeElement.value = '';
      return;
    }
    
    const numericValue = parseFloat(cleanValue) / 100;

    this.ngControl.control?.setValue(numericValue, { emitEvent: false });

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
    
    this.elementRef.nativeElement.value = formattedValue;
  }
}