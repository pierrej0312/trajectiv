import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import { computed, effect, inject, linkedSignal, resource, Signal, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import {environment} from '@app/src/environments/environment';
import {httpResource} from '@angular/common/http';
import {withDevtools} from '@angular-architects/ngrx-toolkit';

const getManagerToken = async () => {
  return fetch(`${environment.keycloak.config.url}/realms/${environment.keycloak.config.realm}/protocol/openid-connect/token`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: `grant_type=client_credentials&client_id=${environment.keycloak.manager.client_id}&client_secret=${environment.keycloak.manager.secret}`
  })
}

const usersManagerResource = () => resource(
  {
    loader: async () => {
      const token = await getManagerToken()
      const { access_token } = await token.json()
      const users = await fetch(`${environment.keycloak.config.url}/admin/realms/${environment.keycloak.config.realm}/users`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        },
        method: 'GET'
      })
      return users.json()
    }
  }
)
const groupsManagerResource = () => resource(
  {
    loader: async () => {
      const token = await getManagerToken()
      const { access_token } = await token.json()
      const groups = await fetch(`${environment.keycloak.config.url}/admin/realms/${environment.keycloak.config.realm}/groups`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        },
        method: 'GET'
      })
      return groups.json()
    }
  }
)
const myGroupManagerResource = (user: Signal<any>) => {
  return resource(
    {
      params: () => user()?.id,
      loader: async ({ params: userId }) => {
        if (!userId) return undefined;
        const token = await getManagerToken()
        const { access_token } = await token.json()
        const groups = await fetch(`${environment.keycloak.config.url}/admin/realms/${environment.keycloak.config.realm}/users/${userId}/groups`, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          },
          method: 'GET'
        })

        return groups.json()
      }
    }
  );
}

const loginResource = (username: string, password: string) => {
  //https://login.memoco.eu/realms/{{keycloak.realm}}/protocol/openid-connect/token
  // Content-Type: application/x-www-form-urlencoded
  // Accept: application/json
  //
  // grant_type = password &
  // client_id = {{keycloak.client_id}} &
  // username = {{keycloak.username}} &
  // password = {{keycloak.password}}
  //
  // > {%
  //   const body = response.body;
  //   client.global.set("auth_token", body.access_token);
  // %}
  return httpResource(
    () => ({
      url: `${environment.keycloak.config.url}/realms/${environment.keycloak.config.realm}/protocol/openid-connect/token`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: `grant_type=password&client_id=${environment.keycloak.config.clientId}&username=${username}&password=${password}`
    })
  );
}

const adminBase = `${environment.keycloak.config.url}/admin/realms/${environment.keycloak.config.realm}`;
export const KeycloakStore = signalStore(
  { providedIn: 'root' },
  withDevtools('keycloak'),
  withState({
    user: null as any,
    tokenParsed: null as any,
    selectedGroupId: undefined as string | undefined,
  }),
  withMethods((state, $kc = inject(Keycloak)) => ({
    // 6. Auth Actions
    login: () => $kc.login(),
    loginLocal: (username: string, password: string) => {
      const loginRes = loginResource(username, password)
      setTimeout(() => {
        const res = loginRes.value()
        console.log('loginRes', res)

        // patchState(state, { user: ...res })
      }, 2000);
    },
    logout: () => $kc.logout(),
    register: () => $kc.register(),

    // Update state from Keycloak JS
    sync: async ()=> {
      if ($kc.authenticated) {
        const user = await $kc.loadUserProfile();
        patchState(state, {
          tokenParsed: $kc.tokenParsed,
          user: user
        });
      }
    },

    // 5. Select a group to trigger the membersResource
    viewGroupMembers: (groupId: string) => {
      patchState(state, { ['selectedGroupId']: groupId });
    },

    // 7. Role Check
    hasRole: (role: string) => {
      return $kc.hasRealmRole(role) || $kc.hasResourceRole(role);
    },

    getGroupAttribute: (attribute: string): any[] => {
      const token = state.tokenParsed();
      const groups = token?.groups;
      const filteredGroup = groups?.filter((group: any) => group.attributes && group.attributes[attribute])

      return filteredGroup?.map((group: any) => group.attributes[attribute] ?? [])
    },

    // 2. Get all users (Declarative)
    // const usersResource = httpResource<any[]>(() => `${adminBase}/users`);
    usersResource: () => usersManagerResource(),
    // 3. Get all groups
    groupsResource: () => groupsManagerResource(),
    // 4. Get Current User's Groups (Linked to token)
    myGroupsResource: () => myGroupManagerResource(state.user),

    // 5. Members inside a group (Reactive to selectedGroupId signal)
    getGroupMembers: (groups: Signal<any[]>) => {
      return resource({
        params: () => {
          const grps = groups();
          return grps && grps.length > 0 ? grps : null;
        },
        loader: async ({ params: groups }) => {
          if (!groups) return undefined

          const token = await getManagerToken()

          const { access_token } = await token.json()

          const promises = groups.map(async (group: any) => {
            const members = fetch(`${adminBase}/groups/${group.id}/members`, {
              headers: {
                'Authorization': `Bearer ${access_token}`
              },
              method: 'GET'
            })
            return members.then(res => res.json()).then(res => res.map((user: any) => ({...user, group})))
          })

          return Promise.all(promises).then(res => res.flat())
        },
      })
      // console.log('getGroupMembers', groups())
      // const ids = groups().map((group: any) => group.id)
      //
      // const promises = ids.map(async (id: string) => {
      //   const members = await fetch(`${adminBase}/groups/${id}/members`, {
      //     headers: {
      //       'Authorization': `Bearer ${$kc.token}`
      //     },
      //     method: 'GET'
      //   })
      //   return members.json() || undefined
      // })
      // return resource({
      //   loader: () => Promise.all(promises)
      // });


      // httpResource<any[]>(() => {
      //   console.log('getGroupMembers', group())
      //   const groupId = group().id;
      //   return groupId ? `${adminBase}/groups/${groupId}/members` : undefined;
      // })
    },
  }))
)
