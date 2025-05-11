import { Component, OnInit, ViewChild } from '@angular/core';
import { Column } from 'src/app/shared/advanced-table/advanced-table.component';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { Vehicle } from '../Shared/models/vehicle.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvancedTableServices } from 'src/app/shared/advanced-table/advanced-table-service.service';
import { MetroMenuService } from 'src/app/shared/metro-menu/metro-menu.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MetroButton } from 'src/app/shared/metro-menu/metro-menu.component';
import { GetAllRequest } from 'src/app/Http/models/Input/get-all-request.model';
import { VehicleService } from './vehicle.service';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.scss'
})
export class VehicleComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  columns: Column[] = [];

  @ViewChild("advancedTable") advancedTable: any;

  list: Vehicle[] = [];
  isDisabled: boolean = false;
  selectedRowId: number = 0;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private service: VehicleService,
    private tableService: AdvancedTableServices,
    private metroMenuService: MetroMenuService
  ) { }

  ngOnInit(): void {
    this.pageTitle = [
      { label: "Vehicle", path: "/" },
      { label: "Vehicle", path: "/", active: true },
    ];

    const initialButtons = this.menuButtons;
    this.metroMenuService.setButtons(initialButtons);

    this.initAdvancedTableData();
    this._fetchData();
  }

  //#region ADVANCED TABLE

  initAdvancedTableData(): void {
    this.columns = [
      {
        name: "id",
        label: "CÓDIGO",
        formatter: this.IDFormatter.bind(this),
      },
      {
        name: "brand",
        label: "Marca",
        formatter: (Vehicle: Vehicle) => Vehicle.brand,
      },
      {
        name: "model",
        label: "Modelo",
        formatter: (Vehicle: Vehicle) => Vehicle.model,
      },
      {
        name: "plate",
        label: "Placa",
        formatter: (Vehicle: Vehicle) => Vehicle.plate,
      },
      {
        name: "action",
        label: "Ações",
        sort: false,
        formatter: this.actionFormatter.bind(this),
      },
    ];
  }

  /**
   * 
   * @param event 
   */
  handleTableLoad(event: any): void {
    // product cell
    document.querySelectorAll(".vehicle").forEach((e) => {
      e.addEventListener("click", () => {
        this.router.navigate(["../order/details"], {
          relativeTo: this.route,
          queryParams: { id: e.id },
        });
      });
    });
  }

  /**
   * Load data
   */
  async _fetchData(): Promise<void> {
    const request: GetAllRequest = {
      pageSize: this.tableService.pageSize,
      pageIndex: this.tableService.page,
      sort: '',
      direction: ''
    };

    this.service.getAll(request).subscribe((ret: any) => {
      this.list = ret.content.resultList;
      this.tableService.totalRecords = ret.content.totalRecords;
      this.tableService.startIndex = (ret.content.pageIndex * ret.content.pageSize) + 1;
      this.tableService.endIndex = this.tableService.startIndex + ret.content.resultList.length - 1;
    });
  }

  /**
   * 
   * @param value 
   */
  searchData(value: string) {
    console.log(value);
  }

  /**
   * 
   * @param item 
   */
  onRowSelected(row: Vehicle): void {
    if (row) {
      this.selectedRowId = row.id;
      this.metroMenuService.enableButton('edit');
      this.metroMenuService.enableButton('delete');
    } else {
      this.metroMenuService.disableButton('edit');
      this.metroMenuService.enableButton('delete');
    }
  }
  //#endregion

  //#region MENU 
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

  handleMenuAction(action: any) {
    switch (action) {
      case 'save':
        console.log('Save acionado');
        break;
      case 'edit':
        //this.router.navigate([`apps/customers/${this.selectedCustomerId}/edit`]);
        break;
      case 'delete':

        break;
      case 'exit':
        this.router.navigate([`apps/tools`]);
        break;
      case 'photos':
        // lógica para fotos
        console.log('Fotos acionado');
        break;
      case 'new':
        // lógica para novo
        this.router.navigate(['apps/vehicles/new']);
        break;
    }
  }
  //#endregion

  //#region HELPER METHODS
  /**
   * 
   * @param vehicle 
   * @returns 
   */
  IDFormatter(vehicle: Vehicle): any {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<a href="javascript:void(0)" class="order text-body fw-bold" id="${vehicle.id}">#${vehicle.id}</a> `
    );
  }

  /**
   * 
   * @param vehicle 
   * @returns 
   */
  actionFormatter(vehicle: Vehicle): any {
    return this.sanitizer.bypassSecurityTrustHtml(`
          <a href="javascript:void(0);" class="action-icon edit-btn" data-id="${vehicle.id}">
            <i class="mdi mdi-square-edit-outline"></i>
          </a>
          <a href="javascript:void(0);" class="action-icon delete-btn ${this.isDisabled ? 'disabled' : ''}" 
           data-id="${vehicle.id}"
           style="${this.isDisabled ? 'pointer-events: none; opacity: 0.5;' : ''}">
          <i class="mdi mdi-delete"></i>
        </a>
        `);
  }

}
