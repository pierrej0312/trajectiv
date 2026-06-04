import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TrajectivLogoTone, TrajectivLogoVariant } from './trajectiv-logo.model';

let trajectivLogoId = 0;

@Component({
  selector: 'lib-trajectiv-logo',
  imports: [],
  templateUrl: './trajectiv-logo.html',
  styleUrl: './trajectiv-logo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.tr-logo--mark]': 'variant() === "mark"',
    '[class.tr-logo--horizontal]': 'variant() === "horizontal"',
    '[class.tr-logo--auto]': 'tone() === "auto"',
    '[class.tr-logo--light]': 'tone() === "light"',
    '[class.tr-logo--dark]': 'tone() === "dark"',
    '[class.tr-logo--mono]': 'tone() === "mono"',
    '[style.--tr-logo-size]': 'size()',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class TrajectivLogo {
  private readonly instanceId = ++trajectivLogoId;

  readonly variant = input<TrajectivLogoVariant>('horizontal');
  readonly tone = input<TrajectivLogoTone>('auto');
  readonly size = input<string>('10rem');
  readonly ariaLabel = input<string>('Trajectiv');

  readonly gradientId = computed(() => `tr-logo-active-gradient-${this.instanceId}`);
  readonly gradientUrl = computed(() => `url(#${this.gradientId()})`);

  readonly isMark = computed(() => this.variant() === 'mark');
  readonly isHorizontal = computed(() => this.variant() === 'horizontal');
}
