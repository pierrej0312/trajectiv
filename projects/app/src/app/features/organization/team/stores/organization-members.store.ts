import { computed, inject } from '@angular/core';

import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import { rxMethod } from '@ngrx/signals/rxjs-interop';

import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  map,
  mergeMap,
  Observable,
  of,
  pipe,
  switchMap,
  tap,
} from 'rxjs';

import {
  MeWorkspaceApiDto,
  OrganizationMemberControllerService,
  OrganizationMemberResponseApiDto,
  UpdateOrganizationMemberRoleRequestApiDto,
} from '@shared-api-client';

import { WorkspaceStore } from '@shared/workspace/stores/workspace.store';

export type OrganizationMembersStatus = 'idle' | 'loading' | 'ready' | 'error';

export type OrganizationMemberMutation =
  | {
      readonly type: 'change-role';
      readonly memberId: string;
      readonly role: UpdateOrganizationMemberRoleRequestApiDto.RoleEnum;
    }
  | {
      readonly type: 'suspend';
      readonly memberId: string;
    }
  | {
      readonly type: 'reactivate';
      readonly memberId: string;
    }
  | {
      readonly type: 'remove';
      readonly memberId: string;
    };

type OrganizationMembersState = {
  readonly organizationId: string | null;

  readonly members: OrganizationMemberResponseApiDto[];

  readonly status: OrganizationMembersStatus;
  readonly error: unknown | null;

  readonly mutatingMemberIds: readonly string[];

  readonly mutationError: unknown | null;

  readonly statusFilter: OrganizationMemberResponseApiDto.StatusEnum | null;
};

const initialState: OrganizationMembersState = {
  organizationId: null,

  members: [],

  status: 'idle',
  error: null,

  mutatingMemberIds: [],
  mutationError: null,

  statusFilter: null,
};

