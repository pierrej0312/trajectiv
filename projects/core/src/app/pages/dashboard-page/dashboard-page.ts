import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-dashboard-page',
  imports: [ButtonDirective],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private $router = inject(Router);
  private $keycloak = inject(KeycloakStore);

  protected logout($event: any) {
    $event.preventDefault();
    this.$keycloak.logout();
  }
}
