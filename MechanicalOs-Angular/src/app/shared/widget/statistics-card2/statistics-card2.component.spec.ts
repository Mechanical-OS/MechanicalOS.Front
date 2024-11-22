import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsCard2Component } from './statistics-card2.component';

describe('StatisticsCard2Component', () => {
  let component: StatisticsCard2Component;
  let fixture: ComponentFixture<StatisticsCard2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatisticsCard2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticsCard2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