export const OrganizationMembersStore = signalStore(
  withState(initialState),

  withComputed((store, workspaceStore = inject(WorkspaceStore)) => ({
    isIdle: computed(() => store.status() === 'idle'),

    isLoading: computed(() => store.status() === 'loading'),

    isReady: computed(() => store.status() === 'ready'),

    hasError: computed(() => store.status() === 'error'),

    isEmpty: computed(() => store.status() === 'ready' && store.members().length === 0),

    activeMembers: computed(() =>
      store
        .members()
        .filter((member) => member.status === OrganizationMemberResponseApiDto.StatusEnum.Active),
    ),

    suspendedMembers: computed(() =>
      store
        .members()
        .filter(
          (member) => member.status === OrganizationMemberResponseApiDto.StatusEnum.Suspended,
        ),
    ),

    memberCount: computed(() => store.members().length),

    activeMemberCount: computed(
      () =>
        store
          .members()
          .filter((member) => member.status === OrganizationMemberResponseApiDto.StatusEnum.Active)
          .length,
    ),

    filteredMembers: computed(() => {
      const statusFilter = store.statusFilter();

      if (!statusFilter) {
        return store.members();
      }

      return store.members().filter((member) => member.status === statusFilter);
    }),

    hasActiveFilters: computed(() => store.statusFilter() !== null),

    suspendedMemberCount: computed(
      () =>
        store
          .members()
          .filter(
            (member) => member.status === OrganizationMemberResponseApiDto.StatusEnum.Suspended,
          ).length,
    ),

    canReadMembers: computed(() =>
      workspaceStore.hasPermission(MeWorkspaceApiDto.PermissionsEnum.MemberRead),
    ),

    canInviteMembers: computed(() =>
      workspaceStore.hasPermission(MeWorkspaceApiDto.PermissionsEnum.MemberInvite),
    ),

    canUpdateMemberRole: computed(() =>
      workspaceStore.hasPermission(MeWorkspaceApiDto.PermissionsEnum.MemberUpdateRole),
    ),

    canUpdateMemberStatus: computed(() =>
      workspaceStore.hasPermission(MeWorkspaceApiDto.PermissionsEnum.MemberUpdateStatus),
    ),

    canRemoveMember: computed(() =>
      workspaceStore.hasPermission(MeWorkspaceApiDto.PermissionsEnum.MemberRemove),
    ),

    isMutating: computed(() => store.mutatingMemberIds().length > 0),
  })),

  withMethods((store, membersApi = inject(OrganizationMemberControllerService)) => {
    /**
     * Recharge automatiquement la collection chaque fois
     * que l'organisation active change.
     */
    const loadForOrganization = rxMethod<string | null>(
      pipe(
        distinctUntilChanged(),

        tap((organizationId) => {
          patchState(store, {
            organizationId,
            members: [],
            error: null,
            mutationError: null,

            status: organizationId ? 'loading' : 'idle',
          });
        }),

        switchMap((organizationId) => {
          if (!organizationId) {
            return EMPTY;
          }

          return membersApi
            .getMembers(organizationId, 'body', false, {
              httpHeaderAccept: 'application/json',

              transferCache: false,
            })
            .pipe(
              tap((members) => {
                patchState(store, {
                  members: sortMembers(members),

                  status: 'ready',
                  error: null,
                });
              }),

              catchError((error: unknown) => {
                patchState(store, {
                  members: [],
                  status: 'error',
                  error,
                });

                return EMPTY;
              }),
            );
        }),
      ),
    );

    /**
     * Recharge explicitement l'organisation actuellement
     * enregistrée dans ce store.
     */
    const reloadMembersInternal = rxMethod<void>(
      pipe(
        switchMap(() => {
          const organizationId = store.organizationId();

          if (!organizationId) {
            return EMPTY;
          }

          patchState(store, {
            status: 'loading',
            error: null,
          });

          return membersApi
            .getMembers(organizationId, 'body', false, {
              httpHeaderAccept: 'application/json',

              transferCache: false,
            })
            .pipe(
              tap((members) => {
                patchState(store, {
                  members: sortMembers(members),

                  status: 'ready',
                  error: null,
                });
              }),

              catchError((error: unknown) => {
                patchState(store, {
                  status: 'error',
                  error,
                });

                return EMPTY;
              }),
            );
        }),
      ),
    );

    /**
     * Une seule pipeline gère toutes les mutations membre.
     *
     * mergeMap permet à deux membres différents d'être
     * modifiés simultanément. L'UI bloque déjà une seconde
     * action sur le même membre via mutatingMemberIds.
     */
    const mutateMember = rxMethod<OrganizationMemberMutation>(
      pipe(
        filter((mutation) => !store.mutatingMemberIds().includes(mutation.memberId)),

        tap((mutation) => {
          patchState(store, {
            mutatingMemberIds: addUniqueValue(store.mutatingMemberIds(), mutation.memberId),

            mutationError: null,
          });
        }),

        mergeMap((mutation) => {
          const organizationId = store.organizationId();

          if (!organizationId) {
            removeMutatingMember(store, mutation.memberId);

            return EMPTY;
          }

          return executeMutation(membersApi, organizationId, mutation).pipe(
            tap((result) => {
              if (mutation.type === 'remove') {
                patchState(store, {
                  members: store.members().filter((member) => member.id !== mutation.memberId),
                });

                return;
              }

              if (result) {
                patchState(store, {
                  members: replaceMember(store.members(), result),
                });
              }
            }),

            catchError((error: unknown) => {
              patchState(store, {
                mutationError: error,
              });

              return EMPTY;
            }),

            finalize(() => {
              removeMutatingMember(store, mutation.memberId);
            }),
          );
        }),
      ),
    );

    return {
      loadForOrganization,

      reloadMembers(): void {
        reloadMembersInternal();
      },

      changeRole(memberId: string, role: UpdateOrganizationMemberRoleRequestApiDto.RoleEnum): void {
        const normalizedMemberId = memberId.trim();

        if (!normalizedMemberId) {
          return;
        }

        mutateMember({
          type: 'change-role',
          memberId: normalizedMemberId,
          role,
        });
      },

      suspendMember(memberId: string): void {
        const normalizedMemberId = memberId.trim();

        if (!normalizedMemberId) {
          return;
        }

        mutateMember({
          type: 'suspend',
          memberId: normalizedMemberId,
        });
      },

      reactivateMember(memberId: string): void {
        const normalizedMemberId = memberId.trim();

        if (!normalizedMemberId) {
          return;
        }

        mutateMember({
          type: 'reactivate',
          memberId: normalizedMemberId,
        });
      },

      clearFilters(): void {
        patchState(store, {
          statusFilter: null,
        });
      },

      setStatusFilter(statusFilter: OrganizationMemberResponseApiDto.StatusEnum | null): void {
        patchState(store, {
          statusFilter,
        });
      },

      removeMember(memberId: string): void {
        const normalizedMemberId = memberId.trim();

        if (!normalizedMemberId) {
          return;
        }

        mutateMember({
          type: 'remove',
          memberId: normalizedMemberId,
        });
      },

      isMemberMutating(memberId: string | null | undefined): boolean {
        return typeof memberId === 'string' && store.mutatingMemberIds().includes(memberId);
      },

      clearMutationError(): void {
        patchState(store, {
          mutationError: null,
        });
      },

      clear(): void {
        patchState(store, initialState);
      },
    };
  }),

  withHooks((store, workspaceStore = inject(WorkspaceStore)) => ({
    onInit(): void {
      store.loadForOrganization(workspaceStore.activeOrganizationId);
    },
  })),
);
function executeMutation(
  api: OrganizationMemberControllerService,
  organizationId: string,
  mutation: OrganizationMemberMutation,
): Observable<OrganizationMemberResponseApiDto | null> {
  switch (mutation.type) {
    case 'change-role':
      return api.changeRole(
        organizationId,
        mutation.memberId,
        {
          role: mutation.role,
        },
        'body',
        false,
        {
          httpHeaderAccept: 'application/json',
          transferCache: false,
        },
      );

    case 'suspend':
      return api.suspendMember(organizationId, mutation.memberId, 'body', false, {
        httpHeaderAccept: 'application/json',
        transferCache: false,
      });

    case 'reactivate':
      return api.reactivateMember(organizationId, mutation.memberId, 'body', false, {
        httpHeaderAccept: 'application/json',
        transferCache: false,
      });

    case 'remove':
      return api
        .removeMember(organizationId, mutation.memberId, 'body', false, {
          transferCache: false,
        })
        .pipe(map(() => null));
  }
}

