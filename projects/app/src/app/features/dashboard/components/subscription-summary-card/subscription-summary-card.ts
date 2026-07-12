import { Component, input, output } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { DashboardSubscriptionVm } from '@features/dashboard/models/dashboard.model';

@Component({
  selector: 'app-subscription-summary-card',
  imports: [Card, Tag, ButtonDirective],
  templateUrl: './subscription-summary-card.html',
  styleUrl: './subscription-summary-card.css',
})
export class SubscriptionSummaryCard {
  readonly subscription = input.required<DashboardSubscriptionVm>();

  readonly openBilling = output<void>();
}
