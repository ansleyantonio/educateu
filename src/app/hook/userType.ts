export type IUser = {
  userId: string;
  firstName: string;
  lastName?: string;
  email: string;
  mobile: string;
  username: string;
  address?: string;
  roleId: string;

  accessToken: string;
  refreshToken?: string;
};
