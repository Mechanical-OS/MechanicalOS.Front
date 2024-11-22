import { Component, Input, OnInit } from '@angular/core';
import { CountUpOptions } from 'countup.js';

@Component({
  selector: 'app-widget-chart-card',
  templateUrl: './chart-card.component.html',
  styleUrls: ['./chart-card.component.scss']
})
export class ChartCardComponent implements OnInit {

  @Input() icon: string = '';
  @Input() variant: string = '';
  @Input() stats: number = 0;
  @Input() options: CountUpOptions = {};
  @Input() title: string = "";

  constructor () { }

  ngOnInit(): void {
  }

}
