import { CareerGoalCode } from '../catalogs/career-goal.catalog';
import { ExperienceLevelCode } from '../catalogs/experience-level.catalog';

export interface UserProfile {
  careerGoal: CareerGoalCode | null;
  targetRole: string | null;
  experienceLevel: ExperienceLevelCode | null;
  preferredLanguage: string;
}
