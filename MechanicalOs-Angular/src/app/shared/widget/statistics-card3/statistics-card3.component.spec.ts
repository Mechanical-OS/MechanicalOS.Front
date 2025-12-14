import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsCard3Component } from './statistics-card3.component';

describe('StatisticsCard3Component', () => {
  let component: StatisticsCard3Component;
  let fixture: ComponentFixture<StatisticsCard3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatisticsCard3Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticsCard3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
