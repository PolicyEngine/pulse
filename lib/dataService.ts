import { supabase } from './supabase';

interface TeamData {
  team: string[];
  meetings: any[];
}

interface SurveyData {
  responses: any[];
}

// DataService now uses Supabase for all environments
class DataService {
  async getTeamData(): Promise<TeamData> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('name')
        .order('name');
      
      if (error) throw error;
      
      return {
        team: data?.map(member => member.name) || [],
        meetings: []
      };
    } catch (error) {
      console.error('Error fetching team data:', error);
      // Fallback to default data
      return {
        team: ['Max', 'Nikhil', 'Pavel', 'Anthony', 'Vahid', 'Daphne', 'David', 'María', 'Ziming'],
        meetings: []
      };
    }
  }

  async saveTeamData(data: TeamData): Promise<void> {
    // Not implemented for now - team members are managed in database
  }

  async getSurveyData(): Promise<SurveyData> {
    try {
      console.log('Fetching survey data from Supabase...');
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('week_ending', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Raw data from Supabase:', data);
      
      // Transform database format to app format
      const responses = data?.map(row => ({
        name: row.name,
        weekEnding: row.week_ending,
        blockedPercentage: row.blocked_percentage,
        feelSupported: row.feel_supported,
        workload: row.workload,
        learnedNewSkills: row.learned_new_skills,
        meetingProductivity: row.meeting_productivity,
        soloProductivity: row.solo_productivity,
        weekQuality: row.week_quality,
        feedback: row.feedback || '',
        timestamp: row.created_at
      })) || [];
      
      return { responses };
    } catch (error) {
      console.error('Error fetching survey data:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
      return { responses: [] };
    }
  }

  async saveSurveyResponse(response: any): Promise<void> {
    try {
      console.log('Saving survey response:', response);
      const { error } = await supabase
        .from('survey_responses')
        .insert({
          name: response.name,
          week_ending: response.weekEnding,
          blocked_percentage: response.blockedPercentage,
          feel_supported: response.feelSupported,
          workload: response.workload,
          learned_new_skills: response.learnedNewSkills,
          meeting_productivity: response.meetingProductivity,
          solo_productivity: response.soloProductivity,
          week_quality: response.weekQuality,
          feedback: response.feedback || null
        });
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      console.log('Survey response saved successfully');
    } catch (error) {
      console.error('Error saving survey response:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
      throw error;
    }
  }
}

export const dataService = new DataService();