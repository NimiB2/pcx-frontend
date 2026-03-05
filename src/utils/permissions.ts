/**
 * RBAC Permission System for PCX Pilot System
 * 
 * Defines role-based access control permissions derived from PRD §3, SRS §5.1,
 * and the Functional Requirements Specification §2.3.
 * 
 * Roles:
 *   - super_admin: Full system management
 *   - plant_engineer: Operational control & approvals
 *   - field_worker: Mobile data collection
 *   - regulatory: Read-only audit access
 */

export type UserRole = 'super_admin' | 'plant_engineer' | 'field_worker' | 'regulatory';

// Permission constants
export const PERMISSIONS = {
    // System administration
    ALL_SYSTEM_FUNCTIONS: 'all_system_functions',
    MANAGE_USERS: 'manage_users',
    SYSTEM_SETTINGS: 'system_settings',

    // Operational data
    VIEW_OPERATIONAL_DATA: 'view_operational_data',
    EDIT_OPERATIONAL_DATA: 'edit_operational_data',

    // VRCQ
    APPROVE_VRCQ: 'approve_vrcq',
    VIEW_VRCQ: 'view_vrcq',

    // Discrepancies
    MANAGE_DISCREPANCIES: 'manage_discrepancies',

    // Reports & Audit
    VIEW_REPORTS: 'view_reports',
    VIEW_AUDIT: 'view_audit',
    EXPORT_REPORTS: 'export_reports',

    // Measurements
    CREATE_MEASUREMENTS: 'create_measurements',
    EDIT_MEASUREMENTS: 'edit_measurements',

    // Evidence
    UPLOAD_EVIDENCE: 'upload_evidence',

    // Documents
    UPLOAD_DOCUMENTS: 'upload_documents',
    DOWNLOAD_DOCUMENTS: 'download_documents',
    DELETE_DOCUMENTS: 'delete_documents',

    // Configuration
    CONFIGURE_CODEBOOKS: 'configure_codebooks',
    CONFIGURE_PUNCHLIST: 'configure_punchlist',

    // Batches
    CREATE_BATCHES: 'create_batches',
    EDIT_BATCHES: 'edit_batches',
    VIEW_BATCHES: 'view_batches',

    // Reconciliation
    VIEW_RECONCILIATION: 'view_reconciliation',
    TRIGGER_RECONCILIATION: 'trigger_reconciliation',

    // Credits
    VIEW_CREDITS: 'view_credits',

    // Leaderboard
    VIEW_LEADERBOARD: 'view_leaderboard',
} as const;

type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * RBAC Permission Matrix
 * Maps each role to its set of allowed permissions.
 * Source: FRS §2.3 RBAC Permission Matrix
 */
const ROLE_PERMISSIONS: Record<UserRole, Set<Permission>> = {
    super_admin: new Set([
        PERMISSIONS.ALL_SYSTEM_FUNCTIONS,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.SYSTEM_SETTINGS,
        PERMISSIONS.VIEW_OPERATIONAL_DATA,
        PERMISSIONS.EDIT_OPERATIONAL_DATA,
        PERMISSIONS.APPROVE_VRCQ,
        PERMISSIONS.VIEW_VRCQ,
        PERMISSIONS.MANAGE_DISCREPANCIES,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_AUDIT,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.CREATE_MEASUREMENTS,
        PERMISSIONS.EDIT_MEASUREMENTS,
        PERMISSIONS.UPLOAD_EVIDENCE,
        PERMISSIONS.UPLOAD_DOCUMENTS,
        PERMISSIONS.DOWNLOAD_DOCUMENTS,
        PERMISSIONS.DELETE_DOCUMENTS,
        PERMISSIONS.CONFIGURE_CODEBOOKS,
        PERMISSIONS.CONFIGURE_PUNCHLIST,
        PERMISSIONS.CREATE_BATCHES,
        PERMISSIONS.EDIT_BATCHES,
        PERMISSIONS.VIEW_BATCHES,
        PERMISSIONS.VIEW_RECONCILIATION,
        PERMISSIONS.TRIGGER_RECONCILIATION,
        PERMISSIONS.VIEW_CREDITS,
        PERMISSIONS.VIEW_LEADERBOARD,
    ]),

    plant_engineer: new Set([
        PERMISSIONS.VIEW_OPERATIONAL_DATA,
        PERMISSIONS.EDIT_OPERATIONAL_DATA,
        PERMISSIONS.APPROVE_VRCQ,
        PERMISSIONS.VIEW_VRCQ,
        PERMISSIONS.MANAGE_DISCREPANCIES,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_AUDIT,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.CREATE_MEASUREMENTS,
        PERMISSIONS.EDIT_MEASUREMENTS,
        PERMISSIONS.UPLOAD_EVIDENCE,
        PERMISSIONS.UPLOAD_DOCUMENTS,
        PERMISSIONS.DOWNLOAD_DOCUMENTS,
        PERMISSIONS.CREATE_BATCHES,
        PERMISSIONS.EDIT_BATCHES,
        PERMISSIONS.VIEW_BATCHES,
        PERMISSIONS.VIEW_RECONCILIATION,
        PERMISSIONS.VIEW_CREDITS,
        PERMISSIONS.VIEW_LEADERBOARD,
    ]),

    field_worker: new Set([
        PERMISSIONS.CREATE_MEASUREMENTS,
        PERMISSIONS.EDIT_MEASUREMENTS,
        PERMISSIONS.UPLOAD_EVIDENCE,
        PERMISSIONS.VIEW_LEADERBOARD,
    ]),

    regulatory: new Set([
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_AUDIT,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.VIEW_VRCQ,
        PERMISSIONS.DOWNLOAD_DOCUMENTS,
        PERMISSIONS.VIEW_BATCHES,
        PERMISSIONS.VIEW_CREDITS,
    ]),
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

/**
 * Check if a role is one of the allowed roles.
 * Useful for route guarding.
 */
export function isRoleAllowed(role: UserRole | undefined, allowedRoles: UserRole[]): boolean {
    if (!role) return false;
    return allowedRoles.includes(role);
}

/**
 * Get the display name for a role.
 */
export function getRoleDisplayName(role: UserRole): string {
    const names: Record<UserRole, string> = {
        super_admin: 'Super-Admin',
        plant_engineer: 'Plant Engineer',
        field_worker: 'Field Worker',
        regulatory: 'Regulatory / Commercial',
    };
    return names[role] || role;
}

/**
 * Get all permissions for a role.
 */
export function getRolePermissions(role: UserRole): Permission[] {
    return Array.from(ROLE_PERMISSIONS[role] || []);
}

/**
 * Check if a role has read-only access to a specific area.
 * Regulatory users have read-only access to most areas.
 */
export function isReadOnly(role: UserRole | undefined): boolean {
    return role === 'regulatory';
}
