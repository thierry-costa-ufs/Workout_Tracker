import { useTemplates } from '@/context/WorkoutContext';
import { useMemo } from 'react';

export function useActiveTemplate() {
  const { templates, activeId } = useTemplates();
  return useMemo(() => templates.find((t) => t.id === activeId) ?? null, [templates, activeId]);
}
