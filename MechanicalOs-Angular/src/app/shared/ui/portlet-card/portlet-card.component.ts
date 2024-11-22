import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-ui-portlet-card',
  templateUrl: './portlet-card.component.html',
  styleUrls: ['./portlet-card.component.scss']
})
export class PortletCardComponent implements OnInit {

  @Input() cardTitle: string = '';
  @Input() cardTitleClass?: string;
  @Input() cardClasses: string = '';
  isCollapsed: boolean = false;
  isClosed: boolean = false;
  refreshRequsted: boolean = false;

  constructor () { }

  ngOnInit(): void {
  }

  /**
   * close portlet card
   */
  closeCard(): void {
    this.isClosed = true;
  }

  /**
   * refresh card content
   */
  refreshContent(): void {
    this.refreshRequsted = true;
    setTimeout(() => {
      this.refreshRequsted = false;
    }, 1000);
  }

}
