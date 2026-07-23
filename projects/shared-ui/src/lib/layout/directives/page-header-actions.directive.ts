import { Directive } from '@angular/core';

@Directive({
  selector: '[pageHeaderActions]',
  host: {
    class: 'tr-page-header__projected-action',
  },
})
export class PageHeaderActionsDirective {
  constructor() {}
}
