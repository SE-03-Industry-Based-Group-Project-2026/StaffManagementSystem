const supabase = require('../config/supabase');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });
    
    req.user = user;
    next();
};

const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const { data: userData, error } = await supabase
                .from('users')
                .select('id, auth_id, role_id, roles(role_name)')
                .eq('auth_id', req.user.id)
                .single();
                
            if (error || !userData) {
                return res.status(403).json({ error: 'User not found in system' });
            }
            
            const roleName = userData.roles?.role_name;
            
            // Admin හට සියල්ලටම අවසර ඇත[cite: 3]
            if (roleName === 'Admin') {
                req.userRole = roleName;
                req.userData = userData;
                return next();
            }
            
            if (!allowedRoles.includes(roleName)) {
                return res.status(403).json({ error: `Access denied. ${roleName} cannot perform this action.` });
            }
            
            req.userRole = roleName;
            req.userData = userData;
            next();
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error during role verification.' });
        }
    };
};

module.exports = { authenticate, checkRole };