import type { RuntimeMode } from '@helm/client';

export interface ComposerAccessMenuProps {
  mode: RuntimeMode;
  onApply: (mode: RuntimeMode) => void;
}
