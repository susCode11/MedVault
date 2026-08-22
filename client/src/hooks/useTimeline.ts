import { useQuery } from '@tanstack/react-query';
// TODO (Workstream 3): Import canister instance from '../lib/canister'

export const useTimeline = () => {
  // TODO (Workstream 3): BLANK SPACE - Implement fetch timeline query
  return useQuery({
    queryKey: ['timeline'],
    queryFn: async () => {
      return [];
    }
  });
};
