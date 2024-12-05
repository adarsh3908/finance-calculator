import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSplitModalComponent } from './add-split-modal.component';

describe('AddSplitModalComponent', () => {
  let component: AddSplitModalComponent;
  let fixture: ComponentFixture<AddSplitModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSplitModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSplitModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
