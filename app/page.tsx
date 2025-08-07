'use client';

import { useState, useEffect } from 'react';
import TabNav from '@/components/TabNav';
import StandupTab from '@/components/StandupTab';
import SurveyTab from '@/components/SurveyTab';
import ResultsTab from '@/components/ResultsTab';
import { dataService } from '@/lib/dataService';

export default function Home() {
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('standup');

  useEffect(() => {
    // Load team data on mount
    dataService.getTeamData().then(data => {
      setTeamMembers(data.team);
    });
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12">
          <h1 className="text-5xl font-bold text-[#2C6496] mb-4" style={{ fontFamily: 'var(--font-roboto-serif)' }}>
            PolicyEngine pulse
          </h1>
          <p className="text-xl text-gray-600" style={{ fontFamily: 'var(--font-roboto)' }}>
            Team meeting coordination hub
          </p>
        </header>

        <div className="max-w-4xl">
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
          
          {activeTab === 'standup' && <StandupTab teamMembers={teamMembers} />}
          {activeTab === 'survey' && <SurveyTab />}
          {activeTab === 'results' && <ResultsTab />}

          <div className="mt-8 flex justify-between items-center">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-roboto-mono)' }}>
              Meeting started at {new Date().toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('https://mbhrkgzrswaysrmpdehz.supabase.co/rest/v1/survey_responses?select=*', {
                    headers: {
                      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iaHJrZ3pyc3dheXNybXBkZWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTU2NjAsImV4cCI6MjA3MDA5MTY2MH0._JP4S6jVxYt0w7mSL2Rci59pSii0kDK1g9qfgFFtXKI',
                      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iaHJrZ3pyc3dheXNybXBkZWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTU2NjAsImV4cCI6MjA3MDA5MTY2MH0._JP4S6jVxYt0w7mSL2Rci59pSii0kDK1g9qfgFFtXKI'
                    }
                  });
                  const data = await response.json();
                  alert(`API Test: ${response.ok ? 'Success' : 'Failed'}\nStatus: ${response.status}\nData: ${JSON.stringify(data).substring(0, 100)}`);
                  console.log('API Test:', data);
                } catch (err) {
                  alert('API Test Error: ' + err);
                  console.error('API Test Error:', err);
                }
              }}
              className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              style={{ fontFamily: 'var(--font-roboto-mono)' }}
            >
              Test API
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
