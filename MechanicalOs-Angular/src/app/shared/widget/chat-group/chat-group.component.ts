import { Component, Input, OnInit } from '@angular/core';
import { ChatGroup } from './chat-group.model';

@Component({
  selector: 'app-widget-chat-group',
  templateUrl: './chat-group.component.html',
  styleUrls: ['./chat-group.component.scss']
})
export class ChatGroupComponent implements OnInit {

  @Input() group!: ChatGroup;
  @Input() containerClass: string = '';

  constructor () { }

  ngOnInit(): void {
  }

}
