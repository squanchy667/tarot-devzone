import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function useCards(source?: 'live' | 'drafts') {
  return useQuery({ queryKey: ['cards', source], queryFn: () => api.getCards(source) });
}

export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (card: any) => api.createCard(card),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cards'] }),
  });
}

export function useUpdateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, card }: { id: string; card: any }) => api.updateCard(id, card),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cards'] }),
  });
}

export function useDeleteCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCard(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cards'] }),
  });
}
