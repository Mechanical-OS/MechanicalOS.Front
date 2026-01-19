import { Component, OnInit, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { FormValidationService } from 'src/app/shared/services/form-validation.service';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { UiInteractionService } from 'src/app/shared/services/ui-interaction.service';
import { Result } from 'src/app/Http/models/operation-result.model';
import { UserService } from '../user.service';
import { User } from '../../Shared/models/user.model';
import { ViaCepService } from 'src/app/Http/via-cep/via-cep.service';
import { ZipCodeResponse } from 'src/app/Http/via-cep/zipcode-response';

export class UserFactory {
  static fromForm(formValue: any): User {
    return {
      id: formValue.id || 0,
      name: `${formValue.firstName} ${formValue.lastName}`,
      email: formValue.email,
      address: formValue.address,
      role: 'User',
      status: formValue.status
    } as User;
  }
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})

export class UserFormComponent implements OnInit, AfterViewInit, OnDestroy {
  pageTitle: BreadcrumbItem[] = [];
  form!: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  private initialFormValue: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public messageValidationService: FormValidationService,
    private service: UserService,
    private metroMenuService: MetroMenuService,
    private cdr: ChangeDetectorRef,
    private uiInteractionService: UiInteractionService,
    private viaCepService: ViaCepService
  ) {}

  ngOnInit(): void {
    this.setupPageTitle();
    this.buildForm();
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode = true;
      this.loadUser(this.userId);
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

  setupPageTitle(): void {
    this.pageTitle = [
      { label: "Usuários", path: "/apps/users" },
      { label: this.isEditMode ? "Editar Usuário" : "Novo Usuário", path: "/", active: true },
    ];
  }

  buildForm(): void {
    this.form = this.fb.group({
      id: [null],
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      rg: [''],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      whatsapp: ['', [Validators.pattern(/^\d{10,11}$/)]],
      login: ['', [Validators.required]],
      password: [''],
      status: [1, [Validators.required]],
      address: this.fb.group({
        zipcode: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
        street: ['', [Validators.required]],
        uf: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
        city: ['', [Validators.required]],
        neighborhood: ['', [Validators.required]],
        number: ['', [Validators.required]],
        complement: ['']
      })
    });
    
    if (!this.isEditMode) {
      this.form.get('password')?.setValidators(Validators.required);
    }
    this.form.get('password')?.updateValueAndValidity();

    this.initialFormValue = JSON.parse(JSON.stringify(this.form.value));
  }

  onCpfInput(event: any) { 
    const value = event.target.value.replace(/\D/g, ''); this.form.get('cpf')?.setValue(value, { emitEvent: false }); 
  }

  onRgInput(event: any) { 
    const value = event.target.value.replace(/\D/g, ''); this.form.get('rg')?.setValue(value, { emitEvent: false }); 
  }

  onPhoneInput(event: any) { 
    const value = event.target.value.replace(/\D/g, ''); this.form.get('phone')?.setValue(value, { emitEvent: false }); 
  }

  onWhatsappInput(event: any) { 
    const value = event.target.value.replace(/\D/g, ''); this.form.get('whatsapp')?.setValue(value, { emitEvent: false }); 
  }
  
  onCepInput(event: any) { 
    const value = event.target.value.replace(/\D/g, ''); this.form.get('address.zipcode')?.setValue(value, { emitEvent: false }); 
  }
  
  async getZipCode(): Promise<void> {
    const cepControl = this.form.get('address.zipcode');
    if (cepControl && cepControl.valid) {
      try {
        const ret: ZipCodeResponse | undefined = await this.viaCepService.getCep(cepControl.value).toPromise();
        if (ret && !ret.erro) {
          this.form.get('address')?.patchValue({
            street: ret.logradouro,
            uf: ret.uf,
            city: ret.localidade,
            neighborhood: ret.bairro,
            complement: ret.complemento
          });
        } else {
          throw new Error("CEP não encontrado.");
        }
      } catch (error) {
        await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'CEP inválido ou não encontrado.', icon: 'error' }, this.menuButtons);
      }
    }
  }

  async loadUser(id: string): Promise<void> {
    try {
      const result: Result<User> | undefined = await this.service.findById(id).toPromise();
      if (result && result.content) {
        const formValue = this.mapUserToForm(result.content);
        this.form.patchValue(formValue);
      } else {
        throw new Error("Usuário não encontrado.");
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao carregar dados do usuário.', icon: 'error' }, this.menuButtons);
      this.router.navigate(['apps/users']);
    }
  }

  mapUserToForm(user: User): any {
    const nameParts = user.name.split(' ');
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ');

    return {
      id: user.id,
      firstName: firstName,
      lastName: lastName,
      email: user.email,
    };
  }
  
  async onSubmit(): Promise<void> {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      await this.uiInteractionService.showSweetAlert({ title: 'Atenção', text: 'Por favor, corrija os campos inválidos.', icon: 'warning' }, this.menuButtons);
      return;
    }

    const user = UserFactory.fromForm(this.form.value);

    try {
      if (this.isEditMode && this.userId) {
        const ret: Result<User> | undefined = await this.service.update(user).toPromise();
        if (ret && ret.statusCode === 200) {
          await this.uiInteractionService.showSweetAlert({ title: 'Sucesso', text: 'Usuário atualizado com sucesso.', icon: 'success' }, this.menuButtons);
          this.router.navigate(['apps/users']);
        } else {
          await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: (ret as any)?.message || 'Não foi possível atualizar.', icon: 'error' }, this.menuButtons);
        }
      } else {
        const ret: Result<User> | undefined = await this.service.save(user).toPromise();
        if (ret && ret.statusCode === 200) {
          await this.uiInteractionService.showSweetAlert({ title: 'Sucesso', text: 'Usuário cadastrado com sucesso.', icon: 'success' }, this.menuButtons);
          this.form.reset();
          this.router.navigate(['apps/users']);
        } else {
          await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: (ret as any)?.message || 'Não foi possível salvar.', icon: 'error' }, this.menuButtons);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      await this.uiInteractionService.showSweetAlert({ title: 'Erro de Comunicação', text: 'Não foi possível completar a operação.', icon: 'error' }, this.menuButtons);
    }
  }

  // --- MENU ---
  menuButtons: MetroButton[] = [
    { id: 'new', label: 'Novo', iconClass: 'fas fa-plus', colorClass: 'start', visible: true, enabled: true },
    { id: 'save', label: 'Salvar', iconClass: 'fas fa-save', colorClass: 'save', visible: true, enabled: false },
    { id: 'exit', label: 'Voltar', iconClass: 'fas fa-sign-out-alt', colorClass: 'exit', visible: true, enabled: true }
  ];

  handleMenuAction(action: string) {
    switch (action) {
      case 'save': this.onSubmit(); break;
      case 'exit': this.router.navigate(['apps/users']); break;
      case 'new': this.router.navigate(['apps/users/new']); break;
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
}