/**
 * Admin utility functions for applying consistent styling
 */

export const adminClasses = {
  page: "admin-page min-h-screen",
  card: "admin-card",
  cardHover: "admin-card glow-hover",
  primaryButton: "admin-button admin-primary",
  table: "admin-table",
  badge: "status-badge",
  sidebar: "admin-sidebar",
  glow: "admin-glow",
} as const;

/**
 * Get status badge classes based on status type
 */
export const getStatusBadgeClass = (status: string) => {
  const baseClass = adminClasses.badge;
  
  switch (status.toLowerCase()) {
    case 'completed':
    case 'active':
    case 'confirmed':
      return `${baseClass} active`;
    case 'processing':
    case 'pending':
    case 'in-progress':
      return `${baseClass} pending`;
    case 'cancelled':
    case 'inactive':
    case 'rejected':
      return `${baseClass} inactive`;
    default:
      return baseClass;
  }
};

/**
 * Apply admin theme to document body
 */
export const applyAdminTheme = () => {
  if (typeof document !== 'undefined') {
    document.body.classList.add('admin-theme');
  }
};

/**
 * Remove admin theme from document body
 */
export const removeAdminTheme = () => {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('admin-theme');
  }
};