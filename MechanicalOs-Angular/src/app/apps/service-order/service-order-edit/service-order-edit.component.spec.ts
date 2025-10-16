import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceOrderEditComponent } from './service-order-edit.component';

describe('ServiceOrderEditComponent', () => {
  let component: ServiceOrderEditComponent;
  let fixture: ComponentFixture<ServiceOrderEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceOrderEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceOrderEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
