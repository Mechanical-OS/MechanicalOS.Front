interface InvoiceItem {
    id: number;
    name: string;
    description: string;
    hours: number;
    hour_rate: number;
    total: number;
}

interface Address {
    owner?: string;
    line_1?: string;
    city?: string;
    state?: string;
    zip?: number;
    phone?: string;
}

export interface Invoice {
    customer?: string;
    notes?: string;
    invoice_date?: string;
    invoice_id?: string;
    invoice_status?: string;
    address?: Address;
    billing_address?: Address;
    items: InvoiceItem[];
    sub_total?: number;
    discount?: number;
    total?: number;
};