import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cpf' })
export class CpfPipe implements PipeTransform {
  transform(value: string | null): string {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 11) return value; // retorna sem formatar se não for válido
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}

@Pipe({ name: 'rg' })
export class RgPipe implements PipeTransform {
  transform(value: string | null): string {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length < 8 || cleaned.length > 9) return value;
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  }
}

@Pipe({ name: 'phone' })
export class PhonePipe implements PipeTransform {
  transform(value: string | null): string {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 10) {
      // fixo (XX) XXXX-XXXX
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      // celular (XX) XXXXX-XXXX
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  }
}

@Pipe({ name: 'cep' })
export class CepPipe implements PipeTransform {
  transform(value: string | null): string {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 8) return value;
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
}
@Pipe({ name: 'cnpj' })
export class CnpjPipe implements PipeTransform {
  transform(value: string | number): string {
    let cnpj = String(value).replace(/\D/g, '');
    if (cnpj.length > 14) {
      cnpj = cnpj.substring(0, 14);
    }
    
    if (cnpj.length > 12) {
      return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } else if (cnpj.length > 8) {
      return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4');
    } else if (cnpj.length > 5) {
      return cnpj.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
    } else if (cnpj.length > 2) {
      return cnpj.replace(/(\d{2})(\d{3})/, '$1.$2');
    }
    return cnpj;
  }
}
@Pipe({
  name: 'brlCurrency'
})
export class BrlCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    const numberValue = Number(value);
    if (isNaN(numberValue)) {
      return '';
    }
    
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}
