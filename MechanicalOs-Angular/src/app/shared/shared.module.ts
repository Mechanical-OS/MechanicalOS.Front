import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectizeComponent } from './selectize/selectize.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CpfPipe, RgPipe, PhonePipe, CepPipe, CnpjPipe, BrlCurrencyPipe  } from './directives/mask-pipes.directive';
import { CurrencyBrDirective } from './directives/currency-br.directive';


@NgModule({
  declarations: [
    SelectizeComponent,
    CpfPipe, 
    RgPipe, 
    PhonePipe, 
    CepPipe,
    CnpjPipe,
    BrlCurrencyPipe,
    CurrencyBrDirective
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    
  ],
  exports: [
    SelectizeComponent,
    CpfPipe, 
    RgPipe, 
    PhonePipe, 
    CepPipe,
    CnpjPipe,
    BrlCurrencyPipe,
    CurrencyBrDirective
  ]
})
export class SharedModule { }
