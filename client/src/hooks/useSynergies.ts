import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function useSynergies(source?: 'live' | 'drafts') {
  return useQuery({ queryKey: ['synergies', source], queryFn: () => api.getSynergies(source) });
}

export function useUpdateSynergy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tribe, synergy }: { tribe: string; synergy: any }) => api.updateSynergy(tribe, synergy),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['synergies'] }),
  });
}
