import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nojktckjliiqayrxcwdh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vamt0Y2tqbGlpcWF5cnhjd2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzMTE1NzYsImV4cCI6MjEwOTg4NzU3Nn0.m8gmPUHFFMRop1blFZx7JSTeVaGwnV_8Gkwv1Rrjee8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
