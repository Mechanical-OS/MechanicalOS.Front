import { Component, Input, OnInit } from '@angular/core';
import { Message } from './inbox.model';

@Component({
  selector: 'app-widget-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit {

  @Input() messages: Message[] = [];
  @Input() height: number = 410;

  constructor () { }

  ngOnInit(): void {
  }

}
