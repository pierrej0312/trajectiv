import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'lib-feature-highlight',
  imports: [],
  templateUrl: './feature-highlight.html',
  styleUrl: './feature-highlight.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureHighlight {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
