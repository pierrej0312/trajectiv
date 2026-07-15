import { Component, input, output } from '@angular/core';
import { Card } from 'primeng/card';
import { ProgressBar } from 'primeng/progressbar';
import { Chip } from 'primeng/chip';

import { DashboardCreditsVm } from '@features/dashboard/models/dashboard.model';

@Component({
  selector: 'app-ai-credit-card',
  imports: [Card, ProgressBar, Chip],
  templateUrl: './ai-credit-card.html',
  styleUrl: './ai-credit-card.css',
})
export class AiCreditCard {
  readonly credits = input.required<DashboardCreditsVm>();

  readonly openCredits = output<void>();
}
