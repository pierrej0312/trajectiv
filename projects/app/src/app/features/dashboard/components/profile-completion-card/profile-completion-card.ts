import { Component, input, output } from '@angular/core';
import { DashboardProfileCompletionVm } from '@features/dashboard/models/dashboard.model';
import { Skeleton } from 'primeng/skeleton';
import { Card } from 'primeng/card';
import { ButtonDirective } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'app-profile-completion-card',
  imports: [Card, ButtonDirective, ProgressBar, Skeleton],
  templateUrl: './profile-completion-card.html',
  styleUrl: './profile-completion-card.css',
})
export class ProfileCompletionCard {
  readonly completion = input.required<DashboardProfileCompletionVm>();

  readonly loading = input(false);
  readonly error = input(false);

  readonly openProfile = output<void>();
  readonly retry = output<void>();
}
