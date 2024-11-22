import { CountUpOptions } from 'countup.js';

export interface StatisticsCard1 {
    id?: number;
    variant?: string;
    description?: string;
    stats?: number;
    icon?: string;
    options?: CountUpOptions;
}