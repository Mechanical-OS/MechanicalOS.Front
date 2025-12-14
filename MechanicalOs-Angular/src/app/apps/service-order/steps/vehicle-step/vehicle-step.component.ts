import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceOrderDraftService, VehicleData } from '../../shared/service-order-draft.service';
import { VehicleService } from 'src/app/apps/vehicle/vehicle.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { PlateConsultationResponse } from 'src/app/apps/Shared/models/plate-consultation.model';

@Component({
  selector: 'app-vehicle-step',
  templateUrl: './vehicle-step.component.html',
  styleUrl: './vehicle-step.component.scss'
})
export class VehicleStepComponent implements OnInit, OnDestroy {
  vehicleForm: FormGroup;
  plateSearchValue: string = '';
  isSearching: boolean = false;
  vehicleFound: PlateConsultationResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private draftService: ServiceOrderDraftService,
    private vehicleService: VehicleService,
    private notificationService: NotificationService
  ) {
    this.vehicleForm = this.createForm();
  }

  ngOnInit(): void {
    // Carrega dados existentes se houver
    const currentDraft = this.draftService.getCurrentDraft();
    if (currentDraft.vehicle?.data) {
      this.loadVehicleData(currentDraft.vehicle.data);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      version: [''],
      year: ['', Validators.required],
      chassi: [''],
      color: ['', Validators.required],
      transmission: ['', Validators.required],
      engine: [''],
      plate: ['', Validators.required]
    });
  }

  private loadVehicleData(vehicleData: VehicleData): void {
    this.vehicleForm.patchValue(vehicleData);
  }

  onSearchPlate(): void {
    if (this.plateSearchValue && this.plateSearchValue.trim()) {
      this.searchVehicleByPlate(this.plateSearchValue.trim());
    }
  }

  private searchVehicleByPlate(plate: string): void {
    // Remove caracteres especiais da placa
    const cleanPlate = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    if (cleanPlate.length < 7) {
      this.notificationService.showMessage('Placa deve conter pelo menos 7 caracteres', 'warning');
      return;
    }

    this.isSearching = true;
    this.notificationService.showLoading();

    this.vehicleService.consultPlateExternal(cleanPlate).subscribe({
      next: (response: PlateConsultationResponse) => {
        if (response && response.placa) {
          // Veículo encontrado - popula o formulário
          this.vehicleFound = response;
          this.populateFormWithVehicle(response);
        } else {
          // Veículo não encontrado
          this.handleVehicleNotFound(cleanPlate);
        }
      },
      error: (error) => {
        console.error('Erro ao buscar veículo:', error);
        this.notificationService.showError(error);
        this.handleVehicleNotFound(cleanPlate);
      },
      complete: () => {
        this.isSearching = false;
        this.notificationService.hideLoading();
      }
    });
  }

  private populateFormWithVehicle(vehicleData: PlateConsultationResponse): void {
    // Extrai os dados da resposta
    const brand = vehicleData.MARCA || vehicleData.marca || '';
    const model = vehicleData.MODELO || vehicleData.modelo || '';
    const version = vehicleData.VERSAO || vehicleData.versao || vehicleData.SUBMODELO || vehicleData.submodelo || '';
    const year = vehicleData.ano || vehicleData.anoModelo || '';
    const chassi = vehicleData.chassi || vehicleData.extra?.chassi || '';
    const color = vehicleData.cor || '';
    const transmission = vehicleData.extra?.caixa_cambio || '';
    const engine = vehicleData.extra?.motor || '';
    const plate = vehicleData.placa || vehicleData.extra?.placa || '';

    // Popula o formulário com os dados do veículo
    this.vehicleForm.patchValue({
      brand: brand,
      model: model,
      version: version,
      year: year,
      chassi: chassi,
      color: color,
      transmission: transmission,
      engine: engine,
      plate: plate.toUpperCase()
    });

    // Tenta buscar se o veículo já existe no banco pela placa
    this.vehicleService.getByPlate(plate).subscribe({
      next: (response) => {
        if (response.statusCode === 200 && response.content) {
          // Veículo existe, salva com o ID
          const vehicleFormData: VehicleData = this.vehicleForm.value;
          this.draftService.updateVehicleData(vehicleFormData, response.content.id);
          console.log('Veículo já cadastrado, ID:', response.content.id);
        } else {
          // Veículo novo, salva sem ID
          const vehicleFormData: VehicleData = this.vehicleForm.value;
          this.draftService.updateVehicleData(vehicleFormData);
        }
      },
      error: () => {
        // Veículo não existe, salva sem ID
        const vehicleFormData: VehicleData = this.vehicleForm.value;
        this.draftService.updateVehicleData(vehicleFormData);
      }
    });

    console.log('Formulário populado com os dados do veículo:', vehicleData);
  }

  private handleVehicleNotFound(plate: string): void {
    this.vehicleFound = null;
    
    // Limpa o formulário e preenche apenas a placa
    this.vehicleForm.reset({
      plate: plate.toUpperCase()
    });

    this.notificationService.showToast('Veículo não encontrado. Por favor, preencha os dados manualmente.', 'info');
    console.log('Veículo não encontrado para a placa:', plate);
  }

  onSaveVehicle(): void {
    if (this.vehicleForm.valid) {
      const vehicleData: VehicleData = this.vehicleForm.value;
      this.draftService.updateVehicleData(vehicleData);
      console.log('Dados do veículo salvos:', vehicleData);
    } else {
      this.markFormGroupTouched();
    }
  }

  ngOnDestroy(): void {
    console.log('VehicleStepComponent sendo destruído');
    // Salva automaticamente quando o componente é destruído
    if (this.vehicleForm.valid) {
      const vehicleData: VehicleData = this.vehicleForm.value;
      const currentDraft = this.draftService.getCurrentDraft();
      const vehicleId = currentDraft.vehicle?.id;
      this.draftService.updateVehicleData(vehicleData, vehicleId);
      console.log('Dados do veículo salvos automaticamente:', vehicleData);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.vehicleForm.controls).forEach(key => {
      const control = this.vehicleForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.vehicleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
