const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws'); 
require('dotenv').config();

// Use SERVICE ROLE KEY for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// This client can create users (bypasses RLS) with WebSocket transport for Node.js
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
    realtime: {
        transport: WebSocket 
    }
});

module.exports = supabase;