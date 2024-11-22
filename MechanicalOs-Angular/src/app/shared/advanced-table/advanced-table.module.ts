import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbSortableHeaderDirective } from './sortable.directive';
import { AdvancedTableComponent } from './advanced-table.component';

@NgModule({
  declarations: [
    NgbSortableHeaderDirective,
    AdvancedTableComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
  ],
    exports: [AdvancedTableComponent, NgbSortableHeaderDirective]
})
export class AdvancedTableModule { }
