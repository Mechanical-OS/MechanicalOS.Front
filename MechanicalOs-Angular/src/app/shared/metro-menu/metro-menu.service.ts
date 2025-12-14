import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MetroButton } from './metro-menu.component';

@Injectable({
  providedIn: 'root'
})
export class MetroMenuService {
  private buttonsSubject = new BehaviorSubject<MetroButton[]>([]);
  buttons$ = this.buttonsSubject.asObservable();

  setButtons(buttons: MetroButton[]) {
    this.buttonsSubject.next(buttons);
  }

  enableButton(id: string): void {
    const updated = this.buttonsSubject.getValue().map(btn =>
      btn.id === id ? { ...btn, enabled: true } : btn
    );
    this.buttonsSubject.next(updated);
  }

  disableButton(id: string): void {
    const updated = this.buttonsSubject.getValue().map(btn =>
      btn.id === id ? { ...btn, enabled: false } : btn
    );
    this.buttonsSubject.next(updated);
  }
}
