import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetachedLayoutComponent } from './layout.component';

describe('DetachedLayoutComponent', () => {
  let component: DetachedLayoutComponent;
  let fixture: ComponentFixture<DetachedLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetachedLayoutComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetachedLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
