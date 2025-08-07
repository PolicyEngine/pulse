import { createClient } from '@supabase/supabase-js';

// Use hardcoded values as fallback for static export
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mbhrkgzrswaysrmpdehz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iaHJrZ3pyc3dheXNybXBkZWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTU2NjAsImV4cCI6MjA3MDA5MTY2MH0._JP4S6jVxYt0w7mSL2Rci59pSii0kDK1g9qfgFFtXKI';

// Only log in browser environment
if (typeof window !== 'undefined') {
  console.log('Supabase initialization:', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey?.length,
    keyPrefix: supabaseAnonKey?.substring(0, 20) + '...',
    env: 'browser'
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'x-source': 'policyengine-pulse'
    }
  }
});

// Add request interceptor for debugging only in browser
if (typeof window !== 'undefined') {
  const originalFrom = supabase.from.bind(supabase);
  (supabase as any).from = (table: string) => {
    console.log(`[Supabase] Accessing table: ${table}`);
    const tableRef = originalFrom(table);
    
    // Intercept select
    const originalSelect = tableRef.select.bind(tableRef);
    tableRef.select = (...args: any[]) => {
      console.log(`[Supabase] SELECT from ${table}`, args);
      const query = originalSelect(...args);
      
      // Intercept the promise
      const originalThen = query.then.bind(query);
      query.then = (onFulfilled: any, onRejected: any) => {
        return originalThen(
          (result: any) => {
            console.log(`[Supabase] SELECT ${table} result:`, result);
            return onFulfilled?.(result);
          },
          (error: any) => {
            console.error(`[Supabase] SELECT ${table} error:`, error);
            return onRejected?.(error);
          }
        );
      };
      
      return query;
    };
    
    // Intercept insert
    const originalInsert = tableRef.insert.bind(tableRef);
    tableRef.insert = (...args: any[]) => {
      console.log(`[Supabase] INSERT into ${table}`, args);
      const query = originalInsert(...args);
      
      // Intercept the promise
      const originalThen = query.then.bind(query);
      query.then = (onFulfilled: any, onRejected: any) => {
        return originalThen(
          (result: any) => {
            console.log(`[Supabase] INSERT ${table} result:`, result);
            return onFulfilled?.(result);
          },
          (error: any) => {
            console.error(`[Supabase] INSERT ${table} error:`, error);
            return onRejected?.(error);
          }
        );
      };
      
      return query;
    };
    
    return tableRef;
  };
}

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