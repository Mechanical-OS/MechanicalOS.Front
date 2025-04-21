import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class CustomDatepickerFormatter extends NgbDateParserFormatter {
  
  readonly DELIMITER = '-';

  // Transforma a data do formato NgbDateStruct para string
  format(date: NgbDateStruct | null): string {
    return date ? 
      `${this.padZero(date.day)}${this.DELIMITER}${this.padZero(date.month)}${this.DELIMITER}${date.year}` : '';
  }

  // Transforma string no formato dd-MM-yyyy para NgbDateStruct
  parse(value: string): NgbDateStruct | null {
    if (!value) return null;
    const parts = value.split(this.DELIMITER);
    return { 
      day: parseInt(parts[0], 10), 
      month: parseInt(parts[1], 10), 
      year: parseInt(parts[2], 10) 
    };
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }
}
