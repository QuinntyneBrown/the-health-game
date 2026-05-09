import type { NavigationBarItem } from 'components';

export interface AppNavigationItem extends NavigationBarItem {
  readonly route: string;
}

export const NAV_ITEMS: readonly AppNavigationItem[] = [
  { id: 'home', label: 'Home', icon: 'home', route: '/' },
  { id: 'goals', label: 'Goals', icon: 'flag', route: '/goals' },
  { id: 'rewards', label: 'Rewards', icon: 'workspace_premium', route: '/rewards' },
  { id: 'profile', label: 'Profile', icon: 'person', route: '/profile' },
];
