import { createContext, useContext } from 'react';

const TabNavigationContext = createContext<(index: number) => void>(() => {});

export const TabNavigationProvider = TabNavigationContext.Provider;

export function useSwitchTab() {
  return useContext(TabNavigationContext);
}
