import { Component, inject } from '@angular/core';
import { DashboardStore } from '@features/dashboard/store/dashboard.store';
import { DashboardNavigationService } from '@features/dashboard/services/dashboard-navigation.service';
import { ProfileCompletionCard } from '@features/dashboard/components/profile-completion-card/profile-completion-card';
import { DashboardHero } from '@features/dashboard/components/dashboard-hero/dashboard-hero';
import {
  SubscriptionSummaryCard
} from '@features/dashboard/components/subscription-summary-card/subscription-summary-card';
import { AiCreditCard } from '@features/dashboard/components/ai-credit-card/ai-credit-card';

@Component({
  selector: 'app-dashboard-page',
  imports: [ProfileCompletionCard, DashboardHero, SubscriptionSummaryCard, AiCreditCard],
  providers: [DashboardStore, DashboardNavigationService],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  protected readonly dashboard = inject(DashboardStore);

  protected readonly navigation = inject(DashboardNavigationService);
}
