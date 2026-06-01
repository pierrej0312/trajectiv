import { Component, input } from '@angular/core';

@Component({
  selector: 'kc-feature-highlight',
  imports: [],
  templateUrl: './feature-highlight.component.html',
  styleUrl: './feature-highlight.component.css',
})
export class FeatureHighlightComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
