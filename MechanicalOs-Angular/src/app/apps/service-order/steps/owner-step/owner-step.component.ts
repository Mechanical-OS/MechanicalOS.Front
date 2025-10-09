import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceOrderDraftService, OwnerData } from '../../shared/service-order-draft.service';

@Component({
  selector: 'app-owner-step',
  templateUrl: './owner-step.component.html',
  styleUrl: './owner-step.component.scss'
})
export class OwnerStepComponent implements OnInit, OnDestroy {
  ownerForm: FormGroup;
  cpfSearchValue: string = '';

  constructor(
    private fb: FormBuilder,
    private draftService: ServiceOrderDraftService
  ) {
    this.ownerForm = this.createForm();
  }

  ngOnInit(): void {
    console.log('OwnerStepComponent inicializado');
    // Carrega dados existentes se houver
    const currentDraft = this.draftService.getCurrentDraft();
    if (currentDraft.owner) {
      this.loadOwnerData(currentDraft.owner);
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
      // Simula busca por CPF (mock)
      this.searchOwnerByCpf(this.cpfSearchValue.trim());
    }
  }

  private searchOwnerByCpf(cpf: string): void {
    // Mock data baseado no CPF
    const mockOwnerData = {
      firstName: 'Kleiton',
      lastName: 'Freitas',
      cpf: cpf,
      rg: '12.345.678-9',
      email: 'kleitonsfreitas@gmail.com',
      phone: '11-3456-7890',
      cellPhone: '11-98765-4321',
      contact: 'Kleiton'
    };

    this.ownerForm.patchValue(mockOwnerData);
    console.log(`Busca realizada para o CPF: ${cpf}`);
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
    const ownerData: OwnerData = this.ownerForm.value;
    this.draftService.updateOwnerData(ownerData);
    console.log('Dados do owner salvos automaticamente:', ownerData);
  }
}
