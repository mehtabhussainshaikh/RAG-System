export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const isRole = (value: string): value is Role =>
  Object.values(Role).some((role) => role === value);
