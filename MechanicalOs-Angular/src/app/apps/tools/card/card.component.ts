import { Component, OnInit } from '@angular/core';
import { ToolsModel } from '../tools.model';
import { TOOLS } from '../data';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit{

  tools: ToolsModel[] = TOOLS;

  ngOnInit(): void {
    
  }

}
