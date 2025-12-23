import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetroMenuComponent } from './metro-menu/metro-menu.component';
import { SelectizeComponent } from './selectize/selectize.component';
import { ServiceSearchModule } from './service-search/service-search.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CpfPipe, RgPipe, PhonePipe, CepPipe, CnpjPipe, BrlCurrencyPipe  } from './directives/mask-pipes.directive'; 


@NgModule({
  declarations: [
    SelectizeComponent,
    CpfPipe, 
    RgPipe, 
    PhonePipe, 
    CepPipe,
    CnpjPipe,
    BrlCurrencyPipe 
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ServiceSearchModule
  ],
  exports: [
    SelectizeComponent,
    ServiceSearchModule,
    CpfPipe, 
    RgPipe, 
    PhonePipe, 
    CepPipe,
    CnpjPipe,
    BrlCurrencyPipe 
  ]
})
export class SharedModule { }
