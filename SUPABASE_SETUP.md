# Supabase configuration for PolicyEngine pulse

## Important: Enable CORS for GitHub Pages

The app needs proper CORS configuration to work from GitHub Pages.

### Step 1: Configure allowed URLs

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Under "CORS Allowed Origins", add:
   - `https://policyengine.github.io`
   - `http://localhost:3000`
   - `http://localhost:3001`

### Step 2: Verify RLS policies

1. Go to Database → Tables
2. Check that both tables have RLS enabled:
   - `team_members` - should allow public SELECT
   - `survey_responses` - should allow public SELECT and INSERT

### Step 3: Run the database setup

1. Go to SQL Editor
2. Run this SQL to create tables and policies:

```sql
-- Create team members table
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  week_ending DATE NOT NULL,
  blocked_percentage INTEGER NOT NULL CHECK (blocked_percentage >= 1 AND blocked_percentage <= 10),
  feel_supported INTEGER NOT NULL CHECK (feel_supported >= 1 AND feel_supported <= 10),
  workload INTEGER NOT NULL CHECK (workload >= 1 AND workload <= 10),
  learned_new_skills INTEGER NOT NULL CHECK (learned_new_skills >= 1 AND learned_new_skills <= 10),
  meeting_productivity INTEGER NOT NULL CHECK (meeting_productivity >= 1 AND meeting_productivity <= 10),
  solo_productivity INTEGER NOT NULL CHECK (solo_productivity >= 1 AND solo_productivity <= 10),
  week_quality INTEGER NOT NULL CHECK (week_quality >= 1 AND week_quality <= 10),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert initial team members
INSERT INTO team_members (name) VALUES
  ('Max'),
  ('Nikhil'),
  ('Pavel'),
  ('Anthony'),
  ('Vahid'),
  ('Daphne'),
  ('David'),
  ('María'),
  ('Ziming')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON team_members
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON survey_responses
  FOR SELECT USING (true);

-- Create policies for public insert (for survey responses)
CREATE POLICY "Allow public insert" ON survey_responses
  FOR INSERT WITH CHECK (true);
```

### Troubleshooting

If data still doesn't load:
1. Check browser console for errors (F12 → Console tab)
2. Look for CORS errors or network failures
3. Verify the Supabase URL and anon key are correct
4. Make sure tables exist and have data

### Testing the API directly

You can test if Supabase is accessible:
```bash
curl -X GET "https://mbhrkgzrswaysrmpdehz.supabase.co/rest/v1/survey_responses" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

This should return JSON data if everything is configured correctly.