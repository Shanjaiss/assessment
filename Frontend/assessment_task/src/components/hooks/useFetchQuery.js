import { useQuery } from '@tanstack/react-query';
import apiClient from './api/apiClient';

export const useFetchQuery = ({ url, queryKey }) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await apiClient.get(url);
      return data;
    },
  });
};
