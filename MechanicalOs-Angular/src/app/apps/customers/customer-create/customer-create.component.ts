import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { FormValidationService } from 'src/app/shared/services/form-validation.service';
import { CustomerFactory } from './customer-factory';
import { CustomerService } from '../customer.service';
import { Result } from 'src/app/Http/models/operation-result.model';
import { Customer } from '../../Shared/models/customer.model';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { Router } from '@angular/router';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';

@Component({
  selector: 'app-customer-create',
  templateUrl: './customer-create.component.html',
  styleUrls: ['./customer-create.component.scss']
})
export class CustomerCreateComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  form!: FormGroup;

  isDisabled: boolean = false;
  constructor(private router: Router,
    private fb: FormBuilder,
    public messageValidationService: FormValidationService,
    private service: CustomerService,
    private notificationService: NotificationService,
    private metroMenuService: MetroMenuService) { }

  ngOnInit(): void {

    const initialButtons = this.menuButtons;
    this.metroMenuService.setButtons(initialButtons);

    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      cpf: ['', [Validators.required]],
      rg: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      whatsapp: [''],

      zipcode: ['', [Validators.required]],
      street: ['', [Validators.required]],
      uf: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      city: ['', [Validators.required]],
      neighborhood: ['', [Validators.required]],
      number: [''],
      complement: ['']
    });

    this.form.valueChanges.subscribe(() => {
      if(this.form.valid){
        this.metroMenuService.enableButton('save');
      }else{
        this.metroMenuService.disableButton('save');
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const newCustomer = CustomerFactory.fromForm(this.form.value);
      console.log('Novo cliente:', newCustomer);

      this.service.save(newCustomer).subscribe((ret: Result<Customer>) => {
        if (ret.statusCode == 200) {
          this.notificationService.showMessage('Cliente cadastrado com sucesso.','success');
          this.form.reset();
        } else {
          this.notificationService.showError(ret);
        }
      });

      // this.customerService.create(newCustomer).subscribe(...)
    } else {
      this.form.markAllAsTouched();
    }
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
  ];

  handleMenuAction(action: string) {
    switch (action) {
      case 'save':
        console.log('Save acionado');
        this.onSubmit();
        break;
      case 'exit':
        // lógica para sair
        console.log('Sair acionado');
        this.router.navigate(['apps/customers']);
        break;
      case 'photos':
        // lógica para fotos
        console.log('Fotos acionado');
        break;
      case 'new':
        // lógica para novo
        //this.router.navigate(['apps/customers/new']);
        break;
    }
  }
  //#endregion

  //#region HELPERS
  clearDate(control: string) {
    this.form.controls[control].setValue(null);
  }

  //#endregion

}
