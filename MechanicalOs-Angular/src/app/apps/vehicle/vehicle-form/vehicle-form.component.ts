import { Component, OnInit, ChangeDetectorRef, TemplateRef, ViewChild, ElementRef} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { FormValidationService } from 'src/app/shared/services/form-validation.service';
import { VehicleService } from '../vehicle.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { Vehicle, Color, Brand, VehicleModel } from '../../Shared/models/vehicle.model';
import { Result } from 'src/app/Http/models/operation-result.model';
import { SelectizeModel } from 'src/app/shared/selectize/selectize.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlateConsultationResponse } from '../../Shared/models/plate-consultation.model';

// Interface para o modelo de dados enviado para a API
interface VehicleApiModel {
  id: number;
  customerId: number;
  plate: string;
  chassi: string;
  brandId: number;
  vehicleModelId: number;
  version: string;
  year: string;
  colorId: number;
  transmission: string;
  engine: string;
  status: number;
}
declare var bootstrap: any;

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss'
})
export class VehicleFormComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  form!: FormGroup;
  vehicleForm!: FormGroup;
  isEditMode = false;
  vehicleId: string | null = null;
  isDisabled: boolean = false;
  images: { base64: string }[] = [];
  selectedImage: { base64: string } | null = null;
  mainImageIndex: number = 0;
  maxImages: number = 10;
  
  // Propriedades para busca de placa
  searchedPlate: string = '';
  isSearchingPlate: boolean = false;

  brands: SelectizeModel[] = [];
  vehicleModels: SelectizeModel[] = [];
  transmissions: SelectizeModel[] = [{ id: 1, label: "Manual" }, { id: 2, label: "Automático" }, { id: 3, label: "CVT" }, { id: 2, label: "Automatizado" }];
  colors: SelectizeModel[] = [];

  @ViewChild('brandModal', { static: false }) brandModal!: TemplateRef<any>;
  @ViewChild('modelModal', { static: false }) modelModal!: TemplateRef<any>;
  @ViewChild('colorModal', { static: false }) colorModal!: TemplateRef<any>;
  @ViewChild('mainImageCarousel') carouselEl!: ElementRef;
  @ViewChild('vehicleImagesInput') vehicleImagesInput: any;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  newBrandName: string = '';
  newBrandDescription: string = '';
  newModelName: string = '';
  newModelDescription: string = '';
  newColorName: string = '';
  newColorDescription: string = '';
  selectedBrandName: string = '';
  originalVehicleStatus: number = 1; // Status original do veículo em edição

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public messageValidationService: FormValidationService,
    private service: VehicleService,
    private notificationService: NotificationService,
    private metroMenuService: MetroMenuService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) {
    const initialButtons = this.menuButtons;
    this.metroMenuService.setButtons(initialButtons);

    this.buildForm();

    this.form.valueChanges.subscribe(() => {
      if (this.form.valid) {
        this.metroMenuService.enableButton('save');
      } else {
        this.metroMenuService.disableButton('save');
      }
    });
  }

  ngAfterViewInit() {
  if (this.carouselEl) {
    const carouselElement = this.carouselEl.nativeElement;
    new bootstrap.Carousel(carouselElement, { interval: 3000 });

    // Sincroniza o índice da miniatura
    carouselElement.addEventListener('slid.bs.carousel', (event: any) => {
      this.mainImageIndex = event.to; // 'to' é o índice do slide ativo
    });
  }
  }

  openFileDialog() {
    this.vehicleImagesInput.nativeElement.click();
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  ngOnInit(): void { 
    this.setupPageTitle();
    this.checkEditMode();
    this.loadInitialData();
  }

  /**
   * Configura o título da página baseado no modo
   */
  setupPageTitle(): void {
    this.pageTitle = [
      { label: "Home", path: "/" },
      { label: "Veículos", path: "/apps/vehicles" },
      { label: this.isEditMode ? "Editar Veículo" : "Novo Veículo", path: "/", active: true }
    ];
  }

  /**
   * Verifica se está em modo de edição baseado na rota
   */
  checkEditMode(): void {
    this.vehicleId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.vehicleId;
    
    // Atualiza o título após detectar o modo
    this.setupPageTitle();
    
    if (this.isEditMode) {
      console.log('Modo de edição ativado para veículo ID:', this.vehicleId);
      this.loadVehicleForEdit();
    } else {
      console.log('Modo de cadastro novo');
    }
  }

  /**
   * Carrega os dados do veículo para edição
   */
  loadVehicleForEdit(): void {
    if (!this.vehicleId) return;

    this.service.findById(parseInt(this.vehicleId)).subscribe({
      next: (result: Result<Vehicle>) => {
        if (result.statusCode === 200 && result.content) {
          this.populateFormWithVehicleData(result.content);
        } else {
          this.notificationService.showMessage('Erro ao carregar dados do veículo.', 'error');
          this.router.navigate(['apps/vehicles']);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar veículo:', error);
        this.notificationService.showMessage('Erro ao carregar dados do veículo.', 'error');
        this.router.navigate(['apps/vehicle']);
      }
    });
  }

   onImageSelected(event: any): void {
    const files = event.target.files;
    if (!files || this.images.length >= this.maxImages) return;

    Array.from(files).forEach((file: any) => {
      if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        if (this.images.length < this.maxImages) {
          this.images.push({ base64 });
        }
      };
      reader.readAsDataURL(file);
    });
  }
  // Define qual imagem será exibida como principal
  setMainImage(index: number): void {
    this.mainImageIndex = index;
  }

  //Abre o modal de visualização da imagem ampliada

  openImageModal(index: number): void {
    this.selectedImage = this.images[index];
    const modalElement = document.getElementById('imageModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  handleImageUpload(event: any) {
  const files: FileList = event.target.files;
  if (!files || files.length === 0) return;

  const remainingSlots = this.maxImages - this.images.length;
  const filesToAdd = Array.from(files).slice(0, remainingSlots);

  filesToAdd.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64 = e.target.result;
      if (typeof base64 === 'string') {
        this.images.push({ base64 });

        console.log('Imagem adicionada:', base64);
      }
    };
    reader.readAsDataURL(file);
  });

  // Limita a lista de imagens ao máximo permitido
  if (this.images.length > this.maxImages) {
    this.images = this.images.slice(0, this.maxImages);
  }

  // Limpa o input para permitir upload de novos arquivos
  if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
  }

  console.log('Todas as imagens atualmente:', this.images);
}


  /**
   * Popula o formulário com os dados do veículo
   */
  populateFormWithVehicleData(vehicle: Vehicle): void {
    console.log('Populando formulário com dados:', vehicle);
    
    // Armazena o status original do veículo
    this.originalVehicleStatus = vehicle.status || 1;
    
    // Aguarda os dados iniciais carregarem antes de popular o form
    setTimeout(() => {
      this.form.patchValue({
        brand: vehicle.brand?.id || '',
        vehicleModel: vehicle.vehicleModel?.id || '',
        version: vehicle.version || '',
        year: vehicle.year || '',
        chassi: vehicle.chassi || '',
        color: vehicle.color?.id || '',
        transmission: vehicle.transmission || '',
        engine: vehicle.engine || '',
        plate: vehicle.plate || ''
      });

      // Se tem marca, carrega os modelos
      if (vehicle.brand?.id) {
        this.selectedBrandName = vehicle.brand.name;
        this.loadVehicleModelsByBrand(vehicle.brand.id);
      }

      console.log('Formulário populado com sucesso');
    }, 1000); // Aguarda 1 segundo para garantir que os dados iniciais foram carregados
  }

  //#region FORM
  buildForm(): void {
    this.form = this.fb.group({
      brand: ['', [Validators.required]],
      vehicleModel: ['', [Validators.required]],
      version: [''],
      year: ['', [Validators.required]],
      chassi: [''],
      color: [''],
      transmission: [''],
      engine: [''],
      plate: ['']
    });
  }

  get brandControl(): FormControl {
    return this.form.get("brand") as FormControl;
  }

  get vehicleModelControl(): FormControl {
    return this.form.get("vehicleModel") as FormControl;
  }

  get transmissionControl(): FormControl {
    return this.form.get("transmission") as FormControl;
  }

  get colorControl(): FormControl {
    return this.form.get("color") as FormControl;
  }

  onSelectBrandChange($event: any) {
    console.log($event); // event estra trazendo apenas o ID
    // Limpa a seleção do modelo quando a marca muda
    this.vehicleModelControl.setValue('');
    
    // Limpa a lista de modelos
    this.vehicleModels = [];
    
    if ($event) {
      // Atualiza o nome da marca selecionada
      const selectedBrand = this.brands.find(brand => brand.id == $event);
      this.selectedBrandName = selectedBrand ? selectedBrand.label : '';
      
      // Carrega os modelos apenas quando uma marca válida for selecionada
      this.loadVehicleModelsByBrand($event);
    } else {
      this.selectedBrandName = '';
      console.log('Nenhuma marca selecionada - lista de modelos limpa');
    }
    
  }

  onSelectVehicleModelChange($event: any) {
    console.log($event);
  }

  onSelectTrasmissionChange($event: any) {
    console.log($event);
  }

  onSelectColorChange($event: any) {
    console.log($event);
  }

  /**
   * Carrega os modelos de veículos para uma marca específica
   * @param brandId ID da marca selecionada
   */
  loadVehicleModelsByBrand(brandId: number): void {
    console.log(`=== CARREGANDO MODELOS PARA MARCA ${brandId} ===`);
    // Carrega todos os modelos da API
    this.service.getAllVehicleModels().subscribe({
      next: (models: VehicleModel[]) => {
        console.log('Todos os modelos carregados:', models);
        
        // Filtra apenas os modelos da marca selecionada
        const filteredModels = models.filter(model => model.brandId == brandId);
        console.log(`Modelos filtrados para marca ${brandId}:`, filteredModels);
        
        // Converte para SelectizeModel
        this.vehicleModels = filteredModels.map(model => ({
          id: model.id,
          label: model.name
        }));
        
        console.log('Modelos convertidos para SelectizeModel:', this.vehicleModels);
        console.log('=== FIM CARREGAMENTO DE MODELOS ===');
        
        // Força a detecção de mudanças
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(`Erro ao carregar modelos para marca ${brandId}:`, error);
        this.notificationService.showMessage('Erro ao carregar modelos da marca selecionada.', 'error');
        this.vehicleModels = [];
      }
    });
    
  }


  /**
   * Carrega dados iniciais (cores e marcas) da API de forma sequencial
   * para evitar erro de mapeamento duplicado no backend
   */
  loadInitialData(): void {
    console.log('Iniciando carregamento sequencial de dados...');
    
    // Carrega cores primeiro
    this.service.getAllColors().subscribe({
      next: (colors) => {
        console.log('✅ Cores carregadas:', colors.length);
        this.colors = colors.map(color => ({
          id: color.id,
          label: color.name
        }));
        this.cdr.detectChanges();
        
        // Após cores carregadas, carrega marcas
        this.loadBrandsAfterColors();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar cores:', error);
        this.notificationService.showMessage('Erro ao carregar cores. Tente novamente.', 'error');
        // Mesmo com erro, tenta carregar marcas
        this.loadBrandsAfterColors();
      }
    });
  }

  private loadBrandsAfterColors(): void {
    console.log('Carregando marcas...');
    this.service.getAllBrands().subscribe({
      next: (brands) => {
        console.log('✅ Marcas carregadas:', brands.length);
        this.brands = brands.map(brand => ({
          id: brand.id,
          label: brand.name
        }));
        this.cdr.detectChanges();

        // Inicializa lista vazia de modelos
        this.vehicleModels = [];

        console.log('✅ Dados iniciais carregados com sucesso:', {
          cores: this.colors.length,
          marcas: this.brands.length,
          modelos: this.vehicleModels.length
        });
      },
      error: (error) => {
        console.error('❌ Erro ao carregar marcas:', error);
        this.notificationService.showMessage('Erro ao carregar marcas. Tente novamente.', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Validações adicionais
      const brandId = this.form.get('brand')?.value;
      const vehicleModelId = this.form.get('vehicleModel')?.value;
      const year = this.form.get('year')?.value;

      if (!brandId) {
        this.notificationService.showMessage('Selecione uma marca.', 'error');
        return;
      }

      if (!vehicleModelId) {
        this.notificationService.showMessage('Selecione um modelo.', 'error');
        return;
      }

      if (!year) {
        this.notificationService.showMessage('Informe o ano do veículo.', 'error');
        return;
      }

      // Cria o objeto no formato esperado pela API
      const vehicleApiData: VehicleApiModel = {
        id: this.isEditMode && this.vehicleId ? parseInt(this.vehicleId) : 0,
        customerId: 0, // TODO: Implementar customerId quando necessário
        plate: this.form.get('plate')?.value || '',
        chassi: this.form.get('chassi')?.value || '',
        brandId: brandId,
        vehicleModelId: vehicleModelId,
        version: this.form.get('version')?.value || '',
        year: year,
        colorId: this.form.get('color')?.value || 0,
        transmission: this.form.get('transmission')?.value || '',
        engine: this.form.get('engine')?.value || '',
        status: this.isEditMode ? this.originalVehicleStatus : 0 // Mantém status original em edição, 0 para novo
      };

      console.log('Dados enviados para API:', vehicleApiData);

      if (this.isEditMode && this.vehicleId) {
        // Modo de edição - usa updateVehicle
        this.service.updateVehicle(vehicleApiData).subscribe({
          next: (ret: Result<Vehicle>) => {
            if (ret.statusCode === 200) {
              this.notificationService.showMessage('Veículo atualizado com sucesso.', 'success');
              // Navega de volta para a listagem após sucesso
              this.router.navigate(['apps/vehicles']);
            } else {
              // Trata erro retornado pela API com statusCode diferente de 200
              console.log('Erro ao atualizar veículo:', ret.message);
            }
          },
          error: (error) => {
            console.error('Erro ao atualizar veículo:', error);
            
            // Trata erro HTTP (ex: 400, 500, etc)
            console.log('Erro ao atualizar veículo:', error.message);
          }
        });
      } else {
        // Modo de cadastro - usa saveVehicle
        this.service.saveVehicle(vehicleApiData).subscribe({
          next: (ret: Result<Vehicle>) => {
            if (ret.statusCode === 200) {
              this.notificationService.showToast('Veículo cadastrado com sucesso.', 'success');
              
              // Limpa o formulário
              this.form.reset();
              
              // Limpa o campo de busca de placa
              this.searchedPlate = '';
              
              // Limpa as listas de modelos e marca selecionada
              this.vehicleModels = [];
              this.selectedBrandName = '';
              
            } else if (ret.statusCode === 400) {
              // Trata erro retornado pela API com statusCode diferente de 200
              console.log('Erro ao cadastrar veículo:', ret.message);
            }
          },
        });
      }
    } 
  }
  //#endregion

  openBrandModal(): void {
    this.newBrandName = '';
    this.newBrandDescription = '';
    this.modalService.open(this.brandModal, { centered: true, backdrop: 'static' });
  }

  SaveNewBrand(modalRef?: any): void {
    if (!this.newBrandName || !this.newBrandName.trim()) {
      this.notificationService.showMessage('Nome da marca é obrigatório.', 'error');
      return;
    }

    const brandData = {
      name: this.newBrandName.trim(),
      description: this.newBrandDescription.trim() || this.newBrandName.trim()
    };

    this.service.saveBrand(brandData).subscribe({
      next: (result: Result<Brand>) => {
        if (result.statusCode === 200) {
          this.notificationService.showMessage('Marca cadastrada com sucesso.', 'success');
          
          // Atualiza a lista de marcas
          this.loadBrands();
          
          // Fecha o modal
          if (modalRef) {
            modalRef.close();
          } else {
            this.modalService.dismissAll();
          }
        } else {
          this.notificationService.showMessage('Erro ao cadastrar marca.', 'error');
        }
      },
      error: (error) => {
        console.error('Erro ao salvar marca:', error);
        this.notificationService.showMessage('Erro ao cadastrar marca.', 'error');
      }
    });
  }

  /**
   * Carrega apenas as marcas (método auxiliar para atualizar a lista após cadastro)
   */
  private loadBrands(): void {
    this.service.getAllBrands().subscribe({
      next: (brands: Brand[]) => {
        this.brands = brands.map(brand => ({
          id: brand.id,
          label: brand.name
        }));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar marcas:', error);
        this.notificationService.showMessage('Erro ao carregar marcas.', 'error');
      }
    });
  }

  openModelModal(): void {
    if (!this.brandControl.value) {
      this.notificationService.showMessage('Selecione uma marca antes de adicionar um modelo.', 'warning');
      return;
    }
    
    this.newModelName = '';
    this.newModelDescription = '';
    this.modalService.open(this.modelModal, { centered: true, backdrop: 'static' });
  }

  SaveNewModel(modalRef?: any): void {
    if (!this.newModelName || !this.newModelName.trim()) {
      this.notificationService.showMessage('Nome do modelo é obrigatório.', 'error');
      return;
    }

    if (!this.brandControl.value) {
      this.notificationService.showMessage('Selecione uma marca antes de salvar o modelo.', 'error');
      return;
    }

    const modelData = {
      brandId: this.brandControl.value,
      name: this.newModelName.trim(),
      description: this.newModelDescription.trim() || this.newModelName.trim()
    };

    this.service.saveVehicleModel(modelData).subscribe({
      next: (result: Result<VehicleModel>) => {
        if (result.statusCode === 200) {
          this.notificationService.showMessage('Modelo cadastrado com sucesso.', 'success');
          
          // Atualiza a lista de modelos para a marca selecionada
          this.loadVehicleModelsByBrand(this.brandControl.value);
          
          // Fecha o modal
          if (modalRef) {
            modalRef.close();
          } else {
            this.modalService.dismissAll();
          }
        } else {
          this.notificationService.showMessage('Erro ao cadastrar modelo.', 'error');
        }
      },
      error: (error) => {
        console.error('Erro ao salvar modelo:', error);
        this.notificationService.showMessage('Erro ao cadastrar modelo.', 'error');
      }
    });
  }

  openColorModal(): void {
    this.newColorName = '';
    this.newColorDescription = '';
    this.modalService.open(this.colorModal, { centered: true, backdrop: 'static' });
  }

  SaveNewColor(modalRef?: any): void {
    if (!this.newColorName || !this.newColorName.trim()) {
      this.notificationService.showMessage('Nome da cor é obrigatório.', 'error');
      return;
    }

    const colorData = {
      name: this.newColorName.trim(),
      description: this.newColorDescription.trim() || this.newColorName.trim()
    };

    this.service.saveColor(colorData).subscribe({
      next: (result: Result<Color>) => {
        if (result.statusCode === 200) {
          this.notificationService.showMessage('Cor cadastrada com sucesso.', 'success');
          
          // Atualiza a lista de cores
          this.loadColors();
          
          // Fecha o modal
          if (modalRef) {
            modalRef.close();
          } else {
            this.modalService.dismissAll();
          }
        } else {
          this.notificationService.showMessage('Erro ao cadastrar cor.', 'error');
        }
      },
      error: (error) => {
        console.error('Erro ao salvar cor:', error);
        this.notificationService.showMessage('Erro ao cadastrar cor.', 'error');
      }
    });
  }

  /**
   * Carrega apenas as cores (método auxiliar para atualizar a lista após cadastro)
   */
  private loadColors(): void {
    this.service.getAllColors().subscribe({
      next: (colors: Color[]) => {
        this.colors = colors.map(color => ({
          id: color.id,
          label: color.name
        }));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar cores:', error);
        this.notificationService.showMessage('Erro ao carregar cores.', 'error');
      }
    });
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
        this.onSubmit();
        break;
      case 'exit':
        this.router.navigate(['apps/vehicles']);
        break;
      case 'new':
        this.router.navigate(['apps/vehicles/new']);
        break;
    }
  }

  /**
   * Extrai e formata mensagens de erro da API
   * @param error Objeto de erro retornado pela API
   * @returns Mensagem de erro formatada
   */
  private extractErrorMessage(error: any): string {
    console.log('🔍 Extraindo mensagem de erro:', error);
    console.log('🔍 Tipo do erro:', typeof error);
    console.log('🔍 É array?:', Array.isArray(error));
    
    // Se não houver erro, retorna mensagem genérica
    if (!error && error !== 0 && error !== false) {
      console.log('❌ Erro é null/undefined');
      return 'Erro ao processar operação.';
    }
    
    // Função para processar array de validações
    const processValidationArray = (validationArray: any[]): string => {
      console.log('📝 Processando array de validações:', validationArray);
      const messages: string[] = [];
      
      validationArray.forEach((item: any) => {
        console.log('📄 Processando item:', item);
        // Extrai todas as chaves e valores do objeto
        Object.keys(item).forEach(key => {
          const value = item[key];
          console.log(`   📌 ${key}: ${value}`);
          
          // Traduz algumas mensagens comuns
          let translatedMessage = value;
          if (value === 'Plate already exists.') {
            translatedMessage = 'Placa já cadastrada no sistema.';
          } else if (value === 'Chassi already exists.') {
            translatedMessage = 'Chassi já cadastrado no sistema.';
          } else if (value === 'Invalid year format.') {
            translatedMessage = 'Formato de ano inválido.';
          }
          
          messages.push(translatedMessage);
        });
      });
      
      console.log('✅ Mensagens processadas:', messages);
      return messages.length > 0 ? messages.join(' ') : 'Erro ao processar operação.';
    };
    
    // Caso 1: O erro já é um array (erro HTTP direto)
    if (Array.isArray(error)) {
      console.log('✅ CASO 1: Erro é um array direto');
      return processValidationArray(error);
    }
    
    // Caso 2: O erro tem uma propriedade 'message' que é string JSON
    if (error.message && typeof error.message === 'string') {
      console.log('🔍 CASO 2: Erro.message é string, tentando parse...');
      try {
        const parsedMessage = JSON.parse(error.message);
        console.log('✅ Parse bem-sucedido:', parsedMessage);
        
        if (Array.isArray(parsedMessage)) {
          console.log('✅ CASO 2: Erro.message é um array JSON');
          return processValidationArray(parsedMessage);
        }
        
        return error.message;
      } catch (e) {
        console.log('❌ Parse falhou, retornando mensagem original');
        // Se não for JSON válido, retorna a mensagem original
        return error.message;
      }
    }
    
    // Caso 3: O erro tem uma propriedade 'message' que já é um objeto/array
    if (error.message && typeof error.message === 'object') {
      console.log('🔍 CASO 3: Erro.message é objeto');
      if (Array.isArray(error.message)) {
        console.log('✅ CASO 3: Erro.message é um array de objetos');
        return processValidationArray(error.message);
      }
    }
    
    // Caso 4: Verifica se há outras propriedades que possam conter as validações
    if (error.error && Array.isArray(error.error)) {
      console.log('✅ CASO 4: error.error é um array');
      return processValidationArray(error.error);
    }
    
    if (error.errors && Array.isArray(error.errors)) {
      console.log('✅ CASO 5: error.errors é um array');
      return processValidationArray(error.errors);
    }
    
    // Caso final: Retorna mensagem genérica ou string simples
    console.log('⚠️ Nenhum caso específico encontrado, usando fallback');
    if (typeof error === 'string') {
      return error;
    }
    return error.message || error.statusText || 'Erro ao processar operação.';
  }

  //#region Métodos de busca de placa
  onPlateSearchChange(event: any): void {
    const value = event.target.value;
    this.searchedPlate = value.toUpperCase();
    
    // Atualiza o campo plate do formulário
    this.form.patchValue({ plate: this.searchedPlate });
    
    // Se a placa foi limpa, limpa também o formulário
    if (!this.searchedPlate || this.searchedPlate.trim() === '') {
      this.clearFormData();
    }
  }

  searchPlate(): void {
    if (!this.searchedPlate || this.searchedPlate.trim() === '') {
      this.notificationService.showMessage('Por favor, digite uma placa para buscar.', 'warning');
      return;
    }

    this.isSearchingPlate = true;
    
    // Busca na API externa de consulta de placas
    this.service.consultPlateExternal(this.searchedPlate).subscribe({
      next: (result: PlateConsultationResponse) => {
        this.isSearchingPlate = false;
        
        if (result && result.placa) {
          this.loadVehicleDataFromPlateConsultation(result);
          this.notificationService.showMessage('Dados do veículo carregados com sucesso!', 'success');
        } else {
          this.notificationService.showMessage('Placa não encontrada na base de dados.', 'warning');
        }
      },
      error: (error) => {
        this.isSearchingPlate = false;
        console.error('Erro ao buscar placa:', error);
        this.notificationService.showMessage('Erro ao buscar dados da placa. Tente novamente.', 'error');
      }
    });
  }

  private loadVehicleDataFromPlateConsultation(plateData: PlateConsultationResponse): void {
    console.log('Dados da consulta de placa via API interna:', plateData);
    
    // Preenche os campos básicos do formulário
    this.form.patchValue({
      version: plateData.versao || plateData.VERSAO || plateData.SUBMODELO || '',
      year: plateData.ano || plateData.extra?.ano_fabricacao || '',
      chassi: plateData.chassi || plateData.extra?.chassi || '',
      engine: plateData.extra?.motor || plateData.extra?.cilindradas || ''
    });

    // Processa marca
    if (plateData.marca || plateData.MARCA) {
      const brandName = plateData.marca || plateData.MARCA;
      this.processVehicleBrand(brandName);
    }

    // Processa modelo
    if (plateData.modelo || plateData.MODELO) {
      const modelName = plateData.modelo || plateData.MODELO;
      // O modelo será processado após a marca ser selecionada
      setTimeout(() => {
        this.processVehicleModel(modelName);
      }, 300);
    }

    // Processa cor
    if (plateData.cor) {
      this.processVehicleColorFromPlate(plateData.cor);
    }

    console.log('✅ Formulário preenchido com dados da consulta interna:', {
      marca: plateData.marca || plateData.MARCA,
      modelo: plateData.modelo || plateData.MODELO,
      cor: plateData.cor,
      ano: plateData.ano,
      versao: plateData.versao
    });
  }

  private processVehicleBrand(brandName: string): void {
    console.log('🔍 Processando marca:', brandName);
    console.log('📋 Lista de marcas disponíveis:', this.brands);
    
    // Busca marca na lista carregada
    const existingBrand = this.brands.find(b => 
      b.label.toUpperCase().includes(brandName.toUpperCase()) ||
      brandName.toUpperCase().includes(b.label.toUpperCase())
    );
    
    if (existingBrand) {
      console.log('✅ Marca encontrada, selecionando:', existingBrand);
      console.log('📝 Valor atual do brandControl ANTES:', this.brandControl.value);
      
      // Setta o ID da marca no controle
      this.brandControl.setValue(existingBrand.id);
      console.log('📝 Valor do brandControl APÓS setValue(id):', this.brandControl.value);
      
      this.selectedBrandName = existingBrand.label;
      
      // Força detecção de mudanças
      this.cdr.detectChanges();
      
      // Chama o evento de mudança passando o ID (como o select faz)
      this.onSelectBrandChange(existingBrand.id);
      
      console.log('✅ Marca setada com sucesso:', {
        id: existingBrand.id,
        label: existingBrand.label,
        controlValue: this.brandControl.value
      });
    } else {
      console.log('❌ Marca não encontrada:', brandName);
      console.log('❌ Nomes de marcas disponíveis:', this.brands.map(b => b.label));
      // Aqui poderia implementar cadastro automático de marca se necessário
    }
  }

  private processVehicleModel(modelName: string): void {
    // Busca modelo na lista carregada
    const existingModel = this.vehicleModels.find(m => 
      m.label.toUpperCase().includes(modelName.toUpperCase()) ||
      modelName.toUpperCase().includes(m.label.toUpperCase())
    );
    
    if (existingModel) {      
      // Setta o ID do modelo no controle
      this.vehicleModelControl.setValue(existingModel.id);
      
      // Força detecção de mudanças
      this.cdr.detectChanges();
      
      console.log('✅ Modelo setado com sucesso:', {
        id: existingModel.id,
        label: existingModel.label,
        controlValue: this.vehicleModelControl.value
      });
    } else {
      console.log('🆕 Modelo não encontrado, cadastrando automaticamente:', modelName);
      
      // Verifica se há uma marca selecionada
      const selectedBrandId = this.brandControl.value;
      if (!selectedBrandId) {
        console.error('❌ Não é possível cadastrar modelo sem marca selecionada');
        this.notificationService.showMessage(
          'Erro: Marca não selecionada para cadastrar modelo automaticamente.', 
          'error'
        );
        return;
      }
      
      const modelData = {
        brandId: selectedBrandId,
        name: modelName.trim(),
        description: modelName.trim()
      };
      
      console.log('📤 Enviando modelo para cadastro:', modelData);
      
      this.service.saveVehicleModel(modelData).subscribe({
        next: (result: Result<VehicleModel>) => {
          if (result.statusCode === 200 && result.content) {
            
            // Adiciona o novo modelo diretamente à lista
            const newModelOption = {
              id: result.content.id,
              label: result.content.name
            };
            
            const alreadyExists = this.vehicleModels.find(m => m.id === newModelOption.id);
            // if (!alreadyExists) {
            //   this.vehicleModels.push(newModelOption);
            //   this.cdr.detectChanges();
            // }
            
            // Seleciona o modelo recém-cadastrado usando o ID
            // this.vehicleModelControl.setValue(newModelOption.id);
            // console.log('✅ Modelo adicionado e selecionado:', newModelOption);
            
            // this.notificationService.showMessage(
            //   `Modelo "${modelName}" cadastrado automaticamente!`, 
            //   'success'
            // );
          } else {
            this.notificationService.showMessage(
              'Erro ao cadastrar modelo automaticamente.', 
              'warning'
            );
          }
        },
        error: (error) => {
          console.error('❌ Erro ao cadastrar modelo:', error);
          this.notificationService.showMessage(
            'Erro ao cadastrar modelo automaticamente.', 
            'error'
          );
        }
      });
    }
  }

  private processVehicleColorFromPlate(colorName: string): void {
    console.log('🔍 Processando cor da consulta de placa:', colorName);
    
    // Busca cor na lista carregada
    const existingColor = this.colors.find(c => 
      c.label.toUpperCase() === colorName.toUpperCase()
    );
    
    if (existingColor) {
      console.log('✅ Cor já existe, selecionando:', existingColor);
      
      // Setta o ID da cor no controle (não o objeto)
      this.colorControl.setValue(existingColor.id);
      
      // Força detecção de mudanças
      this.cdr.detectChanges();
      
      console.log('✅ Cor setada com sucesso:', {
        id: existingColor.id,
        label: existingColor.label,
        controlValue: this.colorControl.value
      });
    } else {
      console.log('🆕 Cor não existe, cadastrando automaticamente:', colorName);
      
      const colorData = {
        name: colorName,
        description: colorName
      };
      
      this.service.saveColor(colorData).subscribe({
        next: (result: Result<Color>) => {
          if (result.statusCode === 200 && result.content) {
            console.log('✅ Cor cadastrada com sucesso:', result.content);
            
            // Adiciona a nova cor diretamente à lista
            const newColorOption = {
              id: result.content.id,
              label: result.content.name
            };
            
            const alreadyExists = this.colors.find(c => c.id === newColorOption.id);
            if (!alreadyExists) {
              this.colors.push(newColorOption);
              this.cdr.detectChanges();
            }
            
            // Seleciona a cor recém-cadastrada usando o ID
            this.colorControl.setValue(newColorOption.id);
            console.log('✅ Cor adicionada e selecionada:', newColorOption);
            
            this.notificationService.showMessage(
              `Cor "${colorName}" cadastrada automaticamente!`, 
              'success'
            );
          } else {
            console.error('❌ Erro ao cadastrar cor:', result);
            this.notificationService.showMessage(
              'Erro ao cadastrar cor automaticamente.', 
              'warning'
            );
          }
        },
        error: (error) => {
          console.error('Erro ao cadastrar cor:', error);
          this.notificationService.showMessage(
            'Erro ao cadastrar cor automaticamente. Tente novamente.', 
            'error'
          );
        }
      });
    }
  }

  private loadVehicleDataFromApi(vehicleData: Vehicle): void {
    console.log('Dados do veículo recebidos da API:', vehicleData);
    
    // Preenche os campos básicos do formulário
    this.form.patchValue({
      version: vehicleData.version,
      year: vehicleData.year,
      chassi: vehicleData.chassi,
      engine: vehicleData.engine || vehicleData.engineDisplacement || ''
    });

    // Busca e seleciona a marca
    if (vehicleData.brand && vehicleData.brand.id) {
      const brandMatch = this.brands.find(b => b.id === vehicleData.brand.id);
      if (brandMatch) {
        this.brandControl.setValue(brandMatch);
        this.selectedBrandName = brandMatch.label;
        this.onSelectBrandChange(brandMatch);
        
        // Após selecionar a marca, busca e seleciona o modelo
        setTimeout(() => {
          if (vehicleData.vehicleModel && vehicleData.vehicleModel.id) {
            const modelMatch = this.vehicleModels.find(m => m.id === vehicleData.vehicleModel.id);
            if (modelMatch) {
              this.vehicleModelControl.setValue(modelMatch);
            }
          }
        }, 200);
      }
    }

    // Processa a cor - verifica se existe ou cadastra automaticamente
    if (vehicleData.color && vehicleData.color.name) {
      this.processVehicleColor(vehicleData.color);
    }

    // Se houver transmissão nos dados da API, tenta selecionar
    if (vehicleData.transmission) {
      const transmissionMatch = this.transmissions.find(t => 
        t.label.toUpperCase().includes(vehicleData.transmission.toUpperCase())
      );
      if (transmissionMatch) {
        this.transmissionControl.setValue(transmissionMatch);
      }
    }

    console.log('Formulário preenchido com dados da API');
  }

  private processVehicleColor(colorFromApi: any): void {
    console.log('Processando cor da API:', colorFromApi);
    console.log('Lista atual de cores:', this.colors);
    
    // Verifica se a cor já existe na lista carregada
    const existingColor = this.colors.find(c => 
      c.label.toUpperCase() === colorFromApi.name.toUpperCase()
    );
    
    if (existingColor) {
      // Se a cor já existe, apenas seleciona
      console.log('✅ Cor já existe, selecionando:', existingColor);
      this.colorControl.setValue(existingColor);
    } else {
      // Se a cor não existe, cadastra automaticamente
      console.log('🆕 Cor não existe, cadastrando automaticamente:', colorFromApi.name);
      
      const colorData = {
        name: colorFromApi.name,
        description: colorFromApi.description || colorFromApi.name
      };
      
      this.service.saveColor(colorData).subscribe({
        next: (result: Result<Color>) => {
          if (result.statusCode === 200 && result.content) {
            console.log('Cor cadastrada com sucesso:', result.content);
            
            // Adiciona a nova cor diretamente à lista sem recarregar tudo
            const newColorOption = {
              id: result.content.id,
              label: result.content.name
            };
            
            // Verifica se a cor já não foi adicionada (evita duplicatas)
            const alreadyExists = this.colors.find(c => c.id === newColorOption.id);
            if (!alreadyExists) {
              this.colors.push(newColorOption);
              this.cdr.detectChanges();
            }
            
            // Seleciona a cor recém-cadastrada
            this.colorControl.setValue(newColorOption);
            console.log('Cor adicionada e selecionada:', newColorOption);
            
            this.notificationService.showMessage(
              `Cor "${colorFromApi.name}" cadastrada automaticamente!`, 
              'success'
            );
          } else {
            console.error('Erro ao cadastrar cor:', result);
            this.notificationService.showMessage(
              'Erro ao cadastrar cor automaticamente.', 
              'warning'
            );
          }
        },
        error: (error) => {
          console.error('Erro ao cadastrar cor:', error);
          this.notificationService.showMessage(
            'Erro ao cadastrar cor automaticamente. Tente novamente.', 
            'error'
          );
        }
      });
    }
  }

  private clearFormData(): void {
    // Limpa apenas os campos que são preenchidos pela busca da placa
    this.form.patchValue({
      version: '',
      year: '',
      chassi: '',
      engine: ''
    });

    // Limpa as seleções dos selects
    this.brandControl.setValue(null);
    this.vehicleModelControl.setValue(null);
    this.colorControl.setValue(null);
    this.transmissionControl.setValue(null);
    this.selectedBrandName = '';
    
    // Limpa a lista de modelos
    this.vehicleModels = [];
  }
  //#endregion
}
