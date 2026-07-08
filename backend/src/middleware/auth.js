const supabase = require('../config/supabase');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
};

const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        const { data: userData, error } = await supabase
            .from('users')
            .select('role_id, roles(role_name)')
            .eq('auth_id', req.user.id)
            .single();
            
        if (error || !userData) {
            return res.status(403).json({ error: 'User not found in system' });
        }
        
        const roleName = userData.roles?.role_name;
        
        if (!allowedRoles.includes(roleName)) {
            return res.status(403).json({ error: `Access denied. ${roleName} cannot perform this action.` });
        }
        
        req.userRole = roleName;
        req.userData = userData;
        next();
    };
};

module.exports = { authenticate, checkRole };