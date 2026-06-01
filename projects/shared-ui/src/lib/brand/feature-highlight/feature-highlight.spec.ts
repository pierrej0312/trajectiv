import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureHighlight } from './feature-highlight';

describe('FeatureHighlight', () => {
  let component: FeatureHighlight;
  let fixture: ComponentFixture<FeatureHighlight>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureHighlight],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureHighlight);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
