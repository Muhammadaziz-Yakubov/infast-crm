const ROLES = {
    SUPER_ADMIN: 'superadmin',
    ADMIN: 'admin',
    TEACHER: 'teacher',
    ACCOUNTANT: 'accountant',
    STUDENT: 'student'
};

const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: ['all'],
    [ROLES.ADMIN]: ['manage_users', 'manage_students', 'manage_courses', 'view_reports'],
    [ROLES.TEACHER]: ['view_groups', 'mark_attendance', 'manage_tasks', 'submit_grades'],
    [ROLES.ACCOUNTANT]: ['manage_payments', 'view_revenue'],
    [ROLES.STUDENT]: ['view_profile', 'view_tasks', 'submit_tasks']
};

module.exports = {
    ROLES,
    ROLE_PERMISSIONS
};
