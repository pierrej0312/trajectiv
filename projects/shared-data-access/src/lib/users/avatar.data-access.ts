import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MeAvatarApiDto, MeAvatarControllerService } from '@shared-api-client';

@Injectable({
  providedIn: 'root',
})
export class AvatarDataAccess {
  private readonly avatarApi = inject(MeAvatarControllerService);

  uploadAvatar(file: File): Observable<MeAvatarApiDto> {
    return this.avatarApi.uploadAvatar(file, 'body', false, {
      transferCache: false,
    });
  }

  deleteAvatar(): Observable<MeAvatarApiDto> {
    return this.avatarApi.deleteAvatar('body', false, {
      transferCache: false,
    });
  }
}
