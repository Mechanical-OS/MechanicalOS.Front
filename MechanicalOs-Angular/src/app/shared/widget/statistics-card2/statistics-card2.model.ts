import { CountUpOptions } from 'countup.js';

export interface StatisticsCard2 {
    id: number;
    variant: string;
    description: string;
    stats: number;
    icon: string;
    progress: number;
    options?: CountUpOptions;
}