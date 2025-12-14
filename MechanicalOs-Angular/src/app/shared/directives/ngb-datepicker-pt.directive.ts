import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { NgbDatepicker, NgbDatepickerI18n, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { CustomDatepickerI18n, I18n } from './ngb-datepicker-i18n';

@Directive({
  selector: '[appNgbDatepickerPt]',
  providers: [
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    I18n
  ]
})
export class NgbDatepickerPtDirective {
  @Input() datepickerInstance!: NgbDatepicker;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.addClearButton();
  }

  private addClearButton() {
    const input = this.el.nativeElement;

    // Criando botão "X" para limpar o campo
    const clearButton = this.renderer.createElement('span');
    this.renderer.addClass(clearButton, 'datepicker-clear');
    this.renderer.setStyle(clearButton, 'cursor', 'pointer');
    this.renderer.setStyle(clearButton, 'position', 'absolute');
    this.renderer.setStyle(clearButton, 'right', '10px');
    this.renderer.setStyle(clearButton, 'top', '50%');
    this.renderer.setStyle(clearButton, 'transform', 'translateY(-50%)');
    this.renderer.setStyle(clearButton, 'color', '#999');
    this.renderer.setProperty(clearButton, 'innerHTML', '&times;');

    // Adicionando botão ao input
    this.renderer.appendChild(input.parentElement, clearButton);

    // Evento de clique para limpar o input
    this.renderer.listen(clearButton, 'click', () => {
      input.value = '';
      input.dispatchEvent(new Event('input'));
    });
  }

  @HostListener('document:click', ['$event.target'])
  onClick(target: HTMLElement) {
    const datepicker = this.el.nativeElement.querySelector('ngb-datepicker') as NgbInputDatepicker;
    
    if (datepicker && typeof datepicker.close === 'function') {
      datepicker.close(); // Só chama `close()` se ele existir
    }
  }
}
