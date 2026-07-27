import { useEffect, useRef, ReactNode } from 'react';
import { usePortal } from '@/shared/context/PortalContext';

let nextId = 0;

export function Portal({ children }: { children: ReactNode }) {
  const { register, unregister } = usePortal();
  const id = useRef(`portal-${++nextId}`);

  useEffect(() => {
    const portalId = id.current;
    register(portalId, children);
    return () => unregister(portalId);
  }, [children, register, unregister]);

  return null;
}
