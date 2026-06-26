import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './api/clients';
import { showToast } from '../toast/toast';

export const useEditQuery = ({
  url,
  queryKey,
  successMessage = 'Updated successfully',
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await apiClient.put(`${url}/${id}`, payload);
      return data;
    },

    onSuccess: () => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }

      showToast('success', successMessage);
    },

    onError: (error) => {
      showToast('error', error?.response?.data?.message || 'Update failed');
    },
  });
};
