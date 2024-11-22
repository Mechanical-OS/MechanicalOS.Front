import { Component, Input, OnInit } from '@angular/core';
import { FAQItem } from './faq.model';

@Component({
  selector: 'app-widget-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  @Input() rawFAQ: FAQItem[] = [];
  @Input() containerClass?: string = '';
  constructor () { }

  ngOnInit(): void {
  }

}
