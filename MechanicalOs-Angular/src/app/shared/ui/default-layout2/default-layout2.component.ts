import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-default-layout2',
  templateUrl: './default-layout2.component.html',
  styleUrls: ['./default-layout2.component.scss']
})
export class DefaultLayout2Component implements OnInit, AfterViewInit {

  @Input() showText: boolean = true;

  constructor () { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    document.body.classList.add('auth-fluid-pages', 'pb-0');
  }

}
