import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultLayout2Component } from './default-layout2.component';

describe('DefaultLayout2Component', () => {
  let component: DefaultLayout2Component;
  let fixture: ComponentFixture<DefaultLayout2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefaultLayout2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultLayout2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
