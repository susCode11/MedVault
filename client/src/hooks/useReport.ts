import { useMutation } from '@tanstack/react-query';
// TODO (Workstream 3): Import canister instance from '../lib/canister'

export const useReportAbuse = () => {
  // TODO (Workstream 3): BLANK SPACE - Implement report abuse mutation
  return useMutation({
    mutationFn: async (data: any) => {
      // return await canister.reportAbuse(data);
    }
  });
};
