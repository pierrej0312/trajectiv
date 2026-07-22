import type { AppNavItem } from '../models/app-navigation.model';
import { APP_ACCESS_REQUIREMENTS } from '../../access/config/app-access-requirements.config';

export const APP_NAVIGATION = [
  {
    id: 'dashboard',
    label: 'Pilotage',
    icon: 'pi pi-chart-line',
    route: '/app/dashboard',
    workspaceHome: true,
    section: 'main',

    placements: ['sidebar', 'bottom-bar', 'drawer'],

    order: 10,
    mobileOrder: 10,

    ...APP_ACCESS_REQUIREMENTS.personalWorkspace,

    ariaLabel: 'Aller au pilotage',
  },

  {
    id: 'opportunities',
    label: 'Opportunités',
    icon: 'pi pi-bullseye',
    route: '/app/opportunities',
    section: 'main',

    placements: ['sidebar', 'bottom-bar', 'drawer'],

    order: 20,
    mobileOrder: 20,

    ...APP_ACCESS_REQUIREMENTS.personalWorkspace,

    ariaLabel: 'Voir les opportunités',

    children: [
      {
        id: 'opportunities-all',
        label: 'Toutes',
        icon: 'pi pi-list',
        route: '/app/opportunities',
        order: 10,

        ...APP_ACCESS_REQUIREMENTS.personalWorkspace,

        ariaLabel: 'Voir toutes les opportunités',
      },

      {
        id: 'opportunities-new',
        label: 'Nouvelle',
        icon: 'pi pi-plus',
        route: '/app/opportunities/new',
        order: 20,

        ...APP_ACCESS_REQUIREMENTS.personalWorkspace,

        ariaLabel: 'Créer une opportunité',
      },
    ],
  },

  {
    id: 'questions',
    label: 'Questions',
    icon: 'pi pi-comments',
    route: '/app/questions',
    section: 'main',

    placements: ['sidebar', 'bottom-bar', 'drawer'],

    order: 30,
    mobileOrder: 30,

    ...APP_ACCESS_REQUIREMENTS.personalWorkspace,

    ariaLabel: 'Voir les questions',

    children: [
      {
        id: 'questions-radar',
        label: 'Radar',
        icon: 'pi pi-compass',
        route: '/app/questions/radar',
        order: 10,
        ariaLabel: 'Ouvrir le radar',
      },
      {
        id: 'questions-training',
        label: 'Entraînement',
        icon: 'pi pi-microphone',
        route: '/app/questions/training',
        order: 20,
        ariaLabel: 'Démarrer un entraînement',
      },
    ],
  },

  {
    id: 'actions',
    label: 'Actions',
    icon: 'pi pi-sparkles',
    route: '/app/actions',
    section: 'main',

    placements: ['sidebar', 'drawer'],

    order: 40,

    ...APP_ACCESS_REQUIREMENTS.personalWorkspace,

    badgeKey: 'recommended-actions',

    ariaLabel: 'Voir les actions recommandées',
  },

  {
    id: 'opportunity-create',
    label: 'Ajouter opportunité',
    icon: 'pi pi-plus',
    route: '/app/opportunities/new',
    type: 'button',
    section: 'main',

    placements: ['sidebar', 'drawer'],

    order: 50,

    ...APP_ACCESS_REQUIREMENTS.personalWorkspace,

    ariaLabel: 'Créer une opportunité',
  },

  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'pi pi-bell',
    route: '/app/notifications',
    section: 'system',

    placements: ['sidebar', 'drawer', 'top-navigation'],

    order: 10,

    badgeKey: 'notifications',

    ariaLabel: 'Voir les notifications',
  },

  {
    id: 'profile',
    label: 'Profil',
    icon: 'pi pi-user',
    route: '/app/profile',
    section: 'system',

    placements: ['bottom-bar', 'drawer', 'profile-menu'],

    order: 20,
    mobileOrder: 50,

    ariaLabel: 'Ouvrir le profil',
  },

  {
    id: 'account',
    label: 'Compte',
    icon: 'pi pi-id-card',
    route: '/app/account',
    section: 'system',

    placements: ['drawer', 'profile-menu'],

    order: 30,

    ariaLabel: 'Ouvrir le compte',
  },

  {
    id: 'settings',
    label: 'Paramètres',
    icon: 'pi pi-cog',
    route: '/app/settings',
    section: 'system',

    placements: ['sidebar', 'drawer', 'profile-menu'],

    order: 40,

    ariaLabel: 'Ouvrir les paramètres',
  },
  {
    id: 'organization-dashboard',
    label: 'Organisation',
    icon: 'pi pi-building',
    route: '/app/organization',
    section: 'organization',

    placements: ['sidebar', 'bottom-bar', 'drawer'],

    order: 10,
    mobileOrder: 10,
    workspaceHome: true,

    ...APP_ACCESS_REQUIREMENTS.organizationWorkspace,

    ariaLabel: 'Ouvrir le pilotage de l’organisation',
  },
  {
    id: 'organization-members',
    label: 'Équipe',
    icon: 'pi pi-users',
    route: '/app/organization/team',
    section: 'organization',

    placements: ['sidebar', 'drawer'],

    order: 20,

    ...APP_ACCESS_REQUIREMENTS.memberRead,

    ariaLabel: 'Gérer les membres de l’organisation',
  },
] as const satisfies readonly AppNavItem[];
