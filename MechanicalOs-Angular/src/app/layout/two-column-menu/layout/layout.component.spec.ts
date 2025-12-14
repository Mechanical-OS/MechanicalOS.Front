import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoColumnMenuLayoutComponent } from './layout.component';

describe('TwoColumnMenuLayoutComponent', () => {
  let component: TwoColumnMenuLayoutComponent;
  let fixture: ComponentFixture<TwoColumnMenuLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TwoColumnMenuLayoutComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoColumnMenuLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
