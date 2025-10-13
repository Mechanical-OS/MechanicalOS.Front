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

    console.log('Formulário populado com os dados do customer:', customer);
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
    const ownerData: OwnerData = this.ownerForm.value;
    this.draftService.updateOwnerData(ownerData);
    console.log('Dados do owner salvos automaticamente:', ownerData);
  }
}
