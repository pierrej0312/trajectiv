import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ProfileControllerService, UpdatedMeProfileResponseApiDto } from '@shared-api-client';

import {
  mapUpdatedMeProfileApiDtoToModel,
  mapUpdateUserProfilePayloadToApiDto,
  UpdatedUserProfile,
  UpdateUserProfilePayload,
} from './mappers/profile-api.mapper';

@Injectable({
  providedIn: 'root',
})
export class ProfileDataAccess {
  private readonly profileApi = inject(ProfileControllerService);

  updateProfile(payload: UpdateUserProfilePayload): Observable<UpdatedUserProfile> {
    return this.profileApi
      .updateProfile(mapUpdateUserProfilePayloadToApiDto(payload), 'body', false, {
        transferCache: false,
      })
      .pipe(map((dto: UpdatedMeProfileResponseApiDto) => mapUpdatedMeProfileApiDtoToModel(dto)));
  }
}
