import { Component, input, output } from '@angular/core';
import { Card } from 'primeng/card';
import { ProgressBar } from 'primeng/progressbar';
import { ButtonDirective } from 'primeng/button';
import { DashboardCreditsVm } from '@features/dashboard/models/dashboard.model';

@Component({
  selector: 'app-ai-credit-card',
  imports: [Card, ProgressBar, ButtonDirective],
  templateUrl: './ai-credit-card.html',
  styleUrl: './ai-credit-card.css',
})
export class AiCreditCard {
  readonly credits = input.required<DashboardCreditsVm>();

  readonly openCredits = output<void>();
}
