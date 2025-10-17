import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceOrderDraftService, OwnerData } from '../../shared/service-order-draft.service';
import { CustomerService } from 'src/app/apps/customers/customer.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { Customer } from 'src/app/apps/Shared/models/customer.model';

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

  constructor(
    private fb: FormBuilder,
    private draftService: ServiceOrderDraftService,
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) {
    this.ownerForm = this.createForm();
  }

  ngOnInit(): void {
    console.log('OwnerStepComponent inicializado');
    // Carrega dados existentes se houver
    const currentDraft = this.draftService.getCurrentDraft();
    if (currentDraft.customer?.data) {
      this.loadOwnerData(currentDraft.customer.data);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      rg: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      cellPhone: ['', Validators.required],
      contact: ['']
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

    // Popula o formulário com os dados do customer
    this.ownerForm.patchValue({
      firstName: firstName,
      lastName: lastName,
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

    console.log('Endereço do cliente salvo automaticamente no draft:', addressData);
    this.notificationService.showMessage('Endereço do cliente carregado com sucesso!', 'success');
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

  onSaveOwner(): void {
    if (this.ownerForm.valid) {
      const ownerData: OwnerData = this.ownerForm.value;
      this.draftService.updateOwnerData(ownerData);
      console.log('Dados do proprietário salvos:', ownerData);
    } else {
      this.markFormGroupTouched();
    }
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

  formatCpf(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      this.ownerForm.patchValue({ cpf: value });
    }
  }

  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d)/, '$1-$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
      } else {
        value = value.replace(/(\d{2})(\d)/, '$1-$2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
      }
      this.ownerForm.patchValue({ phone: value });
    }
  }

  formatCellPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d)/, '$1-$2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
      this.ownerForm.patchValue({ cellPhone: value });
    }
  }

  ngOnDestroy(): void {
    console.log('OwnerStepComponent sendo destruído');
    // Salva automaticamente quando o componente é destruído
    if (this.ownerForm.valid) {
      const ownerData: OwnerData = this.ownerForm.value;
      const currentDraft = this.draftService.getCurrentDraft();
      const customerId = currentDraft.customer?.id;
      this.draftService.updateCustomerData(ownerData, customerId);
      console.log('Dados do owner salvos automaticamente:', ownerData);
    }
  }
}
