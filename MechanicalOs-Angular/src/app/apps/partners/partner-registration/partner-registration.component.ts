// partner-store-form.component.ts

import { Component, OnInit, AfterViewInit, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.checkEditMode();
    this.setupPageTitle();
    this.buildForm();
    // this.loadInitialData(); // Se precisar carregar dados para o modo de edição
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
      { label: "Lojas Parceiras", path: "/lojas-parceiras" }, // Crie esta rota se tiver uma listagem
      { label: this.isEditMode ? "Editar Loja" : "Nova Loja Parceira", path: "/", active: true }
    ];
  }

  checkEditMode(): void {
    this.storeId = this.route.snapshot.paramMap.get('id');
    if (this.storeId) {
      this.isEditMode = true;
      // Chamar a função para carregar dados da loja
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      cnpj: ['', [Validators.required]],
      razaoSocial: ['', [Validators.required]],
      nomeFantasia: [''],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
      whatsapp: [''],
      cep: ['', [Validators.required]],
      uf: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      bairro: ['', [Validators.required]],
      rua: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: ['']
    });

    this.initialFormValue = JSON.parse(JSON.stringify(this.form.value));
  }
  
  // --- LÓGICA DE UPLOAD DE ARQUIVO ---

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
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
      this.notificationService.showMessage('Por favor, selecione um arquivo no formato .csv', 'error');
    }
  }
  
  // --- LÓGICA DE VALIDAÇÃO E SUBMISSÃO ---
  
  onSubmit(): void {
    if (!this.form.valid) {
      this.notificationService.showMessage('Por favor, preencha todos os campos obrigatórios do formulário.', 'error');
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
      const headers = text.slice(0, text.indexOf('\n')).trim().split(',');
      const requiredColumns = ['sku', 'descrição', 'código', 'valor', 'quantidade', 'categoria', 'veículo_compatível'];
      
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));

      if (missingColumns.length > 0) {
        this.validationResult = {
          success: false,
          messages: missingColumns.map(col => `Coluna obrigatória não encontrada: "${col}"`)
        };
        this.modalService.open(this.validationModal, { centered: true });
      } else {
        // this.notificationService.showMessage('Arquivo CSV validado com sucesso! Salvando dados...', 'info');
        // // Se a validação passou, envia para o serviço
        // this.partnerStoreService.save(this.form.value, file).subscribe({
        //   next: (response) => {
        //     this.notificationService.showMessage('Loja Parceira e estoque salvos com sucesso!', 'success');
        //     this.router.navigate(['/lojas-parceiras']); // Navega para a página de listagem
        //   },
        //   error: (err) => {
        //     this.notificationService.showMessage('Ocorreu um erro ao salvar a loja.', 'error');
        //   }
        // });
      }
    };
    reader.readAsText(file);
  }

  // --- LÓGICA DO MENU E BOTÃO SALVAR ---
  
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
        this.router.navigate(['/']); // Ajuste para a rota correta
        break;
    }
  }

  private updateSaveButtonState(): void {
    const initialValueString = JSON.stringify(this.initialFormValue);
    const currentValueString = JSON.stringify(this.form.value);
    const hasChanged = initialValueString !== currentValueString;

    if (this.form.valid && (hasChanged || this.selectedFile)) { // Habilita se o form mudou OU se um arquivo foi adicionado
      this.metroMenuService.enableButton('save');
    } else {
      this.metroMenuService.disableButton('save');
    }
  }
}