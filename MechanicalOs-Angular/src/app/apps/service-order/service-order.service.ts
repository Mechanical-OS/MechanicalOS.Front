import { Injectable } from "@angular/core";
import { BaseService } from "src/app/Http/base-service";
import { ServiceOrder } from "../Shared/models/service-order.model";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "src/app/shared/services/notification.service";
import { SERVICE_ORDER_URL, CUSTOMER_URL } from "src/app/Http/Config/config";
import { Observable, firstValueFrom } from "rxjs";
import { Result } from "src/app/Http/models/operation-result.model";
import { ServiceOrderDraft, OwnerData, AddressData, VehicleData } from "./shared/service-order-draft.service";
import { CustomerService } from "../customers/customer.service";
import { VehicleService } from "../vehicle/vehicle.service";
import { Customer, Address } from "../Shared/models/customer.model";

@Injectable({
    providedIn: 'root'
})
export class ServiceOrderService extends BaseService<ServiceOrder> {
    
    constructor(
        http: HttpClient,
        notificationService: NotificationService,
        private customerService: CustomerService,
        private vehicleService: VehicleService
    ) {
        super(http, notificationService, SERVICE_ORDER_URL);
    }

    /**
     * Método principal que orquestra a criação completa da ordem de serviço
     * Resolve Customer → Address → Vehicle → Cria Ordem
     */
    async createCompleteServiceOrder(draft: ServiceOrderDraft): Promise<Result<ServiceOrder>> {
        try {
            this.notificationService.showLoading();
            console.log('Iniciando criação da ordem de serviço:', draft.orderNumber);

            // 1. Resolve Customer
            const customerId = await this.resolveCustomer(draft.customer);
            console.log('Customer resolvido:', customerId);

            // 2. Resolve Address (se existir)
            let addressId: number | undefined = undefined;
            if (draft.address) {
                addressId = await this.resolveAddress(customerId, draft.address);
                console.log('Address resolvido:', addressId);
            }

            // 3. Resolve Vehicle
            const vehicleId = await this.resolveVehicle(customerId, draft.vehicle);
            console.log('Vehicle resolvido:', vehicleId);

            // 4. Create Service Order
            const order = await this.createOrder(draft, customerId, vehicleId);
            console.log('Ordem de serviço criada:', order);

            this.notificationService.hideLoading();
            this.notificationService.showSuccess(order);
            
            return order;

        } catch (error: any) {
            console.error('Erro ao criar ordem de serviço:', error);
            this.notificationService.hideLoading();
            this.notificationService.showError(error);
            throw error;
        }
    }

    /**
     * Resolve Customer: retorna ID se existe, senão cria e retorna o novo ID
     */
    private async resolveCustomer(customer: any): Promise<number> {
        if (!customer) {
            throw new Error('Dados do cliente são obrigatórios');
        }

        // Se já tem ID, retorna
        if (customer.id) {
            console.log('Cliente já existe com ID:', customer.id);
            return customer.id;
        }

        // Se tem dados, tenta buscar por CPF
        if (customer.data?.cpf) {
            try {
                const existing = await firstValueFrom(
                    this.customerService.getBySocialNumber(customer.data.cpf)
                );

                if (existing?.content?.id) {
                    console.log('Cliente encontrado por CPF:', existing.content.id);
                    return existing.content.id;
                }
            } catch (error: any) {
                if (error.status !== 404) {
                    throw error;
                }
                // 404 significa que não existe, continua para criar
            }
        }

        // Cria novo cliente
        console.log('Criando novo cliente...');
        const newCustomer = await this.createCustomer(customer.data);
        return newCustomer.id;
    }

    /**
     * Cria um novo cliente
     */
    private async createCustomer(ownerData: OwnerData): Promise<Customer> {
        const customerPayload = {
            id: 0,
            name: `${ownerData.firstName} ${ownerData.lastName}`,
            email: ownerData.email,
            whatsApp: ownerData.cellPhone,
            phone: ownerData.phone || ownerData.cellPhone,
            socialNumber: ownerData.cpf.replace(/\D/g, ''),
            nationalId: ownerData.rg || '',
            dateOfBirth: '', // Pode ser adicionado ao form depois
            address: {
                id: 0,
                referenceId: 0,
                country: 'Brasil',
                state: '',
                city: '',
                street: '',
                number: '',
                complement: '',
                reference: '',
                zipcode: '',
                neighborhood: '',
                addressType: 1
            }
        };

        const result = await firstValueFrom(
            this.customerService.save(customerPayload)
        );

        if (result.statusCode !== 200 || !result.content) {
            throw new Error('Erro ao criar cliente: ' + result.message);
        }

        return result.content;
    }

