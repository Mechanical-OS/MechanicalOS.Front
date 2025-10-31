import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PartnersService } from './partners.service';
import { Partner } from '../Shared/models/partners.model';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class PartnersComponent implements OnInit {
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
    private modalService: NgbModal
  ) {}

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
        this.partners = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar parceiros:', err);
        this.loading = false;
      }
    });
  }

  openPhone(partner: Partner) {
    this.modalTitle = 'Telefone';
    this.modalContent = partner.phone;
    this.partnerName = partner.name;
    this.copyFeedback = '';
    this.modalService.open(this.partnerInfoModal, { centered: true });
  }

  openEmail(partner: Partner) {
    this.modalTitle = 'E-mail';
    this.modalContent = partner.email;
    this.partnerName = partner.name;
    this.copyFeedback = ''; 
    this.modalService.open(this.partnerInfoModal, { centered: true });
  }

  openSite(partner: Partner) {
    if (partner.website) {
      window.open(partner.website, '_blank', 'noopener noreferrer');
    }
  }

  orderFor(partner: Partner) {
    this.router.navigate(['/products'], { queryParams: { partnerId: partner.id, partnerName: partner.name } });
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