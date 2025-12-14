import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

export interface FilterOption {
  id: string;
  label: string;
  type: 'text' | 'checkbox' | 'range' | 'select';
  value?: any;
  options?: { value: any; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface FilterConfig {
  title: string;
  searchPlaceholder?: string;
  options: FilterOption[];
  showSearch?: boolean;
  showRange?: boolean;
}

@Component({
  selector: 'app-advanced-filter',
  templateUrl: './advanced-filter.component.html',
  styleUrls: ['./advanced-filter.component.scss']
})
export class AdvancedFilterComponent implements OnInit {
  @Input() config: FilterConfig = {
    title: 'Filtro Avançado',
    searchPlaceholder: 'Digite para pesquisar',
    options: [],
    showSearch: true,
    showRange: false
  };

  @Input() isVisible: boolean = false;
  @Output() isVisibleChange = new EventEmitter<boolean>();
  @Output() filterApplied = new EventEmitter<any>();
  @Output() filterCleared = new EventEmitter<void>();

  filterForm: FormGroup = this.fb.group({});

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(): void {
    if (this.config && this.config.options) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    const formControls: any = {};

    if (this.config.showSearch) {
      formControls.search = [''];
    }

    this.config.options.forEach(option => {
      switch (option.type) {
        case 'checkbox':
          formControls[option.id] = [false];
          break;
        case 'range':
          formControls[option.id] = [option.min || 0];
          formControls[`${option.id}_max`] = [option.max || 100];
          break;
        case 'select':
          formControls[option.id] = [option.value || ''];
          break;
        default:
          formControls[option.id] = [option.value || ''];
      }
    });

    this.filterForm = this.fb.group(formControls);
  }

  toggleFilter(): void {
    this.isVisible = !this.isVisible;
    this.isVisibleChange.emit(this.isVisible);
  }

  closeFilter(): void {
    this.isVisible = false;
    this.isVisibleChange.emit(this.isVisible);
  }

  applyFilter(): void {
    const filterData = this.filterForm.value;
    this.filterApplied.emit(filterData);
    this.closeFilter();
  }

  clearFilter(): void {
    this.filterForm.reset();
    this.initializeForm();
    this.filterCleared.emit();
  }

  getCheckboxOptions(): FilterOption[] {
    return this.config.options.filter(option => option.type === 'checkbox');
  }

  getRangeOptions(): FilterOption[] {
    return this.config.options.filter(option => option.type === 'range');
  }

  getTextOptions(): FilterOption[] {
    return this.config.options.filter(option => option.type === 'text');
  }

  getSelectOptions(): FilterOption[] {
    return this.config.options.filter(option => option.type === 'select');
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeFilter();
    }
  }
}
