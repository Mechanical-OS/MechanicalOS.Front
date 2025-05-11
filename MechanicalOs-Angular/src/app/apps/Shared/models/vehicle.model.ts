export class Vehicle {
    id: number;
    plate: string;
    chassi: string;
    brand: string;
    model: string;
    version: string;
    year: string;
    color: string;
    transmission: string;
    engine: string;
    status: number;

    constructor(data: Partial<Vehicle>) {
        this.id = data.id ?? 0;
        this.plate = data.plate ?? '';
        this.chassi = data.chassi ?? '';
        this.brand = data.brand ?? '';
        this.model = data.model ?? '';
        this.version = data.version ?? '';
        this.year = data.year ?? '';
        this.color = data.color ?? '';
        this.transmission = data.transmission ?? '';
        this.engine = data.engine ?? '';
        this.status = data.status ?? 0;
    }
}
