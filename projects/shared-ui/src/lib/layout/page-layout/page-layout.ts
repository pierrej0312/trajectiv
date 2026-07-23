import { Component, input } from '@angular/core';

@Component({
  selector: 'lib-page-layout',
  imports: [],
  templateUrl: './page-layout.html',
  styleUrl: './page-layout.css',
  host: {
    class: 'tr-page-layout',
    '[class.tr-page-layout--wide]': 'width() === "wide"',
    '[class.tr-page-layout--fluid]': 'width() === "fluid"',
    '[class.tr-page-layout--compact]': 'density() === "compact"',
  },
})
export class PageLayout {
  readonly width = input<'default' | 'wide' | 'fluid'>('default');

  readonly density = input<'comfortable' | 'compact'>('comfortable');
}
