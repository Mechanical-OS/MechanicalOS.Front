import { CountUpOptions } from 'countup.js';

export interface StatisticsCard3 {
    id: number;
    title: string;
    stats: number;
    trendIcon: string;
    trendLabel: string;
    trendValue: string;
    trendStats: string;
    variant: string;
    options?: CountUpOptions;
}