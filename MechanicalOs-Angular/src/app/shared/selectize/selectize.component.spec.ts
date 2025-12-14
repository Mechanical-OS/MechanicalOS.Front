import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectizeComponent } from './selectize.component';

describe('SelectizeComponent', () => {
  let component: SelectizeComponent;
  let fixture: ComponentFixture<SelectizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
