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
  private readonly CACHE_KEY = 'toolsModulesCache';

  constructor(private service: ToolsService) { }

  ngOnInit(): void {
    this.loadToolsCard();
  }

  loadToolsCard(): void {
    // Verificar se existe cache
    const cachedData = this.getCachedModules();
    
    if (cachedData) {
      console.log('Carregando módulos do cache');
      this.tools = cachedData;
    } else {
      console.log('Buscando módulos da API');
      this.service.getModules().subscribe((result) => {
        if (result.statusCode == 200) {
          console.log(result);
          this.tools = result.content;
          // Salvar no cache
          this.setCachedModules(this.tools);
          console.log('Módulos salvos no cache');
        } else {
          console.error(result.message);
        }
      })
    }
  }

  private getCachedModules(): ToolsModel[] | null {
    try {
      const cached = sessionStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Erro ao ler cache:', error);
      return null;
    }
  }

  private setCachedModules(modules: ToolsModel[]): void {
    try {
      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(modules));
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  }

}
