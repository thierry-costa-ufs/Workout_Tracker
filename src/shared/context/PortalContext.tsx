import { createContext, useCallback, useContext, ReactNode, useState } from 'react';

interface PortalContextValue {
  register: (id: string, node: ReactNode) => void;
  unregister: (id: string) => void;
}

const PortalContext = createContext<PortalContextValue>({
  register: () => {},
  unregister: () => {},
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

  return (
    <PortalContext.Provider value={{ register, unregister }}>
      {children}
      {Array.from(portals.values())}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  return useContext(PortalContext);
}
