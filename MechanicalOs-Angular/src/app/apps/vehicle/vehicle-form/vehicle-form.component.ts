import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { FormValidationService } from 'src/app/shared/services/form-validation.service';
import { VehicleService } from '../vehicle.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { Vehicle, Color } from '../../Shared/models/vehicle.model';
import { Result } from 'src/app/Http/models/operation-result.model';
import { SelectizeModel } from 'src/app/shared/selectize/selectize.component';

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

  brands: SelectizeModel[] = [{ id: 1, label: "HONDA" }, { id: 2, label: "TOYOTA" }];
  transmissions: SelectizeModel[] = [{ id: 1, label: "Manual" }, { id: 2, label: "Automático" }, { id: 3, label: "CVT" }, { id: 2, label: "Automatizado" }];
  colors: SelectizeModel[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public messageValidationService: FormValidationService,
    private service: VehicleService,
    private notificationService: NotificationService,
    private metroMenuService: MetroMenuService
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
    this.loadColors();
  }

  //#region FORM
  buildForm(): void {
    this.form = this.fb.group({
      brand: ['', [Validators.required]],
      model: ['', [Validators.required]],
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

  get transmissionControl(): FormControl {
    return this.form.get("transmission") as FormControl;
  }

  get colorControl(): FormControl {
    return this.form.get("color") as FormControl;
  }

  onSelectBrandChange($event: any) {
    console.log($event);
  }

  onSelectTrasmissionChange($event: any) {
    console.log($event);
  }

  onSelectColorChange($event: any) {
    console.log($event);
  }

  /**
   * Carrega as cores disponíveis da API
   */
  loadColors(): void {
    this.service.getAllColors().subscribe({
      next: (colors: Color[]) => {
        this.colors = colors.map(color => ({
          id: color.id,
          label: color.name
        }));
      },
      error: (error) => {
        console.error('Erro ao carregar cores:', error);
        this.notificationService.showMessage('Erro ao carregar lista de cores.', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const vehicle = Vehicle.fromForm(this.form);
      if (this.isEditMode && this.vehicleId) {
        this.service.update(vehicle).subscribe((ret: Result<Vehicle>) => {
          if (ret.statusCode === 200) {
            this.notificationService.showMessage('Veículo atualizado com sucesso.', 'success');
          } else {
            this.notificationService.showMessage('Erro ao atualizar veículo.', 'error');
          }
        });
      } else {
        this.service.save(vehicle).subscribe((ret: Result<Vehicle>) => {
          if (ret.statusCode === 200) {
            this.notificationService.showMessage('Veículo cadastrado com sucesso.', 'success');
            this.form.reset();
          } else {
            this.notificationService.showMessage('Erro ao cadastrar veículo.', 'error');
          }
        });
      }
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
