'use client';

import { useState, useEffect, useRef } from 'react';
import { shuffleArray } from '@/lib/storage';

interface TimerState {
  [key: string]: {
    startTime: number;
    elapsed: number;
    isActive: boolean;
    isCompleted: boolean;
  };
}

interface StandupTabProps {
  teamMembers: string[];
}

export default function StandupTab({ teamMembers }: StandupTabProps) {
  const [standupOrder, setStandupOrder] = useState<string[]>(teamMembers);
  const [isShuffling, setIsShuffling] = useState(false);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [timers, setTimers] = useState<TimerState>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setStandupOrder(teamMembers);
  }, [teamMembers]);

  useEffect(() => {
    const hasActiveTimer = Object.values(timers).some(t => t.isActive);
    
    if (hasActiveTimer) {
      intervalRef.current = setInterval(() => {
        setTimers(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(member => {
            if (updated[member].isActive) {
              const elapsed = Date.now() - updated[member].startTime;
              updated[member].elapsed = elapsed;
              
              if (elapsed >= 120000) {
                updated[member].isActive = false;
                updated[member].elapsed = 120000;
              }
            }
          });
          return updated;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timers]);

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const shuffled = shuffleArray(teamMembers);
      setStandupOrder(shuffled);
      setIsShuffling(false);
    }, 500);
  };

  const startTimer = (member: string) => {
    setTimers(prev => {
      const updated: TimerState = {};
      Object.keys(prev).forEach(m => {
        if (prev[m].isActive && m !== member) {
          updated[m] = {
            ...prev[m],
            isActive: false,
          };
        } else {
          updated[m] = prev[m];
        }
      });
      
      updated[member] = {
        startTime: Date.now(),
        elapsed: 0,
        isActive: true,
        isCompleted: false,
      };
      
      return updated;
    });
  };

  const markCompleted = (member: string) => {
    setTimers(prev => ({
      ...prev,
      [member]: {
        ...prev[member],
        isActive: false,
        isCompleted: true,
      }
    }));
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const remaining = 120 - totalSeconds;
    const remainingMinutes = Math.floor(remaining / 60);
    const remainingSeconds = remaining % 60;
    
    if (remaining > 0) {
      return `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return "Time's up!";
  };

  const getProgressColor = (elapsed: number) => {
    const progress = Math.min(elapsed / 120000, 1);
    const red = Math.floor(128 + (255 - 128) * progress);
    const green = Math.floor(128 * (1 - progress));
    const blue = Math.floor(128 * (1 - progress));
    return `rgb(${red}, ${green}, ${blue})`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: 'var(--font-roboto-serif)' }}>
          Today&apos;s standup order
        </h2>
        <button
          onClick={handleShuffle}
          disabled={isShuffling}
          className="px-6 py-3 bg-[#2C6496] text-white rounded-lg hover:bg-[#1e4668] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          style={{ fontFamily: 'var(--font-roboto)' }}
        >
          {isShuffling ? 'Shuffling...' : 'Randomise order'}
        </button>
      </div>

      <div className="space-y-3">
        {standupOrder.map((member, index) => {
          const timer = timers[member];
          const isCompleted = timer?.isCompleted;
          const elapsed = timer?.elapsed || 0;
          const progress = Math.min((elapsed / 120000) * 100, 100);
          
          return (
            <div
              key={member}
              className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                isShuffling ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
              } ${
                isCompleted ? 'bg-green-50' : hoveredMember === member ? 'bg-slate-100' : 'bg-slate-50'
              }`}
              onMouseEnter={() => setHoveredMember(member)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              {timer && !isCompleted && (
                <div
                  className="absolute inset-0 opacity-30 transition-all duration-100"
                  style={{
                    background: `linear-gradient(to right, ${getProgressColor(elapsed)} ${progress}%, transparent ${progress}%)`,
                  }}
                />
              )}
              
              <div className="relative flex items-center p-4">
                <div className={`flex-shrink-0 w-10 h-10 ${isCompleted ? 'bg-green-600' : 'bg-[#2C6496]'} text-white rounded-full flex items-center justify-center font-bold text-sm`} style={{ fontFamily: 'var(--font-roboto-mono)' }}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span className={`ml-4 text-lg font-medium flex-grow ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'}`} style={{ fontFamily: 'var(--font-roboto)' }}>
                  {member}
                </span>
                
                {timer && !isCompleted && (
                  <span className="ml-4 text-lg font-mono font-bold" style={{ 
                    fontFamily: 'var(--font-roboto-mono)',
                    color: elapsed >= 120000 ? '#dc2626' : '#374151'
                  }}>
                    {formatTime(elapsed)}
                  </span>
                )}
                
                {isCompleted && (
                  <span className="ml-4 text-sm font-medium text-green-600" style={{ fontFamily: 'var(--font-roboto)' }}>
                    Completed
                  </span>
                )}
                
                {hoveredMember === member && !isCompleted && (
                  <>
                    {!timer && (
                      <button
                        onClick={() => startTimer(member)}
                        className="ml-4 px-4 py-2 bg-[#2C6496] text-white rounded-md hover:bg-[#1e4668] transition-colors font-medium text-sm"
                        style={{ fontFamily: 'var(--font-roboto)' }}
                      >
                        Start
                      </button>
                    )}
                    {timer && (
                      <button
                        onClick={() => markCompleted(member)}
                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-sm"
                        style={{ fontFamily: 'var(--font-roboto)' }}
                      >
                        Done
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}