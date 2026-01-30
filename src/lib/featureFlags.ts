import { Profile } from './user';

export function featureFlagsFor(profile?: Profile | null) {
  return {
    admin: Boolean(profile && profile.role === 'admin')
  };
}
