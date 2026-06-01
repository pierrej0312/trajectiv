import { Component, inject } from '@angular/core';
import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';

@Component({
  selector: 'app-sign-in-page',
  imports: [],
  templateUrl: './sign-in-page.html',
  styleUrl: './sign-in-page.css',
})
export class SignInPage {
  private readonly keycloakStore = inject(KeycloakStore);

  constructor() {
    this.keycloakStore.login();
  }
}
