import { ServiceModel } from "./service.model";

const SERVICELIST: ServiceModel[] = [
    {
        id: 1,
        code: 'ML000001',
        shortDescription: 'Troca de óleo do motor',
        description: 'Troca de óleo do motor',
        price: 180.00,
        status: 1,
    },
    {
        id: 2,
        code: 'ML000002',
        shortDescription: 'Troca de filtro de ar condicionado',
        description: 'Troca de filtro de ar condicionado',
        price: 70.00,
        status: 1,
    },
    {
        id: 3,
        code: 'ML000003',
        shortDescription: 'Vitrificação do parabrisa dianteiro',
        description: 'Vitrificação do parabrisa dianteiro',
        price: 700.00,
        status: 1,
    },
]
export { SERVICELIST }