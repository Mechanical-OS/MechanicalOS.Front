import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceOrderDraftService, AddressData } from '../../shared/service-order-draft.service';
import { ViaCepService } from 'src/app/Http/via-cep/via-cep.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ZipCodeResponse } from 'src/app/Http/via-cep/zipcode-response';

@Component({
  selector: 'app-address-step',
  templateUrl: './address-step.component.html',
  styleUrl: './address-step.component.scss'
})
export class AddressStepComponent implements OnInit, OnDestroy {
  addressForm: FormGroup;
  zipCodeSearchValue: string = '';
  isSearching: boolean = false;

  constructor(
    private fb: FormBuilder,
    private draftService: ServiceOrderDraftService,
    private viaCepService: ViaCepService,
    private notificationService: NotificationService
  ) {
    this.addressForm = this.createForm();
  }

  ngOnInit(): void {
    // Carrega dados existentes se houver
    const currentDraft = this.draftService.getCurrentDraft();
    if (currentDraft.address?.data) {
      this.loadAddressData(currentDraft.address.data);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      city: ['', Validators.required],
      state: ['', Validators.required],
      neighborhood: ['', Validators.required],
      street: ['', Validators.required],
      number: ['', Validators.required],
      complement: [''],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]]
    });
  }

  private loadAddressData(addressData: AddressData): void {
    this.addressForm.patchValue(addressData);
  }

  onSearchZipCode(): void {
    if (this.zipCodeSearchValue && this.zipCodeSearchValue.trim()) {
      this.searchAddressByZipCode(this.zipCodeSearchValue.trim());
    }
  }

  private searchAddressByZipCode(zipCode: string): void {
    // Remove a máscara do CEP (hífen)
    const cleanZipCode = zipCode.replace(/\D/g, '');
    
    if (cleanZipCode.length !== 8) {
      this.notificationService.showMessage('CEP deve conter 8 dígitos', 'warning');
      return;
    }

    this.isSearching = true;
    this.notificationService.showLoading();

    this.viaCepService.getCep(cleanZipCode).subscribe({
      next: (response: ZipCodeResponse) => {
        if (response.erro) {
          // ViaCep retorna {erro: true} quando não encontra o CEP
          this.handleZipCodeNotFound(zipCode);
        } else {
          // CEP encontrado - popula o formulário
          this.populateFormWithZipCode(response);
        }
      },
      error: (error) => {
        console.error('Erro ao buscar CEP:', error);
        this.notificationService.showError(error);
        this.handleZipCodeNotFound(zipCode);
      },
      complete: () => {
        this.isSearching = false;
        this.notificationService.hideLoading();
      }
    });
  }

  private populateFormWithZipCode(zipCodeData: ZipCodeResponse): void {
    // Formata o CEP com hífen
    const formattedZipCode = this.formatZipCodeValue(zipCodeData.cep);

    // Popula o formulário com os dados do ViaCep
    this.addressForm.patchValue({
      city: zipCodeData.localidade || '',
      state: zipCodeData.uf || '',
      neighborhood: zipCodeData.bairro || '',
      street: zipCodeData.logradouro || '',
      zipCode: formattedZipCode,
      complement: zipCodeData.complemento || ''
    });

    console.log('Formulário populado com os dados do CEP:', zipCodeData);
  }

  private handleZipCodeNotFound(zipCode: string): void {
    const formattedZipCode = this.formatZipCodeValue(zipCode);
    
    // Limpa o formulário e preenche apenas o CEP
    this.addressForm.reset({
      zipCode: formattedZipCode
    });

    this.notificationService.showMessage('CEP não encontrado. Por favor, preencha os dados manualmente.', 'info');
    console.log('CEP não encontrado:', zipCode);
  }

  private formatZipCodeValue(zipCode: string): string {
    // Remove tudo que não é dígito
    let value = zipCode.replace(/\D/g, '');
    
    // Aplica a máscara
    if (value.length <= 8) {
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    return value;
  }

  onSaveAddress(): void {
    if (this.addressForm.valid) {
      const addressData: AddressData = this.addressForm.value;
      this.draftService.updateAddressData(addressData);
      console.log('Dados do endereço salvos:', addressData);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.addressForm.controls).forEach(key => {
      const control = this.addressForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  formatZipCode(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
      this.addressForm.patchValue({ zipCode: value });
    }
  }

  ngOnDestroy(): void {
    console.log('AddressStepComponent sendo destruído');
    // Salva automaticamente quando o componente é destruído
    if (this.addressForm.valid) {
      const addressData: AddressData = this.addressForm.value;
      const currentDraft = this.draftService.getCurrentDraft();
      const addressId = currentDraft.address?.id;
      this.draftService.updateAddressData(addressData, addressId);
      console.log('Dados do endereço salvos automaticamente:', addressData);
    }
  }
}
