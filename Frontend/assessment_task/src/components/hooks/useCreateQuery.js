import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './api/apiClient';
import publicClient from './api/publicClient';
import { toast } from 'sonner';

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
      toast.success(successMessage);
      return data;
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });
};
