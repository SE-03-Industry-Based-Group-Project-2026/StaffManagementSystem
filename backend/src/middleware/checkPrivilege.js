const supabase = require('../config/supabase');

const checkPrivilege = (privilegeKey) => {
    return async (req, res, next) => {
        try {

            // Authentication
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    error: 'Authentication required'
                });
            }

            // Get system user + role
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select(`
                    id,
                    auth_id,
                    role_id,
                    is_active,
                    roles (
                        role_name
                    )
                `)
                .eq('auth_id', req.user.id)
                .single();

            if (userError || !userData) {
                return res.status(403).json({
                    error: 'User not found in system'
                });
            }

            // Active account check
            if (userData.is_active === false) {
                return res.status(403).json({
                    error: 'User account is inactive'
                });
            }

            const roleName = userData.roles?.role_name;

            // Admin = everything allowed
            if (roleName === 'Admin') {
                req.userData = userData;
                req.userRole = roleName;
                return next();
            }

            // Find privilege
            const { data: privilege, error: privilegeError } =
                await supabase
                    .from('system_privileges')
                    .select('id, privilege_key')
                    .eq('privilege_key', privilegeKey)
                    .single();

            if (privilegeError || !privilege) {
                console.error(
                    'Privilege not found:',
                    privilegeKey,
                    privilegeError
                );

                return res.status(403).json({
                    error: 'Required privilege does not exist'
                });
            }

            // Check role privilege
            const { data: rolePrivilege, error: rolePrivilegeError } =
                await supabase
                    .from('role_privileges')
                    .select('is_enabled')
                    .eq('role_id', userData.role_id)
                    .eq('privilege_id', privilege.id)
                    .maybeSingle();

            if (rolePrivilegeError) {
                console.error(
                    'Role privilege lookup error:',
                    rolePrivilegeError
                );

                return res.status(500).json({
                    error: 'Failed to verify privilege'
                });
            }

            // Permission denied
            if (!rolePrivilege || rolePrivilege.is_enabled !== true) {
                return res.status(403).json({
                    error: 'You do not have permission to perform this action',
                    privilege: privilegeKey
                });
            }

            // Permission granted
            req.userData = userData;
            req.userRole = roleName;

            return next();

        } catch (error) {

            console.error(
                'Privilege middleware error:',
                error
            );

            return res.status(500).json({
                error: 'Internal server error while checking privilege'
            });
        }
    };
};

module.exports = {
    checkPrivilege
};