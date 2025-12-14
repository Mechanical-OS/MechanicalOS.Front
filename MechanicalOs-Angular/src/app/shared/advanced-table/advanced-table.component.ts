import { AfterContentInit, AfterViewChecked, AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AdvancedTableServices } from './advanced-table-service.service';
import { NgbSortableHeaderDirective, SortEvent } from './sortable.directive';


export interface Column {
  name: string;
  label: string;
  formatter: (a: any) => any | string;
  sort?: boolean;
  width?: number;

}


@Component({
  selector: 'app-advanced-table',
  templateUrl: './advanced-table.component.html',
  styleUrls: ['./advanced-table.component.scss'],
  providers: [AdvancedTableServices]
})
export class AdvancedTableComponent implements OnInit, AfterViewChecked {


  @Input() pagination: boolean = false;
  @Input() isSearchable: boolean = false;
  @Input() isSortable: boolean = false;
  @Input() pageSizeOptions: number[] = [];
  @Input() tableData: any[] = [];
  @Input() totalRecords?: number;
  @Input() isLoading: boolean = false;
  @Input() tableClasses: string = '';
  @Input() theadClasses: string = '';
  @Input() hasRowSelection: boolean = false;
  @Input() singleRowSelection: boolean = false;
  @Input() columns: Column[] = [];
  collectionSize: number = this.tableData.length;
  selectAll: boolean = false;
  isSelected: boolean[] = [];
  private previousPage: number = 1;
  private previousPageSize: number = 10;
  
  // Opções de registros por página
  availablePageSizes: number[] = [10, 25, 50, 100];

  @Output() rowSelected = new EventEmitter<any>(); // Emissor de evento


  @Output() search = new EventEmitter<string>();
  @Output() sort = new EventEmitter<SortEvent>();
  @Output() handleTableLoad = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();


  @ViewChildren(NgbSortableHeaderDirective) headers!: QueryList<NgbSortableHeaderDirective>;
  @ViewChildren('advancedTable') advancedTable!: any;

  constructor(public service: AdvancedTableServices, private sanitizer: DomSanitizer, private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngAfterViewChecked(): void {
    this.handleTableLoad.emit();

  }

  ngOnInit(): void {
    for (let i = 0; i < this.tableData.length; i++) {
      this.isSelected[i] = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.paginate();
  }

  /**
   * sets pagination configurations
   */
  paginate(): void {
    // paginate - usa totalRecords passado como input ou calcula pelo tamanho do array
    this.service.totalRecords = this.totalRecords !== undefined ? this.totalRecords : this.tableData.length;
    if (this.service.totalRecords === 0) {
      this.service.startIndex = 0;
    }
    else {
      this.service.startIndex = ((this.service.page - 1) * this.service.pageSize) + 1;
    }
    this.service.endIndex = Number((this.service.page - 1) * this.service.pageSize + this.service.pageSize);
    if (this.service.endIndex > this.service.totalRecords) {
      this.service.endIndex = this.service.totalRecords;
    }
    
    // Emite o evento de mudança de página apenas se a página realmente mudou
    if (this.previousPage !== this.service.page) {
      this.previousPage = this.service.page;
      this.pageChange.emit(this.service.page);
    }
  }

  /**
   * Chamado quando o usuário muda o tamanho da página
   */
  onPageSizeChange(): void {
    // Volta para a primeira página ao mudar o pageSize
    this.service.page = 1;
    this.previousPage = 1;
    
    // Emite o evento de mudança de pageSize
    if (this.previousPageSize !== this.service.pageSize) {
      this.previousPageSize = this.service.pageSize;
      this.pageSizeChange.emit(this.service.pageSize);
    }
    
    // Recalcula a paginação
    this.paginate();
  }


  /**
   * Search Method
  */
  searchData(): void {
    this.search.emit(this.service.searchTerm);

  }


  /**
   * sorts column
   * @param param0 column name,sort direction
   */
  onSort({ column, direction }: SortEvent): void {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;

    this.sort.emit({ column, direction });
  }

  /**
   *  calls formatter function for table cells
   * @param column column name
   * @param data data of column
   */
  callFormatter(column: Column, data: any): any {
    return (column.formatter(data));
  }

  /**
   * @returns intermediate status of selectAll checkbox
   */
  checkIntermediate(): boolean {
    let selectedRowCount = this.isSelected.filter(x => x === true).length;
    if (!this.selectAll && selectedRowCount > 0 && selectedRowCount < this.tableData.length) {
      return true;
    }
    else {
      return false;
    }
  }

  /**
   * select all row
   * @param event event
   */
  selectAllRow(event: any): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      for (let i = 0; i < this.tableData.length; i++) {
        this.isSelected[i] = true;
      }
    }
    else {
      for (let i = 0; i < this.tableData.length; i++) {
        this.isSelected[i] = false;
      }
    }
  }

  /**
  * Captura a linha selecionada e emite o evento para o componente pai
  * @param record Objeto da linha selecionada
  */
  selectRow(record: any, index: number): void {
    const isAlreadySelected = this.isSelected[index];
  
    if (this.singleRowSelection) {
      // Se já estiver selecionado, desmarca
      if (isAlreadySelected) {
        this.isSelected = this.tableData.map(() => false);
      } else {
        this.isSelected = this.tableData.map((_, i) => i === index);
      }
    } else {
      this.isSelected[index] = !this.isSelected[index];
      this.selectAll = this.isSelected.every(x => x === true);
    }
  
    this.rowSelected.emit(isAlreadySelected ? null : record);
  }

}