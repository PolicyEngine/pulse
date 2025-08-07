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