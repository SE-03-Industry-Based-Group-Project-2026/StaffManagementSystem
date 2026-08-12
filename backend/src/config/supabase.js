const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use SERVICE ROLE KEY for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// This client can create users (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;