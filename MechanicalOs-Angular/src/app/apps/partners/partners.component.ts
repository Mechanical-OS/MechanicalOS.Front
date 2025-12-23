import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { PartnersService } from './partners.service';
import { Partner } from '../Shared/models/partners.model';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class PartnersComponent implements OnInit, AfterViewInit  {
  @ViewChild('partnerInfoModal') partnerInfoModal!: TemplateRef<any>;

  pageTitle: BreadcrumbItem[] = [];
  partners: Partner[] = [];
  loading = true;

  modalTitle = '';
  modalContent = '';
  partnerName = '';
  copyFeedback = '';

  constructor(
    private partnersService: PartnersService,
    private router: Router,
    private modalService: NgbModal,
    private metroMenuService: MetroMenuService
  ) {}

  menuButtons: MetroButton[] = [
    {
      id: 'new',
      label: 'Novo',
      iconClass: 'fas fa-plus',
      colorClass: 'start',
      visible: true,
      enabled: true
    },
    {
      id: 'exit_to_home',
      label: 'Sair',
      iconClass: 'fas fa-sign-out-alt',
      colorClass: 'exit',
      visible: true,
      enabled: true
    }
  ];

  ngOnInit(): void {
    this.setupPageTitle();
    this.loadPartners();
  }

  setupPageTitle(): void {
    this.pageTitle = [
      { label: "Home", path: "/apps/tools" },
      { label: "Partners", path: "/apps/Parceiros" },
    ];
  }

  loadPartners() {
    this.loading = true;
    this.partnersService.getPartners().subscribe({
      next: (data) => {
        if (data.statusCode === 200 && data.content) {
          this.partners = data.content;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar parceiros:', err);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.metroMenuService.setButtons(this.menuButtons);
  }

handleMenuAction(action: string): void {
  switch (action) {
    case 'new':
      this.router.navigate(['/apps/partners/new']);
      break;
    case 'exit_to_home':
      this.router.navigate(['/apps/tools']);
      break;
  }
}

  openPhone(partner: Partner): void {
    this.modalTitle = 'Telefone';
    this.modalContent = partner.phone;
    this.partnerName = partner.name;
    this.copyFeedback = '';
    this.metroMenuService.setButtons([]);
    const modalRef = this.modalService.open(this.partnerInfoModal, { centered: true });
    modalRef.result.then(
      () => { this.metroMenuService.setButtons(this.menuButtons); },
      () => { this.metroMenuService.setButtons(this.menuButtons); }
    );
  }

  openWhatsApp(): void {
    if (!this.modalContent) {
      console.error('Nenhum número de telefone para abrir no WhatsApp.');
      return;
    }
    const whatsappNumber = this.formatPhoneNumberForWhatsApp(this.modalContent);
    const url = `https://wa.me/${whatsappNumber}`;
    window.open(url, '_blank', 'noopener noreferrer');
  }

  private formatPhoneNumberForWhatsApp(phone: string): string {
    const cleanedNumber = phone.replace(/\D/g, '');
    if (cleanedNumber.length <= 11) {
      return '55' + cleanedNumber;
    }
    
    return cleanedNumber;
  }

  openEmail(partner: Partner): void {
    this.modalTitle = 'E-mail';
    this.modalContent = partner.email;
    this.partnerName = partner.name;
    this.copyFeedback = ''; 
    this.metroMenuService.setButtons([]);
    const modalRef = this.modalService.open(this.partnerInfoModal, { centered: true });
    modalRef.result.then(
      () => { this.metroMenuService.setButtons(this.menuButtons); },
      () => { this.metroMenuService.setButtons(this.menuButtons); }
    );
  }

  openSite(partner: Partner) {
    if (partner.website) {
      window.open(partner.website, '_blank', 'noopener noreferrer');
    }
  }

orderFor(partner: Partner) {
  this.router.navigate(['/apps/partners/products'], { 
    queryParams: { 
      partnerId: partner.id, 
      partnerName: partner.name 
    } 
  });
}
  copyText(text: string | undefined) {
    if (!text) {
      this.copyFeedback = 'Nada para copiar';
      setTimeout(() => (this.copyFeedback = ''), 2000);
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.copyFeedback = 'Copiado com sucesso!';
      setTimeout(() => (this.copyFeedback = ''), 2000);
    }, (err) => {
      console.error('Falha ao copiar:', err);
      this.copyFeedback = 'Falha ao copiar';
      setTimeout(() => (this.copyFeedback = ''), 2000);
    });
  }
}