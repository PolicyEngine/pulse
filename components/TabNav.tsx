'use client';

interface TabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const tabs = [
    { id: 'standup', label: 'Standup' },
    { id: 'survey', label: 'Survey' },
    { id: 'results', label: 'Results' },
  ];

  return (
    <div className="flex space-x-1 mb-8">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-[#2C6496] text-white'
              : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
          }`}
          style={{ fontFamily: 'var(--font-roboto)' }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}