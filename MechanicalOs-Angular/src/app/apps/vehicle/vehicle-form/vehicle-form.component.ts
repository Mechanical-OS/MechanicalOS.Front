import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public messageValidationService: FormValidationService,
    private service: VehicleService,
    private notificationService: NotificationService,
    private metroMenuService: MetroMenuService,
    private cdr: ChangeDetectorRef
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
    this.loadInitialData();
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
      // Carrega os modelos apenas quando uma marca válida for selecionada
      this.loadVehicleModelsByBrand($event);
    } else {
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
      // Cria o objeto no formato esperado pela API
      const vehicleApiData: VehicleApiModel = {
        id: this.isEditMode && this.vehicleId ? parseInt(this.vehicleId) : 0,
        customerId: 0, // TODO: Implementar customerId quando necessário
        plate: this.form.get('plate')?.value || '',
        chassi: this.form.get('chassi')?.value || '',
        brandId: this.form.get('brand')?.value || 0,
        vehicleModelId: this.form.get('vehicleModel')?.value || 0,
        version: this.form.get('version')?.value || '',
        year: this.form.get('year')?.value || '',
        colorId: this.form.get('color')?.value || 0,
        transmission: this.form.get('transmission')?.value || '',
        engine: this.form.get('engine')?.value || '',
        status: 1 // Status padrão ativo
      };

      if (this.isEditMode && this.vehicleId) {
        this.service.updateVehicle(vehicleApiData).subscribe((ret: Result<Vehicle>) => {
          if (ret.statusCode === 200) {
            this.notificationService.showMessage('Veículo atualizado com sucesso.', 'success');
          } else {
            this.notificationService.showMessage('Erro ao atualizar veículo.', 'error');
          }
        });
      } else {
        this.service.saveVehicle(vehicleApiData).subscribe((ret: Result<Vehicle>) => {
          if (ret.statusCode === 200) {
            this.notificationService.showMessage('Veículo cadastrado com sucesso.', 'success');
            this.form.reset();
          } else {
            this.notificationService.showMessage('Erro ao cadastrar veículo.', 'error');
          }
        });
      }
      console.log('Dados enviados para API:', vehicleApiData);
    } else {
      this.form.markAllAsTouched();
    }
  }
  //#endregion

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
