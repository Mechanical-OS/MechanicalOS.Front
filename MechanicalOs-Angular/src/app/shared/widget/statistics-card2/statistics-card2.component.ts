import { Component, Input, OnInit } from '@angular/core';
import { CountUpOptions } from 'countup.js';

@Component({
  selector: 'app-widget-statistics-card2',
  templateUrl: './statistics-card2.component.html',
  styleUrls: ['./statistics-card2.component.scss']
})
export class StatisticsCard2Component implements OnInit {

  @Input() variant: string = "";
  @Input() description: string = "";
  @Input() stats: number = 0;
  @Input() icon: string = "";
  @Input() progress: number = 0;
  @Input() options?: CountUpOptions;

  constructor () { }

  ngOnInit(): void {
  }

}
