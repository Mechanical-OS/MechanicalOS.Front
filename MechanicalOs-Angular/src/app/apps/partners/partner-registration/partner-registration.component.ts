// partner-store-form.component.ts

import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PartnersService } from '../partners.service';
import { Partner } from 'src/app/apps/Shared/models/partners.model'
import { HttpErrorResponse } from '@angular/common/http';
import { ViaCepService } from 'src/app/Http/via-cep/via-cep.service';
import { FormValidationService } from 'src/app/shared/services/form-validation.service';
import { ZipCodeResponse } from 'src/app/Http/via-cep/zipcode-response'
@Component({
  selector: 'app-partner-store-form',
  templateUrl: './partner-registration.component.html',
  styleUrls: ['./partner-registration.component.scss']
})
export class PartnerRegistrationComponent implements OnInit, AfterViewInit {

  pageTitle: BreadcrumbItem[] = [];
  form!: FormGroup;
  isEditMode = false;
  storeId: string | null = null;
  
  selectedFile: File | null = null;
  selectedFileName: string = '';
  isDragging: boolean = false;
  
  validationResult: { success: boolean; messages: string[] } = { success: false, messages: [] };
  @ViewChild('validationModal', { static: false }) validationModal!: TemplateRef<any>;

  private initialFormValue: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private metroMenuService: MetroMenuService,
    private modalService: NgbModal,
    private partnersService: PartnersService,
    private viaCepService: ViaCepService,
    public messageValidationService: FormValidationService
  ) {}

  ngOnInit(): void {
    this.checkEditMode();
    this.setupPageTitle();
    this.buildForm();
    // this.loadInitialData();
  }

  ngAfterViewInit(): void {
    this.metroMenuService.setButtons(this.menuButtons);

    if (this.form) {
      this.form.valueChanges.subscribe(() => {
        this.updateSaveButtonState();
      });
    }
  }

  setupPageTitle(): void {
    this.pageTitle = [
      { label: "Home", path: "/" },
      { label: "Lojas Parceiras", path: "/lojas-parceiras" },
      { label: this.isEditMode ? "Editar Loja" : "Nova Loja Parceira", path: "/", active: true }
    ];
  }

  checkEditMode(): void {
    this.storeId = this.route.snapshot.paramMap.get('id');
    if (this.storeId) {
      this.isEditMode = true;
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      razaoSocial: ['', [Validators.required]],
      nomeFantasia: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      whatsapp: ['', [Validators.pattern(/^\d{10,11}$/)]],
      
      address: this.fb.group({
        cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
        uf: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
        cidade: ['', [Validators.required]],
        bairro: ['', [Validators.required]],
        rua: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        complemento: ['']
      })
    });

    this.initialFormValue = JSON.parse(JSON.stringify(this.form.value));
  }

    onlyNumber(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }

  onCnpjInput(event: any) {
    const value = event.target.value.replace(/\D/g, '');
    this.form.get('cnpj')?.setValue(value, { emitEvent: false });
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
    this.form.get('address.cep')?.setValue(value, { emitEvent: false });
  }

  getZipCode(): void {
    const cepControl = this.form.get('address.cep');
    if (cepControl && cepControl.valid && cepControl.value.length === 8) {
      this.viaCepService.getCep(cepControl.value).subscribe({
        next: (ret: ZipCodeResponse) => {
          this.form.get('address')?.patchValue({
            rua: ret.logradouro,
            uf: ret.uf,
            cidade: ret.localidade,
            bairro: ret.bairro,
            complemento: ret.complemento
          });
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.showMessage('CEP inválido ou não encontrado.', 'error');
        }
      });
    }
  }

  onFileSelected(event: any): void {
    this.handleFile(event.target.files[0]);
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer?.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  handleFile(file: File): void {
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.updateSaveButtonState();
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
      this.notificationService.showMessage('Por favor, selecione um arquivo no formato .csv', 'error');
    }
  }
  
  onSubmit(): void {
    if (!this.form.valid) {
      this.notificationService.showMessage('Por favor, preencha todos os campos obrigatórios do formulário.', 'error');
      this.form.markAllAsTouched();
      return;
    }
    if (!this.selectedFile) {
      this.notificationService.showMessage('Por favor, adicione o arquivo CSV de estoque.', 'error');
      return;
    }

    this.validateCsvAndSubmit(this.selectedFile);
  }

  private validateCsvAndSubmit(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = reader.result as string;
      const headers = text.slice(0, text.indexOf('\n')).trim().toLowerCase().split(',');
      const requiredColumns = ['sku', 'descrição', 'código', 'valor', 'quantidade', 'categoria', 'veículo_compatível'];
      
      const missingColumns = requiredColumns.filter(col => !headers.includes(col.toLowerCase()));

      if (missingColumns.length > 0) {
        this.validationResult = {
          success: false,
          messages: missingColumns.map(col => `Coluna obrigatória não encontrada: "${col}"`)
        };
        this.modalService.open(this.validationModal, { centered: true });
      } else {
        this.notificationService.showMessage('Arquivo CSV validado com sucesso! Salvando dados...', 'info');
        
        const formData = this.form.value;
        const partnerData: Partner = {
            id: this.isEditMode && this.storeId ? parseInt(this.storeId, 10) : 0,
            name: formData.nomeFantasia || formData.razaoSocial, // Usar nome fantasia ou razão social
            description: formData.description,
            address: `${formData.address.rua}, ${formData.address.numero} - ${formData.address.bairro}, ${formData.address.cidade}/${formData.address.uf}`,
            phone: formData.telefone,
            email: formData.email,
            website: formData.website
        };

        this.partnersService.savePartner(partnerData, file).subscribe({
          next: (response) => {
            this.notificationService.showMessage('Loja Parceira e estoque salvos com sucesso!', 'success');
            this.router.navigate(['/apps/partners']);
          },
          error: (err) => {
            this.notificationService.showMessage('Ocorreu um erro ao salvar a loja.', 'error');
          }
        });
      }
    };
    reader.readAsText(file);
  }
  
  menuButtons: MetroButton[] = [
    { id: 'save', label: 'Salvar', iconClass: 'fas fa-save', colorClass: 'save', visible: true, enabled: false },
    { id: 'exit', label: 'Voltar', iconClass: 'fas fa-sign-out-alt', colorClass: 'exit', visible: true, enabled: true }
  ];

  handleMenuAction(action: string): void {
    switch (action) {
      case 'save':
        this.onSubmit();
        break;
      case 'exit':
        this.router.navigate(['/apps/partners']);
        break;
    }
  }

  private updateSaveButtonState(): void {
    const initialValueString = JSON.stringify(this.initialFormValue);
    const currentValueString = JSON.stringify(this.form.value);
    const hasChanged = initialValueString !== currentValueString;

    if (this.form.valid && (hasChanged || this.selectedFile)) {
      this.metroMenuService.enableButton('save');
    } else {
      this.metroMenuService.disableButton('save');
    }
  }
}