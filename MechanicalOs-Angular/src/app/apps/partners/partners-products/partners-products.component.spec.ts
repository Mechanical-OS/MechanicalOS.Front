import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnersProductsComponent } from './partners-products.component';

describe('PartnersProductsComponent', () => {
  let component: PartnersProductsComponent;
  let fixture: ComponentFixture<PartnersProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnersProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnersProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
