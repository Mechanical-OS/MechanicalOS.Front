import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartStatisticsComponent } from './chart-statistics.component';

describe('ChartStatisticsComponent', () => {
  let component: ChartStatisticsComponent;
  let fixture: ComponentFixture<ChartStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartStatisticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
