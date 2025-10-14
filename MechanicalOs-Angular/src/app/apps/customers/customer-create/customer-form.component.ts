import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component'
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model'
import { FormValidationService } from 'src/app/shared/services/form-validation.service'
import { CustomerFactory } from './customer-factory'
import { CustomerService } from '../customer.service'
import { Result } from 'src/app/Http/models/operation-result.model'
import { Customer } from '../../Shared/models/customer.model'
import { NotificationService } from 'src/app/shared/services/notification.service'
import { Router, ActivatedRoute } from '@angular/router'
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service'
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap'
import { ViaCepService } from 'src/app/Http/via-cep/via-cep.service'
import { ZipCodeResponse } from 'src/app/Http/via-cep/zipcode-response'
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = []
  form!: FormGroup

  isEditMode = false
  customerId: string | null = null

  isDisabled: boolean = false

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public messageValidationService: FormValidationService,
    private service: CustomerService,
    private viaCepService: ViaCepService,
    private notificationService: NotificationService,
    private metroMenuService: MetroMenuService
  ) {}

  ngOnInit(): void {
    const initialButtons = this.menuButtons
    this.metroMenuService.setButtons(initialButtons)

    this.buildForm()

    this.customerId = this.route.snapshot.paramMap.get('id')
    if (this.customerId) {
      console.log(this.customerId)
      this.isEditMode = true
      this.loadCustomer(this.customerId)
    }

    this.form.valueChanges.subscribe(() => {
      if (this.form.valid) {
        this.metroMenuService.enableButton('save')
      } else {
        this.metroMenuService.disableButton('save')
      }
    })
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
      uf: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(2)]
      ],
      city: ['', [Validators.required]],
      neighborhood: ['', [Validators.required]],
      number: ['', [Validators.required]],
      complement: ['']
    })
  }

  onlyNumber(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.keyCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }


  loadCustomer(id: string): void {
    this.service.findById(id).subscribe(
      (customer: Result<Customer>) => {
        console.log('Cliente para atualziar', customer)
        const formValue = this.mapCustomerToForm(customer.content)
        this.form.patchValue(formValue)
      },
      (error: HttpErrorResponse) => {
        console.error('Erro ao carregar cliente:', error);
        this.notificationService.showError(error);
        this.router.navigate(['apps/customers']);
      }
    );
  }

  private convertStringToNgbDateStruct(dateString: string): NgbDateStruct | null {
  if (!dateString) return null;
  const parts = dateString.split('-'); // esperado "YYYY-MM-DD"
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

  // limpa erros de API anteriores (mantendo outros erros do controle)
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

  onSubmit(): void {
    this.clearApiErrors(); // Limpa erros de API de tentativas anteriores
    if (this.form.valid) {
      const customer = CustomerFactory.fromForm(this.form.value)

      if (this.isEditMode && this.customerId) {
        console.log('Update: ', customer)
        this.service.update(customer).subscribe(
          (ret: Result<Customer>) => {
            if (ret.statusCode === 200) {
              console.log(ret)
              this.notificationService.showMessage(
                'Cliente atualizado com sucesso.',
                'Sucesso'
              )
            } else {
              this.notificationService.showError(ret);
            }
          },
          (error: HttpErrorResponse) => {
            console.error('Erro ao atualizar cliente:', error);
            this.notificationService.showError(error);
            if (error.error && error.error.errors) {
              for (const field in error.error.errors) {
                if (this.form.get(field)) {
                  this.setFieldApiError(field, error.error.errors[field][0]);
                }
              }
            }
          }
        )
      } else {
        console.log('Insert: ', customer)
        this.service.save(customer).subscribe(
          (ret: Result<Customer>) => {
            if (ret.statusCode === 200) {
              this.notificationService.showMessage(
                'Cliente cadastrado com sucesso.',
                'Sucesso'
              )
              this.form.reset()
              this.metroMenuService.disableButton('save');
            } else {
              this.notificationService.showError(ret);
            }
          },
          (error: HttpErrorResponse) => {
            console.error('Erro ao cadastrar cliente:', error);
            this.notificationService.showError(error);
            if (error.error && error.error.errors) {
              for (const field in error.error.errors) {
                if (this.form.get(field)) {
                  this.setFieldApiError(field, error.error.errors[field][0]);
                }
              }
            }
          }
        )
      }
    } else {
      this.form.markAllAsTouched()
    }
  }

  // --- Variáveis ---
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  isDragOver = false;

  // --- Quando o usuário seleciona a imagem manualmente ---
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.previewFile(this.selectedFile);
    }
  }

  // --- Quando o usuário arrasta o arquivo ---
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.previewFile(this.selectedFile);
    }
  }

  // --- Efeitos visuais do drag ---
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  // --- Remover imagem ---
  removeImage(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.previewUrl = null;
  }

  private previewFile(file: File): void {
  const reader = new FileReader();
  reader.onload = () => (this.previewUrl = reader.result);
  reader.readAsDataURL(file);
}

  getZipCode(): void {
    const value = this.form.controls['zipcode'].value
    if (value.length === 8) {
      this.viaCepService.getCep(value).subscribe(
        (ret: ZipCodeResponse) => {
          this.form.patchValue({
            street: ret.logradouro,
            uf: ret.uf,
            city: ret.localidade,
            neighborhood: ret.bairro,
            complement: ret.complemento
          })
        },
        (error: HttpErrorResponse) => { // Tratamento de erro para ViaCEP
          console.error('Erro ao buscar CEP:', error);
          this.notificationService.showError(error);
          this.form.patchValue({
            street: '', uf: '', city: '', neighborhood: '', complement: ''
          });
          this.setFieldApiError('zipcode', 'CEP inválido ou não encontrado.');
        }
      );
    }
  }

  onCpfInput(event: any) {
    const value = event.target.value.replace(/\D/g, ''); // remove tudo que não é número
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
    {
      id: 'new',
      label: 'Novo',
      iconClass: 'fas fa-plus',
      colorClass: 'start',
      visible: true,
      enabled: true
    },
    {
      id: 'save',
      label: 'Salvar',
      iconClass: 'fas fa-save',
      colorClass: 'save',
      visible: true,
      enabled: false
    },
    {
      id: 'exit',
      label: 'Voltar',
      iconClass: 'fas fa-sign-out-alt',
      colorClass: 'exit',
      visible: true,
      enabled: true
    }
  ]

  handleMenuAction(action: string) {
    switch (action) {
      case 'save':
        this.onSubmit()
        break
      case 'exit':
        this.router.navigate(['apps/customers'])
        break
      case 'new':
        this.router.navigate(['apps/customers/new'])
        break
    }
  }
  //#endregion

  //#region HELPERS
  clearDate(control: string) {
    this.form.controls[control].setValue(null)
  }
}