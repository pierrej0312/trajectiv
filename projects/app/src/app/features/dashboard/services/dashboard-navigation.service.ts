import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class DashboardNavigationService {
  private readonly router = inject(Router);

  openProfile(): void {
    void this.router.navigateByUrl('/app/profile');
  }

  openBilling(): void {
    void this.router.navigateByUrl('/app/billing');
  }

  openCredits(): void {
    void this.router.navigateByUrl('/app/billing');
  }
}
