import { useCallback, useState } from 'react';

export function useSidebarDrawer() {
  const [visible, setVisible] = useState(false);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  return { visible, open, close } as const;
}
