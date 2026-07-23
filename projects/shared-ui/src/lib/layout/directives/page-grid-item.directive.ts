import { Directive, input } from '@angular/core';
import { PageGridItemHeight, PageGridItemSize } from '../models/page-grid.model';

@Directive({
  selector: '[libPageGridItem]',
  host: {
    class: 'tr-page-grid-item',

    '[class.tr-page-grid-item--full]': 'size() === "full"',

    '[class.tr-page-grid-item--primary]': 'size() === "primary"',

    '[class.tr-page-grid-item--secondary]': 'size() === "secondary"',

    '[class.tr-page-grid-item--half]': 'size() === "half"',

    '[class.tr-page-grid-item--third]': 'size() === "third"',

    '[class.tr-page-grid-item--quarter]': 'size() === "quarter"',

    '[class.tr-page-grid-item--metric]': 'size() === "metric"',

    '[class.tr-page-grid-item--tall]': 'height() === "tall"',

    '[class.tr-page-grid-item--feature]': 'height() === "feature"',
  },
})
export class PageGridItemDirective {
  readonly size = input<PageGridItemSize>('full', {
    alias: 'libPageGridItem',
  });

  readonly height = input<PageGridItemHeight>('auto', {
    alias: 'libPageGridItemHeight',
  });
}
