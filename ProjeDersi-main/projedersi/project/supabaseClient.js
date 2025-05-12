// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Supabase URL ve public anon key
const supabaseUrl = 'https://miisgiekkvempdujjihi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paXNnaWVra3ZlbXBkdWpqaWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMzUxMzYsImV4cCI6MjA1OTYxMTEzNn0.tXgIU-d56ygxu0mWXVQ_VMNyigcTJ2zpu4NLPKReqSs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