    /**
     * Resolve Address: retorna ID se existe, senão cria e retorna o novo ID
     */
    private async resolveAddress(customerId: number, address: any): Promise<number> {
        if (!address) {
            return 0;
        }

        // Se já tem ID, retorna
        if (address.id) {
            console.log('Endereço já existe com ID:', address.id);
            return address.id;
        }

        // Para endereço, normalmente ele vem junto com o cliente
        // Aqui você pode implementar lógica adicional se necessário
        console.log('Endereço será tratado junto com o cliente');
        return 0;
    }

    /**
     * Resolve Vehicle: retorna ID se existe, senão cria e retorna o novo ID
     */
    private async resolveVehicle(customerId: number, vehicle: any): Promise<number> {
        if (!vehicle) {
            throw new Error('Dados do veículo são obrigatórios');
        }

        // Se já tem ID, retorna
        if (vehicle.id) {
            console.log('Veículo já existe com ID:', vehicle.id);
            return vehicle.id;
        }

        // Se tem dados, tenta buscar por placa
        if (vehicle.data?.plate) {
            try {
                const existing = await firstValueFrom(
                    this.vehicleService.getByPlate(vehicle.data.plate)
                );

                if (existing?.content?.id) {
                    console.log('Veículo encontrado por placa:', existing.content.id);
                    return existing.content.id;
                }
            } catch (error: any) {
                if (error.status !== 404) {
                    throw error;
                }
                // 404 significa que não existe, continua para criar
            }
        }

        // Cria novo veículo
        console.log('Criando novo veículo...');
        const newVehicle = await this.createVehicle(customerId, vehicle.data);
        return newVehicle.id;
    }

    /**
     * Cria um novo veículo
     */
    private async createVehicle(customerId: number, vehicleData: VehicleData): Promise<any> {
        // Nota: Você precisará ajustar esse payload conforme sua API
        // Pode precisar buscar brandId, colorId, etc.
        const vehiclePayload = {
            id: 0,
            customerId: customerId,
            plate: vehicleData.plate.toUpperCase(),
            chassi: vehicleData.chassi || '',
            brandId: 0, // TODO: buscar ou criar brand
            vehicleModelId: 0, // TODO: buscar ou criar model
            version: vehicleData.version || '',
            year: vehicleData.year,
            colorId: 0, // TODO: buscar ou criar color
            transmission: vehicleData.transmission,
            engine: vehicleData.engine || '',
            status: 1
        };

        const result = await firstValueFrom(
            this.vehicleService.saveVehicle(vehiclePayload)
        );

        if (result.statusCode !== 200 || !result.content) {
            throw new Error('Erro ao criar veículo: ' + result.message);
        }

        return result.content;
    }

    /**
     * Cria a ordem de serviço
     */
    private async createOrder(
        draft: ServiceOrderDraft,
        customerId: number,
        vehicleId: number
    ): Promise<Result<ServiceOrder>> {
        const orderPayload = {
            id: 0,
            customerId: customerId,
            vehicleId: vehicleId,
            totalOrder: Math.round(draft.total * 100), // Converte para centavos
            discount: Math.round(draft.discount * 100), // Converte para centavos
            fees: Math.round(draft.fees * 100), // Converte para centavos
            description: draft.description,
            entryDate: draft.entryDate || new Date().toISOString(),
            departureDate: draft.departureDate,
            status: draft.status,
            orderProducts: draft.products.map(product => ({
                productId: product.id,
                productName: product.name,
                productPrice: product.price,
                productDiscount: product.discount,
                productQuantity: product.quantity,
                pac: null,
                productVariations: [],
                productSizes: []
            })),
            orderServices: draft.services.map(service => ({
                serviceId: service.id,
                serviceCode: service.code || String(service.id),
                serviceShortDescription: service.name,
                servicePrice: Math.round(service.price * 100), // Converte para centavos
                serviceDiscount: 0,
                serviceQuantity: service.quantity
            }))
        };

        console.log('📤 Payload da ordem de serviço:', JSON.stringify(orderPayload, null, 2));

        return await firstValueFrom(
            this.http.post<Result<ServiceOrder>>(SERVICE_ORDER_URL, orderPayload)
        );
    }

    /**
     * Atualiza o endereço de um cliente existente
     */
    async updateCustomerAddress(customerId: number, addressData: AddressData): Promise<Result<Customer>> {
        const addressPayload = {
            id: 0,
            referenceId: customerId,
            country: 'Brasil',
            state: addressData.state,
            city: addressData.city,
            street: addressData.street,
            number: addressData.number,
            complement: addressData.complement || '',
            reference: '',
            zipcode: addressData.zipCode.replace(/\D/g, ''),
            neighborhood: addressData.neighborhood,
            addressType: 1
        };

        // Aqui você precisaria de um endpoint para atualizar endereço
        // Por enquanto, vou deixar como stub
        console.log('Atualizando endereço do cliente:', customerId, addressPayload);
        
        return await firstValueFrom(
            this.http.put<Result<Customer>>(`${CUSTOMER_URL}/${customerId}/address`, addressPayload)
        );
    }
}
