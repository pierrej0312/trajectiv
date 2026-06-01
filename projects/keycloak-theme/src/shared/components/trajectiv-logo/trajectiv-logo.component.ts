import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { TrajectivLogoTone, TrajectivLogoVariant } from './trajectiv-logo.model';

@Component({
  selector: 'kc-trajectiv-logo',
  imports: [],
  templateUrl: './trajectiv-logo.component.html',
  styleUrl: './trajectiv-logo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.tr-logo--mark]': 'variant() === "mark"',
    '[class.tr-logo--horizontal]': 'variant() === "horizontal"',
    '[class.tr-logo--mono]': 'tone() === "mono"',
    '[style.--tr-logo-size]': 'size()',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class TrajectivLogoComponent {
  readonly variant = input<TrajectivLogoVariant>('horizontal');
  readonly tone = input<TrajectivLogoTone>('auto');
  readonly size = input<string>('10rem');
  readonly ariaLabel = input<string>('Trajectiv');

  readonly isMark = computed(() => this.variant() === 'mark');
}
