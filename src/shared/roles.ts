export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER'
}

export const USER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.MODERATOR,
  UserRole.USER
] as const;

export interface RolePermissions {
  canAccessPredictionTool: boolean;
  canManageUsers: boolean;
  canManageModerators: boolean;
  canViewReports: boolean;
  canEarnReferralCommission: boolean;
  canManagePlans: boolean;
  canAccessAdminPanel: boolean;
}

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  [UserRole.SUPER_ADMIN]: {
    canAccessPredictionTool: true,
    canManageUsers: true,
    canManageModerators: true,
    canViewReports: true,
    canEarnReferralCommission: false,
    canManagePlans: true,
    canAccessAdminPanel: true
  },
  [UserRole.MODERATOR]: {
    canAccessPredictionTool: true,
    canManageUsers: false,
    canManageModerators: false,
    canViewReports: false,
    canEarnReferralCommission: true,
    canManagePlans: false,
    canAccessAdminPanel: false
  },
  [UserRole.USER]: {
    canAccessPredictionTool: false, // Requires active subscription
    canManageUsers: false,
    canManageModerators: false,
    canViewReports: false,
    canEarnReferralCommission: false,
    canManagePlans: false,
    canAccessAdminPanel: false
  }
};
