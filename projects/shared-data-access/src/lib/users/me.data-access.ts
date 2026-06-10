import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { MeControllerService, MeResponseApiDto } from '@shared-api-client';

import { Me } from '@shared-domain';

import { mapMeApiDtoToModel } from './mappers/me-api.mapper';

@Injectable({
  providedIn: 'root',
})
export class MeDataAccess {
  private readonly meApi = inject(MeControllerService);

  getMe(): Observable<Me> {
    return this.meApi
      .getMe('body', false, {
        transferCache: false,
      })
      .pipe(map((dto: MeResponseApiDto) => mapMeApiDtoToModel(dto)));
  }
}
