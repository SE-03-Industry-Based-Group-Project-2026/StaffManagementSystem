const supabase = require('../config/supabase');

async function logAudit(
  userId,
  action,
  entityType,
  entityId,
  oldValue = null,
  newValue = null
) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Audit Log Error:', err.message);
  }
}

module.exports = {
  logAudit
};