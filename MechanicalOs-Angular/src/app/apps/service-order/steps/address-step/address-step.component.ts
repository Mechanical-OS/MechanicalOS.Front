import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceOrderDraftService, AddressData } from '../../shared/service-order-draft.service';
import { ViaCepService } from 'src/app/Http/via-cep/via-cep.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ZipCodeResponse } from 'src/app/Http/via-cep/zipcode-response';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-address-step',
  templateUrl: './address-step.component.html',
  styleUrl: './address-step.component.scss'
})
export class AddressStepComponent implements OnInit, OnDestroy {
  addressForm: FormGroup;
  zipCodeSearchValue: string = '';
  isSearching: boolean = false;
  private saveSubscription!: Subscription;

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
    this.saveSubscription = this.draftService.saveStep$.subscribe((callback) => {
      this.onSave(callback);
    });
  }

 onSave(callback: (success: boolean) => void): void {
    if (this.addressForm.valid) {
      const addressData: AddressData = this.addressForm.value;
      const currentAddressId = this.draftService.getCurrentDraft().address?.id;
      this.draftService.updateAddressData(addressData, currentAddressId);
      console.log('Dados de endereço salvos sob comando:', addressData);
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
      city: ['', [Validators.required, Validators.maxLength(100)]],
      state: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      neighborhood: ['', [Validators.required, Validators.maxLength(100)]],
      street: ['', [Validators.required, Validators.maxLength(150)]],
      number: ['', [Validators.required, Validators.maxLength(10)]],
      complement: ['', [Validators.maxLength(100)]],
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

  formatZipCodeSearch(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    this.zipCodeSearchValue = value;
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
}
