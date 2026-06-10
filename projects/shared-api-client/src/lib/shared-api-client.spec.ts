import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedApiClient } from './shared-api-client';

describe('SharedApiClient', () => {
  let component: SharedApiClient;
  let fixture: ComponentFixture<SharedApiClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedApiClient],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedApiClient);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
