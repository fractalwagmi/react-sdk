import { User } from 'types/user';

export const TEST_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
export const TEST_USER_ID = 'test-user-id';
export const TEST_USER_EMAIL = 'test-user@email.com';
export const TEST_USERNAME = 'test-username';

export const TEST_FRACTAL_USER: User = {
  email: TEST_USER_EMAIL,
  userId: TEST_USER_ID,
  username: TEST_USERNAME,
};
