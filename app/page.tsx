'use client';

import { useState, useEffect } from 'react';
import TabNav from '@/components/TabNav';
import StandupTab from '@/components/StandupTab';
import SurveyTab from '@/components/SurveyTab';
import ResultsTab from '@/components/ResultsTab';
import { dataService } from '@/lib/dataService';
import { setupNetworkDebugging, checkEnvironment } from '@/lib/debug';

export default function Home() {
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('standup');

  useEffect(() => {
    // Enable debugging in production
    if (typeof window !== 'undefined') {
      setupNetworkDebugging();
      checkEnvironment();
    }
    
    // Load team data on mount
    dataService.getTeamData().then(data => {
      setTeamMembers(data.team);
    }).catch(error => {
      console.error('Failed to load team data:', error);
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

          <div className="mt-8">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-roboto-mono)' }}>
              Meeting started at {new Date().toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
