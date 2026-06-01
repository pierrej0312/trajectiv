import { Component, input } from '@angular/core';
import { FeatureHighlightComponent } from '../feature-highlight/feature-highlight.component';
import { TrajectivLogoComponent } from '../trajectiv-logo/trajectiv-logo.component';

type AuthHeroFeature = {
  icon: string;
  title: string;
  description: string;
};

@Component({
  selector: 'kc-auth-hero',
  imports: [TrajectivLogoComponent, FeatureHighlightComponent],
  templateUrl: './auth-hero.component.html',
  styleUrl: './auth-hero.component.css',
})
export class AuthHeroComponent {
  readonly eyebrow = input('Start your trajectory');
  readonly title = input('Construis ta stratégie. Pas juste une liste de candidatures.');
  readonly description = input(
    'Configure ton objectif, identifie les entreprises pertinentes et démarre une recherche plus claire dès le premier jour.',
  );

  readonly logoSize = input('14rem');

  readonly features = input<AuthHeroFeature[]>([
    {
      icon: 'pi pi-bullseye',
      title: 'Objectif clair',
      description: 'Transforme ta recherche en trajectoire structurée.',
    },
    {
      icon: 'pi pi-briefcase',
      title: 'Opportunités suivies',
      description: 'Centralise candidatures, relances et entretiens.',
    },
    {
      icon: 'pi pi-sparkles',
      title: 'Préparation guidée',
      description: 'Prépare chaque étape avec une vision plus stratégique.',
    },
  ]);
}
