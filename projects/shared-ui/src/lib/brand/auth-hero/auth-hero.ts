import { Component, input } from '@angular/core';
import { FeatureHighlight, TrajectivLogo } from '@shared-ui';
import { AuthHeroFeature } from '@features/auth/models/auth-hero.model';

@Component({
  selector: 'lib-auth-hero',
  imports: [TrajectivLogo, FeatureHighlight],
  templateUrl: './auth-hero.html',
  styleUrl: './auth-hero.css',
})
export class AuthHero {
  readonly logoSize = input<string>('360px');

  readonly eyebrow = input<string>('Job search cockpit');

  readonly title = input<string>('Structure ta recherche. Cible mieux. Avance avec méthode.');

  readonly description = input<string>(
    'Trajectiv t’aide à structurer tes candidatures, cibler les bonnes entreprises et transformer chaque opportunité en plan d’action clair.',
  );

  readonly features = input<readonly AuthHeroFeature[]>([
    {
      icon: 'pi pi-sitemap',
      title: 'Candidatures pilotées',
      description:
        'Visualise ton pipeline, tes relances et tes prochaines actions sans perdre le fil.',
    },
    {
      icon: 'pi pi-compass',
      title: 'Ciblage stratégique',
      description: 'Priorise les entreprises où ton profil a le plus de chances de convaincre.',
    },
    {
      icon: 'pi pi-bolt',
      title: 'Préparation augmentée',
      description:
        'Transforme chaque offre en plan d’action : CV, pitch, entretien, questions et révisions.',
    },
  ]);
}
