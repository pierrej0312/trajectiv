import { MeOnboardingApiDto } from '@shared-api-client';
import { MeOnboarding } from '@shared-domain';

import { mapMeOnboardingApiDtoToModel } from './me-api.mapper';

export function mapCompleteOnboardingApiDtoToModel(dto: MeOnboardingApiDto): MeOnboarding {
  return mapMeOnboardingApiDtoToModel(dto);
}
