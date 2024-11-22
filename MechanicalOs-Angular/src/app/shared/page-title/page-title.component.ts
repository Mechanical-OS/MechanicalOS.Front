import { Component, Input, OnInit } from '@angular/core';
import { BreadcrumbItem } from './page-title.model';

@Component({
  selector: 'app-page-title',
  templateUrl: './page-title.component.html',
  styleUrls: ['./page-title.component.scss']
})
export class PageTitleComponent implements OnInit {


  @Input() breadcrumbItems: BreadcrumbItem[] = [];
  @Input() title: string = '';
  constructor () { }

  ngOnInit(): void {
  }

}
