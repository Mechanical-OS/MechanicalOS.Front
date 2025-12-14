import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsCard4Component } from './statistics-card4.component';

describe('StatisticsCard4Component', () => {
  let component: StatisticsCard4Component;
  let fixture: ComponentFixture<StatisticsCard4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatisticsCard4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticsCard4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
