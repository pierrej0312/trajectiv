import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CardDesignTokens } from '@primeuix/themes/types/card';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // private $theme: ThemeService = inject(ThemeService);
  //
  // ngOnInit() {
  //   this.$theme.toggleTheme();
  // }

  cardDT: CardDesignTokens = {
    body: {
      padding: '10rem',
    },
  };
  private readonly router = inject(Router);

  readonly isAuthBridgePage = computed(() => {
    const url = this.router.url;
    return url.startsWith('/sign-in') || url.startsWith('/sign-up');
  });
}
