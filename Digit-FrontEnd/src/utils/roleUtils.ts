export type UserRole = 'admin' | 'user' | 'secondary_user';

export interface RolePermissions {
  canManageUsers: boolean;
  canManageCities: boolean;
  canManagePlans: boolean;
  canViewAllOrders: boolean;
  canViewAllBills: boolean;
  canAccessSystemSettings: boolean;
  canViewAnalytics: boolean;
}

/**
 * Get role permissions based on user role
 */
export const getRolePermissions = (role: UserRole): RolePermissions => {
  switch (role) {
    case 'admin':
      return {
        canManageUsers: true,
        canManageCities: true,
        canManagePlans: true,
        canViewAllOrders: true,
        canViewAllBills: true,
        canAccessSystemSettings: true,
        canViewAnalytics: true,
      };
    case 'user':
      return {
        canManageUsers: false,
        canManageCities: false,
        canManagePlans: false,
        canViewAllOrders: true,
        canViewAllBills: true,
        canAccessSystemSettings: false,
        canViewAnalytics: false,
      };
    case 'secondary_user':
      return {
        canManageUsers: false,
        canManageCities: false,
        canManagePlans: false,
        canViewAllOrders: false,
        canViewAllBills: false,
        canAccessSystemSettings: false,
        canViewAnalytics: false,
      };
    default:
      return getRolePermissions('secondary_user');
  }
};

/**
 * Get user role from user object with fallback
 */
export const getUserRole = (user: any): UserRole => {
  return user?.role || user?.access_level || 'secondary_user';
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'user':
      return 'User';
    case 'secondary_user':
      return 'Secondary User';
    default:
      return 'Secondary User';
  }
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (user: any, permission: keyof RolePermissions): boolean => {
  const role = getUserRole(user);
  const permissions = getRolePermissions(role);
  return permissions[permission];
};
