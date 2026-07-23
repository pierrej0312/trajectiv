import { Directive, input } from '@angular/core';
import { PageGridDensity } from '../models/page-grid.model';

@Directive({
  selector: '[libPageGrid]',
  host: {
    class: 'tr-page-grid',

    '[class.tr-page-grid--compact]': 'density() === "compact"',

    '[style.--tr-page-grid-min-row]': 'minRowHeight()',
  },
})
export class PageGridDirective {
  readonly density = input<PageGridDensity>('comfortable', {
    alias: 'libPageGridDensity',
  });

  readonly minRowHeight = input<string>('auto', {
    alias: 'libPageGridMinRowHeight',
  });
}
