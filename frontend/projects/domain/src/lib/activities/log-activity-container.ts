import type { NavigationBarVariant } from 'components';

export type LogActivityContainer = 'sheet' | 'dialog';

export function pickLogActivityContainer(variant: NavigationBarVariant): LogActivityContainer {
  return variant === 'bottom' ? 'sheet' : 'dialog';
}
