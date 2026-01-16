import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { ServiceOrderDraftService } from '../shared/service-order-draft.service';
import { ServiceOrderDraft } from '../shared/service-order-draft.service';
import { filter } from 'rxjs/operators';
import { UiInteractionService } from 'src/app/shared/services/ui-interaction.service';

@Component({
  selector: 'app-service-order-wizard',
  templateUrl: './service-order-wizard.component.html',
  styleUrl: './service-order-wizard.component.scss'
})
export class ServiceOrderWizardComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  currentDraft: ServiceOrderDraft | null = null;
  currentStep: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private draftService: ServiceOrderDraftService,
    private uiInteractionService: UiInteractionService
  ) { }

  ngOnInit(): void {
    this.pageTitle = [
      { label: "Ordens de Serviços", path: "/" },
      { label: "Nova Ordem de Serviço", path: "/", active: true },
    ];

    this.draftService.draft$.subscribe(draft => {
      this.currentDraft = draft;
    });

    // Determina a etapa atual baseada na rota
    this.detectCurrentStep();
    
    // Escuta mudanças na rota
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.detectCurrentStep();
    });
  }

  private detectCurrentStep(): void {
    const currentUrl = this.router.url;
    console.log('URL atual:', currentUrl);
    
    // Usa uma abordagem mais específica para detectar a etapa
    if (currentUrl.endsWith('/owner') || currentUrl.endsWith('/new')) {
      this.currentStep = 'owner';
    } else if (currentUrl.endsWith('/address')) {
      this.currentStep = 'address';
    } else if (currentUrl.endsWith('/vehicle')) {
      this.currentStep = 'vehicle';
    } else if (currentUrl.endsWith('/services')) {
      this.currentStep = 'services';
    } else {
      this.currentStep = 'owner';
    }
    
    console.log('Etapa atual detectada:', this.currentStep);
  }

  onSaveAndNext(): void {
    this.detectCurrentStep();
    this.draftService.triggerSaveCurrentStep((success: boolean) => {
      if (success) {
        switch (this.currentStep) {
          case 'owner':
            this.router.navigate(['/apps/service-orders/new/address']);
            break;
          case 'address':
            this.router.navigate(['/apps/service-orders/new/vehicle']);
            break;
          case 'vehicle':
            this.router.navigate(['/apps/service-orders/new/services']);
            break;
        }
      } else {
        console.error('Falha ao salvar a etapa atual, navegação interrompida.');
      }
    });
  }

  onBack(): void {
    // Força a detecção da etapa atual
    this.detectCurrentStep();
    
    console.log('Voltando da etapa:', this.currentStep);
    
    // Aguarda um momento para garantir que os dados sejam salvos
    setTimeout(() => {
      // Navega para a etapa anterior
      switch (this.currentStep) {
        case 'address':
          console.log('Navegando para owner');
          this.router.navigate(['/apps/service-orders/new/owner']);
          break;
        case 'vehicle':
          console.log('Navegando para address');
          this.router.navigate(['/apps/service-orders/new/address']);
          break;
        case 'services':
          console.log('Navegando para vehicle');
          this.router.navigate(['/apps/service-orders/new/vehicle']);
          break;
        default:
          console.log('Voltando para listagem');
          this.router.navigate(['/apps/service-orders']);
      }
    }, 100);
  }

  async onCancel(): Promise<void> {
    const result = await this.uiInteractionService.showSweetAlert({
      title: 'Cancelar Criação?',
      text: "Tem certeza que deseja cancelar? Todos os dados não salvos serão perdidos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, cancelar',
      cancelButtonText: 'Não'
    }, []); // Array de botões vazio, pois não há menu aqui

    if (result.isConfirmed) {
      this.draftService.resetDraft();
      this.router.navigate(['/apps/service-orders']);
    }
  }
}