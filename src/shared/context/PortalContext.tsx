import { createContext, useCallback, useContext, useMemo, ReactNode, useState } from 'react';

interface PortalContextValue {
  register: (id: string, node: ReactNode) => void;
  unregister: (id: string) => void;
  update: (id: string, node: ReactNode) => void;
}

const PortalContext = createContext<PortalContextValue>({
  register: () => {},
  unregister: () => {},
  update: () => {},
});

export function ModalPortalProvider({ children }: { children: ReactNode }) {
  const [portals, setPortals] = useState<Map<string, ReactNode>>(new Map());

  const register = useCallback((id: string, node: ReactNode) => {
    setPortals((prev) => new Map(prev).set(id, node));
  }, []);

  const unregister = useCallback((id: string) => {
    setPortals((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const update = useCallback((id: string, node: ReactNode) => {
    setPortals((prev) => {
      const next = new Map(prev);
      next.set(id, node);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ register, unregister, update }), [register, unregister, update]);

  return (
    <PortalContext.Provider value={value}>
      {children}
      {Array.from(portals.values())}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  return useContext(PortalContext);
}
