import { Injectable } from '@angular/core';
import { NgbDatepickerI18n, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

// Definição dos valores traduzidos
const I18N_VALUES: Record<string, { weekdays: string[]; months: string[]; weekLabel: string }> = {
  'pt-BR': {
    weekdays: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    months: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    weekLabel: 'Sem'
  }
};

@Injectable()
export class I18n {
  language: keyof typeof I18N_VALUES = 'pt-BR'; // Garante que sempre usamos uma chave válida
}

@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {
  constructor(private _i18n: I18n) {
    super();
  }

  private getTranslation() {
    return I18N_VALUES[this._i18n.language];
  }

  getWeekdayShortName(weekday: number): string {
    return this.getTranslation().weekdays[weekday - 1];
  }

  getMonthShortName(month: number): string {
    return this.getTranslation().months[month - 1].substring(0, 3);
  }

  getMonthFullName(month: number): string {
    return this.getTranslation().months[month - 1];
  }

  getWeekLabel(): string {
    return this.getTranslation().weekLabel;
  }
  
  /** Retorna um rótulo curto para um dia da semana (exemplo: "S" para Segunda) */
  getWeekdayLabel(weekday: number): string {
    return this.getTranslation().weekdays[weekday - 1];
  }

  /** Retorna um rótulo acessível para um dia específico no formato 'dd/mm/aaaa' */
  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}/${date.month}/${date.year}`;
  }
}
