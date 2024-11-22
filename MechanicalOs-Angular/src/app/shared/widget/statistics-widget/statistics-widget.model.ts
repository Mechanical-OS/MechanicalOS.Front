import { CountUpOptions } from 'countup.js';

export interface StatisticsWidget {
    icon?: string;
    iconCssClasses?: string;
    stats: number;
    options?: CountUpOptions;
    label: string;
    labelCssClasses: string;
}