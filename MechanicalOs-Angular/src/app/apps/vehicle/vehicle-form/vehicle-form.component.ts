import { Component, OnInit, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
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
import { forkJoin } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss'
})
export class VehicleFormComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  form!: FormGroup;

  isEditMode = false;
  vehicleId: string | null = null;
  isDisabled: boolean = false;

  brands: SelectizeModel[] = [];
  vehicleModels: SelectizeModel[] = [];
  transmissions: SelectizeModel[] = [{ id: 1, label: "Manual" }, { id: 2, label: "Automático" }, { id: 3, label: "CVT" }, { id: 2, label: "Automatizado" }];
  colors: SelectizeModel[] = [];

  @ViewChild('brandModal', { static: false }) brandModal!: TemplateRef<any>;
  @ViewChild('modelModal', { static: false }) modelModal!: TemplateRef<any>;
  @ViewChild('colorModal', { static: false }) colorModal!: TemplateRef<any>;
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
   * Carrega dados iniciais (cores e marcas) da API usando forkJoin
   * Modelos serão carregados apenas quando uma marca for selecionada
   */
  loadInitialData(): void {
    forkJoin({
      colors: this.service.getAllColors(),
      brands: this.service.getAllBrands()
    }).subscribe({
      next: (data) => {
        // Processa cores
        this.colors = data.colors.map(color => ({
          id: color.id,
          label: color.name
        }));

        // Processa marcas
        this.brands = data.brands.map(brand => ({
          id: brand.id,
          label: brand.name
        }));

        // Inicializa lista vazia de modelos
        this.vehicleModels = [];

        console.log('Dados iniciais carregados com sucesso:', { 
          colors: this.colors, 
          brands: this.brands
        });
        console.log('Modelos serão carregados quando uma marca for selecionada');
      },
      error: (error) => {
        console.error('Erro ao carregar dados iniciais:', error);
        this.notificationService.showMessage('Erro ao carregar dados iniciais.', 'error');
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
              this.notificationService.showMessage('Erro ao atualizar veículo.', 'error');
            }
          },
          error: (error) => {
            console.error('Erro ao atualizar veículo:', error);
            this.notificationService.showMessage('Erro ao atualizar veículo.', 'error');
          }
        });
      } else {
        // Modo de cadastro - usa saveVehicle
        this.service.saveVehicle(vehicleApiData).subscribe({
          next: (ret: Result<Vehicle>) => {
            if (ret.statusCode === 200) {
              this.notificationService.showMessage('Veículo cadastrado com sucesso.', 'success');
              this.form.reset();
              // Limpa as listas de modelos e marca selecionada
              this.vehicleModels = [];
              this.selectedBrandName = '';
            } else {
              this.notificationService.showMessage('Erro ao cadastrar veículo.', 'error');
            }
          },
          error: (error) => {
            console.error('Erro ao cadastrar veículo:', error);
            this.notificationService.showMessage('Erro ao cadastrar veículo.', 'error');
          }
        });
      }
    } else {
      this.form.markAllAsTouched();
      this.notificationService.showMessage('Preencha todos os campos obrigatórios.', 'error');
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
  //#endregion
}
