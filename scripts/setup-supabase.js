#!/usr/bin/env node

/**
 * Setup script for Supabase database
 * Run this to create tables and insert initial data
 * 
 * Usage: node scripts/setup-supabase.js
 */

console.log(`
===========================================
Supabase Database Setup Instructions
===========================================

1. Go to your Supabase dashboard:
   https://supabase.com/dashboard/project/mbhrkgzrswaysrmpdehz/sql

2. Click on "SQL Editor" in the left sidebar

3. Copy and paste the contents of supabase/schema.sql

4. Click "Run" to execute the SQL

This will:
- Create the team_members table
- Create the survey_responses table
- Insert the initial team members
- Set up Row Level Security policies

The app is now ready to use with Supabase!
===========================================
`);

console.log('You can also run the SQL directly from the file:');
console.log('cat supabase/schema.sql | pbcopy');
console.log('(This copies the SQL to your clipboard)');