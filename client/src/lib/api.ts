import { mockAuthApi, mockRecordApi, mockAccessApi } from './mockApi';

// TODO (Workstream 4): Replace these mock APIs with real canister calls using getBackendActor()
export const api = {
  auth: mockAuthApi, 
  records: mockRecordApi,
  access: mockAccessApi,
};
