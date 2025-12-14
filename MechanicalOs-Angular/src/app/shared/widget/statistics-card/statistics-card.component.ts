import { Component, Input, OnInit } from '@angular/core';
import { StatisticsCard1 } from './statistics-card.model';

@Component({
  selector: 'app-widget-statistics-card1',
  templateUrl: './statistics-card.component.html',
  styleUrls: ['./statistics-card.component.scss']
})
export class StatisticsCardComponent implements OnInit {

  @Input() statisticsCardData!: StatisticsCard1;

  constructor () { }

  ngOnInit(): void {
  }

}
