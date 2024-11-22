import { Component, OnInit } from '@angular/core';
import { getLayoutConfig } from '../shared/helper/utils';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss']
})
export class PublicLayoutComponent implements OnInit {

  constructor () { }

  ngOnInit(): void {
    let config = getLayoutConfig();
    document.body.setAttribute('data-bs-theme', config.layoutColor)
  }
}
