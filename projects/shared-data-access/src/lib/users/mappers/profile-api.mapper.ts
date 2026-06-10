import { UpdatedMeProfileResponseApiDto, UpdateMeProfileRequestApiDto } from '@shared-api-client';

import { MeOnboarding, UserProfile } from '@shared-domain';

import { mapMeOnboardingApiDtoToModel, mapMeProfileApiDtoToModel } from './me-api.mapper';

export interface UpdatedUserProfile {
  profile: UserProfile;
  onboarding: MeOnboarding;
}

export interface UpdateUserProfilePayload {
  careerGoal?: string | null;
  targetRole?: string | null;
  experienceLevel?: string | null;
  preferredLanguage?: string | null;
}

export function mapUpdateUserProfilePayloadToApiDto(
  payload: UpdateUserProfilePayload,
): UpdateMeProfileRequestApiDto {
  return {
    careerGoal: payload.careerGoal as UpdateMeProfileRequestApiDto['careerGoal'],
    targetRole: normalizeOptionalString(payload.targetRole),
    experienceLevel: payload.experienceLevel as UpdateMeProfileRequestApiDto['experienceLevel'],
    preferredLanguage: normalizeOptionalString(payload.preferredLanguage),
  };
}

export function mapUpdatedMeProfileApiDtoToModel(
  dto: UpdatedMeProfileResponseApiDto,
): UpdatedUserProfile {
  return {
    profile: mapMeProfileApiDtoToModel(dto.profile),
    onboarding: mapMeOnboardingApiDtoToModel(dto.onboarding),
  };
}

function normalizeOptionalString(value: string | null | undefined): string | undefined {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : undefined;
}
