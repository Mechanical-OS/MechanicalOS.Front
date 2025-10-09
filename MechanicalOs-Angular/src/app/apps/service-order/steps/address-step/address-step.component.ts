import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceOrderDraftService, AddressData } from '../../shared/service-order-draft.service';

@Component({
  selector: 'app-address-step',
  templateUrl: './address-step.component.html',
  styleUrl: './address-step.component.scss'
})
export class AddressStepComponent implements OnInit, OnDestroy {
  addressForm: FormGroup;
  zipCodeSearchValue: string = '';

  constructor(
    private fb: FormBuilder,
    private draftService: ServiceOrderDraftService
  ) {
    this.addressForm = this.createForm();
  }

  ngOnInit(): void {
    // Carrega dados existentes se houver
    const currentDraft = this.draftService.getCurrentDraft();
    if (currentDraft.address) {
      this.loadAddressData(currentDraft.address);
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
      // Simula busca por CEP (mock)
      this.searchAddressByZipCode(this.zipCodeSearchValue.trim());
    }
  }

  private searchAddressByZipCode(zipCode: string): void {
    // Mock data baseado no CEP
    const mockAddressData = {
      city: 'Indaiatuba',
      state: 'SP',
      neighborhood: 'Jardim Bela Vista',
      street: 'Av Ary Barnabé',
      number: '251',
      complement: 'Sem complemento',
      zipCode: zipCode
    };

    this.addressForm.patchValue(mockAddressData);
    console.log(`Busca realizada para o CEP: ${zipCode}`);
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
    const addressData: AddressData = this.addressForm.value;
    this.draftService.updateAddressData(addressData);
    console.log('Dados do endereço salvos automaticamente:', addressData);
  }
}