function replaceMember(
  members: OrganizationMemberResponseApiDto[],
  updatedMember: OrganizationMemberResponseApiDto,
): OrganizationMemberResponseApiDto[] {
  if (!updatedMember.id) {
    return members;
  }

  return sortMembers(
    members.map((member) => (member.id === updatedMember.id ? updatedMember : member)),
  );
}

function sortMembers(
  members: OrganizationMemberResponseApiDto[],
): OrganizationMemberResponseApiDto[] {
  return [...members].sort((left, right) => {
    const statusDifference = getStatusOrder(left.status) - getStatusOrder(right.status);

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return getMemberDisplayName(left).localeCompare(getMemberDisplayName(right), 'fr', {
      sensitivity: 'base',
    });
  });
}

function getStatusOrder(status: OrganizationMemberResponseApiDto.StatusEnum | undefined): number {
  switch (status) {
    case OrganizationMemberResponseApiDto.StatusEnum.Active:
      return 0;

    case OrganizationMemberResponseApiDto.StatusEnum.Suspended:
      return 1;

    default:
      return 2;
  }
}

function getMemberDisplayName(member: OrganizationMemberResponseApiDto): string {
  const explicitDisplayName = member.displayName?.trim();

  if (explicitDisplayName) {
    return explicitDisplayName;
  }

  const fullName = [member.firstName, member.lastName]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
    .trim();

  return fullName || member.email?.trim() || 'Membre';
}

function addUniqueValue(values: readonly string[], value: string): readonly string[] {
  return values.includes(value) ? values : [...values, value];
}

function removeMutatingMember(
  store: {
    readonly mutatingMemberIds: () => readonly string[];
  } & Parameters<typeof patchState>[0],
  memberId: string,
): void {
  patchState(store, {
    mutatingMemberIds: store
      .mutatingMemberIds()
      .filter((currentMemberId) => currentMemberId !== memberId),
  });
}
