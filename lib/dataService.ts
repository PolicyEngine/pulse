interface TeamData {
  team: string[];
  meetings: any[];
}

interface SurveyData {
  responses: any[];
}

const TEAM_KEY = 'pulse_team_data';
const SURVEY_KEY = 'pulse_survey_data';

// For local development, use localStorage
// For production, this will be enhanced to use GCS via a serverless function
class DataService {
  private isProduction = process.env.NEXT_PUBLIC_ENV === 'production';

  async getTeamData(): Promise<TeamData> {
    if (!this.isProduction) {
      // Local development: use localStorage
      const stored = localStorage.getItem(TEAM_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
    
    // Default data
    return {
      team: ['Max', 'Nikhil', 'Pavel', 'Anthony', 'Vahid', 'Daphne', 'David', 'María', 'Ziming'],
      meetings: []
    };
  }

  async saveTeamData(data: TeamData): Promise<void> {
    if (!this.isProduction) {
      localStorage.setItem(TEAM_KEY, JSON.stringify(data));
    }
    // In production, we would call a serverless function here
  }

  async getSurveyData(): Promise<SurveyData> {
    if (!this.isProduction) {
      // Local development: use localStorage
      const stored = localStorage.getItem(SURVEY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Load sample data if nothing in localStorage
      try {
        const response = await fetch('/data/surveys.json');
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem(SURVEY_KEY, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        // Ignore, will return empty
      }
    }
    
    // Return empty responses by default
    return { responses: [] };
  }

  async saveSurveyResponse(response: any): Promise<void> {
    const data = await this.getSurveyData();
    response.timestamp = new Date().toISOString();
    data.responses.push(response);
    
    if (!this.isProduction) {
      localStorage.setItem(SURVEY_KEY, JSON.stringify(data));
    }
    // In production, we would call a serverless function here
  }
}

export const dataService = new DataService();