import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { Column } from 'src/app/shared/advanced-table/advanced-table.component';
import { User } from '../Shared/models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { GetAllRequest } from 'src/app/Http/models/Input/get-all-request.model';
import { UserService } from './user.service';
import Swal from 'sweetalert2';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { AdvancedTableServices } from 'src/app/shared/advanced-table/advanced-table-service.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { UiInteractionService } from 'src/app/shared/services/ui-interaction.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {
  pageTitle: BreadcrumbItem[] = [];
  columns: Column[] = [];

  @ViewChild("advancedTable") advancedTable: any;

  userList: User[] = [];

  isDisabled: boolean = false;

  selectedUserId: number = 0;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private service: UserService,
    private tableService: AdvancedTableServices,
    private notificationService: NotificationService,
    private metroMenuService: MetroMenuService,
    private uiInteractionService: UiInteractionService
  ) {}

  ngOnInit(): void {
    this.pageTitle = [
      { label: "User", path: "/" },
      { label: "User", path: "/", active: true },
    ];

    document.addEventListener('click', this.delegatedClickHandler);
    this.initAdvancedTableData();
    this._fetchData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.metroMenuService.setButtons(this.menuButtons);
    }, 0);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.delegatedClickHandler);
    this.metroMenuService.setButtons([]);
  }

  async _fetchData(): Promise<void> {
    const request: GetAllRequest = {
      pageSize: this.tableService.pageSize,
      pageIndex: this.tableService.page,
      sort: '', direction: ''
    };

    try {
      const ret: any = await this.service.getAll(request).toPromise();
      this.userList = ret.content.resultList;
      this.tableService.totalRecords = ret.content.totalRecords;
      this.tableService.startIndex = (ret.content.pageIndex * ret.content.pageSize) + 1;
      this.tableService.endIndex = this.tableService.startIndex + ret.content.resultList.length - 1;

      console.log('Amostra: ', ret);
    } catch(err) {
      console.error("Erro ao buscar clientes:", err);
      this.userList = [];
      await this.uiInteractionService.showSweetAlert({
        title: 'Erro',
        text: 'Não foi possível carregar a lista de clientes.',
        icon: 'error'
      }, this.menuButtons);
    }
  }

  paginate(): void {
    this._fetchData();
  }

  initAdvancedTableData(): void {
    this.columns = [
      {
        name: "id",
        label: "CÓDIGO",
        formatter: this.IDFormatter.bind(this),
      },
      {
        name: "name",
        label: "Nome",
        formatter: (User: User) => User.name,
      },
      {
        name: "email",
        label: "E-mail",
        formatter: (User: User) => User.email,
      },
      {
        name: "Action",
        label: "Action",
        sort: false,
        formatter: this.serviceActionFormatter.bind(this),
      },
    ];
  }

  onRowSelected(item: User): void {
    if (item) {
      console.log(item);
      this.selectedUserId = item.id;
      this.metroMenuService.enableButton('edit');
      this.metroMenuService.enableButton('delete');
    } else {
      this.metroMenuService.disableButton('edit');
      this.metroMenuService.disableButton('delete');
    }
  }

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
      id: 'edit',
      label: 'Editar',
      iconClass: 'fas fa-edit',
      colorClass: 'edit',
      visible: true,
      enabled: false
    },
    {
      id: 'save',
      label: 'Salvar',
      iconClass: 'fas fa-save',
      colorClass: 'save',
      visible: true,
      enabled: false
    },
    {
      id: 'exit',
      label: 'Sair',
      iconClass: 'fas fa-sign-out-alt',
      colorClass: 'exit',
      visible: true,
      enabled: true
    },
    {
      id: 'delete',
      label: 'Excluir',
      iconClass: 'fas fa-trash',
      colorClass: 'delete',
      visible: true,
      enabled: false
    }
  ];

  async handleMenuAction(action: any): Promise<void> {
    switch (action) {
      case 'save':
        console.log('Save acionado');
      break;
      case 'edit':
        this.router.navigate([`apps/Users/${this.selectedUserId}/edit`]);
      break;
      case 'delete':
        if (this.selectedUserId) {
          const result = await this.uiInteractionService.showSweetAlert({
            title: 'Excluir Cliente!',
            text: 'Tem certeza que deseja excluir este cliente?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
          }, this.menuButtons);
          
          if (result.isConfirmed) {
            await this.deleteUser(this.selectedUserId);
          }
        } else {
          await this.uiInteractionService.showSweetAlert({
            title: 'Nenhum cliente selecionado',
            text: 'Por favor, selecione um cliente antes de continuar.',
            icon: 'warning',
            confirmButtonText: 'OK'
          }, this.menuButtons);
        }
      break;
      case 'exit':
        this.router.navigate([`apps/tools`]);
      break;
      case 'new':
        this.router.navigate(['apps/users/new']);
      break;
    }
  }

  handleTableLoad(event: any): void {
    // product cell
    document.querySelectorAll(".User").forEach((e) => {
      e.addEventListener("click", () => {
        this.router.navigate(["../order/details"], {
          relativeTo: this.route,
          queryParams: { id: e.id },
        });
      });
    });
  }

  async deleteUser(UserId: number): Promise<void> {
    try {
      const result = await this.service.delete(UserId).toPromise();
      if (result && result.statusCode === 200) {
        await this.uiInteractionService.showSweetAlert({ title: 'Sucesso', text: 'Cliente excluído com sucesso.', icon: 'success' }, this.menuButtons);
        this._fetchData();
        this.selectedUserId = 0;
        this.metroMenuService.disableButton('edit');
        this.metroMenuService.disableButton('delete');
      } else {
        await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao excluir cliente.', icon: 'error' }, this.menuButtons);
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao excluir cliente.', icon: 'error' }, this.menuButtons);
    }
  }

  private delegatedClickHandler = async (event: Event) => {
    const target = event.target as HTMLElement;

    const editBtn = target.closest('.edit-btn') as HTMLElement | null;
    if (editBtn) {
      event.preventDefault();
      const UserId = editBtn.getAttribute('data-id');
      if (UserId) {
        this.router.navigate([`apps/users/${UserId}/edit`]);
      }
      return;
    }

    const deleteBtn = target.closest('.delete-btn') as HTMLElement | null;
    if (deleteBtn) {
      event.preventDefault();
      const UserId = deleteBtn.getAttribute('data-id');
      if (UserId && !this.isDisabled) {
        const result = await this.uiInteractionService.showSweetAlert({
          title: 'Excluir Cliente!',
          text: 'Tem certeza que deseja excluir este cliente?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim, excluir!',
          cancelButtonText: 'Não'
        }, this.menuButtons);

        if (result.isConfirmed) {
          try {
            const ret: any = await this.service.delete(parseInt(UserId, 10)).toPromise();
            if (ret.statusCode === 200) {
              await this.uiInteractionService.showSweetAlert({ title: 'Sucesso', text: ret.message || 'Cliente excluído com sucesso.', icon: 'success' }, this.menuButtons);
              this.userList = this.userList.filter(c => c.id !== parseInt(UserId!, 10));
            } else {
              await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao excluir cliente.', icon: 'error' }, this.menuButtons);
            }
          } catch (err) {
            console.error(err);
            await this.uiInteractionService.showSweetAlert({ title: 'Erro', text: 'Erro ao excluir cliente.', icon: 'error' }, this.menuButtons);
          }
        }
      }
      return;
    }
  };
  
  /**
     * Search Method
     */

  async searchData(searchTerm: string): Promise<void> {
    if (searchTerm === '') {
      this._fetchData();
      return;
    }
    try {
      const result = await this.service.findByFilter({ term: searchTerm }).toPromise();
      if (result && result.statusCode === 200) {
        this.userList = result.content;
      } else {
        await this.uiInteractionService.showSweetAlert({
          icon: 'error',
          title: 'Erro na Pesquisa',
          text: result?.message || 'Não foi possível realizar la pesquisa.',
        }, this.menuButtons);
      }
    } catch (error) {
      console.error('Erro na API:', error);
      await this.uiInteractionService.showSweetAlert({
        icon: 'error',
        title: 'Erro na API',
        text: 'Houve um problema ao buscar os dados.',
      }, this.menuButtons);
    }
  }

  // formats order ID cell
  IDFormatter(User: User): any {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<a href="javascript:void(0)" class="order text-body fw-bold" id="${User.id}">#${User.id}</a> `
    );
  }

  // formats status cell
  StatusFormatter(User: User): any {
    // if (service.status == StatusEnum.Active) {
    //   return this.sanitizer.bypassSecurityTrustHtml(
    //     `<h5><span class="badge bg-soft-success text-success"><i class="mdi mdi-bitcoin"></i> Disponível</span></h5>`
    //   );
    // } else if (service.status == StatusEnum.Inactive) {
    //   return this.sanitizer.bypassSecurityTrustHtml(
    //     `<h5><span class="badge bg-soft-warning text-warning"><i class="mdi mdi-timer-sand"></i> Indisponível</span></h5>`
    //   );
    // } else if (service.status == StatusEnum.Pending) {
    //   return this.sanitizer.bypassSecurityTrustHtml(
    //     ` <h5><span class="badge bg-soft-danger text-danger"><i class="mdi mdi-cancel"></i> Pendente</span></h5>`
    //   );
    // } else {
    //   return this.sanitizer.bypassSecurityTrustHtml(
    //     `<h5><span class="badge bg-soft-info text-info"><i class=""></i> ---</span></h5>`
    //   );
    // }
  }

  handleActionClick(event: any): void {
    const target = event.target.closest('.action-icon');
    if (!target) return;

    const id = target.getAttribute('data-id');
    if (!id) return;

    if (target.classList.contains('edit-btn')) {
      // let service = this.serviceList.find(x => x.id == id);
      // if (service)
      //   this.openModal(service || null);
    } else if (target.classList.contains('delete-btn')) {
      //this.deleteService(id);
    } else if (target.classList.contains('view-btn')) {
      //this.visualizarItem(id);
    }
  }

  serviceActionFormatter(item: User): any {
    return this.sanitizer.bypassSecurityTrustHtml(`
        <a href="javascript:void(0);" class="action-icon edit-btn" data-id="${item.id}">
          <i class="mdi mdi-square-edit-outline"></i>
        </a>
        <a href="javascript:void(0);" class="action-icon delete-btn ${this.isDisabled ? 'disabled' : ''}" 
         data-id="${item.id}"
         style="${this.isDisabled ? 'pointer-events: none; opacity: 0.5;' : ''}">
        <i class="mdi mdi-delete"></i>
      </a>
      `);
  }
}
