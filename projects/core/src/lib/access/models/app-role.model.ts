export type PlatformRole = 'app_user' | 'app_admin';

export type OrganizationRole =
  | 'organization_owner'
  | 'organization_admin'
  | 'recruiter'
  | 'coach'
  | 'trainer'
  | 'learner';

export type AppRole = PlatformRole | OrganizationRole;
