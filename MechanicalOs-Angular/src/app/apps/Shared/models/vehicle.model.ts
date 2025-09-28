import { FormGroup } from "@angular/forms";

export class Brand {
    id: number;
    name: string;
    description: string;

    constructor(data: Partial<Brand>) {
        this.id = data.id ?? 0;
        this.name = data.name ?? '';
        this.description = data.description ?? '';
    }
}

export class VehicleModel {
    id: number;
    brandId: number;
    name: string;
    description: string;

    constructor(data: Partial<VehicleModel>) {
        this.id = data.id ?? 0;
        this.brandId = data.brandId ?? 0;
        this.name = data.name ?? '';
        this.description = data.description ?? '';
    }
}

export class Color {
    id: number;
    name: string;
    description: string;

    constructor(data: Partial<Color>) {
        this.id = data.id ?? 0;
        this.name = data.name ?? '';
        this.description = data.description ?? '';
    }
}

export class Vehicle {
    id: number;
    plate: string;
    chassi: string;
    version: string;
    year: string;
    transmission: string;
    engine: string;
    status: number;
    brand: Brand;
    vehicleModel: VehicleModel;
    color: Color;

    constructor(data: Partial<Vehicle>) {
        this.id = data.id ?? 0;
        this.plate = data.plate ?? '';
        this.chassi = data.chassi ?? '';
        this.version = data.version ?? '';
        this.year = data.year ?? '';
        this.transmission = data.transmission ?? '';
        this.engine = data.engine ?? '';
        this.status = data.status ?? 0;
        this.brand = data.brand ? new Brand(data.brand) : new Brand({});
        this.vehicleModel = data.vehicleModel ? new VehicleModel(data.vehicleModel) : new VehicleModel({});
        this.color = data.color ? new Color(data.color) : new Color({});
    }

    static fromForm(form: FormGroup): Vehicle {
        return new Vehicle({
            plate: form.get('plate')?.value ?? '',
            chassi: form.get('chassi')?.value ?? '',
            version: form.get('version')?.value ?? '',
            year: form.get('year')?.value ?? '',
            transmission: form.get('transmission')?.value ?? '',
            engine: form.get('engine')?.value ?? '',
            status: 1,
            brand: form.get('brand')?.value ? new Brand(form.get('brand')?.value) : new Brand({}),
            vehicleModel: form.get('vehicleModel')?.value ? new VehicleModel(form.get('vehicleModel')?.value) : new VehicleModel({}),
            color: form.get('color')?.value ? new Color(form.get('color')?.value) : new Color({})
        });
    }
}
