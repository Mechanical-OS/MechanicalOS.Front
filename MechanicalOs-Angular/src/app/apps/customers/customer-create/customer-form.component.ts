import { Component, OnInit, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component'
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model'
import { FormValidationService } from 'src/app/shared/services/form-validation.service'
import { CustomerFactory } from './customer-factory'
import { CustomerService } from '../customer.service'
import { Result } from 'src/app/Http/models/operation-result.model'
import { Customer } from '../../Shared/models/customer.model'
import { Router, ActivatedRoute } from '@angular/router'
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service'
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap'
import { ViaCepService } from 'src/app/Http/via-cep/via-cep.service'
import { ZipCodeResponse } from 'src/app/Http/via-cep/zipcode-response'
import { HttpErrorResponse } from '@angular/common/http'
import { UiInteractionService } from 'src/app/shared/services/ui-interaction.service'; 

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit, AfterViewInit, OnDestroy { // IMPLEMENTE AfterViewInit, OnDestroy
  pageTitle: BreadcrumbItem[] = []
  form!: FormGroup

  isEditMode = false
  customerId: string | null = null
  isDisabled: boolean = false

  private initialFormValue: any

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public messageValidationService: FormValidationService,
    private service: CustomerService,
    private viaCepService: ViaCepService,
    private metroMenuService: MetroMenuService,
    private cdr: ChangeDetectorRef,
    private uiInteractionService: UiInteractionService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId) {
      this.isEditMode = true;
      this.loadCustomer(this.customerId);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.metroMenuService.setButtons(this.menuButtons);
      if (this.form) {
        this.form.valueChanges.subscribe(() => {
          this.updateSaveButtonState();
        });
      }
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnDestroy(): void {
    this.metroMenuService.setButtons([]);
  }

  buildForm(): void {
    this.form = this.fb.group({
      id: [null],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      rg: ['', [Validators.pattern(/^\d{7,9}$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      whatsapp: ['', [Validators.pattern(/^\d{10,11}$/)]],
      zipcode: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      street: ['', [Validators.required]],
      uf: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      city: ['', [Validators.required]],
      neighborhood: ['', [Validators.required]],
      number: ['', [Validators.required]],
      complement: ['']
    })

    this.initialFormValue = JSON.parse(JSON.stringify(this.form.value));
  }

  onlyNumber(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.keyCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  async loadCustomer(id: string): Promise<void> {
    try {
      const customer: Result<Customer> | undefined = await this.service.findById(id).toPromise();
      if (customer) {
        const formValue = this.mapCustomerToForm(customer.content);
        this.form.patchValue(formValue);
      }
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao carregar dados do cliente.', icon: 'error' }, this.menuButtons);
    }
  }

  private convertStringToNgbDateStruct(dateString: string): NgbDateStruct | null {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length !== 3) return null;
    return {
      year: +parts[0],
      month: +parts[1],
      day: +parts[2]
    };
  }

  mapCustomerToForm(customer: Customer): any {
    const [firstName, ...rest] = customer.name.split(' ')
    return {
      id: customer.id,
      firstName,
      lastName: rest.join(' '),
      birthDate: customer.dateOfBirth
        ? this.convertStringToNgbDateStruct(customer.dateOfBirth)
        : null,
      cpf: customer.socialNumber,
      rg: customer.nationalId,
      email: customer.email,
      phone: customer.phone,
      whatsapp: customer.whatsApp,
      zipcode: customer.address.zipcode,
      street: customer.address.street,
      uf: customer.address.state,
      city: customer.address.city,
      neighborhood: customer.address.neighborhood,
      number: customer.address.number,
      complement: customer.address.complement
    }
  }

  private clearApiErrors(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (!control) return;
      const errs = control.errors ? { ...control.errors } : null;
      if (errs && errs['apiError']) {
        delete errs['apiError'];
        if (Object.keys(errs).length === 0) {
          control.setErrors(null);
        } else {
          control.setErrors(errs);
        }
      }
    });
  }

  private setFieldApiError(controlName: string, message: string): void {
    const control = this.form.get(controlName);
    if (!control) return;
    const errs = control.errors ? { ...control.errors } : {};
    errs['apiError'] = message;
    control.setErrors(errs);
    control.markAsTouched();
  }

  async onSubmit(): Promise<void> {
    this.clearApiErrors();
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      await this.uiInteractionService.showSweetAlert({ title: 'Atenção', text: 'Por favor, corrija os campos inválidos.', icon: 'warning' }, this.menuButtons);
      return;
    }

    const customer = CustomerFactory.fromForm(this.form.value);

    try {
      if (this.isEditMode && this.customerId) {
        // --- ATUALIZAÇÃO ---
        const ret: Result<Customer> | undefined = await this.service.update(customer).toPromise();
        if (ret && ret.statusCode === 200) {
          await this.uiInteractionService.showSweetAlert({ title: 'Sucesso', text: 'Cliente atualizado com sucesso.', icon: 'success' }, this.menuButtons);
          this.router.navigate(['apps/customers']);
        } else {
          await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: (ret as any)?.message || 'Não foi possível atualizar.', icon: 'error' }, this.menuButtons);
        }
      } else {
        // --- CADASTRO ---
        const ret: Result<Customer> | undefined = await this.service.save(customer).toPromise();
        if (ret && ret.statusCode === 200) {
          await this.uiInteractionService.showSweetAlert({ title: 'Sucesso', text: 'Cliente cadastrado com sucesso.', icon: 'success' }, this.menuButtons);
          this.form.reset();
          this.metroMenuService.disableButton('save');
          this.router.navigate(['apps/customers']);
        } else {
          await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: (ret as any)?.message || 'Não foi possível salvar.', icon: 'error' }, this.menuButtons);
        }
      }
    } catch (error) {
      const httpError = error as HttpErrorResponse;
      await this.uiInteractionService.showSweetAlert({ title: 'Erro de Comunicação', text: 'Não foi possível completar a operação.', icon: 'error' }, this.menuButtons);
      if (httpError.error && httpError.error.errors) {
        for (const field in httpError.error.errors) {
          if (this.form.get(field)) {
            this.setFieldApiError(field, httpError.error.errors[field][0]);
          }
        }
      }
    }
  }

  async getZipCode(): Promise<void> {
    const value = this.form.controls['zipcode'].value;
    if (value.length === 8) {
      try {
        const ret: ZipCodeResponse | undefined = await this.viaCepService.getCep(value).toPromise();
        if (ret) {
          this.form.patchValue({
            street: ret.logradouro,
            uf: ret.uf,
            city: ret.localidade,
            neighborhood: ret.bairro,
            complement: ret.complemento
          });
        }
      } catch (error) {
        await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'CEP inválido ou não encontrado.', icon: 'error' }, this.menuButtons);
        this.form.patchValue({ street: '', uf: '', city: '', neighborhood: '', complement: '' });
        this.setFieldApiError('zipcode', 'CEP inválido ou não encontrado.');
      }
    }
  }

  onCpfInput(event: any) {
    const value = event.target.value.replace(/\D/g, '');
    this.form.get('cpf')?.setValue(value, { emitEvent: false });
  }

  onRgInput(event: any) {
    const value = event.target.value.replace(/\D/g, '');
    this.form.get('rg')?.setValue(value, { emitEvent: false });
  }

  onPhoneInput(event: any) {
    const value = event.target.value.replace(/\D/g, '');
    this.form.get('phone')?.setValue(value, { emitEvent: false });
  }

  onWhatsappInput(event: any) {
    const value = event.target.value.replace(/\D/g, '');
    this.form.get('whatsapp')?.setValue(value, { emitEvent: false });
  }

  onCepInput(event: any) {
    const value = event.target.value.replace(/\D/g, '');
    this.form.get('zipcode')?.setValue(value, { emitEvent: false });
  }

  //#region MENU
  menuButtons: MetroButton[] = [
    { id: 'new', label: 'Novo', iconClass: 'fas fa-plus', colorClass: 'start', visible: true, enabled: true },
    { id: 'save', label: 'Salvar', iconClass: 'fas fa-save', colorClass: 'save', visible: true, enabled: false },
    { id: 'exit', label: 'Voltar', iconClass: 'fas fa-sign-out-alt', colorClass: 'exit', visible: true, enabled: true }
  ]

  handleMenuAction(action: string) {
    switch (action) {
      case 'save': this.onSubmit(); break;
      case 'exit': this.router.navigate(['apps/customers']); break;
      case 'new': this.router.navigate(['apps/customers/new']); break;
    }
  }

  private updateSaveButtonState(): void {
    const initialValueString = JSON.stringify(this.initialFormValue);
    const currentValueString = JSON.stringify(this.form.value);
    const hasChanged = initialValueString !== currentValueString;

    if (this.form.valid && hasChanged) {
      this.metroMenuService.enableButton('save');
    } else {
      this.metroMenuService.disableButton('save');
    }
  }

  //#endregion

  //#region HELPERS
  clearDate(control: string) {
    this.form.controls[control].setValue(null)
  }
  //#endregion
}
