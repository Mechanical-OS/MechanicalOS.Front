import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss']
})
export class DefaultLayoutComponent implements OnInit {

  @Input() containerClass: string = '';

  currentYear!: number;

  constructor () {
  }

  ngOnInit(): void {
    this.currentYear = Date.now();
  }

  ngAfterViewInit(): void {
    document.body.classList.add('authentication-bg', 'authentication-bg-pattern');
  }

}
