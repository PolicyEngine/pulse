import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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