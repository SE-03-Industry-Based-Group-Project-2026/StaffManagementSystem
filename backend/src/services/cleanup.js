const cron = require('node-cron');
const supabase = require('../config/supabase');

function initNotificationCleanup() {
  
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running automated cleanup for expired notifications...');

    try {
      
      const sevenDaysAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', sevenDaysAgo)
        .select();

      if (error) {
        console.error('[CRON ERROR] Failed to delete notifications:', error.message);
      } else {
        const count = data ? data.length : 0;
        console.log(`[CRON SUCCESS] Removed ${count} notifications older than 7 days.`);
      }
    } catch (err) {
      console.error('[CRON EXCEPTION]', err);
    }
  });

  console.log('✅ Notification cleanup cron job scheduled successfully (Daily at midnight).');
}

module.exports = initNotificationCleanup;