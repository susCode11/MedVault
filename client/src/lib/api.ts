import { mockAuthApi, mockRecordApi, mockAccessApi } from './mockApi';

// A simple abstraction to route calls to either real HTTP (Workstream 1) or mockApi
// Currently forced to true as requested to run standalone.
const USE_MOCKS = true; // import.meta.env.VITE_USE_MOCKS === 'true';

// TODO (Workstream 1): Implement real HTTP fetching logic here using fetch() and attaching the JWT.
export const api = {
  auth: USE_MOCKS ? mockAuthApi : mockAuthApi, 
  records: USE_MOCKS ? mockRecordApi : mockRecordApi,
  access: USE_MOCKS ? mockAccessApi : mockAccessApi,
};
