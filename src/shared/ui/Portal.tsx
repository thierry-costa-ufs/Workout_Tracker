import { useEffect, useRef, ReactNode } from 'react';
import { usePortal } from '@/shared/context/PortalContext';

let nextId = 0;

export function Portal({ children }: { children: ReactNode }) {
  const { register, unregister, update } = usePortal();
  const id = useRef(`portal-${++nextId}`);

  useEffect(() => {
    const portalId = id.current;
    register(portalId, children);
    return () => unregister(portalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ponytail: initial children only, updates via second effect
  }, [register, unregister]);

  useEffect(() => {
    update(id.current, children);
  }, [children, update]);

  return null;
}
