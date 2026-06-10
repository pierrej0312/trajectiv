import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { MeOnboardingApiDto, OnboardingControllerService } from '@shared-api-client';

import { MeOnboarding } from '@shared-domain';

import { mapCompleteOnboardingApiDtoToModel } from './mappers/onboarding-api.mapper';

@Injectable({
  providedIn: 'root',
})
export class OnboardingDataAccess {
  private readonly onboardingApi = inject(OnboardingControllerService);

  completeOnboarding(): Observable<MeOnboarding> {
    return this.onboardingApi
      .completeOnboarding('body', false, {
        transferCache: false,
      })
      .pipe(map((dto: MeOnboardingApiDto) => mapCompleteOnboardingApiDtoToModel(dto)));
  }
}
