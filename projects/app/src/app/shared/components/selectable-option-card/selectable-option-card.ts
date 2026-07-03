import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type SelectableOptionCardMode = 'choice' | 'asset';
export type SelectableOptionCardSize = 'default' | 'large';

@Component({
  selector: 'app-selectable-option-card',
  imports: [],
  templateUrl: './selectable-option-card.html',
  styleUrl: './selectable-option-card.css',
})
export class SelectableOptionCard {
  readonly label = input.required<string>();
  readonly description = input<string | null>(null);

  readonly selected = input(false);
  readonly disabled = input(false);

  readonly icon = input<string | null>(null);
  readonly imageUrl = input<string | null>(null);

  readonly mode = input<SelectableOptionCardMode>('choice');
  readonly size = input<SelectableOptionCardSize>('default');
  readonly mobileCompact = input(false);

  readonly selectedChange = output<void>();
}
