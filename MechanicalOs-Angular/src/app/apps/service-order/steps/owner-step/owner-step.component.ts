import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceOrderDraftService, OwnerData } from '../../shared/service-order-draft.service';
import { CustomerService } from 'src/app/apps/customers/customer.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { Customer } from 'src/app/apps/Shared/models/customer.model';
import { Subscription } from 'rxjs';
import { dateValidator } from './date-validator';

@Component({
  selector: 'app-owner-step',
  templateUrl: './owner-step.component.html',
  styleUrl: './owner-step.component.scss'
})
export class OwnerStepComponent implements OnInit, OnDestroy {
  ownerForm: FormGroup;
  cpfSearchValue: string = '';
  isSearching: boolean = false;
  customerFound: Customer | null = null;
  birthDateMask: string = '';

  private saveSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private draftService: ServiceOrderDraftService,
    private customerService: CustomerService,
    private notificationService: NotificationService,
  ) {
    this.ownerForm = this.createForm();
  }

  ngOnInit(): void {
    console.log('OwnerStepComponent inicializado');
    // Carrega dados existentes se houver
    const currentDraft = this.draftService.getCurrentDraft();
    if (currentDraft.customer?.data?.birthDate) {
      this.loadOwnerData(currentDraft.customer.data);

      const date = currentDraft.customer.data.birthDate;
      if(date && date.year) {
        this.birthDateMask = `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`;
      }
    }
      this.saveSubscription = this.draftService.saveStep$.subscribe((callback) => {
      this.onSave(callback); 
    });
  }

  onSave(callback: (success: boolean) => void): void {
    if (this.ownerForm.valid) {
      const ownerData: OwnerData = this.ownerForm.value;
      const currentCustomerId = this.draftService.getCurrentDraft().customer?.id;
      this.draftService.updateCustomerData(ownerData, currentCustomerId);
      
      callback(true);
    } else {
      this.markFormGroupTouched();
      this.notificationService.showMessage('Por favor, preencha os campos obrigatórios.', 'warning');
      callback(false);
    }
  }

  ngOnDestroy(): void {
    if (this.saveSubscription) { this.saveSubscription.unsubscribe(); }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      birthDate: ['', [Validators.required, dateValidator]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      rg: ['', [Validators.maxLength(12)]], // Ex: 99.999.999-X
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      phone: ['', [Validators.maxLength(15)]], // Ex: (99) 9999-9999
      cellPhone: ['', [Validators.required, Validators.maxLength(15)]], // Ex: (99) 99999-9999
      contact: ['', [Validators.maxLength(50)]]
    });
  }

  private loadOwnerData(ownerData: OwnerData): void {
    this.ownerForm.patchValue(ownerData);
  }

  onSearchCpf(): void {
    if (this.cpfSearchValue && this.cpfSearchValue.trim()) {
      this.searchOwnerByCpf(this.cpfSearchValue.trim());
    }
  }

  private searchOwnerByCpf(cpf: string): void {
    this.isSearching = true;
    this.notificationService.showLoading();

    this.customerService.getBySocialNumber(cpf).subscribe({
      next: (response) => {
        if (response.statusCode === 200 && response.content) {
          // Customer encontrado - popula o formulário
          this.customerFound = response.content;
          this.populateFormWithCustomer(response.content);
         // this.notificationService.showSuccess(response);
        } else {
          // Customer não encontrado - apenas preenche o CPF
          console.log('Customer não encontrado para o CPF:', cpf);
          this.handleCustomerNotFound(cpf);
        }
      },
      error: (error) => {
        console.error('Erro ao buscar customer:', error);
        // Se for 404, significa que não encontrou
        if (error.status === 404) {
          this.handleCustomerNotFound(cpf);
        } else {
          this.notificationService.showError(error);
        }
      },
      complete: () => {
        this.isSearching = false;
        this.notificationService.hideLoading();
      }
    });
  }

  private populateFormWithCustomer(customer: Customer): void {
    // Divide o nome em firstName e lastName
    const nameParts = customer.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Formata o CPF
    const formattedCpf = this.formatCpfValue(customer.socialNumber);

    // Converte a data de nascimento de string para NgbDateStruct
    const birthDate = this.convertStringToNgbDateStruct(customer.dateOfBirth);

    // Popula o formulário com os dados do customer
    this.ownerForm.patchValue({
      firstName: firstName,
      lastName: lastName,
      birthDate: birthDate,
      cpf: formattedCpf,
      rg: customer.nationalId || '',
      email: customer.email || '',
      phone: customer.phone || '',
      cellPhone: customer.whatsApp || '',
      contact: firstName
    });

    // Salva no draft com o ID do customer encontrado
    const ownerData: OwnerData = this.ownerForm.value;
    this.draftService.updateCustomerData(ownerData, customer.id);

    // Se o cliente tem endereço cadastrado, preenche automaticamente
    if (customer.address) {
      this.populateAddressFromCustomer(customer.address, customer.address.id);
    }

    console.log('Formulário populado com os dados do customer:', customer);
  }

  /**
   * Preenche automaticamente os dados de endereço no draft
   */
  private populateAddressFromCustomer(address: any, addressId: number): void {
    // Formata o CEP
    const formattedZipCode = this.formatZipCodeValue(address.zipcode);

    // Extrai o bairro da string street se necessário
    // A API pode retornar "Av Ary Barnabe 251" em street
    let street = address.street || '';
    let neighborhood = address.neighborhood || '';

    // Cria o objeto de endereço no formato esperado pelo AddressData
    const addressData = {
      city: address.city || '',
      state: address.state || '',
      neighborhood: neighborhood,
      street: street,
      number: address.number || '',
      complement: address.complement || '',
      zipCode: formattedZipCode
    };

    // Salva o endereço no draft com o ID
    this.draftService.updateAddressData(addressData, addressId);

  }

  /**
   * Formata o CEP no padrão 00000-000
   */
  private formatZipCodeValue(zipCode: string): string {
    if (!zipCode) return '';
    
    // Remove tudo que não é dígito
    let value = zipCode.replace(/\D/g, '');
    
    // Aplica a máscara
    if (value.length <= 8) {
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    return value;
  }

  private handleCustomerNotFound(cpf: string): void {
    this.customerFound = null;
    const formattedCpf = this.formatCpfValue(cpf);
    
    // Limpa o formulário e preenche apenas o CPF
    this.ownerForm.reset({
      cpf: formattedCpf
    });

    this.notificationService.showMessage('Cliente não encontrado. Por favor, preencha os dados manualmente.', 'info');
    console.log('Customer não encontrado para o CPF:', cpf);
  }

  private formatCpfValue(cpf: string): string {
    // Remove tudo que não é dígito
    let value = cpf.replace(/\D/g, '');
    
    // Aplica a máscara
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    return value;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.ownerForm.controls).forEach(key => {
      const control = this.ownerForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ownerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  formatCpfSearch(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.cpfSearchValue = value;
  }

  formatCpf(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      this.ownerForm.patchValue({ cpf: value });
    }
  }

  formatRg(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); 
    if (value.length > 9) {
      value = value.substring(0, 9);
    }

    value = value.replace(/(\d{2})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1})$/, '$1-$2');
    this.ownerForm.patchValue({ rg: value }, { emitEvent: false });
  }

  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length > 10) {
      value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d\d)(\d{4})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d\d)(\d*)/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d*)/, '($1');
    }

    event.target.value = value;
    //this.ownerForm.get('phone')?.setValue(value.replace(/\D/g, ''), { emitEvent: false });
  }

  formatCellPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); 
    if (value.length > 11) {
      value = value.substring(0, 11); 
    }

    if (value.length > 10) {
      value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d\d)(\d{4})(\d*)/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d\d)(\d*)/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d*)/, '($1');
    }
    
    event.target.value = value;
    // this.ownerForm.get('cellPhone')?.setValue(value.replace(/\D/g, ''), { emitEvent: false });
  }

  formatBirthDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    if (value.length > 4) {
      value = value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d)/, '$1/$2');
    }
    
    event.target.value = value;
    this.ownerForm.get('birthDate')?.setValue(value, { emitEvent: false });
  }

  onBirthDateInput(): void {
    let value = this.birthDateMask.replace(/\D/g, '');
    
    if (value.length > 8) { value = value.substring(0, 8); }
    if (value.length > 4) { value = value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3'); }
    else if (value.length > 2) { value = value.replace(/(\d{2})(\d)/, '$1/$2'); }
    this.birthDateMask = value;

    if (this.birthDateMask.length === 10) {
      const parts = this.birthDateMask.split('/');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1900) {
        this.ownerForm.get('birthDate')?.setValue({ year, month, day });
      }
    }
  }

  onDateSelect(date: any): void {
      if(date && date.year) {
        this.birthDateMask = `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`;
      }
  }

  /**
   * Limpa o valor de um campo de data
   */
  clearDate(fieldName: string): void {
    this.ownerForm.patchValue({ [fieldName]: null });
  }

  /**
   * Converte string de data (YYYY-MM-DD) para NgbDateStruct
   */
  private convertStringToNgbDateStruct(dateString: string): any {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }
}
