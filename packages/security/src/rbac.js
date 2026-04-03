/**
 * @fileoverview Role-based access control middleware.
 * @module @carverify/security
 */

const { ForbiddenError } = require('@carverify/shared');

const PERMISSIONS = {
  user: ['search:create', 'report:read', 'chat:create', 'billing:manage', 'profile:manage'],
  support: ['search:create', 'report:read', 'report:read_any', 'user:read', 'chat:create'],
  admin: ['*'],
};

/**
 * Check if a role has a specific permission.
 * @param {string} role
 * @param {string} permission
 * @returns {boolean}
 */
function hasPermission(role, permission) {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes('*') || perms.includes(permission);
}

/**
 * Express middleware to require specific permission.
 * @param {string} permission
 * @returns {Function}
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }
    if (!hasPermission(req.user.role, permission)) {
      throw new ForbiddenError(`Missing permission: ${permission}`);
    }
    next();
  };
}

/**
 * Express middleware to require admin role.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }
  next();
}

module.exports = { PERMISSIONS, hasPermission, requirePermission, requireAdmin };
