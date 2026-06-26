import { useQuery } from '@tanstack/react-query';
import apiClient from './api/apiClient';

export const useViewQuery = ({ url, queryKey = [], id }) => {
  return useQuery({
    queryKey: [...queryKey, id],
    enabled: !!id,

    queryFn: async () => {
      const { data } = await apiClient.get(`${url}/${id}`);
      return data;
    },
  });
};
