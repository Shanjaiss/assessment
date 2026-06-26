import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './api/apiClient';
import publicClient from './api/publicClient';
import { showToast } from '../toast/toast';

export const useCreateQuery = ({
  url,
  queryKey,
  successMessage = 'Created successfully',
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const isPublicRoute =
        url.startsWith('/auth/register') || url.startsWith('/auth/login');

      const client = isPublicRoute ? publicClient : apiClient;

      const { data } = await client.post(url, payload);
      return data;
    },

    onSuccess: (data) => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }

      showToast('success', successMessage);
      return data;
    },

    onError: (error) => {
      showToast(
        'error',
        error?.response?.data?.message || 'Something went wrong'
      );
    },
  });
};
