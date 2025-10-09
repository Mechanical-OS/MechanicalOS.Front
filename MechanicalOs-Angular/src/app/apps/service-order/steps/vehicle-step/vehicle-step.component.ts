import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceOrderDraftService, VehicleData } from '../../shared/service-order-draft.service';

@Component({
  selector: 'app-vehicle-step',
  templateUrl: './vehicle-step.component.html',
  styleUrl: './vehicle-step.component.scss'
})
export class VehicleStepComponent implements OnInit, OnDestroy {
  vehicleForm: FormGroup;
  plateSearchValue: string = '';

  constructor(
    private fb: FormBuilder,
    private draftService: ServiceOrderDraftService
  ) {
    this.vehicleForm = this.createForm();
  }

  ngOnInit(): void {
    // Carrega dados existentes se houver
    const currentDraft = this.draftService.getCurrentDraft();
    if (currentDraft.vehicle) {
      this.loadVehicleData(currentDraft.vehicle);
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
      // Simula busca por placa (mock)
      this.searchVehicleByPlate(this.plateSearchValue.trim());
    }
  }

  private searchVehicleByPlate(plate: string): void {
    // Mock data baseado na placa
    const mockVehicleData = {
      brand: 'Hyundai',
      model: 'HB20',
      version: '1.6 Sedan',
      year: '2020',
      chassi: '9BWZZZZZZZZZZZZZZ',
      color: 'Branco',
      transmission: 'Manual',
      engine: '1.6 16V',
      plate: plate.toUpperCase()
    };

    this.vehicleForm.patchValue(mockVehicleData);
    console.log(`Busca realizada para a placa: ${plate}`);
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
    const vehicleData: VehicleData = this.vehicleForm.value;
    this.draftService.updateVehicleData(vehicleData);
    console.log('Dados do veículo salvos automaticamente:', vehicleData);
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
