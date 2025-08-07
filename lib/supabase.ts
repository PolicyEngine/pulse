import { createClient } from '@supabase/supabase-js';

// Use hardcoded values as fallback for static export
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mbhrkgzrswaysrmpdehz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iaHJrZ3pyc3dheXNybXBkZWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTU2NjAsImV4cCI6MjA3MDA5MTY2MH0._JP4S6jVxYt0w7mSL2Rci59pSii0kDK1g9qfgFFtXKI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema types
export interface TeamMember {
  id?: number;
  name: string;
  created_at?: string;
}

export interface SurveyResponse {
  id?: number;
  name: string;
  week_ending: string;
  blocked_percentage: number;
  feel_supported: number;
  workload: number;
  learned_new_skills: number;
  meeting_productivity: number;
  solo_productivity: number;
  week_quality: number;
  feedback?: string;
  created_at?: string;
}