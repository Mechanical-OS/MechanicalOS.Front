import { Injectable } from "@angular/core";
import { BaseService } from "src/app/Http/base-service";
import { ServiceOrder, mapStatusToNumber } from "../Shared/models/service-order.model";
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
     * Busca todas as ordens de serviço com paginação
     */
    getAllOrders(request: { pageSize: number; pageIndex: number; sort?: string; direction?: string }): Observable<any> {
        return this.http.post<any>(`${SERVICE_ORDER_URL}/GetAll`, {
            pageSize: request.pageSize,
            pageIndex: request.pageIndex,
            sort: request.sort || '',
            direction: request.direction || ''
        });
    }

    /**
     * Busca uma ordem de serviço pelo ID
     * @param id ID da ordem de serviço
     * @returns Observable<Result<any>>
     */
    getOrderById(id: number): Observable<Result<any>> {
        return this.http.get<Result<any>>(`${SERVICE_ORDER_URL}/${id}`);
    }

    /**
     * Atualiza uma ordem de serviço existente
     * @param orderData Dados da ordem de serviço para atualização
     * @returns Observable<Result<any>>
     */
    updateOrder(orderData: any): Observable<Result<any>> {
        console.log('📤 Atualizando ordem de serviço:', orderData);
        return this.http.put<Result<any>>(SERVICE_ORDER_URL, orderData);
    }

    /**
     * Método principal que cria a ordem de serviço completa em uma única chamada
     * O backend resolve todas as dependências (Customer, Address, Vehicle, Brand, Model, Color)
     */
    async createCompleteServiceOrder(draft: ServiceOrderDraft): Promise<Result<ServiceOrder>> {
        try {
            this.notificationService.showLoading();
            console.log('📝 Iniciando criação da ordem de serviço:', draft.orderNumber);

            // Monta o payload completo
            const payload = this.buildCompleteOrderPayload(draft);
            console.log('📤 Payload da ordem completa:', JSON.stringify(payload, null, 2));

            // Uma única chamada ao backend que resolve tudo
            const result = await firstValueFrom(
                this.http.post<Result<ServiceOrder>>(`${SERVICE_ORDER_URL}/ServiceOrder`, payload)
            );

            console.log('✅ Ordem de serviço criada com sucesso:', result);

            this.notificationService.hideLoading();
            this.notificationService.showSuccess(result);
            
            return result;

        } catch (error: any) {
            console.error('❌ Erro ao criar ordem de serviço:', error);
            this.notificationService.hideLoading();
            this.notificationService.showError(error);
            throw error;
        }
    }

    /**
     * Monta o payload completo para enviar ao backend
     */
    private buildCompleteOrderPayload(draft: ServiceOrderDraft): any {
        const payload: any = {
            customer: null,
            address: null,
            vehicle: null,
            services: [],
            products: [],
            discount: draft.discount || 0,
            fees: draft.fees || 0,
            description: draft.description || '',
            entryDate: draft.entryDate || new Date().toISOString(),
            departureDate: draft.departureDate,
            status: draft.status || 1
        };

        // Monta dados do Customer
        if (draft.customer) {
            const customerData = draft.customer.data;
            payload.customer = {
                id: draft.customer.id || null,
                firstName: customerData?.firstName || '',
                lastName: customerData?.lastName || '',
                birthDate: this.convertBirthDateToISO(customerData?.birthDate),
                cpf: customerData?.cpf?.replace(/\D/g, '') || '',
                rg: customerData?.rg || '',
                email: customerData?.email || '',
                phone: customerData?.phone || '',
                cellPhone: customerData?.cellPhone || ''
            };
        }

        // Monta dados do Address
        if (draft.address?.data) {
            const addressData = draft.address.data;
            payload.address = {
                id: draft.address.id || null,
                country: 'Brasil',
                street: addressData.street || '',
                number: addressData.number || '',
                complement: addressData.complement || '',
                neighborhood: addressData.neighborhood || '',
                city: addressData.city || '',
                state: addressData.state || '',
                zipCode: addressData.zipCode?.replace(/\D/g, '') || ''
            };
        }

        // Monta dados do Vehicle
        if (draft.vehicle?.data) {
            const vehicleData = draft.vehicle.data;
            payload.vehicle = {
                id: draft.vehicle.id || null,
                plate: vehicleData.plate || '',
                chassi: vehicleData.chassi || '',
                brand: vehicleData.brand || '',
                model: vehicleData.model || '',
                color: vehicleData.color || '',
                version: vehicleData.version || '',
                year: vehicleData.year || '',
                transmission: vehicleData.transmission || '',
                engine: vehicleData.engine || ''
            };
        }

        // Monta lista de Services
        payload.services = draft.services.map(service => ({
            id: service.id,
            quantity: service.quantity
        }));

        // Monta lista de Products
        payload.products = draft.products.map(product => ({
            id: product.id,
            quantity: product.quantity,
            discount: product.discount || 0
        }));

        return payload;
    }

    /**
     * Converte a data de nascimento para formato ISO (YYYY-MM-DDTHH:mm:ss)
     */
    private convertBirthDateToISO(birthDate: any): string {
        if (!birthDate) return '';
        
        // Se já for string no formato ISO
        if (typeof birthDate === 'string') {
            // Se já tiver o T, retorna como está
            if (birthDate.includes('T')) {
                return birthDate;
            }
            // Se for YYYY-MM-DD, adiciona o horário
            return `${birthDate}T00:00:00`;
        }
        
        // Se for NgbDateStruct (objeto com year, month, day)
        if (birthDate.year && birthDate.month && birthDate.day) {
            const year = birthDate.year;
            const month = String(birthDate.month).padStart(2, '0');
            const day = String(birthDate.day).padStart(2, '0');
            return `${year}-${month}-${day}T00:00:00`;
        }
        
        return '';
    }

    // ============================================================================
    // MÉTODOS LEGADOS - Mantidos comentados para referência
    // Podem ser removidos após validação completa do novo fluxo
    // O backend agora faz toda essa lógica internamente
    // ============================================================================

    /**
     * @deprecated Use createCompleteServiceOrder que chama o novo endpoint
     * Resolve Customer: retorna ID se existe, senão cria e retorna o novo ID
     */
    /* 
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
            dateOfBirth: this.convertBirthDateToString(ownerData.birthDate),
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
     * Converte a data de nascimento de NgbDateStruct para string no formato YYYY-MM-DD
     */
    private convertBirthDateToString(birthDate: any): string {
        if (!birthDate) return '';
        
        // Se já for string, retorna
        if (typeof birthDate === 'string') {
            return birthDate;
        }
        
        // Se for NgbDateStruct (objeto com year, month, day)
        if (birthDate.year && birthDate.month && birthDate.day) {
            const year = birthDate.year;
            const month = String(birthDate.month).padStart(2, '0');
            const day = String(birthDate.day).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        
        return '';
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
            console.log('🚗 Veículo já existe com ID:', vehicle.id);
            return vehicle.id;
        }

        // Se tem dados, tenta buscar por placa
        // if (vehicle.data?.plate) {
        //     console.log('🔍 Buscando veículo pela placa:', vehicle.data.plate);
        //     try {
        //         const existing = await firstValueFrom(
        //             this.vehicleService.getByPlate(vehicle.data.plate)
        //         );

        //         if (existing?.content?.id) {
        //             console.log('✅ Veículo encontrado por placa! ID:', existing.content.id);
        //             return existing.content.id;
        //         }
        //     } catch (error: any) {
        //         if (error.status !== 404) {
        //             console.error('❌ Erro ao buscar veículo por placa:', error);
        //             throw error;
        //         }
        //         // 404 significa que não existe, continua para criar
        //         console.log('ℹ️ Veículo não encontrado (404), será criado um novo');
        //     }
        // }

        // Cria novo veículo
        console.log('🆕 Criando novo veículo...');
        const newVehicle = await this.createVehicle(customerId, vehicle.data);
        console.log('✅ Veículo criado com sucesso:', newVehicle);
        console.log('✅ ID do veículo criado:', newVehicle.id);
        
        if (!newVehicle.id) {
            console.error('❌ ERRO CRÍTICO: Veículo criado mas ID não foi retornado pela API');
            console.error('❌ Objeto retornado:', newVehicle);
            throw new Error('Erro: Veículo criado mas ID não foi retornado pela API');
        }
        
        return newVehicle.id;
    }

    /**
     * Cria um novo veículo
     */
    private async createVehicle(customerId: number, vehicleData: VehicleData): Promise<any> {
        try {
            // 1. Resolve Brand (busca ou cria)
            const brandId = await this.resolveBrand(vehicleData.brand);
            console.log('Brand resolvida:', brandId);

            // 2. Resolve VehicleModel (busca ou cria)
            const vehicleModelId = await this.resolveVehicleModel(brandId, vehicleData.model);
            console.log('VehicleModel resolvido:', vehicleModelId);

            // 3. Resolve Color (busca ou cria)
            const colorId = await this.resolveColor(vehicleData.color);
            console.log('Color resolvida:', colorId);

            // 4. Cria o veículo com todos os IDs resolvidos
            const vehiclePayload = {
                id: 0,
                customerId: customerId,
                plate: vehicleData.plate.toUpperCase(),
                chassi: vehicleData.chassi || '',
                brandId: brandId,
                vehicleModelId: vehicleModelId,
                version: vehicleData.version || '',
                year: vehicleData.year,
                colorId: colorId,
                transmission: vehicleData.transmission,
                engine: vehicleData.engine || '',
                status: 1
            };

            console.log('📤 Payload do veículo:', JSON.stringify(vehiclePayload, null, 2));

            const result = await firstValueFrom(
                this.vehicleService.saveVehicle(vehiclePayload)
            );

            console.log('📥 Resposta da API ao criar veículo:', JSON.stringify(result, null, 2));

            if (result.statusCode !== 200 || !result.content) {
                throw new Error('Erro ao criar veículo: ' + result.message);
            }

            console.log('✅ Veículo retornado pela API:', result.content);
            return result.content;
        } catch (error: any) {
            console.error('Erro ao criar veículo:', error);
            throw error;
        }
    }

    /**
     * Resolve Brand: retorna ID se existe, senão cria e retorna o novo ID
     */
    private async resolveBrand(brandName: string): Promise<number> {
        if (!brandName || brandName.trim() === '') {
            throw new Error('Nome da marca é obrigatório');
        }

        try {
            // Busca todas as marcas
            const brands = await firstValueFrom(this.vehicleService.getAllBrands());
            
            // Procura a marca pelo nome (case insensitive)
            const existingBrand = brands.find(
                b => b.name.toLowerCase() === brandName.toLowerCase()
            );

            if (existingBrand) {
                console.log('Marca encontrada:', existingBrand.name, 'ID:', existingBrand.id);
                return existingBrand.id;
            }

            // Cria nova marca
            console.log('Criando nova marca:', brandName);
            const result = await firstValueFrom(
                this.vehicleService.saveBrand({
                    name: brandName,
                    description: brandName
                })
            );

            if (result.statusCode !== 200 || !result.content) {
                throw new Error('Erro ao criar marca: ' + result.message);
            }

            return result.content.id;
        } catch (error: any) {
            console.error('Erro ao resolver marca:', error);
            throw error;
        }
    }

    /**
     * Resolve VehicleModel: retorna ID se existe, senão cria e retorna o novo ID
     */
    private async resolveVehicleModel(brandId: number, modelName: string): Promise<number> {
        if (!modelName || modelName.trim() === '') {
            throw new Error('Nome do modelo é obrigatório');
        }

        try {
            // Busca todos os modelos
            const models = await firstValueFrom(this.vehicleService.getAllVehicleModels());
            
            // Procura o modelo pelo nome e brandId (case insensitive)
            const existingModel = models.find(
                m => m.name.toLowerCase() === modelName.toLowerCase() && m.brandId === brandId
            );

            if (existingModel) {
                console.log('Modelo encontrado:', existingModel.name, 'ID:', existingModel.id);
                return existingModel.id;
            }

            // Cria novo modelo
            console.log('Criando novo modelo:', modelName, 'para brandId:', brandId);
            const result = await firstValueFrom(
                this.vehicleService.saveVehicleModel({
                    brandId: brandId,
                    name: modelName,
                    description: modelName
                })
            );

            if (result.statusCode !== 200 || !result.content) {
                throw new Error('Erro ao criar modelo: ' + result.message);
            }

            return result.content.id;
        } catch (error: any) {
            console.error('Erro ao resolver modelo:', error);
            throw error;
        }
    }

    /**
     * Resolve Color: retorna ID se existe, senão cria e retorna o novo ID
     */
    private async resolveColor(colorName: string): Promise<number> {
        if (!colorName || colorName.trim() === '') {
            throw new Error('Nome da cor é obrigatório');
        }

        try {
            // Busca todas as cores
            const colors = await firstValueFrom(this.vehicleService.getAllColors());
            
            // Procura a cor pelo nome (case insensitive)
            const existingColor = colors.find(
                c => c.name.toLowerCase() === colorName.toLowerCase()
            );

            if (existingColor) {
                console.log('Cor encontrada:', existingColor.name, 'ID:', existingColor.id);
                return existingColor.id;
            }

            // Cria nova cor
            console.log('Criando nova cor:', colorName);
            const result = await firstValueFrom(
                this.vehicleService.saveColor({
                    name: colorName,
                    description: colorName
                })
            );

            if (result.statusCode !== 200 || !result.content) {
                throw new Error('Erro ao criar cor: ' + result.message);
            }

            return result.content.id;
        } catch (error: any) {
            console.error('Erro ao resolver cor:', error);
            throw error;
        }
    }

    /**
     * Cria a ordem de serviço
     */
    private async createOrder(
        draft: ServiceOrderDraft,
        customerId: number,
        vehicleId: number
    ): Promise<Result<ServiceOrder>> {
        console.log('📋 Montando payload da ordem de serviço...');
        console.log('📋 CustomerId recebido:', customerId);
        console.log('📋 VehicleId recebido:', vehicleId);
        
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
            status: mapStatusToNumber(draft.status), // Converte status de string para número
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
