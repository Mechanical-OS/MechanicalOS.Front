import { Component, OnInit } from '@angular/core';
import { ToolsModel } from '../tools.model';
import { TOOLS } from '../data';
import { ToolsService } from '../tools.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit {

  tools: ToolsModel[] = [];

  constructor(private service: ToolsService) { }

  ngOnInit(): void {
    this.loadToolsCard();
  }

  loadToolsCard(): void {
    this.service.getModules().subscribe((result) => {
      if (result.statusCode == 200) {
        console.log(result);
        this.tools = result.content;
        console.log(this.tools);
      } else {
        console.error(result.message);
      }
    })
  }

}
